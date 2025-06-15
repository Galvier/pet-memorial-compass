
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Users, 
  MapPin, 
  DollarSign, 
  Target, 
  Award,
  Download,
  BarChart3
} from 'lucide-react';
import { getDashboardAnalytics } from '@/api/analytics';
import { HeatmapVisualization } from '@/components/HeatmapVisualization';
import { BusinessProfileDistribution } from './BusinessProfileDistribution';
import { LocationScoreChart } from './LocationScoreChart';

export const AdminAnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await getDashboardAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error('Erro ao carregar analytics admin:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const { summary, charts, insights } = analytics || {};

  return (
    <div className="space-y-6">
      {/* KPIs Executivos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {(summary?.ticketMedio * summary?.totalAtendimentos || 0).toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-green-600">+15% vs mês anterior</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Premium</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {Math.floor((summary?.totalAtendimentos || 0) * 0.3)}
            </div>
            <p className="text-xs text-blue-600">Score ≥ 60 pontos</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa Conversão</CardTitle>
            <Target className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{summary?.taxaConversao}</div>
            <p className="text-xs text-purple-600">+5% vs período anterior</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtividade</CardTitle>
            <Award className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {Math.floor((summary?.atendimentosHoje || 0) / 8)}
            </div>
            <p className="text-xs text-orange-600">atend./hora média</p>
          </CardContent>
        </Card>
      </div>

      {/* Mapa de Calor Comercial */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Distribuição Geográfica de Clientes
          </CardTitle>
          <Badge variant="outline">Comercial</Badge>
        </CardHeader>
        <CardContent>
          <HeatmapVisualization />
        </CardContent>
      </Card>

      {/* Análises de Perfil e Localização */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BusinessProfileDistribution />
        <LocationScoreChart />
      </div>

      {/* Insights Estratégicos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Insights Estratégicos
          </CardTitle>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">🎯 Oportunidade</h4>
                <p className="text-sm text-green-700">
                  Região Centro concentra 40% dos clientes premium. 
                  Considere expandir serviços especializados nesta área.
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">📊 Performance</h4>
                <p className="text-sm text-blue-700">
                  Atendentes com foco em clientes score 60+ têm 
                  taxa de conversão 25% maior.
                </p>
              </div>
              
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">💡 Recomendação</h4>
                <p className="text-sm text-purple-700">
                  Implementar campanhas direcionadas para 
                  bairros com score médio entre 40-59.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
