import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building2, 
  DollarSign, 
  Settings, 
  TrendingUp, 
  Save,
  TestTube,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Calculator,
  Info,
  Database,
  BarChart3,
  Clock,
  AlertCircle,
  Target
} from 'lucide-react';
import { SettingsService } from '@/services/SettingsService';
import { BairrosMontesService } from '@/services/BairrosMontesService';
import { IntelligentRealEstateService } from '@/services/IntelligentRealEstateService';
import { useToast } from '@/hooks/use-toast';

interface BairroMultiplier {
  id: string;
  nome_bairro: string;
  fator_imobiliario: number;
  preco_medio_m2: number;
  categoria: string;
}

interface MarketStats {
  totalBairros: number;
  categoriaDistribution: { [key: string]: number };
  fatoresRange: { min: number; max: number; media: number };
  lastUpdate: string;
  discrepancias: number;
}

export const MarketConfigPanel: React.FC = () => {
  const [basePrice, setBasePrice] = useState<string>('3500');
  const [bairros, setBairros] = useState<BairroMultiplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [marketStats, setMarketStats] = useState<MarketStats | null>(null);
  const [basePriceOrigin, setBasePriceOrigin] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadMarketConfig();
  }, []);

  const loadMarketConfig = async () => {
    setLoading(true);
    try {
      // Carregar preço base e sua origem
      const currentBasePrice = await SettingsService.getBasePriceMOC();
      const basePriceSetting = await SettingsService.getSetting('BASE_M2_PRICE_MOC');
      setBasePrice(currentBasePrice.toString());
      setBasePriceOrigin(basePriceSetting);

      // Carregar bairros
      const bairrosList = await BairrosMontesService.listAllBairros();
      const bairrosFormatted = bairrosList.map(b => ({
        id: b.id,
        nome_bairro: b.nome_bairro,
        fator_imobiliario: b.fator_imobiliario,
        preco_medio_m2: b.preco_medio_m2 || 0,
        categoria: b.categoria
      }));
      setBairros(bairrosFormatted);

      // Calcular estatísticas
      calculateMarketStats(bairrosFormatted, currentBasePrice);

      toast({
        title: "Configurações Carregadas",
        description: "Dados de mercado carregados com sucesso",
      });
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar configurações de mercado",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateMarketStats = (bairrosList: BairroMultiplier[], basePriceValue: number) => {
    const totalBairros = bairrosList.length;
    
    // Distribuição por categoria
    const categoriaDistribution = bairrosList.reduce((acc, bairro) => {
      acc[bairro.categoria] = (acc[bairro.categoria] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    // Range dos fatores
    const fatores = bairrosList.map(b => b.fator_imobiliario);
    const fatoresRange = {
      min: Math.min(...fatores),
      max: Math.max(...fatores),
      media: fatores.reduce((a, b) => a + b, 0) / fatores.length
    };

    // Discrepâncias (quando preço manual difere muito do calculado)
    let discrepancias = 0;
    bairrosList.forEach(bairro => {
      const precoCalculado = basePriceValue * bairro.fator_imobiliario;
      const precoManual = bairro.preco_medio_m2;
      if (precoManual > 0) {
        const diferenca = Math.abs(precoCalculado - precoManual) / precoCalculado;
        if (diferenca > 0.15) { // Mais de 15% de diferença
          discrepancias++;
        }
      }
    });

    setMarketStats({
      totalBairros,
      categoriaDistribution,
      fatoresRange,
      lastUpdate: new Date().toLocaleDateString('pt-BR'),
      discrepancias
    });
  };

  const saveBasePrice = async () => {
    try {
      const price = parseFloat(basePrice);
      if (isNaN(price) || price <= 0) {
        toast({
          title: "Erro",
          description: "Digite um preço válido",
          variant: "destructive"
        });
        return;
      }

      const success = await SettingsService.setBasePriceMOC(price);
      if (success) {
        // Recalcular estatísticas
        calculateMarketStats(bairros, price);
        
        toast({
          title: "Sucesso",
          description: `Preço base atualizado para R$ ${price}`,
        });
      } else {
        throw new Error('Falha na atualização');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao salvar preço base",
        variant: "destructive"
      });
    }
  };

  const updateBairroPrice = async (bairroId: string, nomeBairro: string, newPrice: string) => {
    try {
      const price = parseFloat(newPrice);
      if (isNaN(price) || price < 0) return;

      const success = await BairrosMontesService.updateBairroData(nomeBairro, {
        preco_medio_m2: price
      });

      if (success) {
        const updatedBairros = bairros.map(b => 
          b.id === bairroId ? { ...b, preco_medio_m2: price } : b
        );
        setBairros(updatedBairros);
        calculateMarketStats(updatedBairros, parseFloat(basePrice));
        
        toast({
          title: "Atualizado",
          description: `Preço do bairro ${nomeBairro} atualizado`,
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar preço do bairro",
        variant: "destructive"
      });
    }
  };

  const runSimulationTest = async () => {
    setLoading(true);
    try {
      const results = await IntelligentRealEstateService.runSimulationTest();
      setTestResults(results);
      
      toast({
        title: "Teste Concluído",
        description: "Simulação executada com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro no Teste",
        description: "Falha ao executar simulação",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const recalculateAllPrices = async () => {
    setLoading(true);
    try {
      const currentBasePrice = parseFloat(basePrice);
      let updated = 0;

      for (const bairro of bairros) {
        const calculatedPrice = currentBasePrice * bairro.fator_imobiliario;
        const success = await BairrosMontesService.updateBairroData(bairro.nome_bairro, {
          preco_medio_m2: calculatedPrice
        });
        if (success) updated++;
      }

      // Recarregar dados
      await loadMarketConfig();

      toast({
        title: "Recalculado",
        description: `${updated} bairros atualizados com novos preços`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao recalcular preços",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (categoria: string) => {
    switch (categoria) {
      case 'alto': return 'default';
      case 'medio': return 'secondary';
      case 'padrao': return 'outline';
      default: return 'outline';
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6 text-blue-600" />
            Configurações de Mercado
          </h2>
          <p className="text-muted-foreground mt-1">
            Sistema de simulação inteligente para análise imobiliária
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={runSimulationTest} variant="outline" disabled={loading}>
            <TestTube className="h-4 w-4 mr-2" />
            Testar Simulação
          </Button>
          <Button onClick={loadMarketConfig} variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Recarregar
          </Button>
        </div>
      </div>

      {/* Origem dos Dados */}
      <Card className="border-green-200 bg-green-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Database className="h-5 w-5" />
            Origem dos Dados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-green-700 font-medium">Fonte da Configuração</Label>
              <div className="text-sm space-y-1">
                <div>📊 Categoria: <span className="font-mono">{basePriceOrigin?.category || 'real_estate'}</span></div>
                <div>🗓️ Criado em: <span className="font-mono">15/06/2025</span></div>
                <div>📝 Sistema: <span className="text-xs">Configuração base do mercado</span></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-green-700 font-medium">Abrangência</Label>
              <div className="text-sm space-y-1">
                <div>🏘️ Bairros Ativos: <span className="font-mono">{marketStats?.totalBairros || 0}</span></div>
                <div>🎯 Usando Base: <span className="font-mono">{marketStats?.totalBairros || 0}</span></div>
                <div>📈 Em Análise: <span className="font-mono">{marketStats?.totalBairros || 0}</span></div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-green-700 font-medium">Descrição</Label>
              <div className="text-sm bg-white p-3 rounded border border-green-200">
                {basePriceOrigin?.description || 'Preço base do metro quadrado em Montes Claros para cálculos de simulação imobiliária'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas do Mercado */}
      {marketStats && (
        <Card className="border-purple-200 bg-purple-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <BarChart3 className="h-5 w-5" />
              Estatísticas do Mercado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-purple-700">{marketStats.totalBairros}</div>
                <div className="text-sm text-purple-600">Total de Bairros</div>
              </div>
              
              <div className="space-y-3">
                <div className="text-sm font-medium text-purple-700">Distribuição por Categoria</div>
                <div className="space-y-1">
                  {Object.entries(marketStats.categoriaDistribution).map(([categoria, count]) => (
                    <div key={categoria} className="flex justify-between text-sm">
                      <span>{getCategoryLabel(categoria)}</span>
                      <span className="font-mono">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="text-sm font-medium text-purple-700">Fatores Imobiliários</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Mínimo:</span>
                    <span className="font-mono">{marketStats.fatoresRange.min.toFixed(2)}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Máximo:</span>
                    <span className="font-mono">{marketStats.fatoresRange.max.toFixed(2)}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Média:</span>
                    <span className="font-mono">{marketStats.fatoresRange.media.toFixed(2)}x</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="text-sm font-medium text-purple-700">Qualidade dos Dados</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Última Atualização:</span>
                    <span className="font-mono">{marketStats.lastUpdate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discrepâncias:</span>
                    <span className={`font-mono ${marketStats.discrepancias > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                      {marketStats.discrepancias}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {marketStats.discrepancias > 0 && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Atenção:</strong> {marketStats.discrepancias} bairro(s) apresentam discrepâncias superiores a 15% 
                  entre o preço calculado e o preço manual. Considere revisar ou usar a ferramenta de recálculo.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Configuração do Preço Base */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Índice Base do Metro Quadrado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="basePrice">Preço Base (R$/m²)</Label>
              <Input
                id="basePrice"
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                placeholder="3500"
                min="0"
                step="50"
              />
            </div>
            <Button onClick={saveBasePrice} className="mt-6">
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </div>
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Este valor serve como base para calcular os preços simulados de todos os bairros.
              Os multiplicadores individuais são aplicados sobre este valor.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Ferramentas de Sincronização */}
      <Card className="border-orange-200 bg-orange-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <RefreshCw className="h-5 w-5" />
            Ferramentas de Sincronização
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={recalculateAllPrices} 
              variant="outline" 
              disabled={loading}
              className="h-auto flex-col py-4"
            >
              <Target className="h-6 w-6 mb-2 text-orange-600" />
              <div className="text-center">
                <div className="font-medium">Recalcular Preços</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Aplica o preço base atual em todos os bairros
                </div>
              </div>
            </Button>
            
            <Button 
              onClick={loadMarketConfig} 
              variant="outline" 
              disabled={loading}
              className="h-auto flex-col py-4"
            >
              <RefreshCw className="h-6 w-6 mb-2 text-orange-600" />
              <div className="text-center">
                <div className="font-medium">Recarregar Dados</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Atualiza todas as informações do banco
                </div>
              </div>
            </Button>
            
            <Button 
              onClick={runSimulationTest} 
              variant="outline" 
              disabled={loading}
              className="h-auto flex-col py-4"
            >
              <TestTube className="h-6 w-6 mb-2 text-orange-600" />
              <div className="text-center">
                <div className="font-medium">Teste Completo</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Executa simulação em cenários
                </div>
              </div>
            </Button>
          </div>
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Recalcular Preços:</strong> Esta ação irá substituir todos os preços manuais pelos valores 
              calculados (Base × Fator). Use com cuidado se houver preços personalizados importantes.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Como Funciona - Seção Existente */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Calculator className="h-5 w-5" />
            Como Funciona o Cálculo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 text-sm font-bold">1</div>
                <div>
                  <div className="font-medium text-blue-800">Preço Base</div>
                  <div className="text-sm text-blue-600">Valor de referência do metro quadrado para toda a cidade</div>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 text-sm font-bold">2</div>
                <div>
                  <div className="font-medium text-blue-800">Fator do Bairro</div>
                  <div className="text-sm text-blue-600">Multiplicador específico baseado na valorização da região</div>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 text-sm font-bold">3</div>
                <div>
                  <div className="font-medium text-blue-800">Preço Final</div>
                  <div className="text-sm text-blue-600">Resultado da multiplicação: Base × Fator</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <div className="font-medium text-blue-800 mb-3">Exemplo de Cálculo:</div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Preço Base:</span>
                  <span className="font-mono ml-2">R$ {basePrice}</span>
                </div>
                <div>
                  <span className="text-gray-600">Fator Ibituruna:</span>
                  <span className="font-mono ml-2">1.30x</span>
                </div>
                <Separator className="my-2" />
                <div className="font-medium">
                  <span className="text-gray-600">Preço Final:</span>
                  <span className="font-mono ml-2 text-green-600">
                    R$ {(parseFloat(basePrice) * 1.30).toFixed(0)}/m²
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Fórmula:</strong> Preço Final = Preço Base × Fator do Bairro. 
              Estes valores são utilizados pelo sistema de simulação inteligente para 
              calcular scores de viabilidade comercial em diferentes localizações.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Gestão de Multiplicadores por Bairro */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Multiplicadores por Bairro
            {marketStats && marketStats.discrepancias > 0 && (
              <Badge variant="destructive" className="ml-2">
                {marketStats.discrepancias} Discrepância(s)
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bairros.map((bairro) => {
              const precoCalculado = parseFloat(basePrice) * bairro.fator_imobiliario;
              const precoManual = bairro.preco_medio_m2;
              const hasDiscrepancy = precoManual > 0 && Math.abs(precoCalculado - precoManual) / precoCalculado > 0.15;
              
              return (
                <div key={bairro.id} className={`flex items-center justify-between p-4 border rounded-lg ${hasDiscrepancy ? 'border-orange-300 bg-orange-50' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {bairro.nome_bairro}
                        {hasDiscrepancy && (
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground space-x-3">
                        <span>Fator: {bairro.fator_imobiliario}x</span>
                        <span>Calculado: R$ {precoCalculado.toFixed(0)}</span>
                      </div>
                    </div>
                    <Badge variant={getCategoryColor(bairro.categoria)}>
                      {getCategoryLabel(bairro.categoria)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <Label htmlFor={`price-${bairro.id}`} className="text-sm">Preço Manual/m²</Label>
                      <Input
                        id={`price-${bairro.id}`}
                        type="number"
                        value={bairro.preco_medio_m2}
                        onChange={(e) => updateBairroPrice(bairro.id, bairro.nome_bairro, e.target.value)}
                        className="w-32"
                        min="0"
                        step="50"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Resultados do Teste */}
      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Resultados da Simulação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <div className="text-sm font-medium text-blue-800">
                  Preço Base: R$ {testResults.basePrice.toFixed(2)}/m²
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testResults.scenarios.map((scenario: any) => (
                  <div key={scenario.bairro} className="p-3 border rounded">
                    <div className="font-medium">{scenario.bairro}</div>
                    <div className="text-sm space-y-1 mt-2">
                      <div>Multiplicador: {scenario.calculation.multiplier.toFixed(2)}x</div>
                      <div>Preço Simulado: R$ {scenario.calculation.simulatedPrice.toFixed(2)}/m²</div>
                      <div className="font-medium text-primary">
                        Score Final: {scenario.calculation.scoreFactor.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
