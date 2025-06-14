
import { PetMemorialAPI } from '@/lib/api';

/**
 * Endpoint específico para solicitação automática de atendimento humano
 * Este endpoint implementa a lógica Round-Robin para distribuição equitativa
 * AGORA COM NOTIFICAÇÕES AUTOMÁTICAS VIA N8N
 */
export async function solicitarAtendimentoAutomatico(atendimentoId: number) {
  try {
    console.log('🎯 Iniciando atribuição automática Round-Robin com notificação:', atendimentoId);
    
    const resultado = await PetMemorialAPI.solicitarAtendimentoHumano(atendimentoId);
    
    console.log('✅ Atribuição Round-Robin concluída com notificação enviada');
    
    return {
      success: true,
      message: resultado.message,
      details: {
        atendimento_id: atendimentoId,
        atendente_atribuido: resultado.atendente_atribuido,
        metodo: 'Round-Robin',
        notificacao: 'Enviada automaticamente',
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('❌ Erro na atribuição Round-Robin:', error);
    
    return {
      success: false,
      message: 'Erro na atribuição automática',
      error: error.message,
      details: {
        atendimento_id: atendimentoId,
        metodo: 'Round-Robin',
        notificacao: 'Falha no envio',
        timestamp: new Date().toISOString()
      }
    };
  }
}

/**
 * Função utilitária para obter estatísticas de distribuição de carga
 */
export async function obterEstatisticasDistribuicao() {
  try {
    console.log('📊 Calculando estatísticas de distribuição...');
    
    // Esta função pode ser expandida para fornecer insights sobre 
    // a eficácia do algoritmo Round-Robin
    return {
      algoritmo: 'Round-Robin',
      criterio: 'Menor carga de trabalho',
      notificacoes: 'Automáticas via n8n + WhatsApp',
      timestamp: new Date().toISOString(),
      observacao: 'Distribui atendimentos baseado no atendente online com menos atendimentos ativos e notifica automaticamente'
    };
  } catch (error) {
    console.error('Erro ao calcular estatísticas:', error);
    throw error;
  }
}

/**
 * Integração completa com n8n para solicitação automática COM NOTIFICAÇÃO
 */
export function integracaoCompletaN8NRoundRobin(atendimentoId: number) {
  return {
    // URL que o n8n chamaria para solicitar atendimento humano automaticamente
    urlSolicitacao: `/api/attendances/${atendimentoId}/request-human`,
    
    // Novo: Configuração do webhook para notificações
    webhookNotificacao: {
      descricao: "Webhook que recebe dados para envio da notificação WhatsApp",
      metodo: "POST",
      payload_exemplo: {
        to: "5511999999999",
        text: "🤖 NOVA ATRIBUIÇÃO AUTOMÁTICA\n\nOlá, João!\n\nUm cliente solicitou atendimento...",
        attendant_name: "João Silva",
        client_name: "Maria Santos",
        attendance_id: atendimentoId
      }
    },
    
    // Exemplo de como o n8n usaria este endpoint
    exemploUso: {
      descricao: "Fluxo completo: Bot detecta solicitação → API atribui → Webhook notifica → WhatsApp envia",
      etapas: [
        "1. Cliente solicita atendimento humano",
        "2. n8n chama endpoint de atribuição automática",
        "3. Sistema escolhe atendente via Round-Robin",
        "4. Sistema chama webhook de notificação",
        "5. n8n recebe webhook e envia WhatsApp",
        "6. Atendente recebe notificação instantânea"
      ],
      resposta_exemplo: {
        "success": true,
        "message": "Atendimento atribuído automaticamente via Round-Robin para João Silva",
        "details": {
          "atendimento_id": atendimentoId,
          "atendente_atribuido": "João Silva",
          "metodo": "Round-Robin",
          "notificacao": "Enviada automaticamente",
          "timestamp": "2024-06-14T15:30:00.000Z"
        }
      }
    }
  };
}
