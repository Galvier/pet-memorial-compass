
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Users, TrendingUp } from 'lucide-react';

const profileData = [
  { name: 'Premium (60+)', value: 25, color: '#8b5cf6', count: 150 },
  { name: 'Intermediário (40-59)', value: 45, color: '#3b82f6', count: 270 },
  { name: 'Padrão (<40)', value: 30, color: '#10b981', count: 180 }
];

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981'];

export const BusinessProfileDistribution: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Distribuição de Perfis de Cliente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Gráfico de Pizza */}
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={profileData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${value}%`}
              >
                {profileData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>

          {/* Métricas Detalhadas */}
          <div className="space-y-3">
            {profileData.map((profile, index) => (
              <div 
                key={profile.name}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: profile.color }}
                  />
                  <div>
                    <div className="font-medium text-sm">{profile.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {profile.count} clientes
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline">{profile.value}%</Badge>
                  <div className="text-xs text-muted-foreground mt-1">
                    {index === 0 && '+8% vs mês anterior'}
                    {index === 1 && 'Estável'}
                    {index === 2 && '-3% vs mês anterior'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Insight Estratégico */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-blue-800">
                  Insight Estratégico
                </div>
                <div className="text-xs text-blue-700 mt-1">
                  70% dos clientes têm perfil intermediário ou premium. 
                  Oportunidade de upselling focada no segmento padrão.
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
