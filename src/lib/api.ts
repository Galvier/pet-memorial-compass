
import { RecomendacaoRequest, RecomendacaoResponse, ItemDeVenda, Plano, Tutor, Atendimento, Pet, Atendente, AtribuirAtendimentoRequest, StatusAtendimentoResponse } from '@/types';
import { mockItensDeVenda, mockPlanos, mockTutores, mockAtendimentos, mockPets, mockAtendentes } from './mockData';
import { NotificationService } from '@/services/NotificationService';
import { supabase } from '@/integrations/supabase/client';

// Simula delay de API
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class PetMemorialAPI {
  static async calcularPerfil(profissao: string): Promise<'Padrão' | 'Intermediário' | 'Luxo'> {
    const profissaoLower = profissao.toLowerCase();
    
    if (['médico', 'advogado', 'empresário', 'dentista', 'engenheiro'].some(p => profissaoLower.includes(p))) {
      return 'Luxo';
    }
    
    if (['professor', 'analista', 'enfermeiro', 'técnico', 'contador'].some(p => profissaoLower.includes(p))) {
      return 'Intermediário';
    }
    
    return 'Padrão';
  }

  static async processarRecomendacao(request: RecomendacaoRequest): Promise<RecomendacaoResponse> {
    await delay(1000);
    
    console.log('📥 Processando nova estrutura de dados:', request);
    
    // Registrar/Atualizar Tutor
    let tutor = mockTutores.find(t => t.id_whatsapp === request.id_whatsapp);
    if (!tutor) {
      const novoTutor: Tutor = {
        tutor_id: Math.max(...mockTutores.map(t => t.tutor_id)) + 1,
        id_whatsapp: request.id_whatsapp,
        nome_tutor: request.nome_tutor,
        profissao: request.tutor.profissao,
        endereco: request.tutor.endereco,
        perfil_calculado: await this.calcularPerfil(request.tutor.profissao)
      };
      mockTutores.push(novoTutor);
      tutor = novoTutor;
      console.log('🆕 Novo tutor criado:', tutor);
    }
    
    // Registrar Pet
    const novoPet: Pet = {
      pet_id: Math.max(...mockPets.map(p => p.pet_id)) + 1,
      tutor_id: tutor.tutor_id,
      nome_pet: request.pet.nome,
      idade_pet: request.pet.idade
    };
    mockPets.push(novoPet);
    console.log('🐕 Novo pet registrado:', novoPet);
    
    // Registrar Atendimento
    const novoAtendimento: Atendimento = {
      atendimento_id: Math.max(...mockAtendimentos.map(a => a.atendimento_id)) + 1,
      tutor_id: tutor.tutor_id,
      pet_id: novoPet.pet_id,
      data_inicio: new Date().toISOString(),
      status: 'Em andamento',
      status_atendimento: 'BOT_ATIVO',
      tipo_atendimento: request.tipo_atendimento,
      dados_coletados: {
        preferencias: request.preferencias,
        pet: request.pet,
        tutor: request.tutor
      },
      sugestoes_geradas: [],
      tutor: tutor,
      pet: novoPet
    };
    
    if (request.tipo_atendimento === 'Preventivo') {
      const sugestoes = mockPlanos.map(plano => ({
        nome: plano.nome_plano,
        descricao: plano.descricao_curta
      }));
      
      novoAtendimento.sugestoes_geradas = sugestoes;
      novoAtendimento.status = 'Sugestão enviada';
      
      mockAtendimentos.push(novoAtendimento);
      console.log('📋 Atendimento preventivo registrado:', novoAtendimento);
      
      return {
        tipo_sugestao: "Planos Preventivos",
        sugestoes: sugestoes
      };
    }
    
    // Lógica para atendimento "Imediato"
    const perfil = tutor.perfil_calculado;
    
    let pacoteSugerido;
    
    if (perfil === 'Padrão') {
      pacoteSugerido = {
        nome: "Pacote Cremação Coletiva",
        descricao: "Inclui Cremação Coletiva (Imediata).",
        preco: "400.00"
      };
    } else if (perfil === 'Intermediário') {
      pacoteSugerido = {
        nome: "Pacote Homenagem Completa",
        descricao: "Inclui Cremação Individual e uma Urna Padrão.",
        preco: "950.00"
      };
    } else { // Luxo
      pacoteSugerido = {
        nome: "Pacote Homenagem Superior",
        descricao: "Inclui Cremação Individual e uma Urna Superior.",
        preco: "1150.00"
      };
    }
    
    novoAtendimento.sugestoes_geradas = [pacoteSugerido];
    novoAtendimento.status = 'Sugestão enviada';
    
    mockAtendimentos.push(novoAtendimento);
    console.log('🚨 Atendimento imediato registrado:', novoAtendimento);
    
    return {
      tipo_sugestao: "Pacote Imediato",
      sugestoes: [pacoteSugerido]
    };
  }

  // Métodos para controle de atendimento
  static async assumirAtendimento(atendimentoId: number): Promise<boolean> {
    await delay(300);
    
    const atendimento = mockAtendimentos.find(a => a.atendimento_id === atendimentoId);
    if (!atendimento) {
      throw new Error('Atendimento não encontrado');
    }
    
    atendimento.status_atendimento = 'ATRIBUIDO_HUMANO';
    console.log('👤 Atendimento assumido por humano:', atendimentoId);
    
    return true;
  }

  static async atribuirAtendimento(atendimentoId: number, request: AtribuirAtendimentoRequest): Promise<boolean> {
    await delay(500);
    
    const atendimento = mockAtendimentos.find(a => a.atendimento_id === atendimentoId);
    if (!atendimento) {
      throw new Error('Atendimento não encontrado');
    }

    const atendente = mockAtendentes.find(a => a.atendente_id === request.atendente_id);
    if (!atendente) {
      throw new Error('Atendente não encontrado');
    }

    atendimento.atendente_responsavel_id = request.atendente_id;
    atendimento.status_atendimento = 'ATRIBUIDO_HUMANO';
    atendimento.atendente = atendente;
    
    console.log('📋 Atendimento atribuído ao atendente:', atendente.nome_atendente);
    
    // Simulando notificação via webhook/WhatsApp
    console.log(`📲 Notificação enviada para ${atendente.whatsapp_atendente}:`, 
      `Olá, ${atendente.nome_atendente}. Um novo atendimento foi atribuído a você.\n\nCliente: ${atendimento.tutor?.nome_tutor}\nPet: ${atendimento.pet?.nome_pet}\n\nPor favor, acesse o painel para assumir a conversa.`);
    
    return true;
  }

  // NOVA FUNCIONALIDADE: Colocar atendimento na fila
  static async colocarNaFila(atendimentoId: number): Promise<{message: string}> {
    await delay(300);
    
    console.log('📋 Colocando atendimento na fila:', atendimentoId);
    
    const atendimento = mockAtendimentos.find(a => a.atendimento_id === atendimentoId);
    if (!atendimento) {
      throw new Error('Atendimento não encontrado');
    }

    // Atualizar status para aguardando na fila
    atendimento.status_atendimento = 'AGUARDANDO_NA_FILA';
    atendimento.atendente_responsavel_id = undefined;
    
    console.log('✅ Atendimento colocado na fila com sucesso');
    
    // Simular notificação para grupo de atendentes
    console.log('🔔 Notificação enviada para grupo de atendentes: "Novo atendimento na fila! Acesse o painel para atender."');
    
    return {
      message: 'Atendimento colocado na fila com sucesso'
    };
  }

  // NOVA FUNCIONALIDADE: Reivindicar atendimento da fila
  static async reivindicarAtendimento(atendimentoId: number): Promise<{message: string}> {
    await delay(500);
    
    console.log('🎯 Reivindicando atendimento da fila:', atendimentoId);
    
    const atendimento = mockAtendimentos.find(a => a.atendimento_id === atendimentoId);
    if (!atendimento) {
      throw new Error('Atendimento não encontrado');
    }

    // Verificação de concorrência - simular conflito às vezes
    if (atendimento.status_atendimento !== 'AGUARDANDO_NA_FILA') {
      const error = new Error('Este atendimento já foi reivindicado por outro atendente');
      error.message = '409: ' + error.message;
      throw error;
    }

    // Simular atendente atual (na implementação real viria do JWT)
    const atendenteAtual = mockAtendentes[0]; // Primeiro atendente como exemplo
    
    atendimento.status_atendimento = 'ATRIBUIDO_HUMANO';
    atendimento.atendente_responsavel_id = atendenteAtual.atendente_id;
    atendimento.atendente = atendenteAtual;
    
    console.log(`✅ Atendimento reivindicado por: ${atendenteAtual.nome_atendente}`);
    
    return {
      message: `Atendimento reivindicado com sucesso por ${atendenteAtual.nome_atendente}`
    };
  }

  // NOVA FUNCIONALIDADE: Finalizar atendimento
  static async finalizarAtendimento(atendimentoId: number): Promise<{message: string}> {
    await delay(300);
    
    console.log('🏁 Finalizando atendimento:', atendimentoId);
    
    const atendimento = mockAtendimentos.find(a => a.atendimento_id === atendimentoId);
    if (!atendimento) {
      throw new Error('Atendimento não encontrado');
    }

    atendimento.status_atendimento = 'FINALIZADO';
    atendimento.status = 'Finalizado';
    
    console.log('✅ Atendimento finalizado com sucesso');
    
    return {
      message: 'Atendimento finalizado com sucesso'
    };
  }

  // Nova função: Lógica de Round-Robin para atribuição automática COM NOTIFICAÇÃO
  static async solicitarAtendimentoHumano(atendimentoId: number): Promise<{message: string, atendente_atribuido: string}> {
    await delay(800);
    
    console.log('🔄 Iniciando processo Round-Robin para atendimento:', atendimentoId);
    
    // Passo 1: Encontrar o atendimento
    const atendimento = mockAtendimentos.find(a => a.atendimento_id === atendimentoId);
    if (!atendimento) {
      throw new Error('Atendimento não encontrado');
    }

    // Passo 2: Encontrar atendentes online
    const atendentesOnline = mockAtendentes.filter(a => a.status_disponibilidade === 'Online');
    
    if (atendentesOnline.length === 0) {
      console.log('⏳ Nenhum atendente online - colocando na fila');
      
      // Se não há atendentes online, colocar na fila
      atendimento.status_atendimento = 'AGUARDANDO_NA_FILA';
      
      return {
        message: 'Nenhum atendente online. Atendimento colocado na fila.',
        atendente_atribuido: 'Na fila'
      };
    }

    // Passo 3: Calcular carga de trabalho de cada atendente online
    const cargaTrabalho = atendentesOnline.map(atendente => {
      const atendimentosAtivos = mockAtendimentos.filter(a => 
        a.atendente_responsavel_id === atendente.atendente_id && 
        a.status_atendimento === 'ATRIBUIDO_HUMANO'
      ).length;
      
      return {
        atendente,
        carga: atendimentosAtivos
      };
    });

    console.log('📊 Carga de trabalho atual:', cargaTrabalho.map(c => 
      `${c.atendente.nome_atendente}: ${c.carga} atendimentos`
    ));

    // Passo 4: Encontrar atendente com menor carga (Round-Robin)
    const atendenteEscolhido = cargaTrabalho.reduce((menor, atual) => 
      atual.carga < menor.carga ? atual : menor
    );

    console.log(`🎯 Atendente escolhido: ${atendenteEscolhido.atendente.nome_atendente} (${atendenteEscolhido.carga} atendimentos ativos)`);

    // Passo 5: Atribuir o atendimento
    atendimento.atendente_responsavel_id = atendenteEscolhido.atendente.atendente_id;
    atendimento.status_atendimento = 'ATRIBUIDO_HUMANO';
    atendimento.atendente = atendenteEscolhido.atendente;

    // Passo 6: NOVA FUNCIONALIDADE - Enviar notificação automática via NotificationService
    if (atendimento.tutor) {
      try {
        const notificationResult = await NotificationService.notifyAutomaticAssignment(
          atendenteEscolhido.atendente,
          atendimento.tutor,
          atendimentoId,
          atendimento.tipo_atendimento
        );

        if (notificationResult.success) {
          console.log('🔔 Notificação automática enviada com sucesso!');
        } else {
          console.warn('⚠️ Falha na notificação:', notificationResult.error);
        }
      } catch (error) {
        console.error('❌ Erro crítico na notificação:', error);
        // Não falha a atribuição por causa da notificação
      }
    }

    // Passo 7: Log da notificação (mantendo compatibilidade)
    console.log(`🔔 Notificação automática processada para ${atendenteEscolhido.atendente.whatsapp_atendente}`);
    
    return {
      message: `Atendimento atribuído automaticamente via Round-Robin para ${atendenteEscolhido.atendente.nome_atendente}`,
      atendente_atribuido: atendenteEscolhido.atendente.nome_atendente
    };
  }

  static async verificarStatusAtendimento(idWhatsapp: string): Promise<StatusAtendimentoResponse> {
    await delay(200);
    
    // Buscar o atendimento mais recente para este WhatsApp
    const atendimento = mockAtendimentos
      .filter(a => {
        const tutor = mockTutores.find(t => t.tutor_id === a.tutor_id);
        return tutor?.id_whatsapp === idWhatsapp;
      })
      .sort((a, b) => new Date(b.data_inicio).getTime() - new Date(a.data_inicio).getTime())[0];
    
    if (!atendimento) {
      return { status: 'BOT_ATIVO' }; // Novo atendimento
    }
    
    return { status: atendimento.status_atendimento };
  }

  // CRUD Operations para Atendentes
  static async getAtendentes(): Promise<Atendente[]> {
    await delay(500);
    return [...mockAtendentes];
  }

  static async getAtendentesOnline(): Promise<Atendente[]> {
    await delay(300);
    return mockAtendentes.filter(a => a.status_disponibilidade === 'Online');
  }

  static async createAtendente(atendente: Omit<Atendente, 'atendente_id'>): Promise<Atendente> {
    await delay(500);
    const newAtendente = {
      ...atendente,
      atendente_id: Math.max(...mockAtendentes.map(a => a.atendente_id)) + 1
    };
    mockAtendentes.push(newAtendente);
    return newAtendente;
  }

  static async updateAtendente(atendente: Atendente): Promise<Atendente> {
    await delay(500);
    const index = mockAtendentes.findIndex(a => a.atendente_id === atendente.atendente_id);
    if (index !== -1) {
      mockAtendentes[index] = atendente;
    }
    return atendente;
  }

  static async deleteAtendente(id: number): Promise<void> {
    await delay(500);
    const index = mockAtendentes.findIndex(a => a.atendente_id === id);
    if (index !== -1) {
      mockAtendentes.splice(index, 1);
    }
  }

  static async toggleAtendenteStatus(id: number): Promise<Atendente> {
    await delay(300);
    const atendente = mockAtendentes.find(a => a.atendente_id === id);
    if (!atendente) {
      throw new Error('Atendente não encontrado');
    }
    
    atendente.status_disponibilidade = atendente.status_disponibilidade === 'Online' ? 'Offline' : 'Online';
    return atendente;
  }

  // CRUD Operations para Planos
  static async getPlanos(): Promise<Plano[]> {
    await delay(500);
    return [...mockPlanos];
  }

  static async createPlano(plano: Omit<Plano, 'plano_id'>): Promise<Plano> {
    await delay(500);
    const newPlano = {
      ...plano,
      plano_id: Math.max(...mockPlanos.map(p => p.plano_id)) + 1
    };
    mockPlanos.push(newPlano);
    return newPlano;
  }

  static async updatePlano(plano: Plano): Promise<Plano> {
    await delay(500);
    const index = mockPlanos.findIndex(p => p.plano_id === plano.plano_id);
    if (index !== -1) {
      mockPlanos[index] = plano;
    }
    return plano;
  }

  static async deletePlano(id: number): Promise<void> {
    await delay(500);
    const index = mockPlanos.findIndex(p => p.plano_id === id);
    if (index !== -1) {
      mockPlanos.splice(index, 1);
    }
  }

  // CRUD Operations para Itens de Venda
  static async getItensDeVenda(): Promise<ItemDeVenda[]> {
    await delay(500);
    return [...mockItensDeVenda];
  }

  static async createItemDeVenda(item: Omit<ItemDeVenda, 'item_id'>): Promise<ItemDeVenda> {
    await delay(500);
    const newItem = {
      ...item,
      item_id: Math.max(...mockItensDeVenda.map(i => i.item_id)) + 1
    };
    mockItensDeVenda.push(newItem);
    return newItem;
  }

  static async updateItemDeVenda(item: ItemDeVenda): Promise<ItemDeVenda> {
    await delay(500);
    const index = mockItensDeVenda.findIndex(i => i.item_id === item.item_id);
    if (index !== -1) {
      mockItensDeVenda[index] = item;
    }
    return item;
  }

  static async deleteItemDeVenda(id: number): Promise<void> {
    await delay(500);
    const index = mockItensDeVenda.findIndex(i => i.item_id === id);
    if (index !== -1) {
      mockItensDeVenda.splice(index, 1);
    }
  }

  // CRUD Operations para Pets
  static async getPets(): Promise<Pet[]> {
    await delay(500);
    return [...mockPets];
  }

  static async getPet(id: number): Promise<Pet | null> {
    await delay(500);
    return mockPets.find(p => p.pet_id === id) || null;
  }

  // CRUD Operations para Atendimentos
  static async getAtendimentos(): Promise<Atendimento[]> {
    await delay(500);
    // Garantir que os relacionamentos estão populados
    return mockAtendimentos.map(atendimento => ({
      ...atendimento,
      tutor: mockTutores.find(t => t.tutor_id === atendimento.tutor_id),
      pet: mockPets.find(p => p.pet_id === atendimento.pet_id),
      atendente: atendimento.atendente_responsavel_id ? 
        mockAtendentes.find(a => a.atendente_id === atendimento.atendente_responsavel_id) : undefined
    }));
  }

  static async getAtendimento(id: number): Promise<Atendimento | null> {
    await delay(500);
    const atendimento = mockAtendimentos.find(a => a.atendimento_id === id);
    if (!atendimento) return null;
    
    return {
      ...atendimento,
      tutor: mockTutores.find(t => t.tutor_id === atendimento.tutor_id),
      pet: mockPets.find(p => p.pet_id === atendimento.pet_id),
      atendente: atendimento.atendente_responsavel_id ? 
        mockAtendentes.find(a => a.atendente_id === atendimento.atendente_responsavel_id) : undefined
    };
  }

  static async getDashboardStats() {
    await delay(300);
    
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const ultimaSemana = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Métricas Principais
    const totalAtendimentos = mockAtendimentos.length;
    const atendimentosHoje = mockAtendimentos.filter(a => {
      const dataAtendimento = new Date(a.data_inicio).toDateString();
      return hoje.toDateString() === dataAtendimento;
    }).length;
    
    const atendimentosMes = mockAtendimentos.filter(a => {
      const dataAtendimento = new Date(a.data_inicio);
      return dataAtendimento >= inicioMes;
    }).length;
    
    const atendimentosFinalizados = mockAtendimentos.filter(a => a.status === 'Finalizado').length;
    const taxaConversao = totalAtendimentos > 0 ? ((atendimentosFinalizados / totalAtendimentos) * 100).toFixed(1) : '0';
    
    // Simular ticket médio baseado nos preços dos pacotes
    const ticketMedio = 850.50;
    
    // Atendimentos por dia da semana (últimos 7 dias)
    const atendimentosPorDia = [];
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    for (let i = 6; i >= 0; i--) {
      const data = new Date(hoje.getTime() - i * 24 * 60 * 60 * 1000);
      const dia = diasSemana[data.getDay()];
      const count = mockAtendimentos.filter(a => {
        const dataAtendimento = new Date(a.data_inicio).toDateString();
        return data.toDateString() === dataAtendimento;
      }).length + Math.floor(Math.random() * 5); // Adiciona dados simulados
      
      atendimentosPorDia.push({ day: dia, count });
    }
    
    // Produtos/Planos mais vendidos
    const produtosMaisVendidos = [
      { name: 'Pacote Homenagem Superior', count: 12, percentage: 35 },
      { name: 'Plano Ouro', count: 9, percentage: 27 },
      { name: 'Pacote Homenagem Completa', count: 7, percentage: 20 },
      { name: 'Plano Prata', count: 4, percentage: 12 },
      { name: 'Plano Bronze', count: 2, percentage: 6 }
    ];
    
    // Performance por atendente
    const performanceAtendentes = mockAtendentes.map(atendente => {
      const atendimentosAtribuidos = mockAtendimentos.filter(a => 
        a.atendente_responsavel_id === atendente.atendente_id
      ).length + Math.floor(Math.random() * 15); // Dados simulados
      
      const atendimentosConcluidos = Math.floor(atendimentosAtribuidos * 0.6); // 60% de conclusão
      const taxaConversaoAtendente = atendimentosAtribuidos > 0 
        ? ((atendimentosConcluidos / atendimentosAtribuidos) * 100).toFixed(1)
        : '0';
      
      return {
        nome: atendente.nome_atendente,
        atribuidos: atendimentosAtribuidos,
        concluidos: atendimentosConcluidos,
        taxaConversao: taxaConversaoAtendente,
        status: atendente.status_disponibilidade
      };
    });
    
    // Distribuição por tipo de atendimento
    const distribuicaoTipos = [
      { tipo: 'Imediato', count: 15, percentage: 65 },
      { tipo: 'Preventivo', count: 8, percentage: 35 }
    ];
    
    return {
      summary: {
        totalAtendimentos,
        atendimentosHoje,
        atendimentosMes,
        taxaConversao: `${taxaConversao}%`,
        ticketMedio
      },
      charts: {
        atendimentosPorDia,
        produtosMaisVendidos,
        performanceAtendentes,
        distribuicaoTipos
      },
      atendimentosRecentes: mockAtendimentos.slice(-5).reverse(),
      clicksVenda: 47 // Mantendo compatibilidade com o dashboard existente
    };
  }

  /**
   * Buscar todos os tutores
   */
  static async getTutores(): Promise<Tutor[]> {
    try {
      console.log('👥 Buscando tutores...');
      
      const { data, error } = await supabase
        .from('tutores')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar tutores:', error);
        throw error;
      }

      console.log(`✅ ${data?.length || 0} tutores encontrados`);
      
      // Map the data to ensure proper typing
      const tutores: Tutor[] = (data || []).map(tutor => ({
        tutor_id: tutor.tutor_id,
        id_whatsapp: tutor.id_whatsapp,
        nome_tutor: tutor.nome_tutor,
        profissao: tutor.profissao,
        endereco: tutor.endereco,
        perfil_calculado: (tutor.perfil_calculado as 'Padrão' | 'Intermediário' | 'Luxo') || 'Padrão'
      }));
      
      return tutores;
    } catch (error) {
      console.error('❌ Erro na busca de tutores:', error);
      throw error;
    }
  }
}

export default PetMemorialAPI;
