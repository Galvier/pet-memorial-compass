import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Globe, 
  MessageCircle, 
  CreditCard, 
  Database,
  CheckCircle,
  RefreshCw,
  MapPin
} from 'lucide-react';
import { IntegrationCard } from './IntegrationCard';
import { SecretKeyForm } from './SecretKeyForm';
import { N8nConfig } from './N8nConfig';
import { IBGEConfig } from './IBGEConfig';
import { SecretsService } from '@/services/SecretsService';
import { DiagnosticService } from '@/services/DiagnosticService';
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
    { id: 'stripe', name: 'Stripe Payments', status: 'disconnected', configured: false },
    { id: 'n8n-webhook', name: 'n8n WhatsApp Webhook', status: 'disconnected', configured: false },
    { id: 'ibge-apis', name: 'IBGE APIs', status: 'connected', configured: true },
    { id: 'supabase', name: 'Supabase Database', status: 'connected', configured: true }
  ]);

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadIntegrationsStatus();
  }, []);

  const loadIntegrationsStatus = async () => {
    setLoading(true);
    try {
      console.log('🔍 Carregando status das integrações...');
      
      // Verificar quais secrets existem
      const googleMapsExists = await SecretsService.checkSecretExists('GOOGLE_MAPS_API_KEY');
      const stripeExists = await SecretsService.checkSecretExists('STRIPE_SECRET_KEY');
      const n8nExists = await SecretsService.checkSecretExists('N8N_WEBHOOK_URL');
      
      // Testar IBGE
      const ibgeStatus = await DiagnosticService.getIBGEStatus();
      const ibgeHealthy = ibgeStatus.municipalities.success && ibgeStatus.income.success;
      
      console.log('📊 Status dos secrets:', { googleMapsExists, stripeExists, n8nExists, ibgeHealthy });
      
      // Atualizar status baseado na existência das chaves
      setIntegrations(prev => prev.map(integration => {
        switch (integration.id) {
          case 'google-maps':
            return {
              ...integration,
              configured: googleMapsExists,
              status: googleMapsExists ? 'warning' : 'disconnected'
            };
          case 'stripe':
            return {
              ...integration,
              configured: stripeExists,
              status: stripeExists ? 'warning' : 'disconnected'
            };
          case 'n8n-webhook':
            return {
              ...integration,
              configured: n8nExists,
              status: n8nExists ? 'warning' : 'disconnected'
            };
          case 'ibge-apis':
            return {
              ...integration,
              configured: true,
              status: ibgeHealthy ? 'connected' : 'warning'
            };
          default:
            return integration;
        }
      }));
      
      toast({
        title: "Status Atualizado",
        description: "Status das integrações carregado com sucesso!",
      });
    } catch (error) {
      console.error('❌ Erro ao carregar status das integrações:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar status das integrações",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const testIntegration = async (integrationId: string) => {
    try {
      console.log(`🧪 Testando integração: ${integrationId}`);
      
      let result;
      switch (integrationId) {
        case 'google-maps':
          result = await SecretsService.testSecret('GOOGLE_MAPS_API_KEY', 'google-maps');
          break;
        case 'stripe':
          result = await SecretsService.testSecret('STRIPE_SECRET_KEY', 'stripe');
          break;
        case 'n8n-webhook':
          result = await SecretsService.testSecret('N8N_WEBHOOK_URL', 'n8n-webhook');
          break;
        case 'ibge-apis':
          result = await DiagnosticService.runIntegrationTest('location-analysis');
          break;
        default:
          result = await DiagnosticService.runIntegrationTest(integrationId);
      }
      
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

  const handleSecretSave = async (secretName: string) => {
    toast({
      title: "Configuração Necessária",
      description: `Para configurar ${secretName}, use o painel de secrets do Supabase.`,
      variant: "default"
    });
    
    // Recarregar status após salvar
    setTimeout(() => {
      loadIntegrationsStatus();
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Configuração de Integrações</h2>
        <Button onClick={loadIntegrationsStatus} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar Status
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="google-maps">Google Maps</TabsTrigger>
          <TabsTrigger value="stripe">Stripe</TabsTrigger>
          <TabsTrigger value="n8n">n8n</TabsTrigger>
          <TabsTrigger value="ibge">IBGE</TabsTrigger>
          <TabsTrigger value="supabase">Supabase</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Status das Integrações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {integrations.map((integration) => (
                  <IntegrationCard
                    key={integration.id}
                    id={integration.id}
                    name={integration.name}
                    icon={getIntegrationIcon(integration.id)}
                    status={integration.status}
                    configured={integration.configured}
                    lastTested={integration.lastTested}
                    onTest={testIntegration}
                    onConfigure={(id) => setActiveTab(id === 'n8n-webhook' ? 'n8n' : id === 'ibge-apis' ? 'ibge' : id)}
                    isLoading={loading}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="google-maps" className="space-y-4">
          <SecretKeyForm
            title="Google Maps API"
            secretName="GOOGLE_MAPS_API_KEY"
            placeholder="AIza..."
            description="A chave da API do Google Maps é necessária para funcionalidades de geocodificação e mapa de calor."
            helpUrl="https://console.cloud.google.com/"
            helpText="1. Acesse o Google Cloud Console 2. Ative a Maps JavaScript API 3. Crie uma chave de API 4. Configure as restrições adequadas"
            onSave={handleSecretSave}
            isLoading={loading}
          />
        </TabsContent>

        <TabsContent value="stripe" className="space-y-4">
          <SecretKeyForm
            title="Stripe Payments"
            secretName="STRIPE_SECRET_KEY"
            placeholder="sk_..."
            description="Configure suas chaves do Stripe para processar pagamentos de forma segura."
            helpUrl="https://dashboard.stripe.com/apikeys"
            helpText="1. Acesse o Dashboard do Stripe 2. Vá em Desenvolvedores → Chaves de API 3. Copie sua chave secreta (sk_...) 4. Use chaves de teste para desenvolvimento"
            onSave={handleSecretSave}
            isLoading={loading}
          />
        </TabsContent>

        <TabsContent value="n8n" className="space-y-4">
          <N8nConfig />
        </TabsContent>

        <TabsContent value="ibge" className="space-y-4">
          <IBGEConfig />
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

              <div className="p-3 bg-green-50 border border-green-200 rounded text-sm">
                <p className="font-medium text-green-800 mb-1">Edge Functions Ativas:</p>
                <ul className="text-green-700 space-y-1">
                  <li>• check-secret</li>
                  <li>• test-secret</li>
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

function getIntegrationIcon(id: string) {
  switch (id) {
    case 'google-maps':
      return <Globe className="h-4 w-4" />;
    case 'stripe':
      return <CreditCard className="h-4 w-4" />;
    case 'n8n-webhook':
      return <MessageCircle className="h-4 w-4" />;
    case 'ibge-apis':
      return <MapPin className="h-4 w-4" />;
    case 'supabase':
      return <Database className="h-4 w-4" />;
    default:
      return <Settings className="h-4 w-4" />;
  }
}
