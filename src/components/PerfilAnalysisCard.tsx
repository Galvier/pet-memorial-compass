
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart3, MapPin, Briefcase, Info } from 'lucide-react';
import { PerfilAnalysis } from '@/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PerfilAnalysisCardProps {
  perfilAnalysis: PerfilAnalysis;
  className?: string;
}

export const PerfilAnalysisCard: React.FC<PerfilAnalysisCardProps> = ({ 
  perfilAnalysis, 
  className = '' 
}) => {
  const getPerfilColor = (perfil: string) => {
    switch (perfil) {
      case 'Luxo': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Intermediário': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Padrão': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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

  const maxScore = 100;
  const profissaoPercent = (perfilAnalysis.profissionScore / 50) * 100; // Max 50 pontos
  const localizacaoPercent = (perfilAnalysis.localizacaoScore / 50) * 100; // Max 50 pontos
  const totalPercent = (perfilAnalysis.totalScore / maxScore) * 100;

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Análise de Perfil</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Análise automática baseada em:</p>
                  <p>• Profissão declarada</p>
                  <p>• Dados socioeconômicos do IBGE</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              Análise Automática IBGE
            </Badge>
            <Badge className={getPerfilColor(perfilAnalysis.perfilCalculado)}>
              {perfilAnalysis.perfilCalculado}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pontuação Total */}
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-3xl font-bold text-gray-800">
            {perfilAnalysis.totalScore}
            <span className="text-lg text-gray-500">/100</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">Pontuação Total</p>
          <Progress value={totalPercent} className="mt-2" />
        </div>

        {/* Breakdown por Componente */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Profissão */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Briefcase className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-gray-700">Profissão</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Pontuação</span>
                <span className="font-semibold">{perfilAnalysis.profissionScore}/50</span>
              </div>
              <Progress value={profissaoPercent} className="h-2" />
              <p className="text-xs text-gray-500">{perfilAnalysis.profissionReason}</p>
            </div>
          </div>

          {/* Localização */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-green-600" />
              <span className="font-medium text-gray-700">Localização</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Pontuação</span>
                <span className="font-semibold">{perfilAnalysis.localizacaoScore}/50</span>
              </div>
              <Progress value={localizacaoPercent} className="h-2" />
              <p className="text-xs text-gray-500">{perfilAnalysis.localizacaoAnalysis.scoreReason}</p>
            </div>
          </div>
        </div>

        {/* Detalhes da Localização IBGE */}
        {perfilAnalysis.localizacaoAnalysis.success && perfilAnalysis.localizacaoAnalysis.sectorData && (
          <div className="bg-blue-50 p-4 rounded-lg space-y-2">
            <h4 className="font-medium text-blue-900 flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>Dados IBGE</span>
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700 font-medium">Município:</span>
                <p className="text-blue-800">{perfilAnalysis.localizacaoAnalysis.sectorData.municipio}</p>
              </div>
              <div>
                <span className="text-blue-700 font-medium">UF:</span>
                <p className="text-blue-800">{perfilAnalysis.localizacaoAnalysis.sectorData.uf}</p>
              </div>
              {perfilAnalysis.localizacaoAnalysis.incomeData && (
                <>
                  <div>
                    <span className="text-blue-700 font-medium">Renda Média:</span>
                    <p className="text-blue-800">
                      R$ {perfilAnalysis.localizacaoAnalysis.incomeData.averageIncome.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2
                      })}
                    </p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Ano:</span>
                    <p className="text-blue-800">{perfilAnalysis.localizacaoAnalysis.incomeData.dataYear}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Timestamp da Análise */}
        <div className="text-xs text-gray-500 text-center pt-2 border-t">
          Análise realizada em {formatDate(perfilAnalysis.calculationDate)}
        </div>
      </CardContent>
    </Card>
  );
};
