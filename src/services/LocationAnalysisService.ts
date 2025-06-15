
import { GeocodingService } from './GeocodingService';
import { IBGEApiService } from './IBGEApiService';
import { EnhancedLocationAnalysisService } from './EnhancedLocationAnalysisService';

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
 * Atualizado para usar o sistema aprimorado com cache e fallback
 */
export class LocationAnalysisService {
  private static readonly DEFAULT_SCORE = 25;
  private static readonly DEFAULT_REASON = 'Pontuação padrão aplicada - dados indisponíveis';

  /**
   * Função principal: analisa um endereço e retorna pontuação baseada em dados do IBGE
   * Agora usa o serviço aprimorado com cache e fallback
   */
  static async getScoreFromAddress(address: string): Promise<LocationAnalysis> {
    console.log(`🔍 Análise de localização para: "${address}" (usando sistema aprimorado)`);
    
    try {
      // Usar o serviço aprimorado que tem cache e fallback robusto
      return await EnhancedLocationAnalysisService.getScoreFromAddress(address);
    } catch (error) {
      console.error('❌ Falha no serviço aprimorado, usando fallback básico:', error);
      
      // Fallback para a implementação básica original
      return await this.basicAnalysis(address);
    }
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
   */
  static async batchAnalyzeAddresses(addresses: string[]): Promise<LocationAnalysis[]> {
    console.log(`📊 Iniciando análise em lote de ${addresses.length} endereços (sistema aprimorado)`);
    
    try {
      return await EnhancedLocationAnalysisService.batchAnalyzeAddresses(addresses);
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
   * Limpar cache de análises antigas
   */
  static clearCache(): { success: boolean; message: string; details?: any } {
    try {
      // Usar o serviço aprimorado para limpar cache
      return EnhancedLocationAnalysisService.clearOldCache();
    } catch (error) {
      // Fallback para limpar cache do IBGE apenas
      const result = IBGEApiService.clearCache();
      return {
        success: true,
        message: `Cache IBGE limpo: ${result.cleared} entradas removidas${result.errors > 0 ? `, ${result.errors} erros` : ''}`,
        details: result
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
      
      // Teste real de análise usando sistema aprimorado
      const testAddress = 'Centro, Montes Claros, MG';
      const realTest = await EnhancedLocationAnalysisService.getScoreFromAddress(testAddress);
      
      return {
        success: realTest.success,
        details: {
          municipalities: basicTest.municipalities,
          income: basicTest.income,
          realAnalysis: realTest.success,
          enhancedSystem: true,
          cacheUsed: realTest.fallbackUsed,
          message: `Análise ${realTest.success ? 'bem-sucedida' : 'falhou'}: ${realTest.scoreReason}`,
          testResult: {
            score: realTest.score,
            source: realTest.fallbackUsed ? 'Cache/Estimativa' : 'IBGE',
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
          message: `Erro no teste: ${error.message || 'Erro desconhecido'}`
        }
      };
    }
  }
}
