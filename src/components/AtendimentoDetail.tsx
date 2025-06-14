import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, User, Phone, MapPin, Calendar, Package, Heart, UserCheck, AlertCircle } from 'lucide-react';
import { PetMemorialAPI } from '@/lib/api';
import { Atendimento, Atendente } from '@/types';
import { simulateAtendimentoAPI } from '@/api/atendimento';

export const AtendimentoDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [atendimento, setAtendimento] = useState<Atendimento | null>(null);
  const [atendentesOnline, setAtendentesOnline] = useState<Atendente[]>([]);
  const [selectedAtendente, setSelectedAtendente] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [atribuindo, setAtribuindo] = useState(false);

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

  const handleAtribuirAtendimento = async () => {
    if (!atendimento || !selectedAtendente) return;

    setAtribuindo(true);
    try {
      await simulateAtendimentoAPI.atribuir(atendimento.atendimento_id, {
        atendente_id: parseInt(selectedAtendente)
      });
      
      // Atualizar o estado local
      const atendenteData = atendentesOnline.find(a => a.atendente_id === parseInt(selectedAtendente));
      setAtendimento(prev => prev ? {
        ...prev,
        status_atendimento: 'ATRIBUIDO_HUMANO',
        atendente_responsavel_id: parseInt(selectedAtendente),
        atendente: atendenteData
      } : null);
      
      console.log('Atendimento atribuído com sucesso!');
    } catch (error) {
      console.error('Erro ao atribuir atendimento:', error);
    } finally {
      setAtribuindo(false);
    }
  };

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

  const getStatusAtendimentoBadge = (statusAtendimento: string) => {
    const colors = {
      'BOT_ATIVO': 'bg-blue-100 text-blue-800',
      'ATRIBUIDO_HUMANO': 'bg-orange-100 text-orange-800',
      'FINALIZADO': 'bg-green-100 text-green-800'
    } as const;

    const labels = {
      'BOT_ATIVO': 'Bot Ativo',
      'ATRIBUIDO_HUMANO': 'Atribuído para Atendente',
      'FINALIZADO': 'Finalizado'
    } as const;
    
    return (
      <Badge className={colors[statusAtendimento as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {labels[statusAtendimento as keyof typeof labels] || statusAtendimento}
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

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numPrice);
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
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-blue-900">Atribuir para Atendente</h3>
                <p className="text-sm text-blue-700">
                  Selecione um atendente online para assumir este atendimento.
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <Select value={selectedAtendente} onValueChange={setSelectedAtendente}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Selecione um atendente..." />
                    </SelectTrigger>
                    <SelectContent>
                      {atendentesOnline.map((atendente) => (
                        <SelectItem 
                          key={atendente.atendente_id} 
                          value={atendente.atendente_id.toString()}
                        >
                          {atendente.nome_atendente}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={handleAtribuirAtendimento}
                  disabled={!selectedAtendente || atribuindo}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {atribuindo ? (
                    'Atribuindo...'
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4 mr-2" />
                      Atribuir e Notificar
                    </>
                  )}
                </Button>
              </div>

              {atendentesOnline.length === 0 && (
                <p className="text-sm text-blue-600">
                  Nenhum atendente online disponível no momento.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações do Pet */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-purple-primary">
              <Heart className="w-5 h-5" />
              <span>Dados do Pet</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Nome do Pet</label>
              <p className="text-lg font-semibold text-purple-primary">
                {atendimento.pet?.nome_pet || 'Não informado'}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Idade</label>
              <p className="text-base">
                {atendimento.pet?.idade_pet ? `${atendimento.pet.idade_pet} anos` : 'Não informado'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Dados do Tutor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Dados do Tutor</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Nome</label>
              <p className="text-lg font-semibold">{atendimento.tutor?.nome_tutor}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">WhatsApp</label>
              <div className="flex items-center space-x-2 mt-1">
                <Phone className="w-4 h-4 text-gray-400" />
                <p>{atendimento.tutor?.id_whatsapp}</p>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Profissão</label>
              <p>{atendimento.tutor?.profissao}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Endereço</label>
              <div className="flex items-start space-x-2 mt-1">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                <p className="text-sm">{atendimento.tutor?.endereco}</p>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Perfil Calculado</label>
              <div className="mt-1">
                <Badge variant="outline">{atendimento.tutor?.perfil_calculado}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações do Atendimento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Informações do Atendimento</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Data de Início</label>
              <p>{formatDate(atendimento.data_inicio)}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Tipo</label>
              <p>{atendimento.tipo_atendimento}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-1">
                {getStatusBadge(atendimento.status)}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Controle do Atendimento</label>
              <div className="mt-1">
                {getStatusAtendimentoBadge(atendimento.status_atendimento)}
              </div>
            </div>

            {atendimento.atendente && (
              <div>
                <label className="text-sm font-medium text-gray-500">Atendente Responsável</label>
                <p className="font-medium text-purple-primary">{atendimento.atendente.nome_atendente}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dados Coletados */}
      <Card>
        <CardHeader>
          <CardTitle>Dados Coletados Detalhados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-gray-50 rounded-lg">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {JSON.stringify(atendimento.dados_coletados, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Produtos Sugeridos */}
      {atendimento.sugestoes_geradas && atendimento.sugestoes_geradas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5" />
              <span>Produtos Sugeridos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {atendimento.sugestoes_geradas.map((sugestao: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {sugestao.nome}
                  </h3>
                  {sugestao.descricao && (
                    <p className="text-sm text-gray-600 mb-3">
                      {sugestao.descricao}
                    </p>
                  )}
                  {sugestao.preco && (
                    <div className="text-lg font-bold text-green-600">
                      {formatPrice(sugestao.preco)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
