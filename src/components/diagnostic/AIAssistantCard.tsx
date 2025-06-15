
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Bot, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  TrendingUp,
  Eye,
  Loader2,
  Zap,
  BarChart3
} from 'lucide-react';
import { AIRealEstateService, AIAnalysisResult, AIValidationResult } from '@/services/AIRealEstateService';
import { useToast } from '@/hooks/use-toast';
import { AIAnalysisModal } from './AIAnalysisModal';

interface AIAssistantCardProps {
  bairros: Array<{
    id: string;
    nome_bairro: string;
    categoria: string;
    fator_imobiliario: number;
    preco_medio_m2: number;
  }>;
  basePrice: number;
  onSuggestionApplied: (bairro: string, newFactor: number) => void;
}

export const AIAssistantCard: React.FC<AIAssistantCardProps> = ({
  bairros,
  basePrice,
  onSuggestionApplied
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentAnalyzing, setCurrentAnalyzing] = useState<string>('');
  const [analysisResults, setAnalysisResults] = useState<AIAnalysisResult[]>([]);
  const [validationResults, setValidationResults] = useState<AIValidationResult | null>(null);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'validation'>('suggestions');
  const [selectedResult, setSelectedResult] = useState<AIAnalysisResult | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();

  const runBulkAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setCurrentAnalyzing('Iniciando análise...');
    
    try {
      const bairrosData = bairros.map(b => ({
        nome_bairro: b.nome_bairro,
        categoria: b.categoria,
        fator_atual: b.fator_imobiliario,
        preco_medio_m2: b.preco_medio_m2
      }));

      // Simular progresso durante análise
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          const newProgress = prev + (100 / bairrosData.length);
          return Math.min(newProgress, 95);
        });
      }, 500);

      setCurrentAnalyzing(`Analisando ${bairrosData.length} bairros com IA...`);
      
      const results = await AIRealEstateService.bulkAnalyzeNeighborhoods(bairrosData, basePrice);
      
      clearInterval(progressInterval);
      setAnalysisProgress(100);
      setCurrentAnalyzing('Análise concluída!');
      
      setAnalysisResults(results);
      setActiveTab('suggestions');
      
      toast({
        title: "🤖 Análise de IA Concluída",
        description: `${results.length} bairros analisados com sucesso`,
      });
    } catch (error) {
      toast({
        title: "❌ Erro na Análise",
        description: "Falha ao analisar bairros com IA. Verifique os logs para mais detalhes.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
      setCurrentAnalyzing('');
    }
  };

  const runValidation = async () => {
    setIsAnalyzing(true);
    setCurrentAnalyzing('Validando fatores existentes...');
    
    try {
      const bairrosData = bairros.map(b => ({
        nome_bairro: b.nome_bairro,
        categoria: b.categoria,
        fator_atual: b.fator_imobiliario,
        preco_medio_m2: b.preco_medio_m2
      }));

      const results = await AIRealEstateService.validateExistingFactors(bairrosData, basePrice);
      setValidationResults(results);
      setActiveTab('validation');
      
      toast({
        title: "🔍 Validação Concluída",
        description: `${results.resumo.discrepancias_encontradas} discrepâncias identificadas`,
        variant: results.resumo.discrepancias_encontradas > 0 ? "destructive" : "default"
      });
    } catch (error) {
      toast({
        title: "❌ Erro na Validação",
        description: "Falha ao validar fatores com IA",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
      setCurrentAnalyzing('');
    }
  };

  const applySuggestion = (result: AIAnalysisResult) => {
    onSuggestionApplied(result.bairro, result.fator_sugerido);
    toast({
      title: "✅ Sugestão Aplicada",
      description: `Fator de ${result.bairro} atualizado para ${result.fator_sugerido}x`,
    });
  };

  const openDetailsModal = (result: AIAnalysisResult) => {
    setSelectedResult(result);
    setModalOpen(true);
  };

  const getConfidenceBadge = (score: number) => {
    const indicator = AIRealEstateService.getConfidenceIndicator(score);
    return (
      <Badge 
        variant={indicator.level === 'alta' ? 'default' : indicator.level === 'media' ? 'secondary' : 'destructive'}
        className="text-xs"
      >
        {score}% confiança
      </Badge>
    );
  };

  return (
    <>
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Bot className="h-5 w-5" />
            Assistente de IA
            <Sparkles className="h-4 w-4 text-purple-600" />
            <Badge variant="outline" className="ml-auto text-xs">GPT-4o-mini</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Loading state */}
          {isAnalyzing && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-purple-700">
                <Loader2 className="h-4 w-4 animate-spin" />
                {currentAnalyzing}
              </div>
              {analysisProgress > 0 && (
                <Progress value={analysisProgress} className="h-2" />
              )}
            </div>
          )}

          {/* Controles principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button 
              onClick={runBulkAnalysis} 
              disabled={isAnalyzing}
              className="h-auto flex-col py-4 bg-purple-600 hover:bg-purple-700"
            >
              {isAnalyzing ? (
                <Loader2 className="h-6 w-6 mb-2 animate-spin" />
              ) : (
                <Sparkles className="h-6 w-6 mb-2" />
              )}
              <div className="text-center">
                <div className="font-medium">Análise Completa</div>
                <div className="text-xs text-purple-100 mt-1">
                  Sugestões de IA para todos os bairros ({bairros.length})
                </div>
              </div>
            </Button>
            
            <Button 
              onClick={runValidation} 
              disabled={isAnalyzing}
              variant="outline"
              className="h-auto flex-col py-4 border-purple-300 hover:bg-purple-50"
            >
              {isAnalyzing ? (
                <Loader2 className="h-6 w-6 mb-2 animate-spin" />
              ) : (
                <Eye className="h-6 w-6 mb-2 text-purple-600" />
              )}
              <div className="text-center">
                <div className="font-medium">Validar Fatores</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Identifica discrepâncias nos dados atuais
                </div>
              </div>
            </Button>
          </div>

          {/* Resultados */}
          {(analysisResults.length > 0 || validationResults) && (
            <div className="space-y-4">
              {/* Tabs */}
              <div className="flex gap-2">
                <Button
                  variant={activeTab === 'suggestions' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('suggestions')}
                  className="text-xs"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Sugestões ({analysisResults.length})
                </Button>
                <Button
                  variant={activeTab === 'validation' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('validation')}
                  className="text-xs"
                >
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Validação {validationResults && `(${validationResults.resumo.discrepancias_encontradas})`}
                </Button>
              </div>

              {/* Conteúdo das tabs */}
              {activeTab === 'suggestions' && analysisResults.length > 0 && (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {analysisResults.map((result, index) => (
                    <div key={index} className="p-4 bg-white rounded-lg border border-purple-200 shadow-sm">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-medium text-sm">{result.bairro}</div>
                          <div className="text-xs text-muted-foreground">
                            Sugestão baseada em análise de mercado
                          </div>
                        </div>
                        {getConfidenceBadge(result.confidence_score)}
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-4 text-sm">
                          <span>Fator Sugerido: <strong className="text-purple-700">{result.fator_sugerido}x</strong></span>
                          <Badge variant="outline" className="text-xs">
                            {result.categoria_sugerida}
                          </Badge>
                        </div>
                        
                        <p className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">
                          {result.reasoning}
                        </p>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => applySuggestion(result)}
                            className="text-xs h-7"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Aplicar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openDetailsModal(result)}
                            className="text-xs h-7"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Ver Detalhes
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'validation' && validationResults && (
                <div className="space-y-3">
                  <Alert>
                    <BarChart3 className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Resumo:</strong> {validationResults.resumo.discrepancias_encontradas} de {validationResults.resumo.total_analisados} bairros apresentam discrepâncias significativas.
                    </AlertDescription>
                  </Alert>
                  
                  {validationResults.discrepancias.length > 0 && (
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {validationResults.discrepancias.map((disc, index) => (
                        <div key={index} className="p-3 bg-white rounded-lg border border-orange-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{disc.bairro}</span>
                            <Badge 
                              variant={disc.severidade === 'alta' ? 'destructive' : disc.severidade === 'media' ? 'secondary' : 'outline'}
                              className="text-xs"
                            >
                              {disc.severidade}
                            </Badge>
                          </div>
                          
                          <div className="text-xs space-y-1">
                            <div className="flex items-center gap-2">
                              <span>Atual: <strong>{disc.fator_atual}x</strong></span>
                              <span>→</span>
                              <span>Sugerido: <strong className="text-green-600">{disc.fator_sugerido}x</strong></span>
                            </div>
                            <p className="text-muted-foreground bg-gray-50 p-2 rounded">{disc.justificativa}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>Recomendação Geral:</strong> {validationResults.resumo.recomendacao_geral}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Estado inicial */}
          {analysisResults.length === 0 && !validationResults && !isAnalyzing && (
            <Alert>
              <Bot className="h-4 w-4" />
              <AlertDescription>
                Use a <strong>Análise Completa</strong> para obter sugestões inteligentes da IA ou <strong>Validar Fatores</strong> para identificar inconsistências nos dados atuais.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Modal de detalhes */}
      <AIAnalysisModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        result={selectedResult}
        onApplySuggestion={applySuggestion}
      />
    </>
  );
};
