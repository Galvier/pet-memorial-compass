
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import type { AnalyticsData } from './AnalyticsDashboard';

interface BusinessProfileDistributionProps {
  data: AnalyticsData;
}

const COLORS = {
  Premium: '#8884d8',
  Misto: '#82ca9d',
  Local: '#ffc658'
};

export const BusinessProfileDistribution: React.FC<BusinessProfileDistributionProps> = ({ data }) => {
  // Simular dados por bairro
  const profilesByBairro = [
    { bairro: 'Ibituruna', Premium: 45, Misto: 35, Local: 20 },
    { bairro: 'Centro', Premium: 30, Misto: 50, Local: 20 },
    { bairro: 'Morada do Sol', Premium: 40, Misto: 40, Local: 20 },
    { bairro: 'Todos os Santos', Premium: 20, Misto: 45, Local: 35 },
    { bairro: 'Major Prates', Premium: 10, Misto: 35, Local: 55 },
    { bairro: 'Augusta Mota', Premium: 15, Misto: 40, Local: 45 }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfico de Pizza - Distribuição Geral */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição Geral de Perfis Comerciais</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.businessProfiles}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="count"
              >
                {data.businessProfiles.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[entry.category as keyof typeof COLORS]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number, name: string, props: any) => [
                  `${value} análises (${props.payload.percentage}%)`,
                  props.payload.category
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Legenda */}
          <div className="flex justify-center mt-4 space-x-4">
            {data.businessProfiles.map((item) => (
              <div key={item.category} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[item.category as keyof typeof COLORS] }}
                />
                <span className="text-sm">{item.category}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Barras - Perfis por Bairro */}
      <Card>
        <CardHeader>
          <CardTitle>Perfis Comerciais por Bairro (%)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={profilesByBairro}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="bairro" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Premium" stackId="a" fill={COLORS.Premium} />
              <Bar dataKey="Misto" stackId="a" fill={COLORS.Misto} />
              <Bar dataKey="Local" stackId="a" fill={COLORS.Local} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Análise Detalhada */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Análise Detalhada por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.businessProfiles.map((profile) => (
              <div key={profile.category} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{profile.category}</h4>
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: COLORS[profile.category as keyof typeof COLORS] }}
                  />
                </div>
                <div className="text-2xl font-bold mb-1">{profile.count}</div>
                <div className="text-sm text-muted-foreground">{profile.percentage}% do total</div>
                
                <div className="mt-3 space-y-1">
                  <div className="text-xs font-medium">Características:</div>
                  {profile.category === 'Premium' && (
                    <div className="text-xs text-muted-foreground">
                      Saúde, advocacia, consultoria especializada
                    </div>
                  )}
                  {profile.category === 'Misto' && (
                    <div className="text-xs text-muted-foreground">
                      Comércio geral, serviços diversos
                    </div>
                  )}
                  {profile.category === 'Local' && (
                    <div className="text-xs text-muted-foreground">
                      Serviços básicos, comércio local
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
