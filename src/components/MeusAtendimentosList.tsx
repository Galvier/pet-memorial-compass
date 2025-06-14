
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { User, Heart, Calendar, ArrowRight, RefreshCw } from 'lucide-react';
import { PetMemorialAPI } from '@/lib/api';
import { Atendimento } from '@/types';

export const MeusAtendimentosList: React.FC = () => {
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [atendenteNome, setAtendenteNome] = useState<string>('');

  const fetchMeusAtendimentos = async () => {
    try {
      setLoading(true);
      // Simular dados para o atendente logado
      const todosAtendimentos = await PetMemorialAPI.getAtendimentos();
      
      // Filtrar apenas atendimentos atribuídos (simulando autenticação)
      const meusAtendimentos = todosAtendimentos.filter(
        atendimento => atendimento.status_atendimento === 'ATRIBUIDO_HUMANO'
      );
      
      setAtendimentos(meusAtendimentos);
      setAtendenteNome('João Silva'); // Simular nome do atendente logado
    } catch (error) {
      console.error('Erro ao carregar meus atendimentos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeusAtendimentos();
  }, []);

  const getStatusBadge = (status: string) => {
    const colors = {
      'Em andamento': 'bg-yellow-100 text-yellow-800',
      'Sugestão enviada': 'bg-blue-100 text-blue-800',
      'Finalizado': 'bg-green-100 text-green-800'
    } as const;
    
    return (
      <Badge className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-40 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Meus Atendimentos
          </h1>
          <p className="text-gray-600">
            Olá, {atendenteNome}! Aqui estão os atendimentos atribuídos a você.
          </p>
        </div>
        <Button onClick={fetchMeusAtendimentos} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Atendimentos Ativos
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-primary">
              {atendimentos.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Atribuídos para você
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Em Andamento
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {atendimentos.filter(a => a.status === 'Em andamento').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Aguardando ação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Finalizados Hoje
            </CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {atendimentos.filter(a => a.status === 'Finalizado').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Concluídos com sucesso
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Atendimentos */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Atendimentos</CardTitle>
        </CardHeader>
        <CardContent>
          {atendimentos.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum atendimento atribuído
              </h3>
              <p className="text-gray-600">
                Quando houver novos atendimentos, eles aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Tutor</TableHead>
                    <TableHead>Pet</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {atendimentos.map((atendimento) => (
                    <TableRow key={atendimento.atendimento_id}>
                      <TableCell className="font-medium">
                        #{atendimento.atendimento_id}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {atendimento.tutor?.nome_tutor}
                          </div>
                          <div className="text-sm text-gray-600">
                            {atendimento.tutor?.id_whatsapp}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Heart className="w-4 h-4 text-purple-primary" />
                          <span>{atendimento.pet?.nome_pet}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {atendimento.tipo_atendimento}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(atendimento.status)}
                      </TableCell>
                      <TableCell>
                        {formatDate(atendimento.data_inicio)}
                      </TableCell>
                      <TableCell>
                        <Link to={`/atendimentos/${atendimento.atendimento_id}`}>
                          <Button size="sm" variant="outline">
                            Ver Detalhes
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
