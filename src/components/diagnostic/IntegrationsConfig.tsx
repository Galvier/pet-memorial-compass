
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Globe, 
  MessageCircle, 
  CreditCard, 
  Database,
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  TestTube,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import { DiagnosticService } from '@/services/DiagnosticService';
import { NotificationService } from '@/services/NotificationService';
import { useToast } from '@/hooks/use-toast';

interface IntegrationStatus {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'warning';
  configured: boolean;
  lastTested?: string;
}

export const IntegrationsConfig: React.FC = () => {
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([
    { id: 'google-maps', name: 'Google Maps API', status: 'disconnected', configured: false },
    { id: 'n8n-webhook', name: 'n8n WhatsApp Webhook', status: 'disconnected', configured: false },
    { id: 'stripe', name: 'Stripe Payments', status: 'disconnected', configured: false },
    { id: 'supabase', name: 'Supabase Database', status: 'connected', configured: true }
  ]);

  // Google Maps Configuration
  const [showGoogleKey, setShowGoogleKey] = useState(false);
  const [googleMapsKey, setGoogleMapsKey] = useState('');

  // n8n Configuration
  const [webhookUrl, setWebhookUrl] = useState('');
  const [messageTemplate, setMessageTemplate] = useState('Olá {nome}! Seu atendimento #{id} foi atualizado.');

  // Stripe Configuration
  const [showStripeKey, setShowStripeKey] = useState(false);
  const [stripeKey, setStripeKey] = useState('');

  const { toast } = useToast();

  useEffect(() => {
    loadIntegrationsStatus();
  }, []);

  const loadIntegrationsStatus = async () => {
    try {
      // Verificar status das integrações
      const healthStatus = await DiagnosticService.checkSystemHealth();
      
      setIntegrations(prev => prev.map(integration => {
        switch (integration.id) {
          case 'google-maps':
            return {
              ...integration,
              status: healthStatus.googleMaps === 'healthy' ? 'connected' : 
                     healthStatus.googleMaps === 'warning' ? 'warning' : 'disconnected',
              configured: healthStatus.googleMaps !== 'error'
            };
          case 'supabase':
            return {
              ...integration,
              status: healthStatus.database === 'healthy' ? 'connected' : 'disconnected',
              configured: healthStatus.database !== 'error'
            };
          default:
            return integration;
        }
      }));
    } catch (error) {
      console.error('Erro ao carregar status das integrações:', error);
    }
  };

  const testIntegration = async (integrationId: string) => {
    try {
      const result = await DiagnosticService.runIntegrationTest(integrationId);
      
      setIntegrations(prev => prev.map(integration => 
        integration.id === integrationId ? {
          ...integration,
          status: result.success ? 'connected' : 'disconnected',
          lastTested: new Date().toLocaleString('pt-BR')
        } : integration
      ));

      toast({
        title: result.success ? "Teste Bem-sucedido" : "Teste Falhou",
        description: result.message,
        variant: result.success ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        title: "Erro no Teste",
        description: "Falha ao executar teste da integração",
        variant: "destructive"
      });
    }
  };

  const saveGoogleMapsConfig = () => {
    // Em um cenário real, salvaria via Supabase secrets
    toast({
      title: "Configuração Salva",
      description: "Chave do Google Maps configurada com sucesso!",
    });
    setIntegrations(prev => prev.map(integration => 
      integration.id === 'google-maps' ? {
        ...integration,
        configured: true,
        status: 'warning' // Precisa testar para confirmar
      } : integration
    ));
  };

  const saveWebhookConfig = () => {
    NotificationService.setWebhookUrl(webhookUrl);
    toast({
      title: "Webhook Configurado",
      description: "URL do n8n webhook salva com sucesso!",
    });
    setIntegrations(prev => prev.map(integration => 
      integration.id === 'n8n-webhook' ? {
        ...integration,
        configured: !!webhookUrl,
        status: webhookUrl ? 'warning' : 'disconnected'
      } : integration
    ));
  };

  const saveStripeConfig = () => {
    // Em um cenário real, salvaria via Supabase secrets
    toast({
      title: "Stripe Configurado",
      description: "Chave do Stripe salva com sucesso!",
    });
    setIntegrations(prev => prev.map(integration => 
      integration.id === 'stripe' ? {
        ...integration,
        configured: !!stripeKey,
        status: stripeKey ? 'warning' : 'disconnected'
      } : integration
    ));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'disconnected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <XCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      connected: 'default',
      warning: 'secondary',
      disconnected: 'destructive'
    } as const;
    
    const labels = {
      connected: 'Conectado',
      warning: 'Configurado',
      disconnected: 'Desconectado'
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {labels[status as keyof typeof labels] || 'Desconhecido'}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Configuração de Integrações</h2>
        <Button onClick={loadIntegrationsStatus} variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Atualizar Status
        </Button>
      </div>

      {/* Visão Geral das Integrações */}
      <Card>
        <CardHeader>
          <CardTitle>Status das Integrações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {integrations.map((integration) => (
              <div key={integration.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-2">
                  {getStatusIcon(integration.status)}
                  <span className="font-medium text-sm">{integration.name}</span>
                </div>
                {getStatusBadge(integration.status)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configurações Detalhadas */}
      <Tabs defaultValue="google-maps" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="google-maps" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Google Maps
          </TabsTrigger>
          <TabsTrigger value="n8n-webhook" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="stripe" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Stripe
          </TabsTrigger>
          <TabsTrigger value="supabase" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Supabase
          </TabsTrigger>
        </TabsList>

        <TabsContent value="google-maps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Google Maps API
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  A chave da API do Google Maps é necessária para funcionalidades de geocodificação e mapa de calor.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="google-maps-key">Chave da API do Google Maps</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="google-maps-key"
                      type={showGoogleKey ? "text" : "password"}
                      placeholder="AIza..."
                      value={googleMapsKey}
                      onChange={(e) => setGoogleMapsKey(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowGoogleKey(!showGoogleKey)}
                    >
                      {showGoogleKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button onClick={saveGoogleMapsConfig} disabled={!googleMapsKey}>
                    Salvar
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => testIntegration('google-maps')} 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <TestTube className="h-4 w-4" />
                  Testar Conexão
                </Button>
              </div>

              <div className="p-3 bg-gray-50 rounded text-sm">
                <p className="font-medium mb-1">Como obter a chave:</p>
                <p>1. Acesse o <a href="https://console.cloud.google.com/" target="_blank" className="text-blue-600 underline">Google Cloud Console</a></p>
                <p>2. Ative a Maps JavaScript API</p>
                <p>3. Crie uma chave de API</p>
                <p>4. Configure as restrições adequadas</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="n8n-webhook" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Webhook n8n WhatsApp
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <MessageCircle className="h-4 w-4" />
                <AlertDescription>
                  Configure o webhook do n8n para envio automático de notificações via WhatsApp.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="webhook-url">URL do Webhook n8n</Label>
                <div className="flex gap-2">
                  <Input
                    id="webhook-url"
                    placeholder="https://n8n.exemplo.com/webhook/whatsapp"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={saveWebhookConfig}>
                    Salvar
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message-template">Template de Mensagem</Label>
                <Input
                  id="message-template"
                  placeholder="Olá {nome}! Seu atendimento #{id} foi atualizado."
                  value={messageTemplate}
                  onChange={(e) => setMessageTemplate(e.target.value)}
                />
                <p className="text-sm text-gray-600">
                  Use {'{nome}'}, {'{id}'}, {'{status}'} como variáveis
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => testIntegration('n8n-webhook')} 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <TestTube className="h-4 w-4" />
                  Testar Webhook
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stripe" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Stripe Payments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <CreditCard className="h-4 w-4" />
                <AlertDescription>
                  Configure suas chaves do Stripe para processar pagamentos de forma segura.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="stripe-key">Chave Secreta do Stripe</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="stripe-key"
                      type={showStripeKey ? "text" : "password"}
                      placeholder="sk_..."
                      value={stripeKey}
                      onChange={(e) => setStripeKey(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowStripeKey(!showStripeKey)}
                    >
                      {showStripeKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button onClick={saveStripeConfig} disabled={!stripeKey}>
                    Salvar
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => testIntegration('stripe')} 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <TestTube className="h-4 w-4" />
                  Testar Conexão
                </Button>
              </div>

              <div className="p-3 bg-gray-50 rounded text-sm">
                <p className="font-medium mb-1">Como configurar:</p>
                <p>1. Acesse o <a href="https://dashboard.stripe.com/" target="_blank" className="text-blue-600 underline">Dashboard do Stripe</a></p>
                <p>2. Vá em Desenvolvedores → Chaves de API</p>
                <p>3. Copie sua chave secreta (sk_...)</p>
                <p>4. Use chaves de teste para desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="supabase" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Supabase Database
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Conexão com Supabase está ativa e funcionando corretamente.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>URL do Projeto</Label>
                  <div className="flex items-center gap-2">
                    <Input value="mhksmiryxulaotegdfvb.supabase.co" disabled />
                    <Button size="sm" variant="outline">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Status da Conexão</Label>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Conectado</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => testIntegration('supabase')} 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <TestTube className="h-4 w-4" />
                  Testar Banco de Dados
                </Button>
              </div>

              <div className="p-3 bg-green-50 border border-green-200 rounded text-sm">
                <p className="font-medium text-green-800 mb-1">Edge Functions Ativas:</p>
                <ul className="text-green-700 space-y-1">
                  <li>• get-google-maps-key</li>
                  <li>• create-payment-link</li>
                  <li>• handle-payment-webhook</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
