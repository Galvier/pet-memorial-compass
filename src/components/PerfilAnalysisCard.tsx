
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, 
  User, 
  TrendingUp, 
  Building, 
  Home,
  Info
} from 'lucide-react';

interface LocationAnalysis {
  address: string;
  score: number;
  scoreReason: string;
  coordinates: { lat: number; lng: number } | null;
  municipioData: { nome: string; uf: string } | null;
  incomeData: { averageIncome: number; dataYear: number } | null;
  success: boolean;
  fallbackUsed: boolean;
  // Novos campos para Montes Claros
  isMontesClaros?: boolean;
  bairroDetected?: string;
  updateFactor?: number;
  breakdown?: {
    baseScore: number;
    realEstateFactor: number;
    businessFactor: number;
    finalScore: number;
  };
  realEstateData?: {
    avgPriceSqm: number;
    multiplier: number;
  };
  businessData?: {
    category: string;
    multiplier: number;
  };
}

interface PerfilAnalysisCardProps {
  profissao?: string;
  endereco?: string;
  locationAnalysis?: LocationAnalysis;
  isLoading?: boolean;
}

export const PerfilAnalysisCard: React.FC<PerfilAnalysisCardProps> = ({
  profissao,
  endereco,
  locationAnalysis,
  isLoading = false
}) => {
  // Cálculo da pontuação da profissão
  const getProfissaoScore = (prof?: string): number => {
    if (!prof) return 0;
    
    const profissaoLower = prof.toLowerCase();
    
    // Profissões de alto valor
    if (profissaoLower.includes('médico') || profissaoLower.includes('medico') ||
        profissaoLower.includes('advogado') || profissaoLower.includes('dentista') ||
        profissaoLower.includes('engenheiro') || profissaoLower.includes('veterinário') ||
        profissaoLower.includes('veterinario')) {
      return 50;
    }
    
    // Profissões de valor médio-alto
    if (profissaoLower.includes('professor') || profissaoLower.includes('contador') ||
        profissaoLower.includes('farmacêutico') || profissaoLower.includes('farmaceutico') ||
        profissaoLower.includes('psicólogo') || profissaoLower.includes('psicologo')) {
      return 35;
    }
    
    // Profissões de valor médio
    if (profissaoLower.includes('técnico') || profissaoLower.includes('tecnico') ||
        profissaoLower.includes('analista') || profissaoLower.includes('coordenador') ||
        profissaoLower.includes('supervisor')) {
      return 25;
    }
    
    // Outras profissões
    return 15;
  };

  const profissaoScore = getProfissaoScore(profissao);
  const locationScore = locationAnalysis?.score || 0;
  const totalScore = profissaoScore + locationScore;

  // Determinar categoria do perfil
  const getPerfilCategory = (score: number) => {
    if (score >= 80) return { label: 'Luxo', color: 'bg-purple-500', variant: 'default' as const };
    if (score >= 60) return { label: 'Premium', color: 'bg-blue-500', variant: 'default' as const };
    if (score >= 40) return { label: 'Intermediário', color: 'bg-green-500', variant: 'secondary' as const };
    return { label: 'Padrão', color: 'bg-gray-500', variant: 'outline' as const };
  };

  const perfil = getPerfilCategory(totalScore);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Análise de Perfil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
            <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Análise de Perfil
          </div>
          <Badge variant={perfil.variant} className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${perfil.color}`} />
            {perfil.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pontuação Total */}
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">{totalScore}</div>
          <div className="text-sm text-muted-foreground">Pontuação Total</div>
          <Progress value={Math.min(totalScore, 100)} className="mt-2" />
        </div>

        {/* Breakdown da Pontuação */}
        <div className="space-y-3">
          {/* Profissão */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Profissão</span>
            </div>
            <div className="text-right">
              <div className="font-bold">+{profissaoScore} pontos</div>
              <div className="text-xs text-muted-foreground">{profissao || 'Não informado'}</div>
            </div>
          </div>

          {/* Localização */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Localização</span>
              {locationAnalysis?.isMontesClaros && (
                <Badge variant="outline" className="text-xs">Montes Claros</Badge>
              )}
            </div>
            <div className="text-right">
              <div className="font-bold">+{locationScore} pontos</div>
              <div className="text-xs text-muted-foreground">
                {locationAnalysis?.municipioData?.nome || endereco || 'Não informado'}
              </div>
            </div>
          </div>

          {/* Breakdown Detalhado para Montes Claros */}
          {locationAnalysis?.isMontesClaros && locationAnalysis.breakdown && (
            <div className="space-y-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Análise Detalhada</span>
              </div>
              
              {locationAnalysis.bairroDetected && (
                <div className="flex justify-between text-xs">
                  <span>Bairro:</span>
                  <span className="font-medium">{locationAnalysis.bairroDetected}</span>
                </div>
              )}
              
              <div className="flex justify-between text-xs">
                <span>Base IBGE:</span>
                <span>{locationAnalysis.breakdown.baseScore} pontos</span>
              </div>
              
              {locationAnalysis.updateFactor && (
                <div className="flex justify-between text-xs">
                  <span>Fator de Atualização:</span>
                  <span className="font-medium text-blue-700">{locationAnalysis.updateFactor}x</span>
                </div>
              )}
              
              {locationAnalysis.realEstateData && (
                <div className="flex justify-between text-xs">
                  <span className="flex items-center gap-1">
                    <Home className="h-3 w-3" />
                    Imobiliário:
                  </span>
                  <span>{locationAnalysis.realEstateData.multiplier}x (R$ {locationAnalysis.realEstateData.avgPriceSqm.toFixed(0)}/m²)</span>
                </div>
              )}
              
              {locationAnalysis.businessData && (
                <div className="flex justify-between text-xs">
                  <span className="flex items-center gap-1">
                    <Building className="h-3 w-3" />
                    Comercial:
                  </span>
                  <span>{locationAnalysis.businessData.multiplier}x ({locationAnalysis.businessData.category})</span>
                </div>
              )}
            </div>
          )}

          {/* Status da Análise */}
          {locationAnalysis && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Status:
              </span>
              <span className={locationAnalysis.success ? 'text-green-600' : 'text-yellow-600'}>
                {locationAnalysis.success ? 'Dados atuais' : 'Dados estimados'}
                {locationAnalysis.fallbackUsed && ' (cache)'}
              </span>
            </div>
          )}
        </div>

        {/* Recomendações */}
        <div className="pt-3 border-t">
          <div className="text-sm font-medium mb-2">Recomendações:</div>
          <div className="text-xs text-muted-foreground space-y-1">
            {totalScore >= 80 && (
              <div>• Perfil premium - ideal para serviços de alto valor</div>
            )}
            {totalScore >= 60 && totalScore < 80 && (
              <div>• Perfil qualificado - boa capacidade de investimento</div>
            )}
            {totalScore >= 40 && totalScore < 60 && (
              <div>• Perfil intermediário - foco em valor e qualidade</div>
            )}
            {totalScore < 40 && (
              <div>• Perfil padrão - priorizar custo-benefício</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
