
interface Coordinates {
  lat: number;
  lng: number;
}

interface IBGESectorData {
  id: string;
  name: string;
  municipio: string;
  uf: string;
}

interface IBGEIncomeData {
  sectorId: string;
  averageIncome: number;
  populationCount: number;
  dataYear: number;
}

/**
 * Serviço para integração com APIs do IBGE
 */
export class IBGEApiService {
  private static readonly TIMEOUT = 10000; // 10 segundos
  private static readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas

  /**
   * Obtém o setor censitário a partir de coordenadas geográficas
   */
  static async getSectorFromCoordinates(lat: number, lng: number): Promise<IBGESectorData | null> {
    try {
      console.log(`🗺️ Buscando setor censitário para coordenadas: ${lat}, ${lng}`);
      
      // Cache key baseado nas coordenadas (arredondadas para 4 casas decimais)
      const cacheKey = `ibge_sector_${lat.toFixed(4)}_${lng.toFixed(4)}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        console.log('📦 Dados do setor encontrados no cache');
        return cached;
      }

      // API do IBGE para localizar setor censitário por coordenadas
      const url = `https://servicodados.ibge.gov.br/api/v3/malhas/setores/${lat}/${lng}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'PetMemorial/1.0'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`⚠️ API IBGE retornou status ${response.status}`);
        return null;
      }

      const data = await response.json();
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        console.warn('⚠️ Nenhum setor censitário encontrado para essas coordenadas');
        return null;
      }

      const sector: IBGESectorData = {
        id: data[0].CD_SETOR || data[0].id,
        name: data[0].NM_SETOR || `Setor ${data[0].CD_SETOR}`,
        municipio: data[0].NM_MUN || 'N/A',
        uf: data[0].SIGLA_UF || 'N/A'
      };

      // Salvar no cache
      this.saveToCache(cacheKey, sector);
      
      console.log(`✅ Setor censitário encontrado: ${sector.id} - ${sector.municipio}/${sector.uf}`);
      return sector;

    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('⏱️ Timeout na consulta do setor censitário');
      } else {
        console.error('❌ Erro ao consultar setor censitário:', error);
      }
      return null;
    }
  }

  /**
   * Obtém dados de renda média do setor censitário
   */
  static async getIncomeFromSector(sectorId: string): Promise<IBGEIncomeData | null> {
    try {
      console.log(`💰 Buscando dados de renda para setor: ${sectorId}`);
      
      const cacheKey = `ibge_income_${sectorId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        console.log('📦 Dados de renda encontrados no cache');
        return cached;
      }

      // API SIDRA do IBGE para dados de renda por setor censitário
      // Tabela 6579: Domicílios particulares permanentes, por classes de rendimento nominal mensal domiciliar per capita
      const url = `https://apisidra.ibge.gov.br/values/t/6579/n7/${sectorId}/v/9813/p/last/d/v9813%202`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'PetMemorial/1.0'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`⚠️ API SIDRA retornou status ${response.status}`);
        return null;
      }

      const data = await response.json();
      
      if (!data || !Array.isArray(data) || data.length < 2) {
        console.warn('⚠️ Dados de renda não encontrados para este setor');
        return null;
      }

      // O primeiro registro é o cabeçalho, os dados estão no segundo registro
      const incomeRecord = data[1];
      const incomeValue = parseFloat(incomeRecord?.V || '0');

      if (incomeValue <= 0) {
        console.warn('⚠️ Valor de renda inválido ou zero');
        return null;
      }

      const incomeData: IBGEIncomeData = {
        sectorId,
        averageIncome: incomeValue,
        populationCount: parseInt(incomeRecord?.D2C || '0'),
        dataYear: parseInt(incomeRecord?.D1C || new Date().getFullYear().toString())
      };

      // Salvar no cache
      this.saveToCache(cacheKey, incomeData);
      
      console.log(`✅ Renda média encontrada: R$ ${incomeValue.toFixed(2)} (${incomeData.dataYear})`);
      return incomeData;

    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('⏱️ Timeout na consulta de renda');
      } else {
        console.error('❌ Erro ao consultar dados de renda:', error);
      }
      return null;
    }
  }

  /**
   * Converte renda média em pontuação (15-50 pontos)
   */
  static calculateScoreFromIncome(income: number): number {
    console.log(`🧮 Calculando pontuação para renda: R$ ${income.toFixed(2)}`);
    
    if (income >= 8000) return 50;  // Renda muito alta
    if (income >= 5000) return 45;  // Renda alta
    if (income >= 3500) return 40;  // Renda média-alta
    if (income >= 2500) return 35;  // Renda média
    if (income >= 1500) return 30;  // Renda média-baixa
    if (income >= 1000) return 25;  // Renda baixa
    if (income >= 500) return 20;   // Renda muito baixa
    
    return 15; // Renda mínima ou dados insuficientes
  }

  /**
   * Métodos auxiliares para cache
   */
  private static getFromCache(key: string): any {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();

      if (now - timestamp > this.CACHE_TTL) {
        localStorage.removeItem(key);
        return null;
      }

      return data;
    } catch {
      return null;
    }
  }

  private static saveToCache(key: string, data: any): void {
    try {
      const cached = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(cached));
    } catch (error) {
      console.warn('⚠️ Falha ao salvar no cache:', error);
    }
  }
}
