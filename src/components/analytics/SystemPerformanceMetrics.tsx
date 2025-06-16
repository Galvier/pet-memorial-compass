
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Clock, Database, CheckCircle, AlertCircle } from 'lucide-react';
import type { AnalyticsData } from './AnalyticsDashboard';

interface SystemPerformanceMetricsProps {
  data: AnalyticsData;
}

export const SystemPerformanceMetrics: React.FC<SystemPerformanceMetricsProps> = ({ data }) => {
  // Simular dados de performance histórica
  const performanceHistory = [
    { time: '00:00', responseTime: 1200, cacheHit: 75, errors: 2 },
    { time: '04:00', responseTime: 1100, cacheHit: 78, errors: 1 },
    { time: '08:00', responseTime: 1350, cacheHit: 72, errors: 5 },
    { time: '12:00', responseTime: 1450, cacheHit: 68, errors: 8 },
    { time: '16:00', responseTime: 1300, cacheHit: 74, errors: 3 },
    { time: '20:00', responseTime: 1150, cacheHit: 79, errors: 1 }
  ];

  return (
    <div className="space-y-6">
      {/* Métricas de Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo de Resposta</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.performanceMetrics.averageResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">Meta: &lt;2000ms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.performanceMetrics.cacheHitRate}%</div>
            <p className="text-xs text-muted-foreground">Meta: &gt;80%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.performanceMetrics.successRate}%</div>
            <p className="text-xs text-muted-foreground">Meta: &gt;95%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Erros/Hora</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2</div>
            <p className="text-xs text-muted-foreground">Meta: &lt;5</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Análises Diárias */}
        <Card>
          <CardHeader>
            <CardTitle>Análises Realizadas (Últimos 7 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={data.performanceMetrics.dailyAnalyses}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                  formatter={(value: number) => [value, 'Análises']}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance por Hora */}
        <Card>
          <CardHeader>
            <CardTitle>Performance por Horário (Hoje)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={performanceHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="responseTime" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="Tempo de Resposta (ms)"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="cacheHit" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  name="Cache Hit (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Status dos Serviços */}
      <Card>
        <CardHeader>
          <CardTitle>Status dos Serviços</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">IBGE API Service</h4>
                <div className="w-3 h-3 bg-green-500 rounded-full" />
              </div>
              <div className="text-sm text-muted-foreground">
                <div>Último check: há 2 min</div>
                <div>Response time: 850ms</div>
                <div>Uptime: 99.8%</div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Enhanced Analysis</h4>
                <div className="w-3 h-3 bg-green-500 rounded-full" />
              </div>
              <div className="text-sm text-muted-foreground">
                <div>Último check: há 1 min</div>
                <div>Response time: 1200ms</div>
                <div>Uptime: 99.9%</div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Business Profile</h4>
                <div className="w-3 h-3 bg-green-500 rounded-full" />
              </div>
              <div className="text-sm text-muted-foreground">
                <div>Último check: há 3 min</div>
                <div>Response time: 950ms</div>
                <div>Uptime: 99.7%</div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Geocoding Service</h4>
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              </div>
              <div className="text-sm text-muted-foreground">
                <div>Último check: há 15 min</div>
                <div>Response time: 2400ms</div>
                <div>Uptime: 97.2%</div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Cache System</h4>
                <div className="w-3 h-3 bg-green-500 rounded-full" />
              </div>
              <div className="text-sm text-muted-foreground">
                <div>Último check: há 1 min</div>
                <div>Hit rate: {data.performanceMetrics.cacheHitRate}%</div>
                <div>Storage: 24.5MB / 100MB</div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Real Estate Engine</h4>
                <div className="w-3 h-3 bg-green-500 rounded-full" />
              </div>
              <div className="text-sm text-muted-foreground">
                <div>Último check: há 2 min</div>
                <div>Response time: 650ms</div>
                <div>Uptime: 99.9%</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
