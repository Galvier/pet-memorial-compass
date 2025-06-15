
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageCircle, 
  Webhook, 
  CheckCircle, 
  AlertTriangle, 
  TestTube,
  Copy,
  ExternalLink
} from 'lucide-react';
import { SecretsService } from '@/services/SecretsService';
import { NotificationService } from '@/services/NotificationService';
import { useToast } from '@/hooks/use-toast';

export const N8nConfig: React.FC = () => {
  const [isConfigured, setIsConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [testPhone, setTestPhone] = useState('5511999999999');
  const [testMessage, setTestMessage] = useState('🧪 Teste de notificação do sistema Pet Memorial');
  const { toast } = useToast();

  useEffect(() => {
    checkConfiguration();
  }, []);

  const checkConfiguration = async () => {
    setIsLoading(true);
    try {
      const configured = await SecretsService.checkN8nWebhookExists();
      setIsConfigured(configured);
      
      if (configured) {
        toast({
          title: "n8n Configurado",
          description: "Webhook URL está configurado no vault do Supabase",
        });
      }
    } catch (error) {
      console.error('Erro ao verificar configuração:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveWebhook = () => {
    const validation = SecretsService.validateWebhookUrl(webhookUrl);
    
    if (!validation.valid) {
      toast({
        title: "URL Inválida",
        description: validation.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Configuração Necessária",
      description: "Use o painel de secrets do Supabase para configurar N8N_WEBHOOK_URL",
    });
  };

  const handleTestWebhook = async () => {
    setIsLoading(true);
    try {
      const result = await SecretsService.testN8nWebhook();
      
      toast({
        title: result.success ? "Teste Bem-sucedido" : "Teste Falhou",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Erro no Teste",
        description: "Falha ao testar conectividade com webhook",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    setIsLoading(true);
    try {
      const result = await NotificationService.sendToAttendant(
        testPhone,
        testMessage,
        {
          attendant_name: 'Teste',
          client_name: 'Sistema',
          attendance_id: 999
        }
      );

      toast({
        title: result.success ? "Notificação Enviada" : "Erro no Envio",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao enviar notificação de teste",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Conteúdo copiado para a área de transferência",
    });
  };

  const examplePayload = {
    to: "5511999999999",
    text: "🤖 Nova atribuição automática para João Silva",
    attendant_name: "Maria",
    client_name: "João Silva",
    attendance_id: 123
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Configuração n8n WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant={isConfigured ? "default" : "secondary"} className="flex items-center gap-1">
              {isConfigured ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
              {isConfigured ? 'Configurado' : 'Não Configurado'}
            </Badge>
          </div>

          <Alert>
            <Webhook className="h-4 w-4" />
            <AlertDescription>
              Configure o URL do webhook do n8n para ativar as notificações automáticas via WhatsApp.
              O webhook será usado para enviar notificações de atribuição automática aos atendentes.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Tabs defaultValue="config" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="config">Configuração</TabsTrigger>
          <TabsTrigger value="test">Testes</TabsTrigger>
          <TabsTrigger value="docs">Documentação</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>URL do Webhook</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">URL do Webhook n8n</Label>
                <div className="flex gap-2">
                  <Input
                    id="webhook-url"
                    placeholder="https://n8n.exemplo.com/webhook/whatsapp-notification"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleSaveWebhook} disabled={isLoading} variant="outline">
                    Salvar
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  Use o painel de secrets do Supabase para configurar N8N_WEBHOOK_URL de forma segura.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Testes de Conectividade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button 
                  onClick={handleTestWebhook} 
                  disabled={isLoading || !isConfigured}
                  variant="outline" 
                  className="flex items-center gap-2"
                >
                  <TestTube className="h-4 w-4" />
                  Testar Webhook
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="test-phone">Telefone para Teste</Label>
                <Input
                  id="test-phone"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="5511999999999"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="test-message">Mensagem de Teste</Label>
                <Textarea
                  id="test-message"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Mensagem de teste"
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleTestNotification} 
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Enviar Teste
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuração no n8n</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium">Passo a Passo:</h4>
                <ol className="text-sm space-y-2 text-gray-600 list-decimal list-inside">
                  <li>Crie um novo workflow no n8n</li>
                  <li>Adicione um nó "Webhook" como trigger</li>
                  <li>Configure o método como POST</li>
                  <li>Copie a URL do webhook e configure nos secrets do Supabase</li>
                  <li>Adicione um nó "WhatsApp" (ou HTTP Request para API WhatsApp)</li>
                  <li>Configure as propriedades do WhatsApp conforme abaixo</li>
                  <li>Ative o workflow</li>
                </ol>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Configuração do nó WhatsApp:</h4>
                <div className="p-3 bg-gray-50 rounded text-sm">
                  <div className="space-y-1">
                    <p><strong>To Number:</strong> <code>{`{{$json.body.to}}`}</code></p>
                    <p><strong>Message:</strong> <code>{`{{$json.body.text}}`}</code></p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Payload de Exemplo:</h4>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(JSON.stringify(examplePayload, null, 2))}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copiar
                  </Button>
                </div>
                <pre className="p-3 bg-gray-50 rounded text-xs overflow-x-auto">
                  {JSON.stringify(examplePayload, null, 2)}
                </pre>
              </div>

              <Alert>
                <ExternalLink className="h-4 w-4" />
                <AlertDescription>
                  Para mais informações sobre configuração do WhatsApp no n8n, consulte a 
                  <a href="https://docs.n8n.io" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                    documentação oficial do n8n
                  </a>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
