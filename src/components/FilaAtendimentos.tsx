
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Clock, 
  User, 
  Phone, 
  Heart, 
  Grab, 
  RefreshCw, 
  Users,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Atendimento } from '@/types';
import { toast } from 'sonner';

export const FilaAtendimentos: React.FC = () => {
  const [atendimentosFila, setAtendimentosFila] = useState<Atendimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingIds, setClaimingIds] = useState<Set<number>>(new Set());
  const { user, userProfile } = useAuth();

  const fetchFilaAtendimentos = async () => {
    try {
      setLoading(true);

      const { data: atendimentosData, error } = await supabase
        .from('atendimentos')
        .select(`
          *,
          tutores (*),
          pets (*)
        `)
        .eq('status_atendimento', 'AGUARDANDO_NA_FILA')
        .order('data_inicio', { ascending: true });

      if (error) {
        console.error('Erro ao buscar fila de atendimentos:', error);
        toast.error('Erro ao carregar fila de atendimentos');
        return;
      }

      const atendimentosMapeados: Atendimento[] = atendimentosData.map(atendimento => ({
        atendimento_id: atendimento.atendimento_id,
        tutor_id: atendimento.tutor_id,
        pet_id: atendimento.pet_id,
        data_inicio: atendimento.data_inicio,
        status: atendimento.status as 'Em andamento' | 'Sugestão enviada' | 'Finalizado',
        status_atendimento: atendimento.status_atendimento as 'BOT_ATIVO' | 'AGUARDANDO_NA_FILA' | 'ATRIBUIDO_HUMANO' | 'FINALIZADO',
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

      setAtendimentosFila(atendimentosMapeados);
    } catch (error) {
      console.error('Erro inesperado ao carregar fila:', error);
      toast.error('Erro inesperado ao carregar fila');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimAtendimento = async (atendimentoId: number) => {
    if (!user || !userProfile) {
      toast.error('Usuário não autenticado');
      return;
    }

    // Verificar se o usuário é atendente
    if (userProfile.role !== 'atendente') {
      toast.error('Apenas atendentes podem pegar atendimentos');
      return;
    }

    try {
      setClaimingIds(prev => new Set(prev).add(atendimentoId));

      // Buscar dados do atendente logado
      const { data: atendenteData, error: atendenteError } = await supabase
        .from('atendentes')
        .select('atendente_id')
        .eq('user_id', user.id)
        .single();

      if (atendenteError) {
        console.error('Erro ao buscar dados do atendente:', atendenteError);
        toast.error('Erro ao identificar atendente');
        return;
      }

      // Verificar se o atendimento ainda está na fila e reivindicá-lo atomicamente
      const { data: atendimentoAtualizado, error: updateError } = await supabase
        .from('atendimentos')
        .update({
          status_atendimento: 'ATRIBUIDO_HUMANO',
          atendente_responsavel_id: atendenteData.atendente_id
        })
        .eq('atendimento_id', atendimentoId)
        .eq('status_atendimento', 'AGUARDANDO_NA_FILA') // Condição para evitar conflitos
        .select()
        .single();

      if (updateError) {
        if (updateError.code === 'PGRST116') {
          // Nenhuma linha foi afetada - atendimento já foi pego
          toast.error('Este atendimento já foi reivindicado por outro atendente!');
        } else {
          console.error('Erro ao reivindicar atendimento:', updateError);
          toast.error('Erro ao reivindicar atendimento');
        }
        return;
      }

      if (!atendimentoAtualizado) {
        toast.error('Este atendimento já foi reivindicado por outro atendente!');
        return;
      }

      toast.success('Atendimento reivindicado com sucesso!');
      
      // Remover o atendimento da fila local
      setAtendimentosFila(prev => 
        prev.filter(a => a.atendimento_id !== atendimentoId)
      );

    } catch (error) {
      console.error('Erro inesperado ao reivindicar:', error);
      toast.error('Erro inesperado ao reivindicar atendimento');
    } finally {
      setClaimingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(atendimentoId);
        return newSet;
      });
    }
  };

  const formatTempoEspera = (dataInicio: string) => {
    const inicio = new Date(dataInicio);
    const agora = new Date();
    const diffMs = agora.getTime() - inicio.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes}min`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      return `${hours}h ${diffMinutes % 60}min`;
    }
  };

  const getTipoAtendimentoBadge = (tipo: string) => {
    const colors = {
      'Imediato': 'bg-red-100 text-red-800 border-red-200',
      'Preventivo': 'bg-blue-100 text-blue-800 border-blue-200'
    } as const;
    
    return (
      <Badge className={`${colors[tipo as keyof typeof colors] || 'bg-gray-100 text-gray-800'} text-xs px-2 py-1`}>
        {tipo}
      </Badge>
    );
  };

  useEffect(() => {
    fetchFilaAtendimentos();

    // Configurar realtime para atualizar a fila automaticamente
    const channel = supabase
      .channel('fila-atendimentos')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'atendimentos'
        },
        (payload) => {
          console.log('Mudança na tabela atendimentos:', payload);
          fetchFilaAtendimentos(); // Recarregar a fila quando houver mudanças
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-20 bg-gray-200 rounded"></div>
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
            Fila de Atendimentos
          </h1>
          <p className="text-sm lg:text-base text-gray-600">
            Atendimentos aguardando para serem atribuídos a um atendente
          </p>
        </div>
        <Button onClick={fetchFilaAtendimentos} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Card de Resumo */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Atendimentos na Fila
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {atendimentosFila.length}
          </div>
          <p className="text-xs text-muted-foreground">
            Aguardando atribuição
          </p>
        </CardContent>
      </Card>

      {/* Lista da Fila */}
      {atendimentosFila.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Fila Vazia
            </h3>
            <p className="text-gray-600">
              Não há atendimentos aguardando na fila no momento.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {atendimentosFila.map((atendimento) => (
            <Card key={atendimento.atendimento_id} className="border-l-4 border-orange-500 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Header com nome e tempo de espera */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-orange-600 flex-shrink-0" />
                      <span className="font-semibold text-gray-900 text-sm lg:text-base">
                        {atendimento.tutor?.nome_tutor}
                      </span>
                      {atendimento.pet?.nome_pet && (
                        <span className="text-gray-500 text-xs lg:text-sm">
                          (Pet: {atendimento.pet.nome_pet})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {getTipoAtendimentoBadge(atendimento.tipo_atendimento)}
                      <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs px-2 py-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTempoEspera(atendimento.data_inicio)}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Informações de contato */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs lg:text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
                      <span className="truncate">{atendimento.tutor?.id_whatsapp}</span>
                    </div>
                    {atendimento.pet && (
                      <div className="flex items-center space-x-2">
                        <Heart className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0 text-red-500" />
                        <span className="truncate">
                          {atendimento.pet.nome_pet} ({atendimento.pet.idade_pet} anos)
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Ação de reivindicar */}
                  <div className="pt-2 border-t border-gray-100">
                    <Button 
                      onClick={() => handleClaimAtendimento(atendimento.atendimento_id)}
                      disabled={claimingIds.has(atendimento.atendimento_id)}
                      className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white text-xs lg:text-sm"
                    >
                      <Grab className="w-3 h-3 lg:w-4 lg:h-4 mr-2" />
                      {claimingIds.has(atendimento.atendimento_id) ? 'Reivindicando...' : 'Pegar Atendimento'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Alert informativo */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Os atendimentos aparecem aqui quando o bot finaliza a conversa e necessitam de intervenção humana. 
          Clique em "Pegar Atendimento" para assumir a responsabilidade por um atendimento.
        </AlertDescription>
      </Alert>
    </div>
  );
};
