
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Phone, MapPin, Calendar, Package } from 'lucide-react';
import { PetMemorialAPI } from '@/lib/api';
import { Atendimento } from '@/types';

export const AtendimentoDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [atendimento, setAtendimento] = useState<Atendimento | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAtendimento = async () => {
      if (!id) return;
      
      try {
        const data = await PetMemorialAPI.getAtendimento(parseInt(id));
        setAtendimento(data);
      } catch (error) {
        console.error('Erro ao carregar atendimento:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAtendimento();
  }, [id]);

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-1">
                {getStatusBadge(atendimento.status)}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Dados Coletados</label>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(atendimento.dados_coletados, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
                    {sugestao.nome_produto}
                  </h3>
                  {sugestao.descricao && (
                    <p className="text-sm text-gray-600 mb-3">
                      {sugestao.descricao}
                    </p>
                  )}
                  <div className="text-lg font-bold text-green-600">
                    {formatPrice(sugestao.preco)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
