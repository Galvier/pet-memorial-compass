
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2, RefreshCw } from 'lucide-react';
import { getHeatmapData, generateMockHeatmapData, HeatmapDataPoint } from '@/api/heatmap';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Importar o plugin de heatmap
declare global {
  namespace L {
    function heatLayer(data: [number, number, number][], options?: any): any;
  }
}

// Carregar o plugin dinamicamente
const loadHeatmapPlugin = async () => {
  if (typeof window !== 'undefined' && !window.L?.heatLayer) {
    await import('leaflet.heat');
  }
};

export const HeatmapVisualization: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const heatLayerRef = useRef<any>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataPoints, setDataPoints] = useState<HeatmapDataPoint[]>([]);
  const [useMockData, setUseMockData] = useState(false);

  // Inicializar o mapa
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const initMap = async () => {
      try {
        await loadHeatmapPlugin();

        // Criar o mapa centrado em Montes Claros, MG
        const map = L.map(mapRef.current!).setView([-16.7249, -43.8609], 12);

        // Adicionar tiles do OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Adicionar marcador do centro (Montes Claros)
        L.marker([-16.7249, -43.8609])
          .addTo(map)
          .bindPopup('Montes Claros - MG<br>Centro de Operações');

        mapInstanceRef.current = map;
        
        // Carregar dados iniciais
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

  const loadHeatmapData = async (forceMock = false) => {
    if (!mapInstanceRef.current) return;
    
    setLoading(true);
    setError(null);

    try {
      let data: HeatmapDataPoint[];
      
      if (forceMock) {
        data = generateMockHeatmapData();
        setUseMockData(true);
      } else {
        try {
          data = await getHeatmapData();
          setUseMockData(false);
          
          if (data.length === 0) {
            // Se não há dados reais, usar dados de demonstração
            data = generateMockHeatmapData();
            setUseMockData(true);
          }
        } catch (apiError) {
          console.warn('Erro ao carregar dados reais, usando dados de demonstração:', apiError);
          data = generateMockHeatmapData();
          setUseMockData(true);
        }
      }

      setDataPoints(data);

      // Remover camada anterior se existir
      if (heatLayerRef.current) {
        mapInstanceRef.current.removeLayer(heatLayerRef.current);
      }

      // Converter dados para o formato do leaflet.heat: [lat, lng, intensity]
      const heatData: [number, number, number][] = data.map(point => [
        point.lat,
        point.lng,
        point.intensity || 1
      ]);

      // Criar nova camada de calor
      if (heatData.length > 0 && window.L?.heatLayer) {
        heatLayerRef.current = L.heatLayer(heatData, {
          radius: 25,
          blur: 15,
          maxZoom: 17,
          gradient: {
            0.0: 'blue',
            0.3: 'cyan',
            0.5: 'lime',
            0.7: 'yellow',
            1.0: 'red'
          }
        }).addTo(mapInstanceRef.current);

        console.log(`🗺️ Mapa de calor atualizado com ${heatData.length} pontos`);
      }

    } catch (error) {
      console.error('Erro ao carregar dados do heatmap:', error);
      setError('Erro ao carregar dados do mapa');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    loadHeatmapData();
  };

  const toggleMockData = () => {
    loadHeatmapData(!useMockData);
  };

  return (
    <Card className="bg-white border-gray-200 hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg lg:text-xl text-purple-primary flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Mapa de Calor - Distribuição de Clientes
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleMockData}
              disabled={loading}
            >
              {useMockData ? 'Dados Reais' : 'Demo'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        {useMockData && (
          <p className="text-sm text-orange-600">
            Exibindo dados de demonstração - Configure a API do Google Maps para dados reais
          </p>
        )}
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <p>
              <strong>Pontos mapeados:</strong> {dataPoints.length} localizações
            </p>
            <p className="text-xs mt-1">
              Zonas mais escuras indicam maior concentração de clientes
            </p>
          </div>
          
          <div 
            ref={mapRef} 
            className="w-full h-96 rounded-lg border border-gray-200"
            style={{ minHeight: '400px' }}
          />
        </div>
      </CardContent>
    </Card>
  );
};
