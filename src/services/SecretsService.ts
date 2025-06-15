
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
}
