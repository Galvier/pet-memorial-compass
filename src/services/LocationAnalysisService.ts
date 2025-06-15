import { GeocodingService } from './GeocodingService';
import { IBGEApiService } from './IBGEApiService';
import { EnhancedLocationAnalysisService } from './EnhancedLocationAnalysisService';
import { EnhancedMontesClarosService } from './EnhancedMontesClarosService';

export interface LocationAnalysis {
  address: string;
  coordinates: { lat: number; lng: number } | null;
  municipioData: {
    id: string;
    nome: string;
    uf: string;
  } | null;
  incomeData: {
    averageIncome: number;
    populationCount: number;
    dataYear: number;
  } | null;
  score: number;
  scoreReason: string;
  analysisDate: string;
  success: boolean;
  fallbackUsed: boolean;
}

/**
 * Serviço principal para análise de localização com dados do IBGE
 * Atualizado para usar o sistema aprimorado com fator de atualização para Montes Claros
 */
export class LocationAnalysisService {
  private static readonly DEFAULT_SCORE = 25;
  private static readonly DEFAULT_REASON = 'Pontuação padrão aplicada - dados indisponíveis';

  /**
   * Função principal: analisa um endereço e retorna pontuação baseada em dados do IBGE
   * Agora detecta Montes Claros e usa análise aprimorada quando aplicável
   */
  static async getScoreFromAddress(address: string): Promise<LocationAnalysis> {
    console.log(`🔍 Análise de localização para: "${address}"`);
    
    try {
      // Verificar se é Montes Claros e usar análise aprimorada
      if (this.isMontesClarosAddress(address)) {
        console.log('🎯 Endereço de Montes Claros detectado, usando análise aprimorada');
        const enhancedResult = await EnhancedMontesClarosService.analyzeAddress(address);
        
        // Converter para formato padrão
        return {
          address: enhancedResult.address,
          coordinates: enhancedResult.coordinates,
          municipioData: enhancedResult.municipioData,
          incomeData: enhancedResult.incomeData,
          score: enhancedResult.score,
          scoreReason: enhancedResult.scoreReason,
          analysisDate: enhancedResult.analysisDate,
          success: enhancedResult.success,
          fallbackUsed: enhancedResult.fallbackUsed
        };
      }

      // Para endereços fora de Montes Claros, usar sistema aprimorado original
      console.log('🌍 Endereço fora de Montes Claros, usando sistema aprimorado padrão');
      return await EnhancedLocationAnalysisService.getScoreFromAddress(address);
    } catch (error) {
      console.error('❌ Falha nos sistemas aprimorados, usando fallback básico:', error);
      
      // Fallback para a implementação básica original
      return await this.basicAnalysis(address);
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
   * Análise básica original como último recurso
   */
  private static async basicAnalysis(address: string): Promise<LocationAnalysis> {
    const startTime = Date.now();
    console.log(`🔙 Usando análise básica para: "${address}"`);

    const analysis: LocationAnalysis = {
      address,
      coordinates: null,
      municipioData: null,
      incomeData: null,
      score: this.DEFAULT_SCORE,
      scoreReason: this.DEFAULT_REASON,
      analysisDate: new Date().toISOString(),
      success: false,
      fallbackUsed: true
    };

    try {
      // Passo 1: Obter coordenadas do endereço
      console.log('📍 Passo 1: Geocodificação do endereço');
      const coordinates = await GeocodingService.getCoordsFromAddress(address);
      
      if (!coordinates) {
        analysis.scoreReason = 'Endereço não encontrado - usando pontuação padrão';
        console.log('❌ Endereço não geocodificado, usando pontuação padrão');
        return analysis;
      }

      analysis.coordinates = coordinates;
      console.log(`✅ Coordenadas obtidas: ${coordinates.lat}, ${coordinates.lng}`);

      // Passo 2: Obter dados do município
      console.log('🏛️ Passo 2: Consulta do município IBGE');
      const municipioData = await IBGEApiService.getMunicipioFromCoordinates(
        coordinates.lat, 
        coordinates.lng
      );

      if (!municipioData) {
        analysis.scoreReason = 'Município não encontrado - usando pontuação padrão';
        console.log('❌ Município não encontrado, usando pontuação padrão');
        return analysis;
      }

      analysis.municipioData = {
        id: municipioData.id,
        nome: municipioData.nome,
        uf: municipioData.microrregiao?.mesorregiao?.UF?.sigla || 'N/A'
      };
      console.log(`✅ Município: ${municipioData.nome} (${municipioData.id}) - ${analysis.municipioData.uf}`);

      // Passo 3: Obter dados de renda
      console.log('💰 Passo 3: Consulta de dados de renda IBGE');
      const incomeData = await IBGEApiService.getIncomeFromMunicipio(municipioData.id);

      if (!incomeData) {
        analysis.scoreReason = 'Dados de renda não disponíveis - usando pontuação padrão';
        console.log('❌ Dados de renda não encontrados, usando pontuação padrão');
        return analysis;
      }

      analysis.incomeData = {
        averageIncome: incomeData.averageIncome,
        populationCount: incomeData.populationCount,
        dataYear: incomeData.dataYear
      };

      // Verificar se foi usado fallback
      analysis.fallbackUsed = incomeData.dataYear === 2022 && incomeData.averageIncome === 2500;

      // Passo 4: Calcular pontuação final
      console.log('🧮 Passo 4: Cálculo da pontuação final');
      const score = IBGEApiService.calculateScoreFromIncome(incomeData.averageIncome);
      
      analysis.score = score;
      analysis.scoreReason = analysis.fallbackUsed 
        ? `Dados estimados - Renda média R$ ${incomeData.averageIncome.toFixed(2)} = ${score} pontos`
        : `Renda média R$ ${incomeData.averageIncome.toFixed(2)} (${incomeData.dataYear}) = ${score} pontos`;
      analysis.success = true;

      const elapsedTime = Date.now() - startTime;
      console.log(`✅ Análise básica concluída ${analysis.fallbackUsed ? 'com fallback' : 'com sucesso'} em ${elapsedTime}ms`);
      console.log(`📊 Resultado: ${score} pontos (${analysis.scoreReason})`);

      return analysis;

    } catch (error) {
      const elapsedTime = Date.now() - startTime;
      console.error(`❌ Erro na análise básica após ${elapsedTime}ms:`, error);
      
      analysis.scoreReason = `Erro na análise: ${error.message || 'Erro desconhecido'} - usando pontuação padrão`;
      analysis.fallbackUsed = true;
      return analysis;
    }
  }

  /**
   * Análise em lote de múltiplos endereços
   * Agora usa sistema aprimorado para Montes Claros
   */
  static async batchAnalyzeAddresses(addresses: string[]): Promise<LocationAnalysis[]> {
    console.log(`📊 Iniciando análise em lote de ${addresses.length} endereços`);
    
    try {
      // Separar endereços de Montes Claros dos demais
      const montesClarosAddresses = addresses.filter(addr => this.isMontesClarosAddress(addr));
      const otherAddresses = addresses.filter(addr => !this.isMontesClarosAddress(addr));
      
      const results: LocationAnalysis[] = [];
      
      // Processar endereços de Montes Claros com sistema aprimorado
      if (montesClarosAddresses.length > 0) {
        console.log(`🎯 Processando ${montesClarosAddresses.length} endereços de Montes Claros`);
        const montesResults = await EnhancedMontesClarosService.batchAnalyzeAddresses(montesClarosAddresses);
        
        // Converter para formato padrão
        results.push(...montesResults.map(result => ({
          address: result.address,
          coordinates: result.coordinates,
          municipioData: result.municipioData,
          incomeData: result.incomeData,
          score: result.score,
          scoreReason: result.scoreReason,
          analysisDate: result.analysisDate,
          success: result.success,
          fallbackUsed: result.fallbackUsed
        })));
      }
      
      // Processar outros endereços com sistema padrão
      if (otherAddresses.length > 0) {
        console.log(`🌍 Processando ${otherAddresses.length} outros endereços`);
        const otherResults = await EnhancedLocationAnalysisService.batchAnalyzeAddresses(otherAddresses);
        results.push(...otherResults);
      }
      
      // Reordenar resultados para manter ordem original
      const orderedResults: LocationAnalysis[] = [];
      for (const originalAddress of addresses) {
        const result = results.find(r => r.address === originalAddress);
        if (result) {
          orderedResults.push(result);
        }
      }
      
      return orderedResults;
    } catch (error) {
      console.error('❌ Falha na análise em lote aprimorada, usando básica:', error);
      
      // Fallback para análise sequencial básica
      const results: LocationAnalysis[] = [];
      
      for (const address of addresses) {
        try {
          const result = await this.getScoreFromAddress(address);
          results.push(result);
          
          // Pausa pequena entre análises
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`❌ Erro na análise de "${address}":`, error);
          results.push({
            address,
            coordinates: null,
            municipioData: null,
            incomeData: null,
            score: this.DEFAULT_SCORE,
            scoreReason: 'Erro na análise',
            analysisDate: new Date().toISOString(),
            success: false,
            fallbackUsed: true
          });
        }
      }
      
      return results;
    }
  }

  /**
   * Limpar cache de análises antigas - now returns synchronous result
   */
  static clearCache(): { success: boolean; message: string; details?: any } {
    try {
      // Clear enhanced Montes Claros caches
      const montesResult = EnhancedMontesClarosService.clearAllCaches();
      
      // Use the enhanced service for clearing cache but handle it synchronously
      EnhancedLocationAnalysisService.clearOldCache().then(result => {
        console.log('Enhanced cache cleared:', result);
      }).catch(error => {
        console.error('Error clearing enhanced cache:', error);
      });
      
      // Also clear IBGE cache
      const ibgeResult = IBGEApiService.clearCache();
      
      const totalCleared = montesResult.cleared + ibgeResult.cleared;
      
      return {
        success: true,
        message: `Cache limpo: ${totalCleared} entradas removidas (Montes Claros: ${montesResult.cleared}, IBGE: ${ibgeResult.cleared})${ibgeResult.errors > 0 ? `, ${ibgeResult.errors} erros` : ''}`,
        details: {
          montesClaros: montesResult.details,
          ibge: ibgeResult,
          total: totalCleared
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Erro ao limpar cache: ${error.message || 'Erro desconhecido'}`
      };
    }
  }

  /**
   * Teste de conectividade melhorado com análise real
   */
  static async testConnectivity(): Promise<{ success: boolean; details: any }> {
    try {
      console.log('🔍 Testando conectividade com análise real (sistema aprimorado)...');
      
      // Primeiro, teste básico de conectividade
      const basicTest = await IBGEApiService.testConnectivity();
      
      // Teste real de análise usando sistema aprimorado para Montes Claros
      const testAddress = 'Centro, Montes Claros, MG';
      const realTest = await this.getScoreFromAddress(testAddress);
      
      return {
        success: realTest.success,
        details: {
          municipalities: basicTest.municipalities,
          income: basicTest.income,
          realAnalysis: realTest.success,
          enhancedSystem: true,
          montesClausSystem: true,
          cacheUsed: realTest.fallbackUsed,
          message: `Análise ${realTest.success ? 'bem-sucedida' : 'falhou'}: ${realTest.scoreReason}`,
          testResult: {
            score: realTest.score,
            source: realTest.fallbackUsed ? 'Cache/Estimativa' : 'IBGE+Atualização',
            address: testAddress
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        details: {
          municipalities: false,
          income: false,
          enhancedSystem: false,
          montesClausSystem: false,
          message: `Erro no teste: ${error.message || 'Erro desconhecido'}`
        }
      };
    }
  }
}
