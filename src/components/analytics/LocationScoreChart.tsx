
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import type { AnalyticsData } from './AnalyticsDashboard';

interface LocationScoreChartProps {
  data: AnalyticsData;
}

export const LocationScoreChart: React.FC<LocationScoreChartProps> = ({ data }) => {
  // Agrupar scores por bairro
  const scoresByBairro = data.locationScores.reduce((acc, item) => {
    if (!item.bairro) return acc;
    
    if (!acc[item.bairro]) {
      acc[item.bairro] = {
        bairro: item.bairro,
        scores: [],
        averageScore: 0,
        count: 0
      };
    }
    
    acc[item.bairro].scores.push(item.score);
    acc[item.bairro].count++;
    
    return acc;
  }, {} as Record<string, any>);

  // Calcular médias e preparar dados para o gráfico
  const chartData = Object.values(scoresByBairro).map((item: any) => {
    const average = item.scores.reduce((sum: number, score: number) => sum + score, 0) / item.scores.length;
    return {
      bairro: item.bairro,
      averageScore: Math.round(average * 10) / 10,
      count: item.count,
      minScore: Math.min(...item.scores),
      maxScore: Math.max(...item.scores)
    };
  }).sort((a, b) => b.averageScore - a.averageScore);

  // Dados para scatter plot (últimas 50 análises)
  const scatterData = data.locationScores.slice(0, 50).map((item, index) => ({
    index: index + 1,
    score: item.score,
    bairro: item.bairro || 'Desconhecido'
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfico de Barras - Scores Médios por Bairro */}
      <Card>
        <CardHeader>
          <CardTitle>Scores Médios por Bairro</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="bairro" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  name === 'averageScore' ? `${value} pontos` : value,
                  name === 'averageScore' ? 'Score Médio' : name
                ]}
                labelFormatter={(label) => `Bairro: ${label}`}
              />
              <Bar 
                dataKey="averageScore" 
                fill="#8884d8"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Scatter Plot - Distribuição de Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Scores (Últimas 50 Análises)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={scatterData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="index" 
                type="number"
                domain={['dataMin', 'dataMax']}
                name="Análise"
              />
              <YAxis 
                dataKey="score" 
                type="number"
                name="Score"
                domain={[0, 80]}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  name === 'score' ? `${value} pontos` : value,
                  name === 'score' ? 'Score' : name
                ]}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    return `Análise #${label} - ${payload[0].payload.bairro}`;
                  }
                  return `Análise #${label}`;
                }}
              />
              <Scatter fill="#82ca9d" />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabela de Top Áreas */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Ranking de Áreas por Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Posição</th>
                  <th className="text-left p-2">Bairro</th>
                  <th className="text-right p-2">Score Médio</th>
                  <th className="text-right p-2">Análises</th>
                  <th className="text-right p-2">Variação</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((item, index) => (
                  <tr key={item.bairro} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">#{index + 1}</td>
                    <td className="p-2">{item.bairro}</td>
                    <td className="p-2 text-right font-medium">{item.averageScore}</td>
                    <td className="p-2 text-right">{item.count}</td>
                    <td className="p-2 text-right text-sm text-muted-foreground">
                      {item.minScore} - {item.maxScore}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
