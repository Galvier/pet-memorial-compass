
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface InsightsPanelProps {
  insights: {
    recomendacoes: string[];
    melhorAtendente: string;
    picoAtendimento: string;
    produtoDestaque: string;
  };
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({ insights }) => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
      {/* Insights Principais */}
      <Card className="bg-white border-gray-200 hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg lg:text-xl text-purple-primary flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Insights Principais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-green-800">Melhor Performance</p>
              <p className="text-sm text-green-700">
                {insights.melhorAtendente} está liderando em conversões
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-800">Pico de Atividade</p>
              <p className="text-sm text-blue-700">
                {insights.picoAtendimento} é o dia com mais atendimentos
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <TrendingUp className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-purple-800">Produto Destaque</p>
              <p className="text-sm text-purple-700">
                {insights.produtoDestaque} tem alta demanda
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recomendações */}
      <Card className="bg-white border-gray-200 hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg lg:text-xl text-purple-primary flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Recomendações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.recomendacoes.map((recomendacao, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-purple-primary/5 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-purple-primary text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <p className="text-sm text-gray-700">{recomendacao}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
