
import { LocationAnalysis } from './LocationAnalysisService';
import { GeocodingService } from './GeocodingService';
import { IBGEApiService } from './IBGEApiService';
import { RealEstateService } from './RealEstateService';
import { BusinessProfileService } from './BusinessProfileService';
import { BairrosMontesService } from './BairrosMontesService';
import { GeocacheService } from './GeocacheService';

export interface EnhancedLocationAnalysis extends LocationAnalysis {
  isMontesClaros: boolean;
  bairroDetected?: string;
  realEstateData?: {
    avgPriceSqm: number;
    multiplier: number;
    sampleSize: number;
  };
  businessData?: {
    category: string;
    multiplier: number;
    empresas: number;
  };
  updateFactor?: number;
  breakdown?: {
    baseScore: number;
    realEstateFactor: number;
    businessFactor: number;
    finalScore: number;
  };
}

/**
 * Serviço aprimorado especificamente para análises em Montes Claros
 * Integra dados do IBGE com fatores de atualização do mercado local
 */
export class EnhancedMontesClarosService {
  private static readonly MONTES_CLAROS_PATTERNS = [
    'montes claros',
    'moc',
    '39400', '39401', '39402', '39403', '39404', '39405'
  ];

  /**
   * Análise completa para endereços em Montes Claros
   */
  static async analyzeAddress(address: string): Promise<EnhancedLocationAnalysis> {
    const startTime = Date.now();
    console.log(`🎯 Iniciando análise aprimorada para: "${address}"`);

    // Verificar se é Montes Claros
    const isMontesClaros = this.isMontesClarosAddress(address);
    
    if (!isMontesClaros) {
      console.log('📍 Endereço fora de Montes Claros, usando análise padrão');
      return await this.fallbackToStandardAnalysis(address);
    }

    console.log('🏙️ Endereço em Montes Claros detectado, iniciando análise aprimorada');

    const analysis: EnhancedLocationAnalysis = {
      address,
      coordinates: null,
      municipioData: null,
      incomeData: null,
      score: 25,
      scoreReason: 'Análise em andamento...',
      analysisDate: new Date().toISOString(),
      success: false,
      fallbackUsed: false,
      isMontesClaros: true
    };

    try {
      // Passo 1: Geocodificação
      console.log('📍 Passo 1: Geocodificação');
      const coordinates = await GeocodingService.getCoordsFromAddress(address);
      
      if (coordinates) {
        analysis.coordinates = coordinates;
        console.log(`✅ Coordenadas: ${coordinates.lat}, ${coordinates.lng}`);
      }

      // Passo 2: Dados do IBGE (base)
      console.log('🏛️ Passo 2: Dados base do IBGE');
      let baseScore = 25;
      
      if (coordinates) {
        const municipioData = await IBGEApiService.getMunicipioFromCoordinates(coordinates.lat, coordinates.lng);
        if (municipioData) {
          analysis.municipioData = {
            id: municipioData.id,
            nome: municipioData.nome,
            uf: municipioData.microrregiao?.mesorregiao?.UF?.sigla || 'MG'
          };

          const incomeData = await IBGEApiService.getIncomeFromMunicipio(municipioData.id);
          if (incomeData) {
            analysis.incomeData = {
              averageIncome: incomeData.averageIncome,
              populationCount: incomeData.populationCount,
              dataYear: incomeData.dataYear
            };
            baseScore = IBGEApiService.calculateScoreFromIncome(incomeData.averageIncome);
          }
        }
      }

      // Passo 3: Detectar bairro
      console.log('🏠 Passo 3: Detecção de bairro');
      const bairroDetected = BairrosMontesService.extractBairroFromAddress(address);
      if (bairroDetected) {
        analysis.bairroDetected = bairroDetected;
        console.log(`✅ Bairro detectado: ${bairroDetected}`);
      }

      // Passo 4: Análise do mercado imobiliário
      console.log('🏢 Passo 4: Análise do mercado imobiliário');
      let realEstateMultiplier = 1.0;
      
      if (bairroDetected) {
        try {
          const realEstateData = await RealEstateService.getRealEstateData(bairroDetected, 'Montes Claros');
          analysis.realEstateData = {
            avgPriceSqm: realEstateData.avgPriceSqm,
            multiplier: realEstateData.multiplier,
            sampleSize: realEstateData.sampleSize
          };
          realEstateMultiplier = realEstateData.multiplier;
          console.log(`✅ Dados imobiliários: R$ ${realEstateData.avgPriceSqm}/m² (${realEstateData.multiplier}x)`);
        } catch (error) {
          console.warn('⚠️ Erro na análise imobiliária:', error);
        }
      }

      // Passo 5: Análise do perfil comercial
      console.log('🏬 Passo 5: Análise do perfil comercial');
      let businessMultiplier = 1.0;
      
      const cep = this.extractCEPFromAddress(address) || this.estimateCEPFromBairro(bairroDetected);
      if (cep) {
        try {
          const businessData = await BusinessProfileService.getBusinessProfile(cep);
          analysis.businessData = {
            category: businessData.category,
            multiplier: businessData.multiplier,
            empresas: businessData.empresas
          };
          businessMultiplier = businessData.multiplier;
          console.log(`✅ Perfil comercial: ${businessData.category} (${businessData.multiplier}x)`);
        } catch (error) {
          console.warn('⚠️ Erro na análise comercial:', error);
        }
      }

      // Passo 6: Consultar dados do bairro na base
      console.log('📊 Passo 6: Consulta de dados do bairro');
      let dbMultiplier = 1.0;
      
      if (bairroDetected) {
        const bairroData = await BairrosMontesService.getBairroDataNormalized(bairroDetected);
        if (bairroData) {
          dbMultiplier = bairroData.fator_atualizacao_calculado;
          console.log(`✅ Fator do bairro na base: ${dbMultiplier}x`);
          
          // Atualizar base se temos dados mais recentes
          const shouldUpdate = this.shouldUpdateBairroData(bairroData, realEstateMultiplier, businessMultiplier);
          if (shouldUpdate) {
            await this.updateBairroWithNewData(bairroDetected, realEstateMultiplier, businessMultiplier, analysis);
          }
        }
      }

      // Passo 7: Calcular pontuação final
      console.log('🧮 Passo 7: Cálculo da pontuação final');
      const updateFactor = this.calculateFinalUpdateFactor(realEstateMultiplier, businessMultiplier, dbMultiplier);
      const finalScore = Math.round(baseScore * updateFactor);

      analysis.updateFactor = updateFactor;
      analysis.score = finalScore;
      analysis.breakdown = {
        baseScore,
        realEstateFactor: realEstateMultiplier,
        businessFactor: businessMultiplier,
        finalScore
      };

      // Determinar se foi usado fallback
      analysis.fallbackUsed = !analysis.coordinates || !analysis.municipioData || !analysis.incomeData;

      // Gerar razão detalhada
      analysis.scoreReason = this.generateDetailedReason(analysis, baseScore, updateFactor);
      analysis.success = true;

      // Salvar no cache
      await this.saveToCache(analysis);

      const elapsedTime = Date.now() - startTime;
      console.log(`✅ Análise aprimorada concluída em ${elapsedTime}ms: ${finalScore} pontos (fator ${updateFactor}x)`);

      return analysis;

    } catch (error) {
      const elapsedTime = Date.now() - startTime;
      console.error(`❌ Erro na análise aprimorada após ${elapsedTime}ms:`, error);
      
      analysis.scoreReason = `Erro na análise aprimorada: ${error.message} - usando dados base`;
      analysis.fallbackUsed = true;
      return analysis;
    }
  }

  /**
   * Verifica se endereço é de Montes Claros
   */
  private static isMontesClarosAddress(address: string): boolean {
    const normalized = address.toLowerCase();
    return this.MONTES_CLAROS_PATTERNS.some(pattern => normalized.includes(pattern));
  }

  /**
   * Fallback para análise padrão
   */
  private static async fallbackToStandardAnalysis(address: string): Promise<EnhancedLocationAnalysis> {
    // Importar apenas quando necessário para evitar dependência circular
    const { LocationAnalysisService } = await import('./LocationAnalysisService');
    const standardAnalysis = await LocationAnalysisService.getScoreFromAddress(address);
    
    return {
      ...standardAnalysis,
      isMontesClaros: false
    };
  }

  /**
   * Calcula fator de atualização final
   */
  private static calculateFinalUpdateFactor(
    realEstateFactor: number, 
    businessFactor: number, 
    dbFactor: number
  ): number {
    // Se temos dados da base, dar preferência com ajuste
    if (dbFactor > 1.0) {
      // Usar base com pequeno ajuste baseado em dados mais recentes
      const recentDataAdjustment = ((realEstateFactor + businessFactor) / 2 - 1.0) * 0.1;
      return Math.round((dbFactor + recentDataAdjustment) * 100) / 100;
    }

    // Senão, calcular baseado em dados coletados
    // Peso: 60% imobiliário, 40% comercial
    const weightedFactor = (realEstateFactor * 0.6) + (businessFactor * 0.4);
    return Math.round(weightedFactor * 100) / 100;
  }

  /**
   * Verifica se deve atualizar dados do bairro
   */
  private static shouldUpdateBairroData(
    bairroData: any, 
    realEstateFactor: number, 
    businessFactor: number
  ): boolean {
    const dataAge = Date.now() - new Date(bairroData.ultima_atualizacao).getTime();
    const isOld = dataAge > (7 * 24 * 60 * 60 * 1000); // 7 dias

    const significantChange = Math.abs(bairroData.fator_imobiliario - realEstateFactor) > 0.05 ||
                             Math.abs(bairroData.fator_comercial - businessFactor) > 0.05;

    return isOld || significantChange;
  }

  /**
   * Atualiza dados do bairro com informações mais recentes
   */
  private static async updateBairroWithNewData(
    bairro: string,
    realEstateFactor: number,
    businessFactor: number,
    analysis: EnhancedLocationAnalysis
  ): Promise<void> {
    try {
      await BairrosMontesService.updateBairroData(bairro, {
        fator_imobiliario: realEstateFactor,
        fator_comercial: businessFactor,
        preco_medio_m2: analysis.realEstateData?.avgPriceSqm,
        perfil_comercial: analysis.businessData?.category
      });
      console.log(`📝 Dados do bairro ${bairro} atualizados na base`);
    } catch (error) {
      console.warn(`⚠️ Erro ao atualizar dados do bairro ${bairro}:`, error);
    }
  }

  /**
   * Gera razão detalhada para a pontuação
   */
  private static generateDetailedReason(
    analysis: EnhancedLocationAnalysis, 
    baseScore: number, 
    updateFactor: number
  ): string {
    const parts: string[] = [];

    if (analysis.bairroDetected) {
      parts.push(`Bairro: ${analysis.bairroDetected}`);
    }

    parts.push(`Base IBGE: ${baseScore} pontos`);

    if (analysis.realEstateData) {
      parts.push(`Imobiliário: R$ ${analysis.realEstateData.avgPriceSqm.toFixed(0)}/m² (${analysis.realEstateData.multiplier}x)`);
    }

    if (analysis.businessData) {
      parts.push(`Comercial: ${analysis.businessData.category} (${analysis.businessData.multiplier}x)`);
    }

    parts.push(`Fator atualização: ${updateFactor}x`);

    if (analysis.fallbackUsed) {
      parts.push('(dados estimados)');
    }

    return parts.join(' | ');
  }

  /**
   * Extrai CEP do endereço
   */
  private static extractCEPFromAddress(address: string): string | null {
    const cepMatch = address.match(/\b\d{5}-?\d{3}\b/);
    return cepMatch ? cepMatch[0].replace('-', '') : null;
  }

  /**
   * Estima CEP baseado no bairro
   */
  private static estimateCEPFromBairro(bairro?: string): string | null {
    if (!bairro) return null;

    const bairroToCEP: Record<string, string> = {
      'ibituruna': '39401000',
      'morada do sol': '39402000',
      'augusta mota': '39403000',
      'centro': '39400000',
      'todos os santos': '39400100',
      'cândida câmara': '39400200',
      'candida camara': '39400200',
      'major prates': '39404000',
      'maracanã': '39404100',
      'maracana': '39404100',
      'delfino magalhães': '39405000',
      'delfino magalhaes': '39405000'
    };

    return bairroToCEP[bairro.toLowerCase()] || '39400000';
  }

  /**
   * Salva análise no cache
   */
  private static async saveToCache(analysis: EnhancedLocationAnalysis): Promise<void> {
    try {
      const source = analysis.fallbackUsed ? 'ESTIMATIVA' : 'IBGE';
      
      await GeocacheService.saveToCache(
        analysis.address,
        analysis.score,
        source,
        analysis.municipioData || undefined,
        analysis.incomeData?.averageIncome
      );
    } catch (error) {
      console.warn('⚠️ Erro ao salvar no cache:', error);
    }
  }

  /**
   * Análise em lote para múltiplos endereços
   */
  static async batchAnalyzeAddresses(addresses: string[]): Promise<EnhancedLocationAnalysis[]> {
    console.log(`📊 Iniciando análise em lote aprimorada de ${addresses.length} endereços`);
    
    const results: EnhancedLocationAnalysis[] = [];
    
    for (const address of addresses) {
      try {
        const result = await this.analyzeAddress(address);
        results.push(result);
        
        // Pausa entre análises para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.error(`❌ Erro na análise de "${address}":`, error);
        results.push({
          address,
          coordinates: null,
          municipioData: null,
          incomeData: null,
          score: 25,
          scoreReason: 'Erro na análise',
          analysisDate: new Date().toISOString(),
          success: false,
          fallbackUsed: true,
          isMontesClaros: this.isMontesClarosAddress(address)
        });
      }
    }
    
    console.log(`✅ Análise em lote concluída: ${results.length} endereços processados`);
    return results;
  }

  /**
   * Limpa caches de todos os serviços
   */
  static clearAllCaches(): { cleared: number; details: Record<string, number> } {
    const realEstate = RealEstateService.clearOldCache();
    const business = BusinessProfileService.clearOldCache();
    
    return {
      cleared: realEstate.cleared + business.cleared,
      details: {
        realEstate: realEstate.cleared,
        business: business.cleared
      }
    };
  }
}
