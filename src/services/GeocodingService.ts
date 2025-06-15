
import { supabase } from '@/integrations/supabase/client';

interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Serviço para geocodificação de endereços usando Google Maps API
 */
export class GeocodingService {
  private static async getApiKey(): Promise<string | null> {
    try {
      const { data, error } = await supabase.functions.invoke('get-google-maps-key');
      if (error) {
        console.error('Erro ao obter chave da API:', error);
        return null;
      }
      return data?.apiKey || null;
    } catch (error) {
      console.error('Erro na requisição da chave:', error);
      return null;
    }
  }

  /**
   * Converte um endereço em coordenadas geográficas
   */
  static async getCoordsFromAddress(address: string): Promise<Coordinates | null> {
    if (!address || address.trim() === '') {
      return null;
    }

    try {
      const apiKey = await this.getApiKey();
      if (!apiKey) {
        console.warn('Chave da API do Google Maps não configurada');
        return null;
      }

      const encodedAddress = encodeURIComponent(address);
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return {
          lat: location.lat,
          lng: location.lng
        };
      }

      console.warn(`Geocodificação falhou para: ${address}. Status: ${data.status}`);
      return null;
    } catch (error) {
      console.error('Erro na geocodificação:', error);
      return null;
    }
  }

  /**
   * Processa uma lista de endereços e retorna coordenadas válidas
   */
  static async batchGeocode(addresses: string[]): Promise<Coordinates[]> {
    const coordinates: Coordinates[] = [];
    
    // Processa em lotes pequenos para evitar rate limiting
    const batchSize = 5;
    for (let i = 0; i < addresses.length; i += batchSize) {
      const batch = addresses.slice(i, i + batchSize);
      
      const batchPromises = batch.map(address => this.getCoordsFromAddress(address));
      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(coord => {
        if (coord) {
          coordinates.push(coord);
        }
      });

      // Pequena pausa entre lotes para respeitar rate limits
      if (i + batchSize < addresses.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    return coordinates;
  }
}
