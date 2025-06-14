
import { RecomendacaoRequest, RecomendacaoResponse } from '@/types';
import { PetMemorialAPI } from '@/lib/api';

export async function POST(request: Request) {
  try {
    const body: RecomendacaoRequest = await request.json();
    
    console.log('Recebendo dados estruturados do n8n:', body);
    
    // Validar dados obrigatórios
    if (!body.id_whatsapp || !body.nome_tutor || !body.tipo_atendimento) {
      return Response.json(
        { error: 'Dados obrigatórios: id_whatsapp, nome_tutor, tipo_atendimento' },
        { status: 400 }
      );
    }

    // Validar dados do pet
    if (!body.pet || !body.pet.nome || !body.pet.idade) {
      return Response.json(
        { error: 'Dados do pet obrigatórios: nome e idade' },
        { status: 400 }
      );
    }

    // Validar dados do tutor
    if (!body.tutor || !body.tutor.profissao || !body.tutor.endereco) {
      return Response.json(
        { error: 'Dados do tutor obrigatórios: profissao e endereco' },
        { status: 400 }
      );
    }
    
    // Processar recomendação com nova estrutura
    const response = await PetMemorialAPI.processarRecomendacao(body);
    
    console.log('Enviando sugestões para n8n:', response);
    
    return Response.json(response);
  } catch (error) {
    console.error('Erro na API de recomendação:', error);
    return Response.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Simulação de endpoint - em uma aplicação real, isso seria configurado no servidor
export const simulateRecomendacaoAPI = async (request: RecomendacaoRequest): Promise<RecomendacaoResponse> => {
  console.log('📥 API Recebeu dados estruturados do n8n:', request);
  
  const response = await PetMemorialAPI.processarRecomendacao(request);
  
  console.log('📤 API Respondendo para n8n:', response);
  
  return response;
};
