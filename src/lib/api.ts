
import { RecomendacaoRequest, RecomendacaoResponse, ItemDeVenda, Plano, Tutor, Atendimento } from '@/types';
import { mockItensDeVenda, mockPlanos, mockTutores, mockAtendimentos } from './mockData';

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
    
    if (request.tipo_atendimento === 'Preventivo') {
      // Retorna os planos Bronze, Prata e Ouro
      return {
        tipo_sugestao: "Planos Preventivos",
        sugestoes: mockPlanos.map(plano => ({
          nome: plano.nome_plano,
          descricao: plano.descricao_curta
        }))
      };
    }
    
    // Lógica para atendimento "Imediato"
    const perfil = await this.calcularPerfil(request.profissao);
    
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
    
    return {
      tipo_sugestao: "Pacote Imediato",
      sugestoes: [pacoteSugerido]
    };
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

  // CRUD Operations para Atendimentos (mantendo compatibilidade)
  static async getAtendimentos(): Promise<Atendimento[]> {
    await delay(500);
    return [...mockAtendimentos];
  }

  static async getAtendimento(id: number): Promise<Atendimento | null> {
    await delay(500);
    return mockAtendimentos.find(a => a.atendimento_id === id) || null;
  }

  static async getDashboardStats() {
    await delay(300);
    return {
      atendimentosHoje: mockAtendimentos.filter(a => {
        const hoje = new Date().toDateString();
        const dataAtendimento = new Date(a.data_inicio).toDateString();
        return hoje === dataAtendimento;
      }).length,
      totalItens: mockItensDeVenda.length,
      totalPlanos: mockPlanos.length,
      atendimentosRecentes: mockAtendimentos.slice(-5).reverse()
    };
  }
}
