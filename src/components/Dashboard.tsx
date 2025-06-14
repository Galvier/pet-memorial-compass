
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { CalendarDays, Users, MousePointer, TrendingUp } from 'lucide-react';
import { PetMemorialAPI } from '@/lib/api';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    atendimentosHoje: 0,
    totalClientes: 0,
    clicksVenda: 0,
    atendimentosRecentes: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await PetMemorialAPI.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const chartData = [
    { name: 'Seg', atendimentos: 4 },
    { name: 'Ter', atendimentos: 3 },
    { name: 'Qua', atendimentos: 6 },
    { name: 'Qui', atendimentos: 8 },
    { name: 'Sex', atendimentos: 5 },
    { name: 'Sáb', atendimentos: 7 },
    { name: 'Dom', atendimentos: 2 },
  ];

  if (loading) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <div className="h-6 lg:h-8 bg-gray-200 rounded w-48 lg:w-64 animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4 lg:p-6">
                <div className="h-12 lg:h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="text-center lg:text-left">
        <h1 className="text-2xl lg:text-3xl font-bold text-purple-primary mb-1 lg:mb-2">Dashboard Terranova Pet</h1>
        <p className="text-sm lg:text-base text-gray-600">Visão geral dos atendimentos e operações</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="border-l-4 border-purple-primary bg-white hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs lg:text-sm font-medium text-gray-600">
              Atendimentos Hoje
            </CardTitle>
            <CalendarDays className="h-4 w-4 lg:h-5 lg:w-5 text-purple-primary" />
          </CardHeader>
          <CardContent className="pb-2 lg:pb-4">
            <div className="text-2xl lg:text-3xl font-bold text-purple-primary">{stats.atendimentosHoje}</div>
            <p className="text-xs text-green-600 font-medium">
              +20% desde ontem
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-purple-primary/60 bg-white hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs lg:text-sm font-medium text-gray-600">
              Total de Clientes
            </CardTitle>
            <Users className="h-4 w-4 lg:h-5 lg:w-5 text-purple-primary/70" />
          </CardHeader>
          <CardContent className="pb-2 lg:pb-4">
            <div className="text-2xl lg:text-3xl font-bold text-purple-primary">{stats.totalClientes}</div>
            <p className="text-xs text-gray-500">
              Clientes atendidos
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-gray-300 bg-white hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs lg:text-sm font-medium text-gray-600">
              Clicks em Vendas
            </CardTitle>
            <MousePointer className="h-4 w-4 lg:h-5 lg:w-5 text-gray-500" />
          </CardHeader>
          <CardContent className="pb-2 lg:pb-4">
            <div className="text-2xl lg:text-3xl font-bold text-gray-700">{stats.clicksVenda}</div>
            <p className="text-xs text-gray-500">
              Links de venda acessados
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-gray-300 bg-white hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs lg:text-sm font-medium text-gray-600">
              Taxa de Conversão
            </CardTitle>
            <TrendingUp className="h-4 w-4 lg:h-5 lg:w-5 text-gray-500" />
          </CardHeader>
          <CardContent className="pb-2 lg:pb-4">
            <div className="text-2xl lg:text-3xl font-bold text-gray-700">78%</div>
            <p className="text-xs text-green-600 font-medium">
              +5% desde a semana passada
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        {/* Chart */}
        <Card className="bg-white border-gray-200 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg lg:text-xl text-purple-primary">Atendimentos da Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250} className="lg:h-[300px]">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={11} />
                <YAxis stroke="#6b7280" fontSize={11} />
                <Bar 
                  dataKey="atendimentos" 
                  fill="rgb(85, 12, 116)" 
                  opacity={0.8}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-white border-gray-200 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg lg:text-xl text-purple-primary">Atendimentos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 lg:space-y-4">
              {stats.atendimentosRecentes.slice(0, 5).map((atendimento: any) => (
                <div key={atendimento.atendimento_id} className="flex items-center space-x-3 lg:space-x-4 p-2 lg:p-3 rounded-lg bg-gray-50 hover:bg-purple-primary/5 transition-colors border border-gray-100">
                  <div className="w-2 h-2 bg-purple-primary rounded-full flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-purple-primary truncate">
                      {atendimento.tutor?.nome_tutor}
                    </p>
                    <p className="text-xs lg:text-sm text-gray-500 truncate">
                      {atendimento.tipo_atendimento} - {atendimento.status}
                    </p>
                  </div>
                  <div className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(atendimento.data_inicio).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
