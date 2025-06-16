
import { BairrosMontesService } from './BairrosMontesService';
import { IntelligentRealEstateService } from './IntelligentRealEstateService';
import { BusinessProfileService } from './BusinessProfileService';

export interface EnhancedAnalysisResult {
  address: string;
  isMontesClaros: boolean;
  bairroDetected?: string;
  score: number;
  breakdown: {
    baseScore: number;
    realEstateFactor: number;
    businessFactor: number;
    finalScore: number;
  };
  coordinates?: { lat: number; lng: number } | null;
  municipioData?: {
    id: string;
    nome: string;
    uf: string;
  } | null;
  incomeData?: {
    averageIncome: number;
    populationCount: number;
    dataYear: number;
  } | null;
  scoreReason?: string;
  analysisDate?: string;
  success?: boolean;
  fallbackUsed?: boolean;
}

/**
 * Serviço aprimorado para análise de endereços em Montes Claros
 * Integra múltiplas fontes de dados para cálculo de pontuação
 */
export class EnhancedMontesClarosService {
  /**
   * Analisa um endereço e calcula pontuação aprimorada
   */
  static async analyzeAddress(address: string): Promise<EnhancedAnalysisResult> {
    console.log(`🔍 Análise aprimorada para: ${address}`);

    try {
      // Verificar se é endereço de Montes Claros
      const isMontesClaros = this.isMontesClarosAddress(address);
      
      if (!isMontesClaros) {
        return {
          address,
          isMontesClaros: false,
          score: 0,
          breakdown: {
            baseScore: 0,
            realEstateFactor: 1.0,
            businessFactor: 1.0,
            finalScore: 0
          },
          success: false,
          fallbackUsed: true,
          analysisDate: new Date().toISOString(),
          scoreReason: 'Endereço fora de Montes Claros'
        };
      }

      // Score base padrão para Montes Claros
      const baseScore = 45;
      
      // Detectar bairro do endereço
      const bairroDetected = this.extractBairroFromAddress(address);
      
      // Calcular fatores de aprimoramento
      let realEstateFactor = 1.0;
      let businessFactor = 1.0;

      if (bairroDetected) {
        console.log(`🏘️ Bairro detectado: ${bairroDetected}`);
        
        // Fator imobiliário usando simulação inteligente
        try {
          realEstateFactor = await IntelligentRealEstateService.getRealEstateScore(bairroDetected);
        } catch (error) {
          console.warn('Erro ao obter fator imobiliário:', error);
        }

        // Fator de perfil comercial usando CEP simulado
        try {
          const cepSimulado = this.getCepFromBairro(bairroDetected);
          const businessProfile = await BusinessProfileService.getBusinessProfile(cepSimulado);
          businessFactor = businessProfile.multiplier;
        } catch (error) {
          console.warn('Erro ao obter perfil comercial:', error);
        }
      }

      // Calcular pontuação final
      const finalScore = Math.round(baseScore * realEstateFactor * businessFactor);

      console.log(`📊 Pontuação final: ${finalScore} (Base: ${baseScore}, Imob: ${realEstateFactor}x, Neg: ${businessFactor}x)`);

      return {
        address,
        isMontesClaros: true,
        bairroDetected,
        score: finalScore,
        breakdown: {
          baseScore,
          realEstateFactor,
          businessFactor,
          finalScore
        },
        success: true,
        fallbackUsed: false,
        analysisDate: new Date().toISOString(),
        scoreReason: `Análise completa: Base ${baseScore} × Imob ${realEstateFactor} × Neg ${businessFactor} = ${finalScore} pontos`
      };
    } catch (error) {
      console.error('Erro na análise aprimorada:', error);
      
      return {
        address,
        isMontesClaros: true,
        score: 25,
        breakdown: {
          baseScore: 25,
          realEstateFactor: 1.0,
          businessFactor: 1.0,
          finalScore: 25
        },
        success: false,
        fallbackUsed: true,
        analysisDate: new Date().toISOString(),
        scoreReason: `Erro na análise: ${error.message || 'Erro desconhecido'}`
      };
    }
  }

  /**
   * Verifica se endereço é de Montes Claros
   */
  private static isMontesClarosAddress(address: string): boolean {
    const normalized = address.toLowerCase();
    const patterns = [
      'montes claros',
      'moc',
      '39400', '39401', '39402', '39403', '39404', '39405'
    ];
    
    return patterns.some(pattern => normalized.includes(pattern));
  }

  /**
   * Simula um CEP baseado no bairro
   */
  private static getCepFromBairro(bairro: string): string {
    const cepMap: Record<string, string> = {
      'centro': '39400010',
      'ibituruna': '39401234',
      'morada do sol': '39402345', 
      'todos os santos': '39400567',
      'major prates': '39403890',
      'augusta mota': '39404123'
    };
    
    const normalized = bairro.toLowerCase();
    return cepMap[normalized] || '39400000';
  }

  /**
   * Extrai nome do bairro de um endereço
   */
  private static extractBairroFromAddress(address: string): string | null {
    try {
      const parts = address.split(',').map(part => part.trim());
      
      // Lista de bairros conhecidos em Montes Claros
      const knownBairros = [
        'centro', 'ibituruna', 'morada do sol', 'augusta mota', 'todos os santos',
        'cândida câmara', 'candida camara', 'major prates', 'maracanã', 'maracana',
        'delfino magalhães', 'delfino magalhaes', 'são josé', 'sao jose', 'vila oliveira',
        'cintra', 'jaraguá', 'jaragua', 'funcionários', 'funcionarios', 'vila atlântida', 'vila atlantida'
      ];

      for (const part of parts) {
        const cleaned = part.toLowerCase()
          .replace(/^(rua|av|avenida|praça|praca|r\.|av\.)\s+/i, '')
          .replace(/\s+\d+.*$/, '')
          .trim();

        if (cleaned.length > 2) {
          // Verificar correspondência exata ou parcial
          const matched = knownBairros.find(bairro => 
            cleaned.includes(bairro) || bairro.includes(cleaned) ||
            this.similarity(cleaned, bairro) > 0.8
          );

          if (matched) {
            return this.normalizeBairroName(matched);
          }
        }
      }

      return null;
    } catch (error) {
      console.warn('Erro ao extrair bairro:', error);
      return null;
    }
  }

  /**
   * Normaliza nome do bairro para formato padrão
   */
  private static normalizeBairroName(name: string): string {
    const normalizations: Record<string, string> = {
      'candida camara': 'Cândida Câmara',
      'maracana': 'Maracanã',
      'jaragua': 'Jaraguá',
      'delfino magalhaes': 'Delfino Magalhães',
      'sao jose': 'São José',
      'funcionarios': 'Funcionários',
      'vila atlantida': 'Vila Atlântida'
    };

    const normalized = normalizations[name.toLowerCase()];
    if (normalized) return normalized;

    // Capitalizar primeira letra de cada palavra
    return name.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Calcula similaridade entre strings
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

  /**
   * Limpa todos os caches relacionados
   */
  static clearAllCaches(): { cleared: number; services: string[] } {
    let totalCleared = 0;
    const services: string[] = [];

    try {
      // Limpar cache do BusinessProfileService
      const businessResult = BusinessProfileService.clearOldCache();
      totalCleared += businessResult.cleared;
      if (businessResult.cleared > 0) services.push('BusinessProfile');
      
      console.log(`🗑️ Cache limpo: ${totalCleared} entradas de ${services.length} serviços`);
    } catch (error) {
      console.warn('Erro ao limpar caches:', error);
    }

    return { cleared: totalCleared, services };
  }
}
