
import { PetMemorialAPI } from '@/lib/api';

/**
 * Endpoint específico para solicitação automática de atendimento humano
 * Este endpoint implementa a lógica Round-Robin para distribuição equitativa
 */
export async function solicitarAtendimentoAutomatico(atendimentoId: number) {
  try {
    console.log('🎯 Iniciando atribuição automática Round-Robin:', atendimentoId);
    
    const resultado = await PetMemorialAPI.solicitarAtendimentoHumano(atendimentoId);
    
    console.log('✅ Atribuição Round-Robin concluída com sucesso');
    
    return {
      success: true,
      message: resultado.message,
      details: {
        atendimento_id: atendimentoId,
        atendente_atribuido: resultado.atendente_atribuido,
        metodo: 'Round-Robin',
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
      timestamp: new Date().toISOString(),
      observacao: 'Distribui atendimentos baseado no atendente online com menos atendimentos ativos'
    };
  } catch (error) {
    console.error('Erro ao calcular estatísticas:', error);
    throw error;
  }
}

/**
 * Simulação da integração com n8n para solicitação automática
 */
export function simularIntegracaoN8NRoundRobin(atendimentoId: number) {
  return {
    // URL que o n8n chamaria para solicitar atendimento humano automaticamente
    urlSolicitacao: `/api/attendances/${atendimentoId}/request-human`,
    
    // Exemplo de como o n8n usaria este endpoint
    exemploUso: {
      descricao: "O n8n deve fazer uma chamada POST para esta URL quando o cliente solicitar atendimento humano",
      metodo: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      resposta_exemplo: {
        "success": true,
        "message": "Atendimento atribuído automaticamente via Round-Robin para Ana Paula",
        "details": {
          "atendimento_id": atendimentoId,
          "atendente_atribuido": "Ana Paula",
          "metodo": "Round-Robin",
          "timestamp": "2024-06-14T15:30:00.000Z"
        }
      }
    }
  };
}
