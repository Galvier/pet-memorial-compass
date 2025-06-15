
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Clock, Star, Target } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  description?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  trend = 'neutral', 
  icon, 
  description 
}) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4" />;
      case 'down': return <TrendingDown className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <Card className="bg-white hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl lg:text-3xl font-bold text-purple-primary mb-1">
          {value}
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-xs ${getTrendColor()}`}>
            {getTrendIcon()}
            <span>{change}</span>
          </div>
        )}
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

interface AdvancedMetricsProps {
  analytics: {
    summary: {
      tempoMedioAtendimento: string;
      satisfacaoCliente: string;
      atendimentosEmAndamento: number;
    };
    insights: {
      melhorAtendente: string;
      picoAtendimento: string;
      produtoDestaque: string;
    };
  };
}

export const AdvancedMetrics: React.FC<AdvancedMetricsProps> = ({ analytics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      <MetricCard
        title="Tempo Médio de Atendimento"
        value={analytics.summary.tempoMedioAtendimento}
        change="-15% vs mês anterior"
        trend="up"
        icon={<Clock className="h-4 w-4 lg:h-5 lg:w-5 text-blue-500" />}
        description="Eficiência melhorou"
      />

      <MetricCard
        title="Satisfação do Cliente"
        value={analytics.summary.satisfacaoCliente}
        change="+0.3 este mês"
        trend="up"
        icon={<Star className="h-4 w-4 lg:h-5 lg:w-5 text-yellow-500" />}
        description="Baseado em avaliações"
      />

      <MetricCard
        title="Atendimentos em Andamento"
        value={analytics.summary.atendimentosEmAndamento}
        icon={<Target className="h-4 w-4 lg:h-5 lg:w-5 text-orange-500" />}
        description="Aguardando conclusão"
      />

      <MetricCard
        title="Melhor Atendente"
        value={analytics.insights.melhorAtendente}
        icon={<TrendingUp className="h-4 w-4 lg:h-5 lg:w-5 text-green-500" />}
        description="Maior taxa de conversão"
      />
    </div>
  );
};
