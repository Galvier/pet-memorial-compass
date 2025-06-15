
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { Atendimento } from '@/types';

interface AtendimentoInfoProps {
  atendimento: Atendimento;
}

export const AtendimentoInfo: React.FC<AtendimentoInfoProps> = ({ atendimento }) => {
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

  return (
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
  );
};
