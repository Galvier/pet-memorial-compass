
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { User, Heart, Calendar, ArrowRight, RefreshCw, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Atendimento } from '@/types';
import { toast } from 'sonner';

export const MeusAtendimentosList: React.FC = () => {
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, userProfile } = useAuth();

  const fetchMeusAtendimentos = async () => {
    if (!user || !userProfile) return;

    try {
      setLoading(true);

      // Primeiro, obter dados do atendente logado
      const { data: atendenteData, error: atendenteError } = await supabase
        .from('atendentes')
        .select('atendente_id, nome_atendente')
        .eq('user_id', user.id)
        .single();

      if (atendenteError) {
        console.error('Erro ao buscar dados do atendente:', atendenteError);
        toast.error('Erro ao carregar dados do atendente');
        return;
      }

      // Buscar atendimentos atribuídos ao atendente logado
      const { data: atendimentosData, error: atendimentosError } = await supabase
        .from('atendimentos')
        .select(`
          *,
          tutores (*),
          pets (*)
        `)
        .eq('atendente_responsavel_id', atendenteData.atendente_id)
        .order('data_inicio', { ascending: false });

      if (atendimentosError) {
        console.error('Erro ao buscar atendimentos:', atendimentosError);
        toast.error('Erro ao carregar atendimentos');
        return;
      }

      // Mapear dados para o formato esperado
      const atendimentosMapeados: Atendimento[] = atendimentosData.map(atendimento => ({
        atendimento_id: atendimento.atendimento_id,
        tutor_id: atendimento.tutor_id,
        pet_id: atendimento.pet_id,
        data_inicio: atendimento.data_inicio,
        status: atendimento.status as 'Em andamento' | 'Sugestão enviada' | 'Finalizado',
        status_atendimento: atendimento.status_atendimento as 'BOT_ATIVO' | 'ATRIBUIDO_HUMANO' | 'FINALIZADO',
        tipo_atendimento: atendimento.tipo_atendimento as 'Imediato' | 'Preventivo',
        dados_coletados: atendimento.dados_coletados,
        sugestoes_geradas: atendimento.sugestoes_geradas,
        atendente_responsavel_id: atendimento.atendente_responsavel_id,
        tutor: atendimento.tutores ? {
          tutor_id: atendimento.tutores.tutor_id,
          id_whatsapp: atendimento.tutores.id_whatsapp,
          nome_tutor: atendimento.tutores.nome_tutor,
          profissao: atendimento.tutores.profissao,
          endereco: atendimento.tutores.endereco,
          perfil_calculado: atendimento.tutores.perfil_calculado as 'Padrão' | 'Intermediário' | 'Luxo'
        } : undefined,
        pet: atendimento.pets ? {
          pet_id: atendimento.pets.pet_id,
          tutor_id: atendimento.pets.tutor_id,
          nome_pet: atendimento.pets.nome_pet,
          idade_pet: atendimento.pets.idade_pet
        } : undefined
      }));

      setAtendimentos(atendimentosMapeados);
    } catch (error) {
      console.error('Erro ao carregar meus atendimentos:', error);
      toast.error('Erro inesperado ao carregar atendimentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeusAtendimentos();
  }, [user, userProfile]);

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
      <div className="space-y-4 lg:space-y-6">
        <div className="h-6 lg:h-8 bg-gray-200 rounded w-48 lg:w-64 animate-pulse"></div>
        <div className="space-y-3 lg:space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4 lg:p-6">
                <div className="h-16 lg:h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Meus Atendimentos
          </h1>
          <p className="text-sm lg:text-base text-gray-600">
            Olá, {userProfile?.nome}! Aqui estão os atendimentos atribuídos a você.
          </p>
        </div>
        <Button onClick={fetchMeusAtendimentos} variant="outline" size="sm" className="self-center sm:self-auto">
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs lg:text-sm font-medium">
              Atendimentos Ativos
            </CardTitle>
            <User className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-3">
            <div className="text-xl lg:text-2xl font-bold text-purple-primary">
              {atendimentos.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Atribuídos para você
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs lg:text-sm font-medium">
              Em Andamento
            </CardTitle>
            <Calendar className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-3">
            <div className="text-xl lg:text-2xl font-bold text-yellow-600">
              {atendimentos.filter(a => a.status === 'Em andamento').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Aguardando ação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs lg:text-sm font-medium">
              Finalizados Hoje
            </CardTitle>
            <Heart className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-3">
            <div className="text-xl lg:text-2xl font-bold text-green-600">
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
        <CardHeader className="pb-3 lg:pb-6">
          <CardTitle className="text-lg lg:text-xl">Lista de Atendimentos</CardTitle>
        </CardHeader>
        <CardContent className="p-3 lg:p-6">
          {atendimentos.length === 0 ? (
            <div className="text-center py-8 lg:py-12">
              <Heart className="w-8 h-8 lg:w-12 lg:h-12 text-gray-400 mx-auto mb-3 lg:mb-4" />
              <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">
                Nenhum atendimento atribuído
              </h3>
              <p className="text-sm lg:text-base text-gray-600">
                Quando houver novos atendimentos, eles aparecerão aqui.
              </p>
            </div>
          ) : (
            <>
              {/* Mobile View - Cards */}
              <div className="block lg:hidden space-y-3">
                {atendimentos.map((atendimento) => (
                  <Card key={atendimento.atendimento_id} className="border-l-4 border-purple-primary/20">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm font-medium text-purple-primary">
                                #{atendimento.atendimento_id}
                              </span>
                              {getStatusBadge(atendimento.status)}
                            </div>
                            <div className="font-medium text-sm truncate">
                              {atendimento.tutor?.nome_tutor}
                            </div>
                            <div className="text-xs text-gray-600 truncate">
                              {atendimento.tutor?.id_whatsapp}
                            </div>
                          </div>
                        </div>
                        
                        {/* Pet Info */}
                        {atendimento.pet && (
                          <div className="flex items-center space-x-2 text-xs text-purple-primary/70">
                            <Heart className="w-3 h-3 flex-shrink-0" />
                            <span>{atendimento.pet.nome_pet}</span>
                          </div>
                        )}
                        
                        {/* Type and Date */}
                        <div className="flex items-center justify-between text-xs">
                          <Badge variant="outline" className="text-xs">
                            {atendimento.tipo_atendimento}
                          </Badge>
                          <span className="text-gray-600">
                            {formatDate(atendimento.data_inicio)}
                          </span>
                        </div>
                        
                        {/* Action */}
                        <Link to={`/atendimentos/${atendimento.atendimento_id}`} className="block">
                          <Button size="sm" variant="outline" className="w-full text-xs">
                            <Eye className="w-3 h-3 mr-2" />
                            Ver Detalhes
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop View - Table */}
              <div className="hidden lg:block overflow-x-auto">
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
