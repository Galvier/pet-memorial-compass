import { RecomendacaoRequest, RecomendacaoResponse, ItemDeVenda, Plano, Tutor, Atendimento, Pet, Atendente, AtribuirAtendimentoRequest } from '@/types';
import { mockItensDeVenda, mockPlanos, mockTutores, mockAtendimentos, mockPets, mockAtendentes } from './mockData';

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

  static async verificarStatusAtendimento(idWhatsapp: string): Promise<{ status_atendimento: string }> {
    await delay(200);
    
    // Buscar o atendimento mais recente para este WhatsApp
    const atendimento = mockAtendimentos
      .filter(a => {
        const tutor = mockTutores.find(t => t.tutor_id === a.tutor_id);
        return tutor?.id_whatsapp === idWhatsapp;
      })
      .sort((a, b) => new Date(b.data_inicio).getTime() - new Date(a.data_inicio).getTime())[0];
    
    if (!atendimento) {
      return { status_atendimento: 'BOT_ATIVO' }; // Novo atendimento
    }
    
    return { status_atendimento: atendimento.status_atendimento };
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
    return {
      atendimentosHoje: mockAtendimentos.filter(a => {
        const hoje = new Date().toDateString();
        const dataAtendimento = new Date(a.data_inicio).toDateString();
        return hoje === dataAtendimento;
      }).length,
      totalClientes: mockTutores.length,
      clicksVenda: 47, // Simulando clicks em links de venda
      atendimentosRecentes: mockAtendimentos.slice(-5).reverse()
    };
  }
}
