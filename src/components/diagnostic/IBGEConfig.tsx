
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Trash2,
  TestTube,
  Clock,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { DiagnosticService } from '@/services/DiagnosticService';
import { useToast } from '@/hooks/use-toast';

interface IBGETestResult {
  address: string;
  result?: any;
  error?: string;
  duration?: number;
  timestamp: string;
}

export const IBGEConfig: React.FC = () => {
  const [ibgeStatus, setIBGEStatus] = useState<any>(null);
  const [testAddress, setTestAddress] = useState('Montes Claros, MG');
  const [testResults, setTestResults] = useState<IBGETestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadIBGEStatus();
  }, []);

  const loadIBGEStatus = async () => {
    setLoading(true);
    try {
      const status = await DiagnosticService.getIBGEStatus();
      setIBGEStatus(status);
    } catch (error) {
      console.error('Erro ao carregar status do IBGE:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar status das APIs do IBGE",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const testAddressAnalysis = async () => {
    if (!testAddress.trim()) {
      toast({
        title: "Endereço necessário",
        description: "Digite um endereço para testar",
        variant: "destructive"
      });
      return;
    }

    setTesting(true);
    try {
      const result = await DiagnosticService.testAddressAnalysis(testAddress);
      
      setTestResults(prev => [result, ...prev.slice(0, 9)]); // Manter apenas os 10 últimos
      
      if (result.error) {
        toast({
          title: "Teste falhou",
          description: result.error,
          variant: "destructive"
        });
      } else {
        const fallbackMsg = result.result?.fallbackUsed ? " (usando fallback)" : "";
        toast({
          title: "Teste concluído",
          description: `Análise realizada em ${result.duration}ms${fallbackMsg}`,
        });
      }
    } catch (error) {
      toast({
        title: "Erro no teste",
        description: "Falha ao executar teste de análise",
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

  const clearCache = async () => {
    try {
      const result = await DiagnosticService.clearIBGECache();
      
      toast({
        title: result.success ? "Cache limpo" : "Erro",
        description: result.message,
        variant: result.success ? "default" : "destructive"
      });
      
      if (result.success) {
        loadIBGEStatus();
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao limpar cache",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusBadge = (success: boolean) => {
    return (
      <Badge variant={success ? "default" : "destructive"}>
        {success ? "Operacional" : "Erro"}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          APIs do IBGE
        </h3>
        <Button onClick={loadIBGEStatus} disabled={loading} variant="outline" size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Status das APIs */}
      {ibgeStatus && (
        <Card>
          <CardHeader>
            <CardTitle>Status das APIs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Municípios IBGE</span>
                  {getStatusIcon(ibgeStatus.municipalities?.success || false)}
                </div>
                {getStatusBadge(ibgeStatus.municipalities?.success || false)}
                <p className="text-xs text-muted-foreground">{ibgeStatus.municipalities?.message || 'Status desconhecido'}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">API SIDRA (Renda)</span>
                  {getStatusIcon(ibgeStatus.income?.success || false)}
                </div>
                {getStatusBadge(ibgeStatus.income?.success || false)}
                <p className="text-xs text-muted-foreground">{ibgeStatus.income?.message || 'Status desconhecido'}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Análise Completa</span>
                  {getStatusIcon(ibgeStatus.analysis?.success || false)}
                </div>
                {getStatusBadge(ibgeStatus.analysis?.success || false)}
                <p className="text-xs text-muted-foreground">{ibgeStatus.analysis?.message || 'Status desconhecido'}</p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Última verificação: {ibgeStatus.lastUpdated ? new Date(ibgeStatus.lastUpdated).toLocaleString('pt-BR') : 'Nunca'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Teste de Endereço */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Teste de Análise de Endereço
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="test-address">Endereço para teste</Label>
              <Input
                id="test-address"
                placeholder="Ex: Montes Claros, MG"
                value={testAddress}
                onChange={(e) => setTestAddress(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && testAddressAnalysis()}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={testAddressAnalysis} 
                disabled={testing || !testAddress.trim()}
              >
                {testing ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Testando...
                  </>
                ) : (
                  <>
                    <TestTube className="h-4 w-4 mr-2" />
                    Testar
                  </>
                )}
              </Button>
            </div>
          </div>

          {testResults.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Resultados dos Testes</h4>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {testResults.map((result, index) => (
                  <div key={index} className="p-3 border rounded text-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{result.address}</span>
                      <div className="flex items-center gap-2">
                        {result.duration && (
                          <Badge variant="outline" className="text-xs">
                            {result.duration}ms
                          </Badge>
                        )}
                        {result.result?.fallbackUsed && (
                          <Badge variant="secondary" className="text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Fallback
                          </Badge>
                        )}
                        {result.error ? (
                          <XCircle className="h-4 w-4 text-red-500" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </div>
                    
                    {result.error ? (
                      <p className="text-red-600">{result.error}</p>
                    ) : result.result && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-3 w-3" />
                          <span>Pontuação: {result.result.score || 'N/A'}</span>
                        </div>
                        <p className="text-muted-foreground text-xs">
                          {result.result.scoreReason || 'Sem detalhes'}
                        </p>
                        {result.result.municipioData && (
                          <p className="text-xs text-blue-600">
                            📍 {result.result.municipioData.nome} - {result.result.municipioData.uf}
                          </p>
                        )}
                        {result.result.incomeData && (
                          <p className="text-xs text-green-600">
                            💰 Renda média: R$ {result.result.incomeData.averageIncome.toFixed(2)} ({result.result.incomeData.dataYear})
                          </p>
                        )}
                      </div>
                    )}
                    
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(result.timestamp).toLocaleString('pt-BR')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações e Configurações */}
      <Card>
        <CardHeader>
          <CardTitle>Informações e Configurações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <MapPin className="h-4 w-4" />
            <AlertDescription>
              <strong>Atualização:</strong> O sistema agora usa dados municipais do IBGE. 
              Quando os dados específicos não estão disponíveis, o sistema utiliza estimativas regionais para manter a funcionalidade.
            </AlertDescription>
          </Alert>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
            <p className="font-medium text-blue-800 mb-2">Novo Fluxo de Análise:</p>
            <ol className="text-blue-700 space-y-1 list-decimal list-inside">
              <li>Geocodificação do endereço (Google Maps)</li>
              <li>Identificação do município (API IBGE)</li>
              <li>Consulta da renda municipal (API SIDRA)</li>
              <li>Fallback para estimativas se necessário</li>
              <li>Cálculo da pontuação (15-50 pontos)</li>
            </ol>
          </div>

          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
            <p className="font-medium text-yellow-800 mb-2">Sistema de Fallback:</p>
            <ul className="text-yellow-700 space-y-1 list-disc list-inside">
              <li>Dados municipais quando setores não disponíveis</li>
              <li>Estimativas regionais para renda indisponível</li>
              <li>Cache inteligente para otimizar performance</li>
              <li>Logs detalhados para monitoramento</li>
            </ul>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div>
              <p className="text-sm font-medium">Gerenciamento de Cache</p>
              <p className="text-xs text-muted-foreground">
                Limpar cache pode melhorar performance se houver dados obsoletos
              </p>
            </div>
            <Button onClick={clearCache} variant="outline" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar Cache
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
