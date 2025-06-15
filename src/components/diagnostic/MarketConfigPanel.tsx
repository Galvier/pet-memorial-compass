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
  Info
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

export const MarketConfigPanel: React.FC = () => {
  const [basePrice, setBasePrice] = useState<string>('3500');
  const [bairros, setBairros] = useState<BairroMultiplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadMarketConfig();
  }, []);

  const loadMarketConfig = async () => {
    setLoading(true);
    try {
      // Carregar preço base
      const currentBasePrice = await SettingsService.getBasePriceMOC();
      setBasePrice(currentBasePrice.toString());

      // Carregar bairros
      const bairrosList = await BairrosMontesService.listAllBairros();
      setBairros(bairrosList.map(b => ({
        id: b.id,
        nome_bairro: b.nome_bairro,
        fator_imobiliario: b.fator_imobiliario,
        preco_medio_m2: b.preco_medio_m2 || 0,
        categoria: b.categoria
      })));

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
        setBairros(prev => prev.map(b => 
          b.id === bairroId ? { ...b, preco_medio_m2: price } : b
        ));
        
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

  const getCategoryColor = (categoria: string) => {
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

      {/* Como Funciona - Nova Seção */}
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
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bairros.map((bairro) => (
              <div key={bairro.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="font-medium">{bairro.nome_bairro}</div>
                    <div className="text-sm text-muted-foreground">
                      Fator: {bairro.fator_imobiliario}x
                    </div>
                  </div>
                  <Badge variant={getCategoryColor(bairro.categoria)}>
                    {bairro.categoria}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <Label htmlFor={`price-${bairro.id}`} className="text-sm">Preço/m²</Label>
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
            ))}
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
