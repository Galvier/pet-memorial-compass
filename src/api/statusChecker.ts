
import { PetMemorialAPI } from '@/lib/api';

/**
 * Endpoint para ser usado pelo n8n para verificar se deve continuar
 * enviando mensagens automáticas ou se um humano assumiu a conversa
 */
export async function verificarStatusParaN8N(idWhatsapp: string) {
  try {
    console.log('🤖 n8n verificando status para:', idWhatsapp);
    
    const response = await PetMemorialAPI.verificarStatusAtendimento(idWhatsapp);
    
    const deveInterromperBot = response.status !== 'BOT_ATIVO';
    
    console.log(`🔄 Status: ${response.status} - Bot deve parar: ${deveInterromperBot}`);
    
    return {
      status: response.status,
      bot_deve_parar: deveInterromperBot,
      pode_enviar_mensagem: !deveInterromperBot
    };
  } catch (error) {
    console.error('❌ Erro ao verificar status para n8n:', error);
    // Em caso de erro, permite que o bot continue por segurança
    return {
      status: 'BOT_ATIVO',
      bot_deve_parar: false,
      pode_enviar_mensagem: true,
      erro: 'Erro na verificação de status'
    };
  }
}

/**
 * Função utilitária para simular a integração com webhook do n8n
 */
export function simularIntegracaoN8N(idWhatsapp: string) {
  return {
    // URL que o n8n chamaria antes de cada envio de mensagem
    urlVerificacao: `/api/attendances/${idWhatsapp}/status`,
    
    // Exemplo de como o n8n usaria a resposta
    exemploUso: {
      descricao: "O n8n deve fazer uma chamada GET para esta URL antes de cada mensagem",
      logica: "Se status !== 'BOT_ATIVO', o workflow deve ser interrompido",
      resposta_exemplo: {
        "status": "ATRIBUIDO_HUMANO",
        "bot_deve_parar": true,
        "pode_enviar_mensagem": false
      }
    }
  };
}
