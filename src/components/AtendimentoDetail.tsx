
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { PetMemorialAPI } from '@/lib/api';
import { Atendimento, Atendente } from '@/types';
import { GerarPagamento } from '@/components/GerarPagamento';
import { PetInfo } from '@/components/PetInfo';
import { TutorInfo } from '@/components/TutorInfo';
import { AtendimentoInfo } from '@/components/AtendimentoInfo';
import { AtendimentoAssignment } from '@/components/AtendimentoAssignment';
import { DadosColetados } from '@/components/DadosColetados';
import { ProdutosSugeridos } from '@/components/ProdutosSugeridos';

export const AtendimentoDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [atendimento, setAtendimento] = useState<Atendimento | null>(null);
  const [atendentesOnline, setAtendentesOnline] = useState<Atendente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        const [atendimentoData, atendentesData] = await Promise.all([
          PetMemorialAPI.getAtendimento(parseInt(id)),
          PetMemorialAPI.getAtendentesOnline()
        ]);
        
        setAtendimento(atendimentoData);
        setAtendentesOnline(atendentesData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
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

      {/* Seção de atribuir atendimento */}
      {podeAtribuirAtendimento && (
        <AtendimentoAssignment
          atendimentoId={atendimento.atendimento_id}
          atendentesOnline={atendentesOnline}
          onAssignmentComplete={handleAssignmentComplete}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PetInfo pet={atendimento.pet} />
        <TutorInfo tutor={atendimento.tutor} />
        <AtendimentoInfo atendimento={atendimento} />
      </div>

      {/* Seção de Pagamento */}
      {foiAtribuido && atendimento.tutor?.id_whatsapp && (
        <GerarPagamento
          atendimentoId={atendimento.atendimento_id}
          tutorWhatsapp={atendimento.tutor.id_whatsapp}
          sugestoesGeradas={atendimento.sugestoes_geradas}
        />
      )}

      <DadosColetados dadosColetados={atendimento.dados_coletados} />
      <ProdutosSugeridos sugestoesGeradas={atendimento.sugestoes_geradas} />
    </div>
  );
};
