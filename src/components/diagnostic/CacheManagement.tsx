
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, 
  Trash2, 
  RefreshCw, 
  BarChart3, 
  Clock, 
  MapPin,
  TrendingUp
} from 'lucide-react';
import { EnhancedLocationAnalysisService } from '@/services/EnhancedLocationAnalysisService';
import { GeocacheService } from '@/services/GeocacheService';
import { toast } from 'sonner';

export const CacheManagement: React.FC = () => {
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testAddress, setTestAddress] = useState('Centro, Montes Claros, MG');
  const [testResult, setTestResult] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    loadCacheStats();
  }, []);

  const loadCacheStats = async () => {
    setLoading(true);
    try {
      const stats = await EnhancedLocationAnalysisService.getCacheStatistics();
      setCacheStats(stats);
    } catch (error) {
      toast.error('Erro ao carregar estatísticas do cache');
    } finally {
      setLoading(false);
    }
  };

  const clearOldCache = async () => {
    setLoading(true);
    try {
      const result = await EnhancedLocationAnalysisService.clearOldCache();
      if (result.success) {
        toast.success(result.message);
        await loadCacheStats();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Erro ao limpar cache');
    } finally {
      setLoading(false);
    }
  };

  const testAnalysis = async () => {
    if (!testAddress.trim()) {
      toast.error('Digite um endereço para testar');
      return;
    }

    setTestLoading(true);
    try {
      console.log(`🧪 Testando análise para: ${testAddress}`);
      const result = await EnhancedLocationAnalysisService.getScoreFromAddress(testAddress);
      setTestResult(result);
      toast.success('Teste concluído com sucesso');
      await loadCacheStats(); // Atualizar stats após o teste
    } catch (error) {
      toast.error('Erro no teste de análise');
      console.error('Erro no teste:', error);
    } finally {
      setTestLoading(false);
    }
  };

  const getSourceColor = (source: string) => {
    const colors = {
      'IBGE': 'bg-green-500',
      'CACHE': 'bg-blue-500',
      'ESTIMATIVA': 'bg-yellow-500',
      'FALLBACK': 'bg-orange-500'
    };
    return colors[source] || 'bg-gray-500';
  };

  const getSourceLabel = (source: string) => {
    const labels = {
      'IBGE': 'IBGE (Preciso)',
      'CACHE': 'Cache Local',
      'ESTIMATIVA': 'Estimativa por Cidade',
      'FALLBACK': 'Fallback Regional'
    };
    return labels[source] || source;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gerenciamento de Cache</h2>
          <p className="text-muted-foreground">
            Monitoramento e controle do sistema de cache geográfico
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={loadCacheStats} 
            variant="outline" 
            disabled={loading}
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button 
            onClick={clearOldCache} 
            variant="destructive" 
            disabled={loading}
            size="sm"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Limpar Cache Antigo
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">
            <BarChart3 className="w-4 h-4 mr-2" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="test">
            <MapPin className="w-4 h-4 mr-2" />
            Teste de Análise
          </TabsTrigger>
          <TabsTrigger value="performance">
            <TrendingUp className="w-4 h-4 mr-2" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ) : cacheStats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total de Entradas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Database className="w-5 h-5 text-blue-500 mr-2" />
                    <span className="text-2xl font-bold">{cacheStats.total}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Entradas Antigas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-orange-500 mr-2" />
                    <span className="text-2xl font-bold">{cacheStats.oldEntries}</span>
                  </div>
                  {cacheStats.total > 0 && (
                    <Progress 
                      value={(cacheStats.oldEntries / cacheStats.total) * 100} 
                      className="mt-2"
                    />
                  )}
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Distribuição por Fonte
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(cacheStats.bySource).map(([source, count]) => (
                      <div key={source} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${getSourceColor(source)} mr-2`}></div>
                          <span className="text-sm">{getSourceLabel(source)}</span>
                        </div>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  Nenhuma estatística disponível. Clique em "Atualizar" para carregar.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Teste de Análise</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={testAddress}
                  onChange={(e) => setTestAddress(e.target.value)}
                  placeholder="Digite um endereço para testar..."
                  className="flex-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button 
                  onClick={testAnalysis} 
                  disabled={testLoading}
                >
                  {testLoading ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <MapPin className="w-4 h-4 mr-2" />
                  )}
                  Testar
                </Button>
              </div>

              {testResult && (
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Endereço</p>
                        <p className="font-medium">{testResult.address}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Pontuação</p>
                        <p className="font-bold text-2xl text-primary">{testResult.score}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">Explicação</p>
                        <p className="text-sm">{testResult.scoreReason}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge variant={testResult.success ? "default" : "destructive"}>
                          {testResult.success ? 'Sucesso' : 'Falha'}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Fallback</p>
                        <Badge variant={testResult.fallbackUsed ? "secondary" : "outline"}>
                          {testResult.fallbackUsed ? 'Sim' : 'Não'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Métricas de Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {cacheStats?.total > 0 ? 
                        Math.round(((cacheStats.total - cacheStats.oldEntries) / cacheStats.total) * 100) : 0}%
                    </p>
                    <p className="text-sm text-muted-foreground">Cache Válido</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {cacheStats?.bySource?.IBGE || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Dados IBGE</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">
                      {(cacheStats?.bySource?.ESTIMATIVA || 0) + (cacheStats?.bySource?.FALLBACK || 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">Estimativas</p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Estratégia de Cache Hierárquico</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Cache local (endereços específicos)</li>
                    <li>Análise IBGE em tempo real</li>
                    <li>Estimativas por cidade conhecida</li>
                    <li>Fallback regional por estado</li>
                    <li>Pontuação padrão nacional</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
