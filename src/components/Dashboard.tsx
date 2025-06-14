
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { CalendarDays, Users, MousePointer, TrendingUp, DollarSign, Target, Clock, Award } from 'lucide-react';
import { PetMemorialAPI } from '@/lib/api';

const COLORS = ['#550c74', '#7c2d9e', '#a855f7', '#c084fc', '#ddd6fe'];

export const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState({
    summary: {
      totalAtendimentos: 0,
      atendimentosHoje: 0,
      atendimentosMes: 0,
      taxaConversao: '0%',
      ticketMedio: 0
    },
    charts: {
      atendimentosPorDia: [],
      produtosMaisVendidos: [],
      performanceAtendentes: [],
      distribuicaoTipos: []
    },
    atendimentosRecentes: [],
    clicksVenda: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await PetMemorialAPI.getDashboardStats();
        setDashboardData(data);
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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

  const { summary, charts } = dashboardData;

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="text-center lg:text-left">
        <h1 className="text-2xl lg:text-3xl font-bold text-purple-primary mb-1 lg:mb-2">Dashboard Analytics Terranova Pet</h1>
        <p className="text-sm lg:text-base text-gray-600">Performance e métricas de atendimento em tempo real</p>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="border-l-4 border-purple-primary bg-white hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs lg:text-sm font-medium text-gray-600">
              Total de Atendimentos
            </CardTitle>
            <Users className="h-4 w-4 lg:h-5 lg:w-5 text-purple-primary" />
          </CardHeader>
          <CardContent className="pb-2 lg:pb-4">
            <div className="text-2xl lg:text-3xl font-bold text-purple-primary">{summary.totalAtendimentos}</div>
            <p className="text-xs text-gray-500">
              {summary.atendimentosMes} este mês
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-green-500 bg-white hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs lg:text-sm font-medium text-gray-600">
              Taxa de Conversão
            </CardTitle>
            <Target className="h-4 w-4 lg:h-5 lg:w-5 text-green-500" />
          </CardHeader>
          <CardContent className="pb-2 lg:pb-4">
            <div className="text-2xl lg:text-3xl font-bold text-green-600">{summary.taxaConversao}</div>
            <p className="text-xs text-green-600 font-medium">
              +5% desde o mês passado
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-blue-500 bg-white hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs lg:text-sm font-medium text-gray-600">
              Ticket Médio
            </CardTitle>
            <DollarSign className="h-4 w-4 lg:h-5 lg:w-5 text-blue-500" />
          </CardHeader>
          <CardContent className="pb-2 lg:pb-4">
            <div className="text-2xl lg:text-3xl font-bold text-blue-600">
              R$ {summary.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-blue-600 font-medium">
              +12% desde o mês passado
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-orange-500 bg-white hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs lg:text-sm font-medium text-gray-600">
              Atendimentos Hoje
            </CardTitle>
            <CalendarDays className="h-4 w-4 lg:h-5 lg:w-5 text-orange-500" />
          </CardHeader>
          <CardContent className="pb-2 lg:pb-4">
            <div className="text-2xl lg:text-3xl font-bold text-orange-600">{summary.atendimentosHoje}</div>
            <p className="text-xs text-orange-600 font-medium">
              +3 desde ontem
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        {/* Atendimentos por Dia */}
        <Card className="bg-white border-gray-200 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg lg:text-xl text-purple-primary">Atendimentos por Dia (Última Semana)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={charts.atendimentosPorDia}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="day" stroke="#6b7280" fontSize={11} />
                <YAxis stroke="#6b7280" fontSize={11} />
                <Tooltip />
                <Bar 
                  dataKey="count" 
                  fill="rgb(85, 12, 116)" 
                  opacity={0.8}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Produtos Mais Vendidos */}
        <Card className="bg-white border-gray-200 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg lg:text-xl text-purple-primary">Produtos Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={charts.produtosMaisVendidos}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ name, percentage }) => `${percentage}%`}
                >
                  {charts.produtosMaisVendidos.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance da Equipe e Atendimentos Recentes */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        {/* Performance da Equipe */}
        <Card className="bg-white border-gray-200 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg lg:text-xl text-purple-primary flex items-center gap-2">
              <Award className="h-5 w-5" />
              Performance da Equipe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Atendente</TableHead>
                  <TableHead className="text-center">Atribuídos</TableHead>
                  <TableHead className="text-center">Concluídos</TableHead>
                  <TableHead className="text-center">Taxa</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {charts.performanceAtendentes.map((atendente, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{atendente.nome}</TableCell>
                    <TableCell className="text-center">{atendente.atribuidos}</TableCell>
                    <TableCell className="text-center">{atendente.concluidos}</TableCell>
                    <TableCell className="text-center">
                      <span className={`font-medium ${parseFloat(atendente.taxaConversao) > 50 ? 'text-green-600' : 'text-orange-600'}`}>
                        {atendente.taxaConversao}%
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        atendente.status === 'Online' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {atendente.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Atendimentos Recentes */}
        <Card className="bg-white border-gray-200 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg lg:text-xl text-purple-primary flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Atendimentos Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 lg:space-y-4">
              {dashboardData.atendimentosRecentes.slice(0, 5).map((atendimento: any) => (
                <div key={atendimento.atendimento_id} className="flex items-center space-x-3 lg:space-x-4 p-2 lg:p-3 rounded-lg bg-gray-50 hover:bg-purple-primary/5 transition-colors border border-gray-100">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    atendimento.status === 'Finalizado' ? 'bg-green-500' :
                    atendimento.status === 'Sugestão enviada' ? 'bg-blue-500' :
                    'bg-purple-primary'
                  }`}></div>
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
