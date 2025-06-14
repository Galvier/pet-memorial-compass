
import { PetMemorialAPI } from '@/lib/api';
import { AtribuirAtendimentoRequest } from '@/types';

// Endpoint para assumir atendimento
export async function assumirAtendimento(atendimentoId: number) {
  try {
    console.log('Assumindo atendimento:', atendimentoId);
    
    const result = await PetMemorialAPI.assumirAtendimento(atendimentoId);
    
    console.log('Atendimento assumido com sucesso');
    
    return { success: true, message: 'Atendimento assumido com sucesso' };
  } catch (error) {
    console.error('Erro ao assumir atendimento:', error);
    throw new Error('Erro interno do servidor');
  }
}

// Endpoint para atribuir atendimento a um atendente específico
export async function atribuirAtendimento(atendimentoId: number, request: AtribuirAtendimentoRequest) {
  try {
    console.log('Atribuindo atendimento:', atendimentoId, 'para atendente:', request.atendente_id);
    
    const result = await PetMemorialAPI.atribuirAtendimento(atendimentoId, request);
    
    console.log('Atendimento atribuído com sucesso');
    
    return { success: true, message: 'Atendimento atribuído e notificação enviada' };
  } catch (error) {
    console.error('Erro ao atribuir atendimento:', error);
    throw new Error('Erro interno do servidor');
  }
}

// Endpoint para solicitação automática de atendimento humano (Round-Robin)
export async function solicitarAtendimentoHumano(atendimentoId: number) {
  try {
    console.log('🤖 Solicitando atendimento humano automático (Round-Robin) para:', atendimentoId);
    
    const result = await PetMemorialAPI.solicitarAtendimentoHumano(atendimentoId);
    
    console.log('✅ Atendimento atribuído automaticamente via Round-Robin');
    
    return { 
      success: true, 
      message: result.message,
      atendente_atribuido: result.atendente_atribuido 
    };
  } catch (error) {
    console.error('❌ Erro na atribuição automática:', error);
    throw new Error('Erro interno do servidor');
  }
}

// Endpoint para verificar status do atendimento
export async function verificarStatusAtendimento(idWhatsapp: string) {
  try {
    console.log('Verificando status do atendimento para:', idWhatsapp);
    
    const result = await PetMemorialAPI.verificarStatusAtendimento(idWhatsapp);
    
    console.log('Status verificado:', result);
    
    return result;
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    throw new Error('Erro interno do servidor');
  }
}

// Simulação de endpoints - em uma aplicação real, isso seria configurado no servidor
export const simulateAtendimentoAPI = {
  assumir: assumirAtendimento,
  atribuir: atribuirAtendimento,
  solicitarHumano: solicitarAtendimentoHumano,
  verificarStatus: verificarStatusAtendimento
};
