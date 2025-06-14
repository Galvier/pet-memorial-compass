
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, Webhook, MessageCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { NotificationService } from '@/services/NotificationService';
import { useToast } from '@/hooks/use-toast';

export const NotificationConfig: React.FC = () => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [isTestMode, setIsTestMode] = useState(true);
  const { toast } = useToast();

  const handleSaveWebhook = () => {
    if (webhookUrl.trim()) {
      NotificationService.setWebhookUrl(webhookUrl);
      setIsConfigured(true);
      setIsTestMode(false);
      toast({
        title: "Configuração Salva",
        description: "URL do webhook n8n configurada com sucesso!",
      });
    } else {
      toast({
        title: "Erro",
        description: "Por favor, insira uma URL válida",
        variant: "destructive",
      });
    }
  };

  const handleTestNotification = async () => {
    try {
      const result = await NotificationService.sendToAttendant(
        '5511999999999',
        '🧪 Teste de notificação do sistema Pet Memorial. Se você recebeu esta mensagem, a integração está funcionando!',
        {
          attendant_name: 'Teste',
          client_name: 'Sistema',
          attendance_id: 999
        }
      );

      if (result.success) {
        toast({
          title: "Teste Enviado",
          description: "Notificação de teste processada com sucesso!",
        });
      } else {
        toast({
          title: "Erro no Teste",
          description: result.error || "Falha ao enviar notificação",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao executar teste de notificação",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-purple-primary" />
          Configuração de Notificações
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant={isConfigured ? "default" : "secondary"} className="flex items-center gap-1">
            {isConfigured ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
            {isConfigured ? 'Configurado' : 'Não Configurado'}
          </Badge>
          {isTestMode && (
            <Badge variant="outline" className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              Modo Simulação
            </Badge>
          )}
        </div>

        <Alert>
          <Webhook className="h-4 w-4" />
          <AlertDescription>
            Configure o URL do webhook do n8n para ativar as notificações automáticas via WhatsApp.
            Quando não configurado, o sistema funcionará em modo simulação.
          </AlertDescription>
        </Alert>

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
            <Button onClick={handleSaveWebhook} variant="outline">
              Salvar
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleTestNotification} variant="outline" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Testar Notificação
          </Button>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Como Configurar no n8n:</h4>
          <ol className="text-sm space-y-1 text-gray-600">
            <li>1. Crie um novo workflow no n8n</li>
            <li>2. Adicione um nó "Webhook" como trigger</li>
            <li>3. Copie a URL do webhook e cole acima</li>
            <li>4. Adicione um nó "WhatsApp" após o webhook</li>
            <li>5. Configure: To = {`{{$json.body.to}}`}, Text = {`{{$json.body.text}}`}</li>
            <li>6. Ative o workflow</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};
