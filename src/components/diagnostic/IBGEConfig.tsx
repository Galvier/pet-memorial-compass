import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MapPin, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Trash2,
  TestTube,
  Clock,
  TrendingUp,
  AlertTriangle,
  Database,
  DollarSign
} from 'lucide-react';
import { DiagnosticService } from '@/services/DiagnosticService';
import { IBGEApiService } from '@/services/IBGEApiService';
import { useToast } from '@/hooks/use-toast';

interface IBGETestResult {
  address: string;
  result?: any;
  error?: string;
  duration?: number;
  timestamp: string;
}

interface SidraTestResult {
  municipioId: string;
  result?: any;
  error?: string;
  duration?: number;
  timestamp: string;
}

// Códigos de município conhecidos para teste
const KNOWN_MUNICIPALITY_CODES = [
  { code: '3143302', name: 'Montes Claros - MG' },
  { code: '3106200', name: 'Belo Horizonte - MG' },
  { code: '3550308', name: 'São Paulo - SP' },
  { code: '3304557', name: 'Rio de Janeiro - RJ' },
  { code: '2304400', name: 'Fortaleza - CE' },
  { code: '2927408', name: 'Salvador - BA' },
  { code: '5300108', name: 'Brasília - DF' },
  { code: '4106902', name: 'Curitiba - PR' },
  { code: '4314902', name: 'Porto Alegre - RS' },
  { code: '1302603', name: 'Manaus - AM' }
];

export const IBGEConfig: React.FC = () => {
  const [ibgeStatus, setIBGEStatus] = useState<any>(null);
  const [testAddress, setTestAddress] = useState('Belo Horizonte, MG');
  const [testResults, setTestResults] = useState<IBGETestResult[]>([]);
  const [sidraTestCode, setSidraTestCode] = useState('3143302');
  const [sidraTestResults, setSidraTestResults] = useState<SidraTestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [realTesting, setRealTesting] = useState(false);
  const [sidraLoading, setSidraLoading] = useState(false);
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

  const testSidraApi = async () => {
    if (!sidraTestCode.trim()) {
      toast({
        title: "Código necessário",
        description: "Digite um código de município para testar",
        variant: "destructive"
      });
      return;
    }

    // Validar formato do código (7 dígitos)
    if (!/^\d{7}$/.test(sidraTestCode.trim())) {
      toast({
        title: "Código inválido",
        description: "O código do município deve ter exatamente 7 dígitos",
        variant: "destructive"
      });
      return;
    }

    setSidraLoading(true);
    const startTime = Date.now();

    try {
      console.log(`🧪 Testando API SIDRA para município: ${sidraTestCode}`);
      
      // Testar diretamente a API SIDRA
      const result = await IBGEApiService.getIncomeFromMunicipio(sidraTestCode);
      const duration = Date.now() - startTime;
      
      const testResult: SidraTestResult = {
        municipioId: sidraTestCode,
        result,
        duration,
        timestamp: new Date().toISOString()
      };

      if (!result) {
        testResult.error = 'Dados de renda não encontrados para este município';
      }

      setSidraTestResults(prev => [testResult, ...prev.slice(0, 9)]); // Manter apenas os 10 últimos
      
      if (testResult.error) {
        toast({
          title: "Teste SIDRA falhou",
          description: testResult.error,
          variant: "destructive"
        });
      } else {
        const municipioName = KNOWN_MUNICIPALITY_CODES.find(m => m.code === sidraTestCode)?.name || sidraTestCode;
        toast({
          title: "Teste SIDRA concluído",
          description: `Dados obtidos para ${municipioName} em ${duration}ms`,
        });
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      const testResult: SidraTestResult = {
        municipioId: sidraTestCode,
        error: error.message || 'Erro desconhecido',
        duration,
        timestamp: new Date().toISOString()
      };

      setSidraTestResults(prev => [testResult, ...prev.slice(0, 9)]);
      
      toast({
        title: "Erro no teste SIDRA",
        description: `Falha ao testar API: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setSidraLoading(false);
    }
  };

  const runRealTest = async () => {
    setRealTesting(true);
    try {
      console.log('🧪 Executando teste real das APIs IBGE...');
      
      // Executar teste real através do IBGEApiService
      const result = await DiagnosticService.runIntegrationTest('location-analysis');
      
      toast({
        title: result.success ? "Teste Real Bem-sucedido" : "Teste Real Falhou",
        description: result.message,
        variant: result.success ? "default" : "destructive"
      });
      
      // Recarregar status após teste
      await loadIBGEStatus();
      
    } catch (error) {
      toast({
        title: "Erro no Teste Real",
        description: "Falha ao executar teste real das APIs",
        variant: "destructive"
      });
    } finally {
      setRealTesting(false);
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
        <div className="flex gap-2">
          <Button onClick={runRealTest} disabled={realTesting} variant="outline" size="sm">
            <TestTube className={`h-4 w-4 mr-2 ${realTesting ? 'animate-spin' : ''}`} />
            {realTesting ? 'Testando...' : 'Teste Real'}
          </Button>
          <Button onClick={loadIBGEStatus} disabled={loading} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
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
            
            {ibgeStatus.realTestResult && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                <p className="font-medium text-blue-800">Resultado do Teste Real:</p>
                <p className="text-blue-700">{ibgeStatus.realTestResult}</p>
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Última verificação: {ibgeStatus.lastUpdated ? new Date(ibgeStatus.lastUpdated).toLocaleString('pt-BR') : 'Nunca'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Teste Específico da API SIDRA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Teste Específico da API SIDRA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sidra-code">Código do Município IBGE</Label>
              <div className="flex gap-2">
                <Input
                  id="sidra-code"
                  placeholder="Ex: 3143302"
                  value={sidraTestCode}
                  onChange={(e) => setSidraTestCode(e.target.value)}
                  maxLength={7}
                  className="font-mono"
                />
                <Button 
                  onClick={testSidraApi} 
                  disabled={sidraLoading || !sidraTestCode.trim()}
                  size="sm"
                >
                  {sidraLoading ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Testando...
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4 mr-2" />
                      Testar SIDRA
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Digite o código de 7 dígitos do município IBGE
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="municipality-select">Municípios Conhecidos</Label>
              <Select 
                value={sidraTestCode} 
                onValueChange={setSidraTestCode}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um município" />
                </SelectTrigger>
                <SelectContent>
                  {KNOWN_MUNICIPALITY_CODES.map((municipality) => (
                    <SelectItem key={municipality.code} value={municipality.code}>
                      {municipality.name} ({municipality.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {sidraTestResults.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Resultados dos Testes SIDRA</h4>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {sidraTestResults.map((result, index) => (
                  <div key={index} className="p-3 border rounded text-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium font-mono">{result.municipioId}</span>
                      <div className="flex items-center gap-2">
                        {result.duration && (
                          <Badge variant="outline" className="text-xs">
                            {result.duration}ms
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
                          <DollarSign className="h-3 w-3" />
                          <span>Renda média: R$ {result.result.averageIncome?.toFixed(2) || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-3 w-3" />
                          <span>População: {result.result.populationCount?.toLocaleString('pt-BR') || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          <span>Ano dos dados: {result.result.dataYear || 'N/A'}</span>
                        </div>
                        {result.result.dataYear === 2022 && result.result.averageIncome === 2500 && (
                          <div className="flex items-center gap-2 text-orange-600">
                            <AlertTriangle className="h-3 w-3" />
                            <span className="text-xs">Dados de fallback utilizados</span>
                          </div>
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
              <strong>Sistema Melhorado:</strong> O diagnóstico agora executa testes reais de análise, 
              usa cache local quando as APIs estão temporariamente indisponíveis, e detecta automaticamente 
              quando o sistema está funcionando mesmo com limitações de conectividade.
            </AlertDescription>
          </Alert>

          <div className="p-3 bg-green-50 border border-green-200 rounded text-sm">
            <p className="font-medium text-green-800 mb-2">Sistema de Status Inteligente:</p>
            <ul className="text-green-700 space-y-1 list-disc list-inside">
              <li>✅ <strong>OK:</strong> APIs funcionando normalmente</li>
              <li>⚠️ <strong>Atenção:</strong> Funcionando com cache local</li>
              <li>❌ <strong>Erro:</strong> APIs indisponíveis e sem cache</li>
              <li>🧪 <strong>Teste Real:</strong> Executa análise completa para validar</li>
            </ul>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
            <p className="font-medium text-blue-800 mb-2">Melhorias Implementadas:</p>
            <ol className="text-blue-700 space-y-1 list-decimal list-inside">
              <li>Teste de conectividade com endpoints mais confiáveis</li>
              <li>Detecção de cache válido como fallback</li>
              <li>Teste real de análise para validação completa</li>
              <li>Cache de status para evitar testes desnecessários</li>
              <li>Mensagens mais informativas sobre o estado real</li>
              <li><strong>Novo:</strong> Teste específico da API SIDRA por código de município</li>
            </ol>
          </div>

          <div className="p-3 bg-orange-50 border border-orange-200 rounded text-sm">
            <p className="font-medium text-orange-800 mb-2">Teste SIDRA Específico:</p>
            <ul className="text-orange-700 space-y-1 list-disc list-inside">
              <li>Digite códigos IBGE de 7 dígitos ou use a lista de municípios conhecidos</li>
              <li>Teste direto da API SIDRA sem geocodificação</li>
              <li>Exibe renda média, população e ano dos dados</li>
              <li>Identifica quando dados de fallback são utilizados</li>
              <li>Histórico dos últimos 10 testes realizados</li>
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
