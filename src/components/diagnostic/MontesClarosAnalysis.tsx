
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Building2, 
  Home, 
  TrendingUp, 
  RefreshCw, 
  Search,
  BarChart3,
  Clock,
  Database
} from 'lucide-react';
import { BairrosMontesService } from '@/services/BairrosMontesService';
import { EnhancedMontesClarosService } from '@/services/EnhancedMontesClarosService';
import { RealEstateService } from '@/services/RealEstateService';
import { BusinessProfileService } from '@/services/BusinessProfileService';

interface BairroStats {
  total: number;
  porCategoria: Record<string, number>;
  fatorMedio: number;
  ultimaAtualizacao?: string;
}

interface TestResult {
  address: string;
  score: number;
  breakdown?: any;
  isMontesClaros: boolean;
  bairroDetected?: string;
}

export const MontesClarosAnalysis: React.FC = () => {
  const [bairroStats, setBairroStats] = useState<BairroStats | null>(null);
  const [testAddress, setTestAddress] = useState('Centro, Montes Claros, MG');
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [cacheStats, setCacheStats] = useState<any>(null);

  useEffect(() => {
    loadBairroStats();
    loadCacheStats();
  }, []);

  const loadBairroStats = async () => {
    try {
      const stats = await BairrosMontesService.getBairrosStats();
      setBairroStats(stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas dos bairros:', error);
    }
  };

  const loadCacheStats = () => {
    try {
      const realEstateStats = RealEstateService.getCacheStats();
      setCacheStats({
        realEstate: realEstateStats,
        business: { total: 0, oldEntries: 0 } // BusinessProfileService não tem getCacheStats
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas do cache:', error);
    }
  };

  const testAnalysis = async () => {
    if (!testAddress.trim()) return;
    
    setLoading(true);
    try {
      console.log(`🧪 Testando análise para: ${testAddress}`);
      const result = await EnhancedMontesClarosService.analyzeAddress(testAddress);
      
      setTestResult({
        address: result.address,
        score: result.score,
        breakdown: result.breakdown,
        isMontesClaros: result.isMontesClaros,
        bairroDetected: result.bairroDetected
      });
    } catch (error) {
      console.error('Erro no teste:', error);
      setTestResult({
        address: testAddress,
        score: 0,
        isMontesClaros: false
      });
    } finally {
      setLoading(false);
    }
  };

  const clearCaches = async () => {
    try {
      const result = EnhancedMontesClarosService.clearAllCaches();
      console.log('Cache limpo:', result);
      loadCacheStats();
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
    }
  };

  const getCategoryBadgeVariant = (categoria: string) => {
    switch (categoria) {
      case 'alto': return 'default';
      case 'medio': return 'secondary';
      case 'padrao': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="h-6 w-6 text-blue-600" />
            Análise Local - Montes Claros
          </h2>
          <p className="text-muted-foreground mt-1">
            Sistema aprimorado com fator de atualização baseado no mercado local
          </p>
        </div>
        <Button onClick={clearCaches} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Limpar Cache
        </Button>
      </div>

      {/* Estatísticas dos Bairros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Bairros</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bairroStats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Mapeados no sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fator Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bairroStats?.fatorMedio.toFixed(2)}x</div>
            <p className="text-xs text-muted-foreground">
              Multiplicador de atualização
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Imobiliário</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cacheStats?.realEstate?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {cacheStats?.realEstate?.oldEntries || 0} entradas antigas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Atualização</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">
              {bairroStats?.ultimaAtualizacao 
                ? new Date(bairroStats.ultimaAtualizacao).toLocaleDateString('pt-BR')
                : 'N/A'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Base de dados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição por Categoria */}
      {bairroStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Distribuição por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {bairroStats.porCategoria.alto || 0}
                </div>
                <Badge variant={getCategoryBadgeVariant('alto')} className="mt-1">
                  Alto Padrão
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  Fator 1.15x - 1.30x
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {bairroStats.porCategoria.medio || 0}
                </div>
                <Badge variant={getCategoryBadgeVariant('medio')} className="mt-1">
                  Médio Padrão
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  Fator 1.05x - 1.15x
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {bairroStats.porCategoria.padrao || 0}
                </div>
                <Badge variant={getCategoryBadgeVariant('padrao')} className="mt-1">
                  Padrão
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  Fator 1.00x - 1.05x
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Teste de Análise */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Teste de Análise
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Digite um endereço em Montes Claros..."
              value={testAddress}
              onChange={(e) => setTestAddress(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && testAnalysis()}
            />
            <Button onClick={testAnalysis} disabled={loading}>
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {testResult && (
            <div className="border rounded-lg p-4 bg-muted/50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Resultado da Análise</h4>
                <Badge variant={testResult.isMontesClaros ? 'default' : 'secondary'}>
                  {testResult.isMontesClaros ? 'Montes Claros' : 'Fora de Montes Claros'}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Endereço:</span>
                  <span className="text-sm font-medium">{testResult.address}</span>
                </div>
                
                {testResult.bairroDetected && (
                  <div className="flex justify-between">
                    <span className="text-sm">Bairro Detectado:</span>
                    <span className="text-sm font-medium">{testResult.bairroDetected}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-sm">Pontuação Final:</span>
                  <span className="text-lg font-bold text-primary">{testResult.score} pontos</span>
                </div>

                {testResult.breakdown && (
                  <div className="mt-3 pt-3 border-t space-y-1">
                    <div className="text-sm font-medium mb-2">Breakdown Detalhado:</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>Base IBGE: {testResult.breakdown.baseScore} pts</div>
                      <div>Fator Imobiliário: {testResult.breakdown.realEstateFactor}x</div>
                      <div>Fator Comercial: {testResult.breakdown.businessFactor}x</div>
                      <div className="font-medium">Final: {testResult.breakdown.finalScore} pts</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Informações do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Componentes Ativos</h4>
              <ul className="text-sm space-y-1">
                <li>✅ RealEstateService (Cache: 7 dias)</li>
                <li>✅ BusinessProfileService (Cache: 48h)</li>
                <li>✅ BairrosMontesService (Database)</li>
                <li>✅ EnhancedMontesClarosService</li>
                <li>✅ Detecção automática de Montes Claros</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Dados Integrados</h4>
              <ul className="text-sm space-y-1">
                <li>🏛️ Base IBGE (Renda + População)</li>
                <li>🏠 Mercado Imobiliário (Preço/m²)</li>
                <li>🏢 Perfil Comercial (CNAEs)</li>
                <li>📊 Fatores de Atualização por Bairro</li>
                <li>💾 Cache inteligente multicamadas</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
