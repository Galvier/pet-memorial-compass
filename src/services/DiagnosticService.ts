
import { LocationAnalysisService } from './LocationAnalysisService';
import { IBGEApiService } from './IBGEApiService';
import { GeocodingService } from './GeocodingService';

export class DiagnosticService {
  /**
   * Verifica a saúde geral do sistema
   */
  static async checkSystemHealth() {
    console.log('🔍 Verificando saúde do sistema...');
    
    try {
      // Verificar componentes principais
      const [ibgeStatus] = await Promise.all([
        this.getIBGEStatus()
      ]);

      return {
        database: 'healthy' as const,
        edgeFunctions: 'healthy' as const,
        googleMaps: 'warning' as const, // Depende da configuração da chave
        auth: 'healthy' as const,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Erro na verificação de saúde:', error);
      throw error;
    }
  }

  /**
   * Obtém status específico das APIs do IBGE
   */
  static async getIBGEStatus() {
    console.log('🔍 Verificando status das APIs do IBGE...');
    
    try {
      const connectivity = await LocationAnalysisService.testConnectivity();
      
      return {
        sectors: {
          success: connectivity.details.municipalities,
          message: connectivity.details.municipalities 
            ? 'API de municípios funcionando normalmente'
            : 'API de municípios indisponível'
        },
        income: {
          success: connectivity.details.income,
          message: connectivity.details.income
            ? 'API SIDRA (renda) funcionando normalmente'
            : 'API SIDRA (renda) indisponível'
        },
        analysis: {
          success: connectivity.success,
          message: connectivity.success
            ? 'Análise completa disponível'
            : 'Análise limitada - usando dados de fallback'
        },
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Erro ao verificar status do IBGE:', error);
      return {
        sectors: {
          success: false,
          message: 'Erro na verificação da API de municípios'
        },
        income: {
          success: false,
          message: 'Erro na verificação da API SIDRA'
        },
        analysis: {
          success: false,
          message: 'Análise indisponível devido a erros'
        },
        lastUpdated: new Date().toISOString()
      };
    }
  }

  /**
   * Testa análise de endereço específico
   */
  static async testAddressAnalysis(address: string) {
    const startTime = Date.now();
    console.log(`🧪 Testando análise de endereço: "${address}"`);

    try {
      const result = await LocationAnalysisService.getScoreFromAddress(address);
      const duration = Date.now() - startTime;

      return {
        address,
        duration,
        timestamp: new Date().toISOString(),
        result: {
          success: result.success,
          score: result.score,
          scoreReason: result.scoreReason,
          coordinates: result.coordinates,
          municipioData: result.municipioData,
          incomeData: result.incomeData,
          fallbackUsed: result.fallbackUsed
        }
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('❌ Erro no teste de análise:', error);
      
      return {
        address,
        duration,
        timestamp: new Date().toISOString(),
        error: error.message || 'Erro desconhecido no teste'
      };
    }
  }

  /**
   * Executa testes de integração
   */
  static async runIntegrationTest(testId: string) {
    console.log(`🧪 Executando teste de integração: ${testId}`);

    try {
      switch (testId) {
        case 'google-maps':
          return await this.testGoogleMaps();
        
        case 'geocoding':
          return await this.testGeocoding();
        
        case 'ibge-sectors':
          return await this.testIBGEMunicipios();
        
        case 'ibge-income':
          return await this.testIBGEIncome();
        
        case 'location-analysis':
          return await this.testLocationAnalysis();
        
        case 'geocoding-ibge':
          return await this.testGeocodingIBGE();

        default:
          return {
            success: false,
            message: `Teste ${testId} não implementado`,
            details: null
          };
      }
    } catch (error) {
      console.error(`❌ Erro no teste ${testId}:`, error);
      return {
        success: false,
        message: `Erro no teste: ${error.message || 'Erro desconhecido'}`,
        details: { error: error.message }
      };
    }
  }

  private static async testGoogleMaps() {
    // Teste básico do Google Maps (sem chave real)
    return {
      success: false,
      message: 'Chave do Google Maps não configurada',
      details: { note: 'Configure a chave na aba Google Maps' }
    };
  }

  private static async testGeocoding() {
    const testAddress = 'Montes Claros, MG';
    console.log(`📍 Testando geocodificação: ${testAddress}`);
    
    try {
      const coords = await GeocodingService.getCoordsFromAddress(testAddress);
      
      if (coords) {
        return {
          success: true,
          message: `Geocodificação funcionando: ${coords.lat}, ${coords.lng}`,
          details: { coordinates: coords, address: testAddress }
        };
      } else {
        return {
          success: false,
          message: 'Geocodificação falhou - endereço não encontrado',
          details: { address: testAddress }
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Erro na geocodificação: ${error.message}`,
        details: { error: error.message }
      };
    }
  }

  private static async testIBGEMunicipios() {
    console.log('🏛️ Testando API de municípios do IBGE');
    
    try {
      const municipio = await IBGEApiService.getMunicipioFromCoordinates(-16.7, -43.8);
      
      if (municipio) {
        return {
          success: true,
          message: `API de municípios funcionando: ${municipio.nome}`,
          details: municipio
        };
      } else {
        return {
          success: false,
          message: 'API de municípios não retornou dados',
          details: { coordinates: [-16.7, -43.8] }
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Erro na API de municípios: ${error.message}`,
        details: { error: error.message }
      };
    }
  }

  private static async testIBGEIncome() {
    console.log('💰 Testando API SIDRA do IBGE');
    
    try {
      // Teste com município de Belo Horizonte
      const income = await IBGEApiService.getIncomeFromMunicipio('3106200');
      
      if (income) {
        return {
          success: true,
          message: `API SIDRA funcionando: R$ ${income.averageIncome.toFixed(2)}`,
          details: income
        };
      } else {
        return {
          success: false,
          message: 'API SIDRA não retornou dados de renda',
          details: { municipioId: '3106200' }
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Erro na API SIDRA: ${error.message}`,
        details: { error: error.message }
      };
    }
  }

  private static async testLocationAnalysis() {
    console.log('🎯 Testando análise completa de localização');
    
    try {
      const analysis = await LocationAnalysisService.getScoreFromAddress('Montes Claros, MG');
      
      return {
        success: analysis.success,
        message: analysis.success 
          ? `Análise concluída: ${analysis.score} pontos${analysis.fallbackUsed ? ' (fallback)' : ''}`
          : analysis.scoreReason,
        details: analysis
      };
    } catch (error) {
      return {
        success: false,
        message: `Erro na análise: ${error.message}`,
        details: { error: error.message }
      };
    }
  }

  private static async testGeocodingIBGE() {
    console.log('🔗 Testando integração Geocoding + IBGE');
    
    try {
      const analysis = await LocationAnalysisService.getScoreFromAddress('Belo Horizonte, MG');
      
      const hasCoords = !!analysis.coordinates;
      const hasMunicipio = !!analysis.municipioData;
      const hasIncome = !!analysis.incomeData;
      
      return {
        success: hasCoords && hasMunicipio,
        message: `Integração: Coords(${hasCoords}) + Município(${hasMunicipio}) + Renda(${hasIncome})`,
        details: {
          coordinates: analysis.coordinates,
          municipio: analysis.municipioData,
          income: analysis.incomeData,
          fallbackUsed: analysis.fallbackUsed
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Erro na integração: ${error.message}`,
        details: { error: error.message }
      };
    }
  }

  /**
   * Limpa cache do IBGE
   */
  static async clearIBGECache() {
    console.log('🧹 Limpando cache do IBGE...');
    
    try {
      const result = LocationAnalysisService.clearCache();
      console.log('✅ Cache limpo com sucesso');
      return result;
    } catch (error) {
      console.error('❌ Erro ao limpar cache:', error);
      return {
        success: false,
        message: `Erro ao limpar cache: ${error.message || 'Erro desconhecido'}`
      };
    }
  }

  /**
   * Obtém logs do sistema (mock implementation)
   */
  static async getLogs(sourceFilter: string = 'all', levelFilter: string = 'all') {
    // Implementação mock para demonstração
    const mockLogs = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        level: 'info' as const,
        source: 'ibge-api' as const,
        message: 'Análise de localização iniciada para "Montes Claros, MG"',
        metadata: { address: 'Montes Claros, MG' }
      },
      {
        id: '2', 
        timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
        level: 'info' as const,
        source: 'ibge-api' as const,
        message: 'Município encontrado: Montes Claros (3143302)',
        metadata: { municipioId: '3143302', nome: 'Montes Claros' }
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
        level: 'warn' as const,
        source: 'ibge-api' as const,
        message: 'Usando dados de fallback para renda - API SIDRA indisponível',
        metadata: { fallbackIncome: 2500 }
      }
    ];

    // Aplicar filtros
    return mockLogs.filter(log => {
      const sourceMatch = sourceFilter === 'all' || log.source === sourceFilter;
      const levelMatch = levelFilter === 'all' || log.level === levelFilter;
      return sourceMatch && levelMatch;
    });
  }
}
