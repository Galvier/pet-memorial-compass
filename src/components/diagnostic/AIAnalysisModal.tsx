
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Building2,
  Target,
  Info,
  ThumbsUp,
  Eye,
  DollarSign
} from 'lucide-react';
import { AIAnalysisResult } from '@/services/AIRealEstateService';

interface AIAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: AIAnalysisResult | null;
  onApplySuggestion?: (bairro: string, newFactor: number) => void;
}

export const AIAnalysisModal: React.FC<AIAnalysisModalProps> = ({
  isOpen,
  onClose,
  result,
  onApplySuggestion
}) => {
  if (!result) return null;

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getCategoryColor = (categoria: string) => {
    switch (categoria) {
      case 'alto': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'medio': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'padrao': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryLabel = (categoria: string) => {
    switch (categoria) {
      case 'alto': return 'Alto Padrão';
      case 'medio': return 'Médio Padrão';
      case 'padrao': return 'Padrão';
      default: return categoria;
    }
  };

  const handleApplySuggestion = () => {
    if (onApplySuggestion) {
      onApplySuggestion(result.bairro, result.fator_sugerido);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Building2 className="h-6 w-6 text-purple-600" />
            Análise Detalhada - {result.bairro}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumo Principal */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-700 mb-1">
                {result.fator_sugerido}x
              </div>
              <div className="text-sm text-purple-600">Fator Sugerido</div>
            </div>
            
            {result.preco_manual_sugerido && (
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-lg font-bold text-green-700 mb-1">
                  R$ {result.preco_manual_sugerido}
                </div>
                <div className="text-sm text-green-600">Preço Sugerido/m²</div>
              </div>
            )}
            
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Badge className={`text-sm px-3 py-1 ${getCategoryColor(result.categoria_sugerida)}`}>
                {getCategoryLabel(result.categoria_sugerida)}
              </Badge>
              <div className="text-sm text-blue-600 mt-1">Categoria</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
              <Badge className={`text-sm px-3 py-1 ${getConfidenceColor(result.confidence_score)}`}>
                {result.confidence_score}%
              </Badge>
              <div className="text-sm text-orange-600 mt-1">Confiança</div>
            </div>
          </div>

          {/* Análise Executiva */}
          <div>
            <h3 className="flex items-center gap-2 font-medium text-gray-900 mb-3">
              <Info className="h-4 w-4 text-blue-600" />
              Resumo Executivo
            </h3>
            <Alert>
              <AlertDescription className="text-sm leading-relaxed">
                {result.reasoning}
              </AlertDescription>
            </Alert>
          </div>

          <Separator />

          {/* Justificativa Detalhada */}
          <div>
            <h3 className="flex items-center gap-2 font-medium text-gray-900 mb-3">
              <Target className="h-4 w-4 text-purple-600" />
              Análise Detalhada
            </h3>
            <div className="p-4 bg-gray-50 rounded-lg border">
              <p className="text-sm text-gray-700 leading-relaxed">
                {result.justificativa_detalhada}
              </p>
            </div>
          </div>

          {/* Pontos Fortes e Atenção */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="flex items-center gap-2 font-medium text-gray-900 mb-3">
                <ThumbsUp className="h-4 w-4 text-green-600" />
                Pontos Fortes
              </h3>
              <div className="space-y-2">
                {result.pontos_fortes.map((ponto, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-green-50 rounded border border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-green-800">{ponto}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="flex items-center gap-2 font-medium text-gray-900 mb-3">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                Pontos de Atenção
              </h3>
              <div className="space-y-2">
                {result.pontos_atencao.map((ponto, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-orange-50 rounded border border-orange-200">
                    <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-orange-800">{ponto}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Comparação de Mercado */}
          <div>
            <h3 className="flex items-center gap-2 font-medium text-gray-900 mb-3">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Comparação de Mercado
            </h3>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 leading-relaxed">
                {result.comparacao_mercado}
              </p>
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={handleApplySuggestion}
              className="flex-1"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Aplicar Fator ({result.fator_sugerido}x)
            </Button>
            
            {result.preco_manual_sugerido && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  // Aqui você pode implementar aplicação do preço manual se necessário
                  console.log('Aplicar preço manual:', result.preco_manual_sugerido);
                }}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Aplicar Preço (R$ {result.preco_manual_sugerido})
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={onClose}
            >
              <Eye className="h-4 w-4 mr-2" />
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
