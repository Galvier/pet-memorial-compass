
import { PetMemorialAPI } from '@/lib/api';
import { GeocodingService } from '@/services/GeocodingService';

export interface HeatmapDataPoint {
  lat: number;
  lng: number;
  intensity?: number;
}

/**
 * API para dados do mapa de calor
 */
export async function getHeatmapData(): Promise<HeatmapDataPoint[]> {
  try {
    console.log('🗺️ Carregando dados do mapa de calor...');
    
    // Buscar tutores com endereços
    const tutores = await PetMemorialAPI.getTutores();
    
    // Filtrar apenas tutores com endereços válidos
    const enderecosValidos = tutores
      .filter(tutor => tutor.endereco && tutor.endereco.trim() !== '')
      .map(tutor => tutor.endereco!);

    console.log(`📍 Encontrados ${enderecosValidos.length} endereços para geocodificar`);

    if (enderecosValidos.length === 0) {
      console.warn('Nenhum endereço válido encontrado');
      return [];
    }

    // Geocodificar endereços
    const coordinates = await GeocodingService.batchGeocode(enderecosValidos);
    
    console.log(`✅ Geocodificados ${coordinates.length} endereços com sucesso`);

    // Converter para formato do heatmap
    const heatmapData: HeatmapDataPoint[] = coordinates.map(coord => ({
      lat: coord.lat,
      lng: coord.lng,
      intensity: 1 // Intensidade padrão, pode ser ajustada conforme necessário
    }));

    return heatmapData;
    
  } catch (error) {
    console.error('❌ Erro ao carregar dados do mapa de calor:', error);
    throw new Error('Erro ao carregar dados do mapa de calor');
  }
}

/**
 * Gera dados sintéticos para demonstração (quando não há dados reais)
 */
export function generateMockHeatmapData(): HeatmapDataPoint[] {
  // Coordenadas aproximadas de Montes Claros, MG e arredores
  const baseCenter = { lat: -16.7249, lng: -43.8609 };
  const mockData: HeatmapDataPoint[] = [];

  // Gerar pontos aleatórios numa área ao redor de Montes Claros
  for (let i = 0; i < 50; i++) {
    const latOffset = (Math.random() - 0.5) * 0.2; // ±0.1 graus
    const lngOffset = (Math.random() - 0.5) * 0.2; // ±0.1 graus
    
    mockData.push({
      lat: baseCenter.lat + latOffset,
      lng: baseCenter.lng + lngOffset,
      intensity: Math.random() * 5 + 1 // Intensidade entre 1 e 6
    });
  }

  return mockData;
}
