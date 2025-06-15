
/**
 * Serviço para envio de notificações em tempo real para atendentes
 * Integra com n8n para envio de mensagens WhatsApp
 */

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
  private static n8nWebhookUrl: string | null = null;

  /**
   * Configura a URL do webhook do n8n
   * Em uma aplicação real, isso viria de variáveis de ambiente
   */
  static setWebhookUrl(url: string) {
    this.n8nWebhookUrl = url;
    console.log('🔗 URL do webhook n8n configurada');
  }

  /**
   * Envia notificação para atendente via n8n
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

      if (!this.n8nWebhookUrl) {
        console.warn('⚠️ URL do webhook n8n não configurada - simulando envio');
        
        // Simular o envio da notificação
        console.log(`📱 SIMULAÇÃO - Mensagem enviada para ${attendantWhatsapp}:`);
        console.log(`📝 Conteúdo: ${message}`);
        
        return {
          success: true,
          message: 'Notificação simulada com sucesso'
        };
      }

      const payload: NotificationPayload = {
        to: attendantWhatsapp,
        text: message,
        ...metadata
      };

      const response = await fetch(this.n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('✅ Notificação enviada com sucesso para:', attendantWhatsapp);
      
      return {
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
