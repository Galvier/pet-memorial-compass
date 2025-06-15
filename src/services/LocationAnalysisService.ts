
import { GeocodingService } from './GeocodingService';
import { IBGEApiService } from './IBGEApiService';

export interface LocationAnalysis {
  address: string;
  coordinates: { lat: number; lng: number } | null;
  sectorData: {
    id: string;
    name: string;
    municipio: string;
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
}

/**
 * Serviço principal para análise de localização com dados do IBGE
 */
export class LocationAnalysisService {
  private static readonly DEFAULT_SCORE = 25;
  private static readonly DEFAULT_REASON = 'Pontuação padrão aplicada';

  /**
   * Função principal: analisa um endereço e retorna pontuação baseada em dados do IBGE
   */
  static async getScoreFromAddress(address: string): Promise<LocationAnalysis> {
    const startTime = Date.now();
    console.log(`🔍 Iniciando análise de localização para: "${address}"`);

    const analysis: LocationAnalysis = {
      address,
      coordinates: null,
      sectorData: null,
      incomeData: null,
      score: this.DEFAULT_SCORE,
      scoreReason: this.DEFAULT_REASON,
      analysisDate: new Date().toISOString(),
      success: false
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

      // Passo 2: Obter setor censitário
      console.log('🗺️ Passo 2: Consulta do setor censitário IBGE');
      const sectorData = await IBGEApiService.getSectorFromCoordinates(
        coordinates.lat, 
        coordinates.lng
      );

      if (!sectorData) {
        analysis.scoreReason = 'Setor censitário não encontrado - usando pontuação padrão';
        console.log('❌ Setor censitário não encontrado, usando pontuação padrão');
        return analysis;
      }

      analysis.sectorData = {
        id: sectorData.id,
        name: sectorData.name,
        municipio: sectorData.municipio,
        uf: sectorData.uf
      };
      console.log(`✅ Setor censitário: ${sectorData.id} em ${sectorData.municipio}/${sectorData.uf}`);

      // Passo 3: Obter dados de renda
      console.log('💰 Passo 3: Consulta de dados de renda IBGE');
      const incomeData = await IBGEApiService.getIncomeFromSector(sectorData.id);

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

      // Passo 4: Calcular pontuação final
      console.log('🧮 Passo 4: Cálculo da pontuação final');
      const score = IBGEApiService.calculateScoreFromIncome(incomeData.averageIncome);
      
      analysis.score = score;
      analysis.scoreReason = `Renda média R$ ${incomeData.averageIncome.toFixed(2)} (${incomeData.dataYear}) = ${score} pontos`;
      analysis.success = true;

      const elapsedTime = Date.now() - startTime;
      console.log(`✅ Análise concluída com sucesso em ${elapsedTime}ms`);
      console.log(`📊 Resultado: ${score} pontos (${analysis.scoreReason})`);

      return analysis;

    } catch (error) {
      const elapsedTime = Date.now() - startTime;
      console.error(`❌ Erro na análise de localização após ${elapsedTime}ms:`, error);
      
      analysis.scoreReason = `Erro na análise: ${error.message || 'Erro desconhecido'} - usando pontuação padrão`;
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
    console.log(`✅ Análise em lote concluída: ${successCount}/${addresses.length} sucessos`);
    
    return results;
  }

  /**
   * Limpar cache de análises antigas
   */
  static clearCache(): void {
    try {
      const keys = Object.keys(localStorage);
      const ibgeKeys = keys.filter(key => key.startsWith('ibge_'));
      
      ibgeKeys.forEach(key => localStorage.removeItem(key));
      
      console.log(`🧹 Cache limpo: ${ibgeKeys.length} entradas removidas`);
    } catch (error) {
      console.warn('⚠️ Erro ao limpar cache:', error);
    }
  }
}
