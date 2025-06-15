
import { supabase } from '@/integrations/supabase/client';

export class SecretsService {
  // Verificar se uma secret existe
  static async checkSecretExists(secretName: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('check-secret', {
        body: { secretName }
      });
      
      if (error) {
        console.warn(`Erro ao verificar secret ${secretName}:`, error);
        return false;
      }
      
      return data?.exists || false;
    } catch (error) {
      console.warn(`Erro ao verificar secret ${secretName}:`, error);
      return false;
    }
  }

  // Testar uma chave específica
  static async testSecret(secretName: string, testType: string): Promise<{ success: boolean; message: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('test-secret', {
        body: { secretName, testType }
      });
      
      if (error) {
        return { success: false, message: `Erro ao testar: ${error.message}` };
      }
      
      return data || { success: false, message: 'Resposta inválida' };
    } catch (error) {
      return { success: false, message: `Erro de conexão: ${error instanceof Error ? error.message : 'Erro desconhecido'}` };
    }
  }

  // Métodos específicos para n8n
  static async testN8nWebhook(): Promise<{ success: boolean; message: string }> {
    return this.testSecret('N8N_WEBHOOK_URL', 'n8n-webhook');
  }

  static async checkN8nWebhookExists(): Promise<boolean> {
    return this.checkSecretExists('N8N_WEBHOOK_URL');
  }

  // Método para validar formato de URL do webhook
  static validateWebhookUrl(url: string): { valid: boolean; message: string } {
    try {
      const parsedUrl = new URL(url);
      
      if (!parsedUrl.protocol.startsWith('http')) {
        return { valid: false, message: 'URL deve usar protocolo HTTP ou HTTPS' };
      }
      
      if (!parsedUrl.hostname) {
        return { valid: false, message: 'URL deve conter um hostname válido' };
      }
      
      return { valid: true, message: 'URL válida' };
    } catch (error) {
      return { valid: false, message: 'Formato de URL inválido' };
    }
  }
}
