
import { RecomendacaoRequest, RecomendacaoResponse, Produto, Tutor, Atendimento } from '@/types';
import { mockProdutos, mockTutores, mockAtendimentos } from './mockData';

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
    await delay(1000); // Simula processamento
    
    const perfil = await this.calcularPerfil(request.profissao);
    const produtosCompativeis = mockProdutos.filter(p => p.perfil_afinidade === perfil);
    
    // Seleciona até 3 produtos
    const sugestoes = produtosCompativeis.slice(0, 3).map(produto => ({
      nome_produto: produto.nome_produto,
      descricao: produto.descricao,
      preco: produto.preco.toFixed(2)
    }));
    
    return { sugestoes };
  }

  // CRUD Operations
  static async getProdutos(): Promise<Produto[]> {
    await delay(500);
    return [...mockProdutos];
  }

  static async createProduto(produto: Omit<Produto, 'produto_id'>): Promise<Produto> {
    await delay(500);
    const newProduto = {
      ...produto,
      produto_id: Math.max(...mockProdutos.map(p => p.produto_id)) + 1
    };
    mockProdutos.push(newProduto);
    return newProduto;
  }

  static async updateProduto(produto: Produto): Promise<Produto> {
    await delay(500);
    const index = mockProdutos.findIndex(p => p.produto_id === produto.produto_id);
    if (index !== -1) {
      mockProdutos[index] = produto;
    }
    return produto;
  }

  static async deleteProduto(id: number): Promise<void> {
    await delay(500);
    const index = mockProdutos.findIndex(p => p.produto_id === id);
    if (index !== -1) {
      mockProdutos.splice(index, 1);
    }
  }

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
      totalProdutos: mockProdutos.length,
      atendimentosRecentes: mockAtendimentos.slice(-5).reverse()
    };
  }
}
