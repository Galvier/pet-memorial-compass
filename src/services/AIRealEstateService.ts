
import { supabase } from '@/integrations/supabase/client';

export interface AIAnalysisResult {
  bairro: string;
  fator_sugerido: number;
  confidence_score: number;
  reasoning: string;
  categoria_sugerida: 'alto' | 'medio' | 'padrao';
  justificativa_detalhada: string;
  pontos_fortes: string[];
  pontos_atencao: string[];
  comparacao_mercado: string;
  preco_manual_sugerido?: number;
}

export interface AIValidationResult {
  discrepancias: Array<{
    bairro: string;
    fator_atual: number;
    fator_sugerido: number;
    confidence_score: number;
    justificativa: string;
    severidade: 'baixa' | 'media' | 'alta';
    preco_manual_sugerido?: number;
  }>;
  resumo: {
    total_analisados: number;
    discrepancias_encontradas: number;
    recomendacao_geral: string;
  };
}

export interface NeighborhoodContext {
  proximidade_centro?: string;
  infraestrutura?: string;
  comercio_local?: string;
  transporte_publico?: string;
}

/**
 * Serviço para análise imobiliária inteligente usando OpenAI
 */
export class AIRealEstateService {
  /**
   * Analisa um bairro específico usando IA
   */
  static async analyzeSingleNeighborhood(
    bairro: string,
    basePrice: number,
    context?: NeighborhoodContext
  ): Promise<AIAnalysisResult> {
    try {
      console.log(`🤖 Analisando bairro ${bairro} com IA...`);

      const { data, error } = await supabase.functions.invoke('ai-real-estate-analyzer', {
        body: {
          type: 'single_neighborhood',
          bairro,
          basePrice,
          context
        }
      });

      if (error) {
        throw new Error(`Erro na análise de IA: ${error.message}`);
      }

      console.log(`✅ Análise de IA concluída para ${bairro}`);
      return data;
    } catch (error) {
      console.error(`❌ Erro na análise de IA para ${bairro}:`, error);
      throw error;
    }
  }

  /**
   * Analisa múltiplos bairros em lote
   */
  static async bulkAnalyzeNeighborhoods(
    bairros: Array<{
      nome_bairro: string;
      categoria: string;
      fator_atual: number;
      preco_medio_m2?: number;
    }>,
    basePrice: number
  ): Promise<AIAnalysisResult[]> {
    try {
      console.log(`🤖 Análise em lote de ${bairros.length} bairros...`);

      const { data, error } = await supabase.functions.invoke('ai-real-estate-analyzer', {
        body: {
          type: 'bulk_analysis',
          bairros,
          basePrice
        }
      });

      if (error) {
        throw new Error(`Erro na análise em lote: ${error.message}`);
      }

      console.log(`✅ Análise em lote concluída: ${data.length} bairros processados`);
      return data;
    } catch (error) {
      console.error(`❌ Erro na análise em lote:`, error);
      throw error;
    }
  }

  /**
   * Valida fatores existentes e identifica discrepâncias
   */
  static async validateExistingFactors(
    bairros: Array<{
      nome_bairro: string;
      categoria: string;
      fator_atual: number;
      preco_medio_m2?: number;
    }>,
    basePrice: number
  ): Promise<AIValidationResult> {
    try {
      console.log(`🔍 Validando fatores de ${bairros.length} bairros...`);

      const { data, error } = await supabase.functions.invoke('ai-real-estate-analyzer', {
        body: {
          type: 'validate_factors',
          bairros,
          basePrice
        }
      });

      if (error) {
        throw new Error(`Erro na validação: ${error.message}`);
      }

      console.log(`✅ Validação concluída: ${data.resumo.discrepancias_encontradas} discrepâncias encontradas`);
      return data;
    } catch (error) {
      console.error(`❌ Erro na validação:`, error);
      throw error;
    }
  }

  /**
   * Gera contexto automático para um bairro baseado em dados conhecidos
   */
  static generateNeighborhoodContext(bairro: string): NeighborhoodContext {
    const bairroLower = bairro.toLowerCase();
    
    // Dados conhecidos sobre bairros de Montes Claros
    const contextMap: Record<string, NeighborhoodContext> = {
      'centro': {
        proximidade_centro: 'Centro da cidade',
        infraestrutura: 'Excelente - ruas pavimentadas, saneamento completo',
        comercio_local: 'Muito forte - centro comercial principal',
        transporte_publico: 'Ótimo - hub de transporte urbano'
      },
      'ibituruna': {
        proximidade_centro: 'Próximo ao centro',
        infraestrutura: 'Muito boa - área nobre consolidada',
        comercio_local: 'Forte - comércio local estabelecido',
        transporte_publico: 'Bom - bem servido'
      },
      'morada do sol': {
        proximidade_centro: 'Periferia valorizada',
        infraestrutura: 'Boa - área em desenvolvimento',
        comercio_local: 'Médio - crescimento comercial',
        transporte_publico: 'Regular - em expansão'
      },
      'major prates': {
        proximidade_centro: 'Distante do centro',
        infraestrutura: 'Básica - área popular',
        comercio_local: 'Básico - comércio local simples',
        transporte_publico: 'Limitado'
      }
    };

    return contextMap[bairroLower] || {
      proximidade_centro: 'Informação não disponível',
      infraestrutura: 'A ser avaliada',
      comercio_local: 'A ser avaliada',
      transporte_publico: 'A ser avaliado'
    };
  }

  /**
   * Converte score de confiança em indicador visual
   */
  static getConfidenceIndicator(score: number): {
    level: 'baixa' | 'media' | 'alta';
    color: string;
    description: string;
  } {
    if (score >= 80) {
      return {
        level: 'alta',
        color: 'green',
        description: 'Alta confiança - análise baseada em dados sólidos'
      };
    } else if (score >= 60) {
      return {
        level: 'media',
        color: 'yellow',
        description: 'Confiança média - recomenda-se revisão manual'
      };
    } else {
      return {
        level: 'baixa',
        color: 'red',
        description: 'Baixa confiança - análise limitada por falta de dados'
      };
    }
  }

  /**
   * Formata resultado da IA para exibição
   */
  static formatAIResult(result: AIAnalysisResult): {
    summary: string;
    details: string[];
    recommendations: string[];
  } {
    return {
      summary: `Fator sugerido: ${result.fator_sugerido}x (${result.categoria_sugerida}) - Confiança: ${result.confidence_score}%`,
      details: [
        `Reasoning: ${result.reasoning}`,
        `Justificativa: ${result.justificativa_detalhada}`,
        `Comparação: ${result.comparacao_mercado}`
      ],
      recommendations: [
        ...result.pontos_fortes.map(p => `✅ ${p}`),
        ...result.pontos_atencao.map(p => `⚠️ ${p}`)
      ]
    };
  }
}
