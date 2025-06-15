
import { GeocodingService } from './GeocodingService';
import { IBGEApiService } from './IBGEApiService';
import { GeocacheService } from './GeocacheService';
import type { LocationAnalysis } from '@/types';

/**
 * Versão aprimorada do LocationAnalysisService com cache e fallback robusto
 */
export class EnhancedLocationAnalysisService {
  private static readonly DEFAULT_SCORE = 25;
  private static readonly RETRY_ATTEMPTS = 2;
  private static readonly RETRY_DELAY = 1000;

  /**
   * Análise principal com sistema de cache e fallback hierárquico
   */
  static async getScoreFromAddress(address: string): Promise<LocationAnalysis> {
    const startTime = Date.now();
    console.log(`🔍 Iniciando análise aprimorada para: "${address}"`);

    const analysis: LocationAnalysis = {
      address,
      coordinates: null,
      municipioData: null,
      incomeData: null,
      score: this.DEFAULT_SCORE,
      scoreReason: 'Pontuação padrão aplicada',
      analysisDate: new Date().toISOString(),
      success: false,
      fallbackUsed: false
    };

    try {
      // NÍVEL 1: Verificar cache primeiro
      const cachedResult = await GeocacheService.findCachedScore(address);
      if (cachedResult) {
        analysis.score = cachedResult.score;
        analysis.scoreReason = `Cache ${cachedResult.source}: ${cachedResult.score} pontos`;
        analysis.success = true;
        analysis.fallbackUsed = cachedResult.source !== 'IBGE';
        
        if (cachedResult.municipio_nome) {
          analysis.municipioData = {
            id: cachedResult.municipio_id || '',
            nome: cachedResult.municipio_nome,
            uf: cachedResult.uf || ''
          };
        }
        
        if (cachedResult.renda_media) {
          analysis.incomeData = {
            averageIncome: cachedResult.renda_media,
            populationCount: 0,
            dataYear: new Date(cachedResult.last_checked).getFullYear()
          };
        }

        const elapsedTime = Date.now() - startTime;
        console.log(`✅ Resultado do cache em ${elapsedTime}ms: ${analysis.score} pontos`);
        return analysis;
      }

      // NÍVEL 2: Tentar análise IBGE em tempo real
      console.log('🌐 Tentando análise IBGE em tempo real...');
      const ibgeResult = await this.tryIBGEAnalysis(address);
      
      if (ibgeResult.success) {
        // Salvar resultado IBGE no cache
        await GeocacheService.saveToCache(
          address,
          ibgeResult.score,
          'IBGE',
          ibgeResult.municipioData || undefined,
          ibgeResult.incomeData?.averageIncome
        );

        const elapsedTime = Date.now() - startTime;
        console.log(`✅ Análise IBGE bem-sucedida em ${elapsedTime}ms: ${ibgeResult.score} pontos`);
        return ibgeResult;
      }

      // NÍVEL 3: Fallback para estimativas por cidade
      console.log('🏙️ Tentando estimativa por cidade...');
      const cityEstimate = await this.tryCityEstimate(address);
      
      if (cityEstimate.success) {
        // Salvar estimativa no cache
        await GeocacheService.saveToCache(
          address,
          cityEstimate.score,
          'ESTIMATIVA',
          cityEstimate.municipioData || undefined
        );

        const elapsedTime = Date.now() - startTime;
        console.log(`✅ Estimativa por cidade em ${elapsedTime}ms: ${cityEstimate.score} pontos`);
        return cityEstimate;
      }

      // NÍVEL 4: Fallback regional
      console.log('🌍 Tentando estimativa regional...');
      const regionalScore = await this.getRegionalFallback(address);
      
      analysis.score = regionalScore;
      analysis.scoreReason = `Estimativa regional: ${regionalScore} pontos`;
      analysis.fallbackUsed = true;

      // Salvar fallback no cache
      await GeocacheService.saveToCache(
        address,
        regionalScore,
        'FALLBACK'
      );

      const elapsedTime = Date.now() - startTime;
      console.log(`⚠️ Usando fallback regional em ${elapsedTime}ms: ${regionalScore} pontos`);
      return analysis;

    } catch (error) {
      const elapsedTime = Date.now() - startTime;
      console.error(`❌ Erro na análise após ${elapsedTime}ms:`, error);
      
      analysis.scoreReason = `Erro na análise: ${error.message || 'Erro desconhecido'}`;
      analysis.fallbackUsed = true;
      return analysis;
    }
  }

  /**
   * Tenta análise via IBGE com retry
   */
  private static async tryIBGEAnalysis(address: string): Promise<LocationAnalysis> {
    for (let attempt = 1; attempt <= this.RETRY_ATTEMPTS; attempt++) {
      try {
        console.log(`🔄 Tentativa ${attempt}/${this.RETRY_ATTEMPTS} - Análise IBGE`);
        
        const result = await this.performIBGEAnalysis(address);
        if (result.success) {
          return result;
        }
        
        if (attempt < this.RETRY_ATTEMPTS) {
          await this.delay(this.RETRY_DELAY * attempt);
        }
      } catch (error) {
        console.warn(`⚠️ Tentativa ${attempt} falhou:`, error.message);
        if (attempt < this.RETRY_ATTEMPTS) {
          await this.delay(this.RETRY_DELAY * attempt);
        }
      }
    }

    return {
      address,
      coordinates: null,
      municipioData: null,
      incomeData: null,
      score: this.DEFAULT_SCORE,
      scoreReason: 'Falha na análise IBGE após retry',
      analysisDate: new Date().toISOString(),
      success: false,
      fallbackUsed: true
    };
  }

  /**
   * Executa análise IBGE usando o serviço existente
   */
  private static async performIBGEAnalysis(address: string): Promise<LocationAnalysis> {
    // Usar o serviço existente, mas com timeout mais rigoroso
    const coords = await GeocodingService.getCoordsFromAddress(address);
    if (!coords) {
      throw new Error('Geocodificação falhou');
    }

    const municipioData = await IBGEApiService.getMunicipioFromCoordinates(coords.lat, coords.lng);
    if (!municipioData) {
      throw new Error('Município não encontrado');
    }

    const incomeData = await IBGEApiService.getIncomeFromMunicipio(municipioData.id);
    if (!incomeData) {
      throw new Error('Dados de renda não encontrados');
    }

    const score = IBGEApiService.calculateScoreFromIncome(incomeData.averageIncome);

    return {
      address,
      coordinates: coords,
      municipioData: {
        id: municipioData.id,
        nome: municipioData.nome,
        uf: municipioData.microrregiao?.mesorregiao?.UF?.sigla || ''
      },
      incomeData: {
        averageIncome: incomeData.averageIncome,
        populationCount: incomeData.populationCount,
        dataYear: incomeData.dataYear
      },
      score,
      scoreReason: `IBGE: Renda média R$ ${incomeData.averageIncome.toFixed(2)} = ${score} pontos`,
      analysisDate: new Date().toISOString(),
      success: true,
      fallbackUsed: false
    };
  }

  /**
   * Tenta estimativa baseada em cidade conhecida
   */
  private static async tryCityEstimate(address: string): Promise<LocationAnalysis> {
    const addressParts = address.split(',').map(part => part.trim());
    
    // Tentar extrair cidade e estado
    if (addressParts.length < 2) {
      throw new Error('Endereço insuficiente para estimativa por cidade');
    }

    const cityName = addressParts[addressParts.length - 2] || '';
    const stateCode = this.extractStateCode(addressParts[addressParts.length - 1] || '');

    if (!cityName || !stateCode) {
      throw new Error('Não foi possível extrair cidade/estado');
    }

    const cityEstimate = await GeocacheService.getCityEstimate(cityName, stateCode);
    if (!cityEstimate) {
      throw new Error('Estimativa de cidade não encontrada');
    }

    return {
      address,
      coordinates: null,
      municipioData: {
        id: '',
        nome: cityEstimate.city_name,
        uf: cityEstimate.state_code
      },
      incomeData: {
        averageIncome: cityEstimate.estimated_income,
        populationCount: 0,
        dataYear: new Date().getFullYear()
      },
      score: cityEstimate.score,
      scoreReason: `Estimativa ${cityEstimate.city_name}: R$ ${cityEstimate.estimated_income.toFixed(2)} = ${cityEstimate.score} pontos`,
      analysisDate: new Date().toISOString(),
      success: true,
      fallbackUsed: true
    };
  }

  /**
   * Fallback regional baseado no estado
   */
  private static async getRegionalFallback(address: string): Promise<number> {
    const addressParts = address.split(',').map(part => part.trim());
    const stateCode = this.extractStateCode(addressParts[addressParts.length - 1] || '');
    
    const region = this.getRegionByState(stateCode);
    return await GeocacheService.getRegionalEstimate(region);
  }

  /**
   * Extrai código do estado do endereço
   */
  private static extractStateCode(statePart: string): string {
    const stateMapping = {
      'mg': 'MG', 'minas gerais': 'MG',
      'sp': 'SP', 'são paulo': 'SP', 'sao paulo': 'SP',
      'rj': 'RJ', 'rio de janeiro': 'RJ',
      'rs': 'RS', 'rio grande do sul': 'RS',
      'pr': 'PR', 'paraná': 'PR', 'parana': 'PR',
      'sc': 'SC', 'santa catarina': 'SC',
      'ba': 'BA', 'bahia': 'BA',
      'pe': 'PE', 'pernambuco': 'PE',
      'ce': 'CE', 'ceará': 'CE', 'ceara': 'CE',
      'go': 'GO', 'goiás': 'GO', 'goias': 'GO',
      'df': 'DF', 'distrito federal': 'DF'
    };

    const normalized = statePart.toLowerCase().trim();
    return stateMapping[normalized] || statePart.toUpperCase();
  }

  /**
   * Mapeia estado para região
   */
  private static getRegionByState(stateCode: string): string {
    const stateToRegion = {
      'SP': 'Sudeste', 'RJ': 'Sudeste', 'MG': 'Sudeste', 'ES': 'Sudeste',
      'RS': 'Sul', 'SC': 'Sul', 'PR': 'Sul',
      'GO': 'Centro-Oeste', 'MT': 'Centro-Oeste', 'MS': 'Centro-Oeste', 'DF': 'Centro-Oeste',
      'BA': 'Nordeste', 'PE': 'Nordeste', 'CE': 'Nordeste', 'MA': 'Nordeste', 'PB': 'Nordeste', 'RN': 'Nordeste', 'AL': 'Nordeste', 'SE': 'Nordeste', 'PI': 'Nordeste',
      'AM': 'Norte', 'PA': 'Norte', 'AC': 'Norte', 'RO': 'Norte', 'RR': 'Norte', 'AP': 'Norte', 'TO': 'Norte'
    };

    return stateToRegion[stateCode] || 'Sudeste';
  }

  /**
   * Utilitário para delay
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Análise em lote com controle de rate limit
   */
  static async batchAnalyzeAddresses(addresses: string[], batchSize: number = 3): Promise<LocationAnalysis[]> {
    console.log(`📊 Iniciando análise em lote de ${addresses.length} endereços`);
    
    const results: LocationAnalysis[] = [];
    
    for (let i = 0; i < addresses.length; i += batchSize) {
      const batch = addresses.slice(i, i + batchSize);
      console.log(`🔄 Processando lote ${Math.floor(i / batchSize) + 1} de ${Math.ceil(addresses.length / batchSize)}`);
      
      const batchPromises = batch.map(address => this.getScoreFromAddress(address));
      const batchResults = await Promise.all(batchPromises);
      
      results.push(...batchResults);
      
      // Pausa entre lotes
      if (i + batchSize < addresses.length) {
        console.log('⏸️ Pausa entre lotes...');
        await this.delay(1000);
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const fallbackCount = results.filter(r => r.fallbackUsed).length;
    console.log(`✅ Análise em lote concluída: ${successCount}/${addresses.length} sucessos, ${fallbackCount} fallbacks`);
    
    return results;
  }

  /**
   * Limpar cache antigo
   */
  static async clearOldCache(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      const result = await GeocacheService.clearOldCache();
      return {
        success: true,
        message: `Cache limpo com sucesso: ${result.cleared} entradas antigas removidas`,
        details: result
      };
    } catch (error) {
      return {
        success: false,
        message: `Erro ao limpar cache: ${error.message || 'Erro desconhecido'}`
      };
    }
  }

  /**
   * Obter estatísticas do cache
   */
  static async getCacheStatistics(): Promise<any> {
    return await GeocacheService.getCacheStats();
  }
}
