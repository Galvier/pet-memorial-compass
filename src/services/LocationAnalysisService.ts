
import { GeocodingService } from './GeocodingService';
import { IBGEApiService } from './IBGEApiService';

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
 * Atualizado para usar dados municipais ao invés de setores censitários
 */
export class LocationAnalysisService {
  private static readonly DEFAULT_SCORE = 25;
  private static readonly DEFAULT_REASON = 'Pontuação padrão aplicada - dados indisponíveis';

  /**
   * Função principal: analisa um endereço e retorna pontuação baseada em dados do IBGE
   */
  static async getScoreFromAddress(address: string): Promise<LocationAnalysis> {
    const startTime = Date.now();
    console.log(`🔍 Iniciando análise de localização para: "${address}"`);

    const analysis: LocationAnalysis = {
      address,
      coordinates: null,
      municipioData: null,
      incomeData: null,
      score: this.DEFAULT_SCORE,
      scoreReason: this.DEFAULT_REASON,
      analysisDate: new Date().toISOString(),
      success: false,
      fallbackUsed: false
    };

    try {
      // Passo 1: Obter coordenadas do endereço
      console.log('📍 Passo 1: Geocodificação do endereço');
      const coordinates = await GeocodingService.getCoordsFromAddress(address);
      
      if (!coordinates) {
        analysis.scoreReason = 'Endereço não encontrado - usando pontuação padrão';
        analysis.fallbackUsed = true;
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
        analysis.fallbackUsed = true;
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
        analysis.fallbackUsed = true;
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
      console.log(`✅ Análise concluída ${analysis.fallbackUsed ? 'com fallback' : 'com sucesso'} em ${elapsedTime}ms`);
      console.log(`📊 Resultado: ${score} pontos (${analysis.scoreReason})`);

      return analysis;

    } catch (error) {
      const elapsedTime = Date.now() - startTime;
      console.error(`❌ Erro na análise de localização após ${elapsedTime}ms:`, error);
      
      analysis.scoreReason = `Erro na análise: ${error.message || 'Erro desconhecido'} - usando pontuação padrão`;
      analysis.fallbackUsed = true;
      return analysis;
    }
  }

  /**
   * Análise em lote de múltiplos endereços
   */
  static async batchAnalyzeAddresses(addresses: string[]): Promise<LocationAnalysis[]> {
    console.log(`📊 Iniciando análise em lote de ${addresses.length} endereços`);
    
    const results: LocationAnalysis[] = [];
    const batchSize = 3; // Processar em lotes pequenos para não sobrecarregar as APIs
    
    for (let i = 0; i < addresses.length; i += batchSize) {
      const batch = addresses.slice(i, i + batchSize);
      console.log(`🔄 Processando lote ${Math.floor(i / batchSize) + 1} de ${Math.ceil(addresses.length / batchSize)}`);
      
      const batchPromises = batch.map(address => this.getScoreFromAddress(address));
      const batchResults = await Promise.all(batchPromises);
      
      results.push(...batchResults);
      
      // Pausa entre lotes para respeitar rate limits
      if (i + batchSize < addresses.length) {
        console.log('⏸️ Pausa entre lotes...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const fallbackCount = results.filter(r => r.fallbackUsed).length;
    console.log(`✅ Análise em lote concluída: ${successCount}/${addresses.length} sucessos, ${fallbackCount} fallbacks`);
    
    return results;
  }

  /**
   * Limpar cache de análises antigas
   */
  static clearCache(): { success: boolean; message: string; details?: any } {
    try {
      const result = IBGEApiService.clearCache();
      
      return {
        success: true,
        message: `Cache limpo com sucesso: ${result.cleared} entradas removidas${result.errors > 0 ? `, ${result.errors} erros` : ''}`,
        details: result
      };
    } catch (error) {
      console.warn('⚠️ Erro ao limpar cache:', error);
      return {
        success: false,
        message: `Erro ao limpar cache: ${error.message || 'Erro desconhecido'}`
      };
    }
  }

  /**
   * Teste de conectividade com as APIs
   */
  static async testConnectivity(): Promise<{ success: boolean; details: any }> {
    try {
      console.log('🔍 Testando conectividade com APIs do IBGE...');
      
      const connectivity = await IBGEApiService.testConnectivity();
      const success = connectivity.municipalities && connectivity.income;
      
      return {
        success,
        details: {
          municipalities: connectivity.municipalities,
          income: connectivity.income,
          message: success 
            ? 'Todas as APIs estão funcionando'
            : 'Algumas APIs apresentam problemas'
        }
      };
    } catch (error) {
      return {
        success: false,
        details: {
          municipalities: false,
          income: false,
          message: `Erro no teste: ${error.message || 'Erro desconhecido'}`
        }
      };
    }
  }
}
