
import { supabase } from '@/integrations/supabase/client';

export interface GeocacheEntry {
  id: string;
  location_key: string;
  municipio_id?: string;
  municipio_nome?: string;
  uf?: string;
  score: number;
  renda_media?: number;
  source: 'IBGE' | 'CACHE' | 'ESTIMATIVA' | 'FALLBACK';
  last_checked: string;
  created_at: string;
  updated_at: string;
}

export interface CityEstimate {
  id: string;
  city_name: string;
  state_code: string;
  estimated_income: number;
  score: number;
  population_range?: string;
  region?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Serviço para gerenciar cache geográfico e estimativas de cidades
 */
export class GeocacheService {
  private static readonly CACHE_TTL_HOURS = 24;
  private static readonly DB_CACHE_TTL_DAYS = 30;

  /**
   * Normaliza uma chave de localização para uso consistente no cache
   */
  static normalizeLocationKey(address: string): string {
    return address
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/[^\w\s,-]/g, '');
  }

  /**
   * Busca no cache hierárquico: endereço específico -> bairro -> cidade -> estado
   */
  static async findCachedScore(address: string): Promise<GeocacheEntry | null> {
    console.log(`🔍 Buscando no cache: ${address}`);
    
    const normalizedAddress = this.normalizeLocationKey(address);
    const addressParts = normalizedAddress.split(',').map(part => part.trim());
    
    // Lista de chaves para buscar, em ordem de prioridade
    const searchKeys = [
      normalizedAddress, // Endereço completo
      addressParts.slice(1).join(', '), // Sem o primeiro componente (rua)
      addressParts.slice(-2).join(', '), // Cidade, Estado
      addressParts.slice(-1)[0] // Apenas estado
    ].filter(key => key && key.length > 2);

    for (const key of searchKeys) {
      const { data, error } = await supabase
        .from('geocache')
        .select('*')
        .eq('location_key', key)
        .gte('last_checked', new Date(Date.now() - this.DB_CACHE_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString())
        .order('last_checked', { ascending: false })
        .limit(1);

      if (error) {
        console.warn(`⚠️ Erro ao buscar cache para "${key}":`, error);
        continue;
      }

      if (data && data.length > 0) {
        console.log(`✅ Cache encontrado para "${key}": ${data[0].score} pontos (${data[0].source})`);
        return data[0] as GeocacheEntry;
      }
    }

    console.log('❌ Nenhum cache encontrado');
    return null;
  }

  /**
   * Salva resultado no cache
   */
  static async saveToCache(
    locationKey: string,
    score: number,
    source: GeocacheEntry['source'],
    municipioData?: { id: string; nome: string; uf: string },
    rendaMedia?: number
  ): Promise<void> {
    try {
      const normalizedKey = this.normalizeLocationKey(locationKey);
      
      const cacheData = {
        location_key: normalizedKey,
        score,
        source,
        renda_media: rendaMedia,
        municipio_id: municipioData?.id,
        municipio_nome: municipioData?.nome,
        uf: municipioData?.uf,
        last_checked: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('geocache')
        .upsert(cacheData, { 
          onConflict: 'location_key',
          ignoreDuplicates: false 
        });

      if (error) {
        console.warn('⚠️ Erro ao salvar no cache:', error);
      } else {
        console.log(`💾 Salvo no cache: "${normalizedKey}" = ${score} pontos (${source})`);
      }
    } catch (error) {
      console.warn('⚠️ Erro ao salvar no cache:', error);
    }
  }

  /**
   * Busca estimativa por cidade
   */
  static async getCityEstimate(cityName: string, stateCode: string): Promise<CityEstimate | null> {
    try {
      const { data, error } = await supabase
        .from('city_estimates')
        .select('*')
        .ilike('city_name', `%${cityName}%`)
        .eq('state_code', stateCode.toUpperCase())
        .limit(1);

      if (error) {
        console.warn(`⚠️ Erro ao buscar estimativa para ${cityName}, ${stateCode}:`, error);
        return null;
      }

      if (data && data.length > 0) {
        console.log(`🏙️ Estimativa encontrada para ${cityName}, ${stateCode}: ${data[0].score} pontos`);
        return data[0] as CityEstimate;
      }

      return null;
    } catch (error) {
      console.warn('⚠️ Erro ao buscar estimativa de cidade:', error);
      return null;
    }
  }

  /**
   * Busca estimativa por região
   */
  static async getRegionalEstimate(region: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('city_estimates')
        .select('score')
        .eq('region', region);

      if (error || !data || data.length === 0) {
        return this.getDefaultScoreByRegion(region);
      }

      const avgScore = data.reduce((sum, item) => sum + item.score, 0) / data.length;
      console.log(`🌍 Estimativa regional para ${region}: ${Math.round(avgScore)} pontos`);
      return Math.round(avgScore);
    } catch (error) {
      console.warn('⚠️ Erro ao buscar estimativa regional:', error);
      return this.getDefaultScoreByRegion(region);
    }
  }

  /**
   * Pontuações padrão por região
   */
  private static getDefaultScoreByRegion(region: string): number {
    const defaultScores = {
      'sudeste': 35,
      'sul': 38,
      'centro-oeste': 32,
      'nordeste': 28,
      'norte': 25
    };

    return defaultScores[region.toLowerCase()] || 25;
  }

  /**
   * Limpa cache antigo
   */
  static async clearOldCache(): Promise<{ cleared: number }> {
    try {
      const cutoffDate = new Date(Date.now() - this.DB_CACHE_TTL_DAYS * 24 * 60 * 60 * 1000);
      
      const { data, error } = await supabase
        .from('geocache')
        .delete()
        .lt('last_checked', cutoffDate.toISOString())
        .select('id');

      if (error) {
        console.warn('⚠️ Erro ao limpar cache antigo:', error);
        return { cleared: 0 };
      }

      const cleared = data?.length || 0;
      console.log(`🧹 Cache limpo: ${cleared} entradas antigas removidas`);
      return { cleared };
    } catch (error) {
      console.warn('⚠️ Erro ao limpar cache:', error);
      return { cleared: 0 };
    }
  }

  /**
   * Estatísticas do cache
   */
  static async getCacheStats(): Promise<{
    total: number;
    bySource: Record<string, number>;
    oldEntries: number;
  }> {
    try {
      const { data: totalData, error: totalError } = await supabase
        .from('geocache')
        .select('id, source, last_checked');

      if (totalError) {
        throw totalError;
      }

      const total = totalData?.length || 0;
      const bySource: Record<string, number> = {};
      let oldEntries = 0;

      const cutoffDate = Date.now() - this.DB_CACHE_TTL_DAYS * 24 * 60 * 60 * 1000;

      totalData?.forEach(entry => {
        bySource[entry.source] = (bySource[entry.source] || 0) + 1;
        if (new Date(entry.last_checked).getTime() < cutoffDate) {
          oldEntries++;
        }
      });

      return { total, bySource, oldEntries };
    } catch (error) {
      console.warn('⚠️ Erro ao obter estatísticas do cache:', error);
      return { total: 0, bySource: {}, oldEntries: 0 };
    }
  }
}
