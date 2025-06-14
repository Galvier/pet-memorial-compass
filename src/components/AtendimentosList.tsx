
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { History, Eye, User, Phone } from 'lucide-react';
import { PetMemorialAPI } from '@/lib/api';
import { Atendimento } from '@/types';

export const AtendimentosList: React.FC = () => {
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAtendimentos = async () => {
      try {
        const data = await PetMemorialAPI.getAtendimentos();
        setAtendimentos(data);
      } catch (error) {
        console.error('Erro ao carregar atendimentos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAtendimentos();
  }, []);

  const getStatusBadge = (status: string) => {
    const variants = {
      'Em andamento': 'default',
      'Sugestão enviada': 'secondary',
      'Finalizado': 'outline'
    } as const;
    
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
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Atendimentos</h1>
        <p className="text-gray-600">Histórico completo de atendimentos realizados</p>
      </div>

      <div className="space-y-4">
        {atendimentos.map((atendimento) => (
          <Card key={atendimento.atendimento_id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold text-gray-900">
                        {atendimento.tutor?.nome_tutor}
                      </span>
                    </div>
                    {getStatusBadge(atendimento.status)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>{atendimento.tutor?.id_whatsapp}</span>
                    </div>
                    <div>
                      <strong>Profissão:</strong> {atendimento.tutor?.profissao}
                    </div>
                    <div>
                      <strong>Data:</strong> {formatDate(atendimento.data_inicio)}
                    </div>
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-600">
                    <strong>Endereço:</strong> {atendimento.tutor?.endereco}
                  </div>
                </div>
                
                <div className="ml-4">
                  <Link to={`/atendimentos/${atendimento.atendimento_id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalhes
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {atendimentos.length === 0 && (
        <div className="text-center py-12">
          <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            Nenhum atendimento registrado
          </h3>
          <p className="text-gray-500">
            Os atendimentos aparecerão aqui conforme forem realizados via WhatsApp.
          </p>
        </div>
      )}
    </div>
  );
};
