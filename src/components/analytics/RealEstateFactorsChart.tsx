
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import type { AnalyticsData } from './AnalyticsDashboard';

interface RealEstateFactorsChartProps {
  data: AnalyticsData;
}

export const RealEstateFactorsChart: React.FC<RealEstateFactorsChartProps> = ({ data }) => {
  // Simular evolução temporal dos fatores
  const temporalData = [
    { month: 'Jan', Ibituruna: 1.28, Centro: 1.12, 'Morada do Sol': 1.22 },
    { month: 'Fev', Ibituruna: 1.29, Centro: 1.13, 'Morada do Sol': 1.23 },
    { month: 'Mar', Ibituruna: 1.30, Centro: 1.15, 'Morada do Sol': 1.25 },
    { month: 'Abr', Ibituruna: 1.30, Centro: 1.15, 'Morada do Sol': 1.25 },
  ];

  // Preparar dados com categoria para cores
  const chartData = data.realEstateFactors.map(item => ({
    ...item,
    fillColor: item.category === 'alto' ? '#8884d8' : 
               item.category === 'medio' ? '#82ca9d' : '#ffc658'
  }));

  return (
    <div className="space-y-6">
      {/* Gráfico de Fatores Atuais */}
      <Card>
        <CardHeader>
          <CardTitle>Fatores Imobiliários por Bairro</CardTitle>
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
              <YAxis 
                domain={[0.95, 1.35]}
                tickFormatter={(value) => `${value}x`}
              />
              <Tooltip 
                formatter={(value: number) => [`${value}x`, 'Fator Imobiliário']}
                labelFormatter={(label) => `Bairro: ${label}`}
              />
              <Bar 
                dataKey="factor" 
                fill="#8884d8"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução Temporal */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução dos Fatores (Principais Bairros)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={temporalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis 
                  domain={[1.0, 1.35]}
                  tickFormatter={(value) => `${value}x`}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [`${value}x`, name]}
                />
                <Line 
                  type="monotone" 
                  dataKey="Ibituruna" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ fill: '#8884d8' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Centro" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  dot={{ fill: '#82ca9d' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Morada do Sol" 
                  stroke="#ffc658" 
                  strokeWidth={2}
                  dot={{ fill: '#ffc658' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Categorização */}
        <Card>
          <CardHeader>
            <CardTitle>Categorização por Faixa de Valor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Alto Padrão */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-blue-600">Alto Padrão (1.20x+)</h4>
                  <div className="w-4 h-4 bg-blue-500 rounded-full" />
                </div>
                <div className="space-y-1">
                  {chartData.filter(item => item.category === 'alto').map(item => (
                    <div key={item.bairro} className="flex justify-between text-sm">
                      <span>{item.bairro}</span>
                      <span className="font-medium">{item.factor}x</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Médio Padrão */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-green-600">Médio Padrão (1.05x - 1.19x)</h4>
                  <div className="w-4 h-4 bg-green-500 rounded-full" />
                </div>
                <div className="space-y-1">
                  {chartData.filter(item => item.category === 'medio').map(item => (
                    <div key={item.bairro} className="flex justify-between text-sm">
                      <span>{item.bairro}</span>
                      <span className="font-medium">{item.factor}x</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Padrão */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-yellow-600">Padrão (1.00x - 1.04x)</h4>
                  <div className="w-4 h-4 bg-yellow-500 rounded-full" />
                </div>
                <div className="space-y-1">
                  {chartData.filter(item => item.category === 'padrao').map(item => (
                    <div key={item.bairro} className="flex justify-between text-sm">
                      <span>{item.bairro}</span>
                      <span className="font-medium">{item.factor}x</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
