
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Database, Users, Clock, RefreshCw } from 'lucide-react';
import { DiagnosticService } from '@/services/DiagnosticService';

interface PerformanceMetrics {
  responseTime: {
    database: number;
    api: number;
    edgeFunctions: number;
  };
  activeConnections: number;
  totalAtendimentos: number;
  atendimentosHoje: number;
  atendentesOnline: number;
  memoryUsage?: number;
  lastUpdated: string;
}

export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(false);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const performanceData = await DiagnosticService.getPerformanceMetrics();
      setMetrics(performanceData);
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
    
    // Atualizar métricas a cada 30 segundos
    const interval = setInterval(loadMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const getResponseTimeStatus = (time: number) => {
    if (time < 200) return { color: 'text-green-600', label: 'Excelente' };
    if (time < 500) return { color: 'text-yellow-600', label: 'Bom' };
    if (time < 1000) return { color: 'text-orange-600', label: 'Lento' };
    return { color: 'text-red-600', label: 'Crítico' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Monitor de Performance</h2>
        <Button onClick={loadMetrics} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {metrics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conexões Ativas</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.activeConnections}</div>
                <p className="text-xs text-muted-foreground">Conexões no banco</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Atendentes Online</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.atendentesOnline}</div>
                <p className="text-xs text-muted-foreground">Disponíveis agora</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Atendimentos Hoje</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.atendimentosHoje}</div>
                <p className="text-xs text-muted-foreground">De {metrics.totalAtendimentos} total</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Última Atualização</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium">
                  {new Date(metrics.lastUpdated).toLocaleTimeString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(metrics.lastUpdated).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tempo de Resposta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Banco de Dados</span>
                    <Badge variant="outline">{metrics.responseTime.database}ms</Badge>
                  </div>
                  <div className={`text-sm ${getResponseTimeStatus(metrics.responseTime.database).color}`}>
                    {getResponseTimeStatus(metrics.responseTime.database).label}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">API REST</span>
                    <Badge variant="outline">{metrics.responseTime.api}ms</Badge>
                  </div>
                  <div className={`text-sm ${getResponseTimeStatus(metrics.responseTime.api).color}`}>
                    {getResponseTimeStatus(metrics.responseTime.api).label}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Edge Functions</span>
                    <Badge variant="outline">{metrics.responseTime.edgeFunctions}ms</Badge>
                  </div>
                  <div className={`text-sm ${getResponseTimeStatus(metrics.responseTime.edgeFunctions).color}`}>
                    {getResponseTimeStatus(metrics.responseTime.edgeFunctions).label}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Métricas em Tempo Real</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {metrics.responseTime.database}ms
                    </div>
                    <div className="text-xs text-muted-foreground">Resposta DB</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {metrics.activeConnections}
                    </div>
                    <div className="text-xs text-muted-foreground">Conexões</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {metrics.atendentesOnline}
                    </div>
                    <div className="text-xs text-muted-foreground">Online</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {metrics.atendimentosHoje}
                    </div>
                    <div className="text-xs text-muted-foreground">Hoje</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
