
/**
 * Serviço para envio de notificações em tempo real para atendentes
 * Integra com n8n para envio de mensagens WhatsApp
 */

import { supabase } from '@/integrations/supabase/client';

interface NotificationPayload {
  to: string;
  text: string;
  attendant_name?: string;
  client_name?: string;
  attendance_id?: number;
}

interface NotificationResponse {
  success: boolean;
  message: string;
  error?: string;
}

export class NotificationService {
  private static webhookUrl: string | null = null;

  /**
   * Carrega a URL do webhook dos secrets do Supabase
   */
  static async loadWebhookFromSecrets(): Promise<string | null> {
    try {
      const { data, error } = await supabase.functions.invoke('check-secret', {
        body: { secretName: 'N8N_WEBHOOK_URL' }
      });
      
      if (error || !data?.exists) {
        console.warn('⚠️ URL do webhook n8n não configurada nos secrets');
        return null;
      }
      
      // Note: Não podemos acessar o valor real do secret diretamente
      // O secret está disponível apenas nas edge functions
      this.webhookUrl = 'configured'; // Indica que está configurado
      return 'configured';
    } catch (error) {
      console.error('❌ Erro ao verificar webhook URL:', error);
      return null;
    }
  }

  /**
   * Verifica se o webhook está configurado
   */
  static async isWebhookConfigured(): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('check-secret', {
        body: { secretName: 'N8N_WEBHOOK_URL' }
      });
      
      return !error && data?.exists;
    } catch (error) {
      console.warn('Erro ao verificar configuração do webhook:', error);
      return false;
    }
  }

  /**
   * Testa a conectividade com o webhook n8n
   */
  static async testWebhookConnectivity(): Promise<NotificationResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('test-secret', {
        body: { secretName: 'N8N_WEBHOOK_URL', testType: 'n8n-webhook' }
      });
      
      if (error) {
        return { success: false, message: `Erro ao testar: ${error.message}` };
      }
      
      return data || { success: false, message: 'Resposta inválida' };
    } catch (error) {
      return { 
        success: false, 
        message: `Erro de conexão: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
      };
    }
  }

  /**
   * Envia notificação para atendente via edge function
   */
  static async sendToAttendant(
    attendantWhatsapp: string, 
    message: string, 
    metadata?: {
      attendant_name?: string;
      client_name?: string;
      attendance_id?: number;
    }
  ): Promise<NotificationResponse> {
    try {
      console.log('📲 Enviando notificação para atendente:', attendantWhatsapp);

      const isConfigured = await this.isWebhookConfigured();
      
      if (!isConfigured) {
        console.warn('⚠️ URL do webhook n8n não configurada - simulando envio');
        
        // Simular o envio da notificação
        console.log(`📱 SIMULAÇÃO - Mensagem enviada para ${attendantWhatsapp}:`);
        console.log(`📝 Conteúdo: ${message}`);
        
        return {
          success: true,
          message: 'Notificação simulada com sucesso (webhook não configurado)'
        };
      }

      // Usar edge function para enviar via webhook configurado
      const { data, error } = await supabase.functions.invoke('send-notification', {
        body: {
          to: attendantWhatsapp,
          text: message,
          ...metadata
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log('✅ Notificação enviada com sucesso para:', attendantWhatsapp);
      
      return data || {
        success: true,
        message: 'Notificação enviada com sucesso'
      };

    } catch (error) {
      console.error('❌ Erro ao enviar notificação:', error);
      
      return {
        success: false,
        message: 'Erro ao enviar notificação',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Formata mensagem padrão para atribuição de atendimento
   */
  static formatAssignmentMessage(
    attendantName: string,
    clientName: string,
    clientWhatsapp: string,
    attendanceId: number,
    attendanceType: string
  ): string {
    return `🤖 *NOVA ATRIBUIÇÃO AUTOMÁTICA*

Olá, ${attendantName}!

Um cliente solicitou atendimento humano e você foi automaticamente selecionado.

📋 *Detalhes do Atendimento:*
• Cliente: ${clientName}
• WhatsApp: ${clientWhatsapp}
• Tipo: ${attendanceType}
• ID: #${attendanceId}

⚡ Por favor, assuma a conversa o mais rápido possível!

🔗 Acesse o painel para ver mais detalhes.`;
  }

  /**
   * Envia notificação formatada para atribuição automática
   */
  static async notifyAutomaticAssignment(
    attendant: { nome_atendente: string; whatsapp_atendente: string },
    client: { nome_tutor: string; id_whatsapp: string },
    attendanceId: number,
    attendanceType: string
  ): Promise<NotificationResponse> {
    const message = this.formatAssignmentMessage(
      attendant.nome_atendente,
      client.nome_tutor,
      client.id_whatsapp,
      attendanceId,
      attendanceType
    );

    return this.sendToAttendant(
      attendant.whatsapp_atendente,
      message,
      {
        attendant_name: attendant.nome_atendente,
        client_name: client.nome_tutor,
        attendance_id: attendanceId
      }
    );
  }

  /**
   * Retorna exemplo de configuração para n8n
   */
  static getN8nIntegrationExample() {
    return {
      webhook_trigger: {
        description: "Configure um nó Webhook no n8n como trigger",
        method: "POST",
        expected_payload: {
          to: "5511999999999",
          text: "Mensagem a ser enviada",
          attendant_name: "Nome do Atendente",
          client_name: "Nome do Cliente",
          attendance_id: 123
        }
      },
      whatsapp_node: {
        description: "Adicione um nó WhatsApp após o webhook",
        configuration: {
          to_number: "{{$json.body.to}}",
          message_text: "{{$json.body.text}}"
        }
      }
    };
  }
}
