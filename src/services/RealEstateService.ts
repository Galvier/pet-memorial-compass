
export interface RealEstateData {
  bairro: string;
  avgPriceSqm: number;
  sampleSize: number;
  lastUpdated: string;
  multiplier: number;
}

export interface PropertyListing {
  price: number;
  area: number;
  priceSqm: number;
  address: string;
}

/**
 * Serviço para análise do mercado imobiliário de Montes Claros
 * Simula web scraping com dados realistas baseados no mercado local
 */
export class RealEstateService {
  private static readonly CACHE_KEY_PREFIX = 'realestate_';
  private static readonly CACHE_TTL_DAYS = 7;

  /**
   * Obtém dados do mercado imobiliário para um bairro específico
   */
  static async getRealEstateData(bairro: string, cidade: string = 'Montes Claros'): Promise<RealEstateData> {
    console.log(`🏠 Analisando mercado imobiliário: ${bairro}, ${cidade}`);

    if (cidade.toLowerCase() !== 'montes claros') {
      throw new Error('Análise imobiliária disponível apenas para Montes Claros');
    }

    // Verificar cache primeiro
    const cachedData = this.getCachedData(bairro);
    if (cachedData) {
      console.log(`📦 Dados de ${bairro} obtidos do cache`);
      return cachedData;
    }

    // Simular busca de dados (em produção seria web scraping real)
    const listings = await this.simulatePropertySearch(bairro);
    const avgPriceSqm = this.calculateAveragePrice(listings);
    const multiplier = this.calculateMultiplier(avgPriceSqm);

    const realEstateData: RealEstateData = {
      bairro,
      avgPriceSqm,
      sampleSize: listings.length,
      lastUpdated: new Date().toISOString(),
      multiplier
    };

    // Salvar no cache
    this.setCachedData(bairro, realEstateData);
    
    console.log(`✅ Análise imobiliária concluída para ${bairro}: R$ ${avgPriceSqm.toFixed(2)}/m² (multiplicador: ${multiplier}x)`);
    return realEstateData;
  }

  /**
   * Simula busca de imóveis (substituiria web scraping real)
   */
  private static async simulatePropertySearch(bairro: string): Promise<PropertyListing[]> {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

    // Dados simulados baseados no mercado real de Montes Claros
    const bairroData = this.getBairroMarketData(bairro);
    const listings: PropertyListing[] = [];

    // Gerar 8-15 listagens simuladas com variação realística
    const numListings = 8 + Math.floor(Math.random() * 8);
    
    for (let i = 0; i < numListings; i++) {
      const basePrice = bairroData.basePrice;
      const variation = 0.8 + Math.random() * 0.4; // ±20% de variação
      const area = 60 + Math.random() * 80; // 60-140m²
      const price = basePrice * area * variation;

      listings.push({
        price,
        area,
        priceSqm: price / area,
        address: `${bairro}, Montes Claros - MG`
      });
    }

    return listings;
  }

  /**
   * Dados base por bairro (baseados no mercado real)
   */
  private static getBairroMarketData(bairro: string): { basePrice: number; category: string } {
    const bairroMap: Record<string, { basePrice: number; category: string }> = {
      'ibituruna': { basePrice: 4800, category: 'alto' },
      'morada do sol': { basePrice: 4600, category: 'alto' },
      'augusta mota': { basePrice: 4400, category: 'alto' },
      'centro': { basePrice: 3800, category: 'medio' },
      'todos os santos': { basePrice: 3500, category: 'medio' },
      'cândida câmara': { basePrice: 3200, category: 'medio' },
      'candida camara': { basePrice: 3200, category: 'medio' },
      'major prates': { basePrice: 2800, category: 'padrao' },
      'maracanã': { basePrice: 2600, category: 'padrao' },
      'maracana': { basePrice: 2600, category: 'padrao' },
      'delfino magalhães': { basePrice: 2400, category: 'padrao' },
      'delfino magalhaes': { basePrice: 2400, category: 'padrao' },
      'são josé': { basePrice: 3100, category: 'medio' },
      'sao jose': { basePrice: 3100, category: 'medio' },
      'vila oliveira': { basePrice: 2700, category: 'padrao' },
      'cintra': { basePrice: 3400, category: 'medio' },
      'jaraguá': { basePrice: 2500, category: 'padrao' },
      'jaragua': { basePrice: 2500, category: 'padrao' },
      'funcionários': { basePrice: 3600, category: 'medio' },
      'funcionarios': { basePrice: 3600, category: 'medio' },
      'vila atlântida': { basePrice: 2900, category: 'padrao' },
      'vila atlantida': { basePrice: 2900, category: 'padrao' }
    };

    const key = bairro.toLowerCase().trim();
    return bairroMap[key] || { basePrice: 2500, category: 'padrao' };
  }

  /**
   * Calcula preço médio por m²
   */
  private static calculateAveragePrice(listings: PropertyListing[]): number {
    if (listings.length === 0) return 2500; // Fallback

    const totalPriceSqm = listings.reduce((sum, listing) => sum + listing.priceSqm, 0);
    return Math.round(totalPriceSqm / listings.length);
  }

  /**
   * Calcula multiplicador baseado no preço por m²
   */
  private static calculateMultiplier(avgPriceSqm: number): number {
    if (avgPriceSqm >= 4500) return 1.25; // Alto padrão
    if (avgPriceSqm >= 4000) return 1.20;
    if (avgPriceSqm >= 3500) return 1.15; // Médio-alto
    if (avgPriceSqm >= 3000) return 1.10;
    if (avgPriceSqm >= 2500) return 1.05; // Médio
    return 1.00; // Padrão
  }

  /**
   * Cache management
   */
  private static getCacheKey(bairro: string): string {
    return `${this.CACHE_KEY_PREFIX}${bairro.toLowerCase().replace(/\s+/g, '_')}`;
  }

  private static getCachedData(bairro: string): RealEstateData | null {
    try {
      const cacheKey = this.getCacheKey(bairro);
      const cached = localStorage.getItem(cacheKey);
      
      if (!cached) return null;

      const data = JSON.parse(cached) as RealEstateData;
      const cacheAge = Date.now() - new Date(data.lastUpdated).getTime();
      const maxAge = this.CACHE_TTL_DAYS * 24 * 60 * 60 * 1000;

      if (cacheAge > maxAge) {
        localStorage.removeItem(cacheKey);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Erro ao ler cache de dados imobiliários:', error);
      return null;
    }
  }

  private static setCachedData(bairro: string, data: RealEstateData): void {
    try {
      const cacheKey = this.getCacheKey(bairro);
      localStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Erro ao salvar cache de dados imobiliários:', error);
    }
  }

  /**
   * Limpa cache antigo
   */
  static clearOldCache(): { cleared: number } {
    let cleared = 0;
    
    try {
      const keys = Object.keys(localStorage);
      const realEstateKeys = keys.filter(key => key.startsWith(this.CACHE_KEY_PREFIX));
      
      for (const key of realEstateKeys) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          const cacheAge = Date.now() - new Date(data.lastUpdated).getTime();
          const maxAge = this.CACHE_TTL_DAYS * 24 * 60 * 60 * 1000;
          
          if (cacheAge > maxAge) {
            localStorage.removeItem(key);
            cleared++;
          }
        } catch {
          // Remove invalid cache entries
          localStorage.removeItem(key);
          cleared++;
        }
      }
    } catch (error) {
      console.warn('Erro ao limpar cache:', error);
    }

    return { cleared };
  }

  /**
   * Obtém estatísticas do cache
   */
  static getCacheStats(): { total: number; oldEntries: number } {
    try {
      const keys = Object.keys(localStorage);
      const realEstateKeys = keys.filter(key => key.startsWith(this.CACHE_KEY_PREFIX));
      let oldEntries = 0;
      
      const maxAge = this.CACHE_TTL_DAYS * 24 * 60 * 60 * 1000;
      
      for (const key of realEstateKeys) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          const cacheAge = Date.now() - new Date(data.lastUpdated).getTime();
          
          if (cacheAge > maxAge) {
            oldEntries++;
          }
        } catch {
          oldEntries++;
        }
      }

      return { total: realEstateKeys.length, oldEntries };
    } catch {
      return { total: 0, oldEntries: 0 };
    }
  }
}
