
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  User, 
  MapPin, 
  TrendingUp, 
  Target,
  Lightbulb,
  Package
} from 'lucide-react';
import { PerfilAnalysisCard } from './PerfilAnalysisCard';

interface RealTimeProfileAnalysisProps {
  clienteData?: {
    profissao?: string;
    endereco?: string;
    nome?: string;
  };
  onRecommendationSelect?: (recommendation: string) => void;
}

export const RealTimeProfileAnalysis: React.FC<RealTimeProfileAnalysisProps> = ({
  clienteData,
  onRecommendationSelect
}) => {
  const [profileScore, setProfileScore] = useState(0);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    if (clienteData?.profissao || clienteData?.endereco) {
      // Simular análise em tempo real
      const calculateScore = () => {
        let score = 0;
        
        if (clienteData.profissao) {
          const prof = clienteData.profissao.toLowerCase();
          if (prof.includes('médico') || prof.includes('advogado')) score += 50;
          else if (prof.includes('professor') || prof.includes('contador')) score += 35;
          else score += 15;
        }
        
        if (clienteData.endereco) {
          // Simulação baseada em palavras-chave do endereço
          const addr = clienteData.endereco.toLowerCase();
          if (addr.includes('centro') || addr.includes('jardim')) score += 40;
          else if (addr.includes('bairro') || addr.includes('vila')) score += 25;
          else score += 15;
        }
        
        setProfileScore(score);
        
        // Gerar recomendações baseadas no score
        if (score >= 70) {
          setRecommendations([
            'Plano Premium - Atendimento VIP',
            'Pacote Completo de Saúde',
            'Serviços Especializados'
          ]);
        } else if (score >= 40) {
          setRecommendations([
            'Plano Intermediário',
            'Consulta + Exames Básicos',
            'Pacote Prevenção'
          ]);
        } else {
          setRecommendations([
            'Plano Básico',
            'Consulta Simples',
            'Atendimento Emergencial'
          ]);
        }
      };
      
      calculateScore();
    }
  }, [clienteData]);

  if (!clienteData?.profissao && !clienteData?.endereco) {
    return (
      <Card className="border-dashed border-2 border-muted">
        <CardContent className="p-6 text-center">
          <User className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">
            Dados do cliente serão analisados em tempo real
          </p>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-purple-600';
    if (score >= 40) return 'text-blue-600';
    return 'text-green-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 70) return 'Premium';
    if (score >= 40) return 'Intermediário';
    return 'Padrão';
  };

  return (
    <div className="space-y-4">
      {/* Score Rápido */}
      <Card className="border-l-4 border-primary">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Análise Instantânea
            </span>
            <Badge variant="outline" className={getScoreColor(profileScore)}>
              {getScoreLabel(profileScore)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Score do Cliente:</span>
            <span className={`text-2xl font-bold ${getScoreColor(profileScore)}`}>
              {profileScore}
            </span>
          </div>
          
          {clienteData.nome && (
            <div className="text-sm">
              <span className="font-medium">{clienteData.nome}</span>
            </div>
          )}
          
          <div className="text-xs text-muted-foreground mt-1">
            {clienteData.profissao && `• ${clienteData.profissao}`}
            {clienteData.endereco && ` • ${clienteData.endereco.slice(0, 30)}...`}
          </div>
        </CardContent>
      </Card>

      {/* Recomendações Rápidas */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Sugestões Automáticas
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {recommendations.map((rec, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="w-full justify-start text-left h-auto p-3"
                onClick={() => onRecommendationSelect?.(rec)}
              >
                <Package className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="text-sm">{rec}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Análise Detalhada */}
      <PerfilAnalysisCard 
        profissao={clienteData.profissao}
        endereco={clienteData.endereco}
      />
    </div>
  );
};
