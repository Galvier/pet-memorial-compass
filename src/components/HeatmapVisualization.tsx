import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Loader2, RefreshCw, Target, BarChart3, Database, TestTube } from 'lucide-react';
import { getProcessedHeatmapData, generateMockHeatmapData, ProcessedHeatmapData } from '@/api/heatmap';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Properly type the heatLayer plugin
declare module 'leaflet' {
  function heatLayer(data: [number, number, number][], options?: any): L.Layer;
}

// Load the heatmap plugin dynamically
const loadHeatmapPlugin = async () => {
  if (typeof window !== 'undefined' && !(L as any).heatLayer) {
    await import('leaflet.heat');
  }
};

// Custom marker icon
const createCustomIcon = (intensity: number = 1) => {
  const size = Math.min(Math.max(intensity * 8 + 20, 20), 40);
  const color = intensity > 5 ? '#dc2626' : intensity > 3 ? '#ea580c' : intensity > 1 ? '#ca8a04' : '#059669';
  
  return L.divIcon({
    html: `<div style="
      background-color: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: ${Math.max(size * 0.3, 10)}px;
    ">${intensity > 1 ? Math.round(intensity) : '•'}</div>`,
    className: 'custom-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
};

export const HeatmapVisualization: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const heatLayerRef = useRef<L.Layer | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapData, setMapData] = useState<ProcessedHeatmapData | null>(null);
  const [isUsingRealData, setIsUsingRealData] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const initMap = async () => {
      try {
        await loadHeatmapPlugin();

        // Create map centered on Montes Claros, MG
        const map = L.map(mapRef.current!).setView([-16.7249, -43.8609], 12);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        mapInstanceRef.current = map;
        
        // Load initial data
        loadHeatmapData();
      } catch (error) {
        console.error('Erro ao inicializar mapa:', error);
        setError('Erro ao carregar o mapa');
      }
    };

    initMap();

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const clearMapLayers = () => {
    if (!mapInstanceRef.current) return;

    // Remove heat layer
    if (heatLayerRef.current) {
      mapInstanceRef.current.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    // Remove markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current!.removeLayer(marker);
    });
    markersRef.current = [];
  };

  const loadHeatmapData = async (forceMock = false) => {
    if (!mapInstanceRef.current) return;
    
    setLoading(true);
    setError(null);

    try {
      let data: ProcessedHeatmapData;
      
      if (forceMock) {
        console.log('🧪 Carregando dados de demonstração por solicitação do usuário');
        data = generateMockHeatmapData();
        setIsUsingRealData(false);
      } else {
        console.log('🔄 Tentando carregar dados reais do Supabase...');
        data = await getProcessedHeatmapData();
        
        // Verificar se realmente temos dados reais ou se foi fallback para mock
        const hasRealPoints = data.points.length > 0 && 
          data.points.some(point => 
            // Verificar se os pontos não são das coordenadas mock padrão
            Math.abs(point.lat - (-16.7249)) > 0.01 || 
            Math.abs(point.lng - (-43.8609)) > 0.01
          );
        
        setIsUsingRealData(hasRealPoints);
        
        if (!hasRealPoints) {
          console.log('📊 Dados retornados são de demonstração (fallback)');
        } else {
          console.log('✅ Dados reais carregados do Supabase!');
        }
      }

      setMapData(data);

      // Clear existing layers
      clearMapLayers();

      // Update map view
      mapInstanceRef.current.setView([data.center.lat, data.center.lng], data.zoom);

      if (data.points.length > 0) {
        if (data.useMarkers) {
          // Use individual markers only for single points
          data.points.forEach(point => {
            const marker = L.marker([point.lat, point.lng], {
              icon: createCustomIcon(point.intensity)
            }).addTo(mapInstanceRef.current!);

            marker.bindPopup(`
              <div class="p-2">
                <strong>Cliente(s) na região</strong><br>
                Intensidade: ${Math.round(point.intensity || 1)}<br>
                Lat: ${point.lat.toFixed(4)}<br>
                Lng: ${point.lng.toFixed(4)}
              </div>
            `);

            markersRef.current.push(marker);
          });

          console.log(`📍 ${data.points.length} marcadores adicionados ao mapa`);
        } else {
          // Use heatmap - configuração melhorada para poucos pontos
          const heatData: [number, number, number][] = data.points.map(point => [
            point.lat,
            point.lng,
            point.intensity || 1
          ]);

          if ((L as any).heatLayer) {
            heatLayerRef.current = (L as any).heatLayer(heatData, {
              radius: data.points.length < 5 ? 50 : Math.max(25, 40 - data.points.length), // Raio maior para poucos pontos
              blur: data.points.length < 5 ? 30 : 20, // Blur maior para poucos pontos
              maxZoom: 17,
              minOpacity: 0.4, // Opacidade mínima aumentada
              gradient: {
                0.0: '#059669',
                0.2: '#16a34a',
                0.4: '#ca8a04',
                0.6: '#ea580c',
                0.8: '#dc2626',
                1.0: '#7c2d12'
              }
            }).addTo(mapInstanceRef.current!);

            console.log(`🗺️ Mapa de calor atualizado com ${heatData.length} pontos`);
          }
        }
      }

    } catch (error) {
      console.error('Erro ao carregar dados do heatmap:', error);
      setError('Erro ao carregar dados do mapa');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    loadHeatmapData(false);
  };

  const toggleDataSource = () => {
    loadHeatmapData(!isUsingRealData);
  };

  const centerOnData = () => {
    if (mapData && mapInstanceRef.current) {
      mapInstanceRef.current.setView([mapData.center.lat, mapData.center.lng], mapData.zoom);
    }
  };

  return (
    <Card className="bg-white border-gray-200 hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg lg:text-xl text-purple-primary flex items-center gap-2">
            <MapPin className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">Mapa de Calor - Distribuição de Clientes</span>
          </CardTitle>
          <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
            {mapData && (
              <Button
                variant="outline"
                size="sm"
                onClick={centerOnData}
                disabled={loading}
                className="min-w-[40px]"
              >
                <Target className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleDataSource}
              disabled={loading}
              className={`min-w-[70px] ${isUsingRealData ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}
            >
              {isUsingRealData ? (
                <>
                  <Database className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Real</span>
                </>
              ) : (
                <>
                  <TestTube className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Demo</span>
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={loading}
              className="min-w-[40px]"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Status messages - melhorado para mobile */}
        <div className="space-y-2">
          {!isUsingRealData && (
            <p className="text-sm text-orange-600 flex items-start gap-2">
              <TestTube className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>Dados de demonstração - Clique em "Real" para dados dos tutores</span>
            </p>
          )}
          {isUsingRealData && (
            <p className="text-sm text-green-600 flex items-start gap-2">
              <Database className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>Dados reais dos tutores cadastrados</span>
            </p>
          )}
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </div>
        
        {/* Data info badges - otimizado para responsividade */}
        {mapData && (
          <div className="flex flex-wrap gap-2 items-center">
            <Badge variant="secondary" className="flex items-center gap-1 text-xs">
              <BarChart3 className="h-3 w-3" />
              {mapData.stats.totalPoints} pontos
            </Badge>
            <Badge variant="outline" className="text-xs">
              {mapData.stats.uniqueLocations} localizações
            </Badge>
            <Badge variant="outline" className="text-xs">
              {mapData.stats.coverage}
            </Badge>
            {mapData.useMarkers && (
              <Badge variant="secondary" className="text-xs">
                Marcadores
              </Badge>
            )}
            {isUsingRealData && (
              <Badge variant="default" className="bg-green-500 text-xs">
                Dados Reais
              </Badge>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Mapa responsivo */}
        <div 
          ref={mapRef} 
          className="w-full h-80 sm:h-96 lg:h-[500px] rounded-lg border border-gray-200"
        />
        
        {/* Legenda do mapa de calor - só aparece quando não está usando marcadores */}
        {mapData && !mapData.useMarkers && (
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0"></div>
              <span className="whitespace-nowrap">Baixa concentração</span>
            </span>
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500 flex-shrink-0"></div>
              <span className="whitespace-nowrap">Média concentração</span>
            </span>
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0"></div>
              <span className="whitespace-nowrap">Alta concentração</span>
            </span>
          </div>
        )}
        
        {/* Dica sobre o tipo de visualização */}
        {mapData && (
          <div className="text-center">
            {mapData.useMarkers ? (
              <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                💡 Ponto único detectado - usando marcador para melhor visualização
              </p>
            ) : (
              <p className="text-xs text-green-600 bg-green-50 p-2 rounded">
                🔥 Mapa de calor ativo - mostrando concentração de clientes
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
