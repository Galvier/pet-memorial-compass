
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Send } from 'lucide-react';
import { NotificationService } from '@/services/NotificationService';
import { toast } from 'sonner';

export const NotificationConfig: React.FC = () => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [testNumber, setTestNumber] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkConfiguration();
  }, []);

  const checkConfiguration = async () => {
    const configured = await NotificationService.isWebhookConfigured();
    setIsConfigured(configured);
  };

  const handleTest = async () => {
    if (!testNumber) {
      toast.error('Informe um número para teste');
      return;
    }

    setLoading(true);
    try {
      const result = await NotificationService.sendToAttendant(
        testNumber,
        '🧪 Teste de notificação do Pet Memorial - Sistema funcionando!'
      );

      if (result.success) {
        toast.success('Mensagem de teste enviada com sucesso!');
      } else {
        toast.error(`Erro no teste: ${result.message}`);
      }
    } catch (error) {
      toast.error('Erro ao enviar mensagem de teste');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Configuração de Notificações
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <span>Status:</span>
          {isConfigured ? (
            <Badge variant="outline" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Configurado
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
              <AlertCircle className="h-3 w-3 mr-1" />
              Não configurado
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="test-number">Número para teste (formato: 5511999999999)</Label>
          <Input
            id="test-number"
            type="text"
            placeholder="5511999999999"
            value={testNumber}
            onChange={(e) => setTestNumber(e.target.value)}
          />
        </div>

        <Button 
          onClick={handleTest} 
          disabled={loading || !testNumber}
          className="w-full"
        >
          {loading ? 'Enviando...' : 'Enviar Mensagem de Teste'}
        </Button>

        {!isConfigured && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              Configure o webhook do n8n na aba "Integrações" para ativar as notificações automáticas.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
