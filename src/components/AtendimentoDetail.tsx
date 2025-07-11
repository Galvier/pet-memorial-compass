
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Atendimento, Atendente } from '@/types';
import { GerarPagamento } from '@/components/GerarPagamento';
import { PetInfo } from '@/components/PetInfo';
import { TutorInfo } from '@/components/TutorInfo';
import { AtendimentoInfo } from '@/components/AtendimentoInfo';
import { AtendimentoAssignment } from '@/components/AtendimentoAssignment';
import { DadosColetados } from '@/components/DadosColetados';
import { ProdutosSugeridos } from '@/components/ProdutosSugeridos';
import { mockAtendimentos, mockAtendentes } from '@/lib/mockData';

export const AtendimentoDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [atendimento, setAtendimento] = useState<Atendimento | null>(null);
  const [atendentesOnline, setAtendentesOnline] = useState<Atendente[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        console.log('🔄 Carregando atendimento:', id);
        
        // Buscar atendimento específico
        const { data: atendimentoData, error: atendimentoError } = await supabase
          .from('atendimentos')
          .select('*')
          .eq('atendimento_id', parseInt(id))
          .single();

        if (atendimentoError) {
          console.log('📋 Atendimento não encontrado no Supabase, usando dados mockados...');
          // Buscar nos dados mockados
          const mockAtendimento = mockAtendimentos.find(a => a.atendimento_id === parseInt(id));
          if (mockAtendimento) {
            setAtendimento(mockAtendimento);
            setAtendentesOnline(mockAtendentes.filter(a => a.status_disponibilidade === 'Online'));
            setUsingMockData(true);
            return;
          }
          throw atendimentoError;
        }

        // Buscar dados relacionados se o atendimento existir
        let tutorData = null;
        let petData = null;
        let atendenteData = null;

        if (atendimentoData) {
          // Buscar tutor
          if (atendimentoData.tutor_id) {
            const { data: tutor } = await supabase
              .from('tutores')
              .select('*')
              .eq('tutor_id', atendimentoData.tutor_id)
              .single();
            tutorData = tutor;
          }

          // Buscar pet
          if (atendimentoData.pet_id) {
            const { data: pet } = await supabase
              .from('pets')
              .select('*')
              .eq('pet_id', atendimentoData.pet_id)
              .single();
            petData = pet;
          }

          // Buscar atendente responsável
          if (atendimentoData.atendente_responsavel_id) {
            const { data: atendente } = await supabase
              .from('atendentes')
              .select('*')
              .eq('atendente_id', atendimentoData.atendente_responsavel_id)
              .single();
            atendenteData = atendente;
          }
        }

        // Buscar atendentes online
        const { data: atendentesData } = await supabase
          .from('atendentes')
          .select('*')
          .eq('status_disponibilidade', 'Online');

        const atendimentoCompleto: Atendimento = {
          ...atendimentoData,
          status: atendimentoData.status as 'Em andamento' | 'Sugestão enviada' | 'Finalizado',
          status_atendimento: atendimentoData.status_atendimento as 'BOT_ATIVO' | 'AGUARDANDO_NA_FILA' | 'ATRIBUIDO_HUMANO' | 'FINALIZADO',
          tipo_atendimento: atendimentoData.tipo_atendimento as 'Imediato' | 'Preventivo',
          tutor: tutorData ? {
            ...tutorData,
            perfil_calculado: tutorData.perfil_calculado as 'Padrão' | 'Intermediário' | 'Luxo'
          } : undefined,
          pet: petData,
          atendente: atendenteData ? {
            ...atendenteData,
            status_disponibilidade: atendenteData.status_disponibilidade as 'Online' | 'Offline'
          } : undefined
        };

        const atendentesOnlineTyped: Atendente[] = (atendentesData || []).map(atendente => ({
          ...atendente,
          status_disponibilidade: atendente.status_disponibilidade as 'Online' | 'Offline'
        }));

        console.log('✅ Atendimento carregado:', atendimentoCompleto);
        setAtendimento(atendimentoCompleto);
        setAtendentesOnline(atendentesOnlineTyped);
        setUsingMockData(false);
      } catch (error) {
        console.error('❌ Erro ao carregar dados, tentando dados mockados:', error);
        // Tentar buscar nos dados mockados como fallback final
        const mockAtendimento = mockAtendimentos.find(a => a.atendimento_id === parseInt(id));
        if (mockAtendimento) {
          setAtendimento(mockAtendimento);
          setAtendentesOnline(mockAtendentes.filter(a => a.status_disponibilidade === 'Online'));
          setUsingMockData(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleAssignmentComplete = (atendenteId: number, atendenteData: Atendente) => {
    setAtendimento(prev => prev ? {
      ...prev,
      status_atendimento: 'ATRIBUIDO_HUMANO',
      atendente_responsavel_id: atendenteId,
      atendente: atendenteData
    } : null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-40 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!atendimento) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-600 mb-4">
          Atendimento não encontrado
        </h2>
        <Link to="/atendimentos">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos Atendimentos
          </Button>
        </Link>
      </div>
    );
  }

  const podeAtribuirAtendimento = atendimento.status_atendimento === 'BOT_ATIVO';
  const foiAtribuido = atendimento.status_atendimento === 'ATRIBUIDO_HUMANO';

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/atendimentos">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Atendimento #{atendimento.atendimento_id}
          </h1>
          <p className="text-gray-600">Detalhes completos do atendimento</p>
        </div>
      </div>

      {/* Alerta quando estiver usando dados mockados */}
      {usingMockData && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-blue-800">
              <Info className="w-5 h-5" />
              <div>
                <p className="font-semibold">Dados de Demonstração</p>
                <p className="text-sm">
                  Este atendimento é um exemplo para demonstração da interface. Os dados reais aparecerão quando conectados ao sistema.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerta de controle do atendimento */}
      {foiAtribuido && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-orange-800">
              <AlertCircle className="w-5 h-5" />
              <div>
                <p className="font-semibold">
                  Atendimento atribuído para {atendimento.atendente?.nome_atendente}
                </p>
                <p className="text-sm">
                  O bot foi pausado e o atendente foi notificado para assumir a conversa.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seção de atribuir atendimento - desabilitada para dados mockados */}
      {podeAtribuirAtendimento && !usingMockData && (
        <AtendimentoAssignment
          atendimentoId={atendimento.atendimento_id}
          atendentesOnline={atendentesOnline}
          onAssignmentComplete={handleAssignmentComplete}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {atendimento.pet && <PetInfo pet={atendimento.pet} />}
          <AtendimentoInfo atendimento={atendimento} />
        </div>
        <div className="space-y-6">
          {atendimento.tutor && <TutorInfo tutor={atendimento.tutor} />}
        </div>
      </div>

      {/* Seção de Pagamento - desabilitada para dados mockados */}
      {foiAtribuido && atendimento.tutor?.id_whatsapp && !usingMockData && (
        <GerarPagamento
          atendimentoId={atendimento.atendimento_id}
          tutorWhatsapp={atendimento.tutor.id_whatsapp}
          sugestoesGeradas={atendimento.sugestoes_geradas}
        />
      )}

      {atendimento.dados_coletados && <DadosColetados dadosColetados={atendimento.dados_coletados} />}
      {atendimento.sugestoes_geradas && <ProdutosSugeridos sugestoesGeradas={atendimento.sugestoes_geradas} />}
    </div>
  );
};
