import { PetMemorialAPI } from '@/lib/api';
import { GeocodingService } from '@/services/GeocodingService';

export interface HeatmapDataPoint {
  lat: number;
  lng: number;
  intensity?: number;
}

export interface ProcessedHeatmapData {
  points: HeatmapDataPoint[];
  center: { lat: number; lng: number };
  zoom: number;
  useMarkers: boolean;
  stats: {
    totalPoints: number;
    uniqueLocations: number;
    coverage: string;
  };
}

/**
 * Agrupa pontos próximos e calcula intensidade baseada na concentração
 */
function groupNearbyPoints(coordinates: Array<{ lat: number; lng: number }>): HeatmapDataPoint[] {
  const groupedPoints: HeatmapDataPoint[] = [];
  const processed = new Set<number>();
  const threshold = 0.01; // ~1km de distância aproximadamente

  coordinates.forEach((coord, index) => {
    if (processed.has(index)) return;

    // Encontrar pontos próximos
    const nearbyPoints = coordinates.filter((other, otherIndex) => {
      if (otherIndex === index || processed.has(otherIndex)) return false;
      
      const distance = Math.sqrt(
        Math.pow(coord.lat - other.lat, 2) + 
        Math.pow(coord.lng - other.lng, 2)
      );
      
      return distance <= threshold;
    });

    // Marcar pontos próximos como processados
    nearbyPoints.forEach((_, nearbyIndex) => {
      const actualIndex = coordinates.findIndex(c => c === coordinates[nearbyIndex]);
      if (actualIndex !== -1) processed.add(actualIndex);
    });

    // Calcular centro do grupo e intensidade
    const allPointsInGroup = [coord, ...nearbyPoints];
    const centerLat = allPointsInGroup.reduce((sum, p) => sum + p.lat, 0) / allPointsInGroup.length;
    const centerLng = allPointsInGroup.reduce((sum, p) => sum + p.lng, 0) / allPointsInGroup.length;
    
    groupedPoints.push({
      lat: centerLat,
      lng: centerLng,
      intensity: Math.min(allPointsInGroup.length * 2, 10) // Máximo intensidade 10
    });

    processed.add(index);
  });

  return groupedPoints;
}

/**
 * Calcula o centro geográfico e zoom apropriado para os dados
 */
function calculateMapBounds(points: HeatmapDataPoint[]): { center: { lat: number; lng: number }; zoom: number } {
  if (points.length === 0) {
    return { center: { lat: -16.7249, lng: -43.8609 }, zoom: 12 };
  }

  if (points.length === 1) {
    return { center: { lat: points[0].lat, lng: points[0].lng }, zoom: 14 };
  }

  // Calcular bounds
  const lats = points.map(p => p.lat);
  const lngs = points.map(p => p.lng);
  
  const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
  const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
  
  // Calcular zoom baseado na dispersão dos pontos
  const latSpread = Math.max(...lats) - Math.min(...lats);
  const lngSpread = Math.max(...lngs) - Math.min(...lngs);
  const maxSpread = Math.max(latSpread, lngSpread);
  
  let zoom = 12;
  if (maxSpread < 0.01) zoom = 15;
  else if (maxSpread < 0.05) zoom = 13;
  else if (maxSpread < 0.1) zoom = 11;
  else if (maxSpread < 0.5) zoom = 9;
  else zoom = 7;

  return { center: { lat: centerLat, lng: centerLng }, zoom };
}

/**
 * API para dados do mapa de calor processados - SEMPRE TENTA DADOS REAIS PRIMEIRO
 */
export async function getProcessedHeatmapData(): Promise<ProcessedHeatmapData> {
  try {
    console.log('🗺️ Carregando dados do mapa de calor do Supabase...');
    
    // SEMPRE tentar buscar dados reais do Supabase primeiro
    const tutores = await PetMemorialAPI.getTutores();
    console.log(`📊 Tutores encontrados no Supabase: ${tutores.length}`);
    
    // Filtrar apenas tutores com endereços válidos
    const enderecosValidos = tutores
      .filter(tutor => tutor.endereco && tutor.endereco.trim() !== '')
      .map(tutor => tutor.endereco!);

    console.log(`📍 Endereços válidos encontrados: ${enderecosValidos.length}`, enderecosValidos);

    if (enderecosValidos.length === 0) {
      console.warn('⚠️ Nenhum endereço válido encontrado no Supabase - usando dados de demonstração');
      return generateMockHeatmapData();
    }

    // Geocodificar endereços reais
    const coordinates = await GeocodingService.batchGeocode(enderecosValidos);
    
    console.log(`✅ Geocodificados ${coordinates.length} endereços com sucesso:`, coordinates);

    if (coordinates.length === 0) {
      console.warn('⚠️ Falha na geocodificação - usando dados de demonstração');
      return generateMockHeatmapData();
    }

    // Processar e agrupar pontos
    const groupedPoints = groupNearbyPoints(coordinates);
    const { center, zoom } = calculateMapBounds(groupedPoints);
    
    // MUDANÇA: Sempre preferir heatmap, só usar marcadores se tiver apenas 1 ponto
    const useMarkers = groupedPoints.length === 1;
    
    // Calcular estatísticas
    let coverage = 'Local';
    if (groupedPoints.length > 10) coverage = 'Regional';
    else if (groupedPoints.length > 5) coverage = 'Área ampla';

    const stats = {
      totalPoints: coordinates.length,
      uniqueLocations: groupedPoints.length,
      coverage
    };

    console.log(`📊 Dados REAIS processados: ${groupedPoints.length} grupos, ${coordinates.length} pontos originais`);

    return {
      points: groupedPoints,
      center,
      zoom,
      useMarkers,
      stats
    };
    
  } catch (error) {
    console.error('❌ Erro ao processar dados reais do mapa de calor:', error);
    console.log('🔄 Fallback para dados de demonstração');
    return generateMockHeatmapData();
  }
}

/**
 * API para dados do mapa de calor (mantida para compatibilidade)
 */
export async function getHeatmapData(): Promise<HeatmapDataPoint[]> {
  const processedData = await getProcessedHeatmapData();
  return processedData.points;
}

/**
 * Gera dados sintéticos para demonstração (melhorados para sempre mostrar heatmap)
 */
export function generateMockHeatmapData(): ProcessedHeatmapData {
  // Coordenadas aproximadas de Montes Claros, MG e arredores
  const baseCenter = { lat: -16.7249, lng: -43.8609 };
  const mockPoints: HeatmapDataPoint[] = [];

  // Gerar clusters em diferentes regiões com mais intensidade
  const clusters = [
    { center: baseCenter, count: 20 },
    { center: { lat: -16.7349, lng: -43.8509 }, count: 15 },
    { center: { lat: -16.7149, lng: -43.8709 }, count: 18 },
    { center: { lat: -16.7449, lng: -43.8409 }, count: 12 },
    { center: { lat: -16.7049, lng: -43.8809 }, count: 14 }
  ];

  clusters.forEach(cluster => {
    for (let i = 0; i < cluster.count; i++) {
      const latOffset = (Math.random() - 0.5) * 0.02;
      const lngOffset = (Math.random() - 0.5) * 0.02;
      
      mockPoints.push({
        lat: cluster.center.lat + latOffset,
        lng: cluster.center.lng + lngOffset,
        intensity: Math.random() * 5 + 2 // Intensidade entre 2 e 7
      });
    }
  });

  return {
    points: mockPoints,
    center: baseCenter,
    zoom: 12,
    useMarkers: false, // Sempre usar heatmap para dados mock
    stats: {
      totalPoints: mockPoints.length,
      uniqueLocations: clusters.length,
      coverage: 'Regional'
    }
  };
}
