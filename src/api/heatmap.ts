
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
 * API para dados do mapa de calor processados
 */
export async function getProcessedHeatmapData(): Promise<ProcessedHeatmapData> {
  try {
    console.log('🗺️ Carregando e processando dados do mapa de calor...');
    
    // Buscar tutores com endereços
    const tutores = await PetMemorialAPI.getTutores();
    
    // Filtrar apenas tutores com endereços válidos
    const enderecosValidos = tutores
      .filter(tutor => tutor.endereco && tutor.endereco.trim() !== '')
      .map(tutor => tutor.endereco!);

    console.log(`📍 Encontrados ${enderecosValidos.length} endereços para geocodificar`);

    if (enderecosValidos.length === 0) {
      console.warn('Nenhum endereço válido encontrado');
      return {
        points: [],
        center: { lat: -16.7249, lng: -43.8609 },
        zoom: 12,
        useMarkers: true,
        stats: {
          totalPoints: 0,
          uniqueLocations: 0,
          coverage: 'Nenhum dado'
        }
      };
    }

    // Geocodificar endereços
    const coordinates = await GeocodingService.batchGeocode(enderecosValidos);
    
    console.log(`✅ Geocodificados ${coordinates.length} endereços com sucesso`);

    // Processar e agrupar pontos
    const groupedPoints = groupNearbyPoints(coordinates);
    const { center, zoom } = calculateMapBounds(groupedPoints);
    
    // Decidir se usar marcadores ou heatmap
    const useMarkers = groupedPoints.length < 4;
    
    // Calcular estatísticas
    const totalIntensity = groupedPoints.reduce((sum, p) => sum + (p.intensity || 1), 0);
    let coverage = 'Local';
    if (groupedPoints.length > 10) coverage = 'Regional';
    else if (groupedPoints.length > 5) coverage = 'Área ampla';

    const stats = {
      totalPoints: coordinates.length,
      uniqueLocations: groupedPoints.length,
      coverage
    };

    console.log(`📊 Dados processados: ${groupedPoints.length} grupos, intensidade total: ${totalIntensity}`);

    return {
      points: groupedPoints,
      center,
      zoom,
      useMarkers,
      stats
    };
    
  } catch (error) {
    console.error('❌ Erro ao processar dados do mapa de calor:', error);
    throw new Error('Erro ao processar dados do mapa de calor');
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
 * Gera dados sintéticos para demonstração (melhorados)
 */
export function generateMockHeatmapData(): ProcessedHeatmapData {
  // Coordenadas aproximadas de Montes Claros, MG e arredores
  const baseCenter = { lat: -16.7249, lng: -43.8609 };
  const mockPoints: HeatmapDataPoint[] = [];

  // Gerar clusters em diferentes regiões
  const clusters = [
    { center: baseCenter, count: 15 },
    { center: { lat: -16.7349, lng: -43.8509 }, count: 8 },
    { center: { lat: -16.7149, lng: -43.8709 }, count: 12 },
    { center: { lat: -16.7449, lng: -43.8409 }, count: 6 },
    { center: { lat: -16.7049, lng: -43.8809 }, count: 9 }
  ];

  clusters.forEach(cluster => {
    for (let i = 0; i < cluster.count; i++) {
      const latOffset = (Math.random() - 0.5) * 0.02;
      const lngOffset = (Math.random() - 0.5) * 0.02;
      
      mockPoints.push({
        lat: cluster.center.lat + latOffset,
        lng: cluster.center.lng + lngOffset,
        intensity: Math.random() * 3 + 1
      });
    }
  });

  return {
    points: mockPoints,
    center: baseCenter,
    zoom: 12,
    useMarkers: false,
    stats: {
      totalPoints: mockPoints.length,
      uniqueLocations: clusters.length,
      coverage: 'Regional'
    }
  };
}
