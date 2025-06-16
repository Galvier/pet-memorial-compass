import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LocationScoreChart } from './LocationScoreChart';
import { BusinessProfileDistribution } from './BusinessProfileDistribution';
import { RealEstateFactorsChart } from './RealEstateFactorsChart';
import { SystemPerformanceMetrics } from './SystemPerformanceMetrics';
import { AnalyticsFilters } from './AnalyticsFilters';
import { DataExport } from './DataExport';
import { MarketConfigPanel } from '@/components/diagnostic/MarketConfigPanel';
import { Activity, BarChart3, MapPin, TrendingUp, Settings } from 'lucide-react';

export interface AnalyticsData {
  totalAnalyses: number;
  averageScore: number;
  topPerformingAreas: Array<{ name: string; score: number }>;
  locationScores: Array<{ address: string; score: number; bairro?: string; date: string }>;
  businessProfiles: Array<{ category: string; count: number; percentage: number }>;
  realEstateFactors: Array<{ bairro: string; factor: number; category: string }>;
  performanceMetrics: {
    cacheHitRate: number;
    averageResponseTime: number;
    successRate: number;
    dailyAnalyses: Array<{ date: string; count: number }>;
  };
}

interface AnalyticsDashboardProps {
  isAdmin?: boolean;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ isAdmin = false }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedRegion, setSelectedRegion] = useState('all');

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod, selectedRegion]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Simular carregamento de dados (em produção seria uma API real)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData: AnalyticsData = {
        totalAnalyses: 1547,
        averageScore: 42.8,
        topPerformingAreas: [
          { name: 'Ibituruna', score: 65 },
          { name: 'Morada do Sol', score: 58 },
          { name: 'Centro', score: 52 },
          { name: 'Todos os Santos', score: 48 },
          { name: 'Augusta Mota', score: 45 }
        ],
        locationScores: generateMockLocationScores(),
        businessProfiles: [
          { category: 'Premium', count: 234, percentage: 15.1 },
          { category: 'Misto', count: 697, percentage: 45.1 },
          { category: 'Local', count: 616, percentage: 39.8 }
        ],
        realEstateFactors: [
          { bairro: 'Ibituruna', factor: 1.30, category: 'alto' },
          { bairro: 'Morada do Sol', factor: 1.25, category: 'alto' },
          { bairro: 'Centro', factor: 1.15, category: 'medio' },
          { bairro: 'Todos os Santos', factor: 1.10, category: 'medio' },
          { bairro: 'Major Prates', factor: 1.05, category: 'padrao' },
          { bairro: 'Augusta Mota', factor: 1.08, category: 'medio' }
        ],
        performanceMetrics: {
          cacheHitRate: 78.5,
          averageResponseTime: 1250,
          successRate: 94.2,
          dailyAnalyses: generateMockDailyAnalyses()
        }
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Erro ao carregar dados de analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockLocationScores = () => {
    const bairros = ['Ibituruna', 'Centro', 'Morada do Sol', 'Major Prates', 'Augusta Mota', 'Todos os Santos'];
    const data = [];
    
    for (let i = 0; i < 100; i++) {
      const bairro = bairros[Math.floor(Math.random() * bairros.length)];
      const baseScore = bairro === 'Ibituruna' ? 65 : bairro === 'Centro' ? 52 : 42;
      const variation = Math.random() * 20 - 10;
      
      data.push({
        address: `Rua Exemplo ${i + 1}, ${bairro}, Montes Claros`,
        score: Math.max(10, Math.min(80, Math.round(baseScore + variation))),
        bairro,
        date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
    
    return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const generateMockDailyAnalyses = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 50) + 150
      });
    }
    return data;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Erro ao carregar dados de analytics</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros e Controles */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <AnalyticsFilters
          selectedPeriod={selectedPeriod}
          selectedRegion={selectedRegion}
          onPeriodChange={setSelectedPeriod}
          onRegionChange={setSelectedRegion}
        />
        <DataExport data={analyticsData} />
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Análises</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalAnalyses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% em relação ao período anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Médio</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.averageScore.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">+2.3 pontos vs. período anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.performanceMetrics.successRate}%</div>
            <p className="text-xs text-muted-foreground">Meta: 95%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.performanceMetrics.averageResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">Cache: {analyticsData.performanceMetrics.cacheHitRate}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Abas de Visualização */}
      <Tabs defaultValue="scores" className="space-y-4">
        <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-5' : 'grid-cols-4'}`}>
          <TabsTrigger value="scores">Scores por Localização</TabsTrigger>
          <TabsTrigger value="business">Perfis Comerciais</TabsTrigger>
          <TabsTrigger value="factors">Fatores Imobiliários</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="scores">
          <LocationScoreChart data={analyticsData} />
        </TabsContent>

        <TabsContent value="business">
          <BusinessProfileDistribution />
        </TabsContent>

        <TabsContent value="factors">
          <RealEstateFactorsChart data={analyticsData} />
        </TabsContent>

        <TabsContent value="performance">
          <SystemPerformanceMetrics data={analyticsData} />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="config">
            <MarketConfigPanel />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};
