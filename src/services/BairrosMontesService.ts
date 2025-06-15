
import { supabase } from '@/integrations/supabase/client';

export interface BairroMontesClaros {
  id: string;
  nome_bairro: string;
  categoria: 'alto' | 'medio' | 'padrao';
  fator_imobiliario: number;
  fator_comercial: number;
  fator_atualizacao_calculado: number;
  preco_medio_m2?: number;
  perfil_comercial?: string;
  ultima_atualizacao: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Serviço para gerenciar dados dos bairros de Montes Claros
 */
export class BairrosMontesService {
  /**
   * Busca dados de um bairro específico
   */
  static async getBairroData(nomeBairro: string): Promise<BairroMontesClaros | null> {
    try {
      console.log(`🔍 Buscando dados do bairro: ${nomeBairro}`);
      
      const { data, error } = await supabase
        .from('bairros_montes_claros')
        .select('*')
        .ilike('nome_bairro', nomeBairro.trim())
        .eq('ativo', true)
        .maybeSingle();

      if (error) {
        console.warn(`⚠️ Erro ao buscar bairro ${nomeBairro}:`, error);
        return null;
      }

      if (data) {
        console.log(`✅ Dados encontrados para ${nomeBairro}: fator ${data.fator_atualizacao_calculado}x`);
      } else {
        console.log(`❌ Bairro ${nomeBairro} não encontrado na base`);
      }

      return data;
    } catch (error) {
      console.error(`❌ Erro na consulta do bairro ${nomeBairro}:`, error);
      return null;
    }
  }

  /**
   * Busca dados de um bairro com normalização de nome
   */
  static async getBairroDataNormalized(nomeBairro: string): Promise<BairroMontesClaros | null> {
    // Tentar busca exata primeiro
    let data = await this.getBairroData(nomeBairro);
    if (data) return data;

    // Tentar variações comuns do nome
    const variations = this.generateNameVariations(nomeBairro);
    
    for (const variation of variations) {
      data = await this.getBairroData(variation);
      if (data) {
        console.log(`✅ Bairro encontrado com variação: "${variation}" para "${nomeBairro}"`);
        return data;
      }
    }

    return null;
  }

  /**
   * Gera variações comuns de nomes de bairros
   */
  private static generateNameVariations(nome: string): string[] {
    const normalized = nome.toLowerCase().trim();
    const variations: string[] = [];

    // Variações de acentuação
    const accentMap: Record<string, string> = {
      'cândida câmara': 'candida camara',
      'candida camara': 'cândida câmara',
      'maracanã': 'maracana',
      'maracana': 'maracanã',
      'jaraguá': 'jaragua',
      'jaragua': 'jaraguá',
      'delfino magalhães': 'delfino magalhaes',
      'delfino magalhaes': 'delfino magalhães',
      'são josé': 'sao jose',
      'sao jose': 'são josé',
      'funcionários': 'funcionarios',
      'funcionarios': 'funcionários',
      'vila atlântida': 'vila atlantida',
      'vila atlantida': 'vila atlântida'
    };

    if (accentMap[normalized]) {
      variations.push(accentMap[normalized]);
    }

    // Variações com/sem "vila", "bairro", etc.
    if (normalized.startsWith('vila ')) {
      variations.push(normalized.replace('vila ', ''));
    } else if (!normalized.includes('vila') && !normalized.includes('centro')) {
      variations.push(`vila ${normalized}`);
    }

    if (normalized.startsWith('bairro ')) {
      variations.push(normalized.replace('bairro ', ''));
    }

    return variations;
  }

  /**
   * Atualiza dados de um bairro
   */
  static async updateBairroData(
    nomeBairro: string, 
    updates: Partial<Pick<BairroMontesClaros, 'fator_imobiliario' | 'fator_comercial' | 'preco_medio_m2' | 'perfil_comercial'>>
  ): Promise<boolean> {
    try {
      console.log(`📝 Atualizando dados do bairro: ${nomeBairro}`);

      // Calcular novo fator de atualização se necessário
      let updateData = { ...updates };
      
      if (updates.fator_imobiliario !== undefined || updates.fator_comercial !== undefined) {
        const currentData = await this.getBairroDataNormalized(nomeBairro);
        if (currentData) {
          const novoFatorImobiliario = updates.fator_imobiliario ?? currentData.fator_imobiliario;
          const novoFatorComercial = updates.fator_comercial ?? currentData.fator_comercial;
          
          // Fórmula: média ponderada (60% imobiliário, 40% comercial)
          const novoFatorAtualizacao = (novoFatorImobiliario * 0.6) + (novoFatorComercial * 0.4);
          
          updateData = {
            ...updateData,
            fator_atualizacao_calculado: Math.round(novoFatorAtualizacao * 100) / 100
          };
        }
      }

      const { error } = await supabase
        .from('bairros_montes_claros')
        .update({
          ...updateData,
          ultima_atualizacao: new Date().toISOString()
        })
        .ilike('nome_bairro', nomeBairro.trim());

      if (error) {
        console.error(`❌ Erro ao atualizar bairro ${nomeBairro}:`, error);
        return false;
      }

      console.log(`✅ Bairro ${nomeBairro} atualizado com sucesso`);
      return true;
    } catch (error) {
      console.error(`❌ Erro na atualização do bairro ${nomeBairro}:`, error);
      return false;
    }
  }

  /**
   * Lista todos os bairros ativos
   */
  static async listAllBairros(): Promise<BairroMontesClaros[]> {
    try {
      const { data, error } = await supabase
        .from('bairros_montes_claros')
        .select('*')
        .eq('ativo', true)
        .order('categoria', { ascending: false })
        .order('nome_bairro');

      if (error) {
        console.error('❌ Erro ao listar bairros:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Erro na consulta de bairros:', error);
      return [];
    }
  }

  /**
   * Obtém estatísticas dos bairros por categoria
   */
  static async getBairrosStats(): Promise<{
    total: number;
    porCategoria: Record<string, number>;
    fatorMedio: number;
    ultimaAtualizacao?: string;
  }> {
    try {
      const bairros = await this.listAllBairros();
      
      const stats = {
        total: bairros.length,
        porCategoria: {
          alto: bairros.filter(b => b.categoria === 'alto').length,
          medio: bairros.filter(b => b.categoria === 'medio').length,
          padrao: bairros.filter(b => b.categoria === 'padrao').length
        },
        fatorMedio: bairros.length > 0 
          ? Math.round((bairros.reduce((sum, b) => sum + b.fator_atualizacao_calculado, 0) / bairros.length) * 100) / 100
          : 1.0,
        ultimaAtualizacao: bairros.length > 0 
          ? new Date(Math.max(...bairros.map(b => new Date(b.ultima_atualizacao).getTime()))).toISOString()
          : undefined
      };

      return stats;
    } catch (error) {
      console.error('❌ Erro ao calcular estatísticas:', error);
      return {
        total: 0,
        porCategoria: { alto: 0, medio: 0, padrao: 0 },
        fatorMedio: 1.0
      };
    }
  }

  /**
   * Extrai nome do bairro de um endereço completo
   */
  static extractBairroFromAddress(address: string): string | null {
    try {
      const parts = address.split(',').map(part => part.trim());
      
      // Procurar por padrões comuns de bairro
      for (const part of parts) {
        const cleaned = part.toLowerCase()
          .replace(/^(rua|av|avenida|praça|praca|r\.|av\.)\s+/i, '')
          .replace(/\s+\d+.*$/, '') // Remove números
          .trim();

        if (cleaned.length > 2 && !cleaned.match(/\d/) && cleaned !== 'mg' && cleaned !== 'montes claros') {
          // Verificar se é um bairro conhecido
          const knownBairros = [
            'ibituruna', 'morada do sol', 'augusta mota', 'centro', 'todos os santos', 
            'cândida câmara', 'candida camara', 'major prates', 'maracanã', 'maracana',
            'delfino magalhães', 'delfino magalhaes', 'são josé', 'sao jose', 'vila oliveira',
            'cintra', 'jaraguá', 'jaragua', 'funcionários', 'funcionarios', 'vila atlântida', 'vila atlantida'
          ];

          if (knownBairros.some(bairro => 
            cleaned.includes(bairro) || bairro.includes(cleaned) || 
            this.similarity(cleaned, bairro) > 0.8
          )) {
            return cleaned;
          }
        }
      }

      return null;
    } catch (error) {
      console.warn('Erro ao extrair bairro do endereço:', error);
      return null;
    }
  }

  /**
   * Calcula similaridade entre strings (Jaro-Winkler simplificado)
   */
  private static similarity(s1: string, s2: string): number {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calcula distância de Levenshtein
   */
  private static levenshteinDistance(s1: string, s2: string): number {
    const matrix = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(null));
    
    for (let i = 0; i <= s1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= s2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= s2.length; j++) {
      for (let i = 1; i <= s1.length; i++) {
        const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[s2.length][s1.length];
  }
}
