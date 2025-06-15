
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calculator, TrendingUp, AlertTriangle, Building2 } from 'lucide-react';

interface ExplanationProps {
  basePrice?: number;
  bairro?: string;
  fator?: number;
  categoria?: string;
  precoCalculado?: number;
  precoManual?: number;
}

export const CalculatedPriceExplanation: React.FC<ExplanationProps> = ({ 
  basePrice = 3500, 
  fator = 1.3, 
  bairro = "Exemplo" 
}) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      <Calculator className="h-5 w-5 text-blue-600" />
      <h3 className="font-medium">Como Calculamos o Preço</h3>
    </div>
    
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
      <div className="font-mono text-lg text-center">
        <div className="text-blue-800">Preço Final = Preço Base × Fator do Bairro</div>
        <Separator className="my-3" />
        <div className="text-green-700">
          R$ {(basePrice * fator).toFixed(0)} = R$ {basePrice} × {fator}
        </div>
      </div>
    </div>

    <div className="space-y-3">
      <div>
        <strong>Preço Base (R$ {basePrice}):</strong>
        <p className="text-sm text-muted-foreground mt-1">
          Valor de referência do metro quadrado para toda Montes Claros. Este é o preço médio 
          usado como base para todos os cálculos da cidade.
        </p>
      </div>
      
      <div>
        <strong>Fator do Bairro ({fator}x):</strong>
        <p className="text-sm text-muted-foreground mt-1">
          Multiplicador que reflete a valorização imobiliária específica do bairro {bairro}. 
          Valores acima de 1.0 indicam bairros mais valorizados que a média.
        </p>
      </div>
      
      <div>
        <strong>Resultado (R$ {(basePrice * fator).toFixed(0)}):</strong>
        <p className="text-sm text-muted-foreground mt-1">
          Este valor é usado pelo sistema de simulação inteligente para calcular scores 
          de viabilidade comercial e fazer recomendações de investimento.
        </p>
      </div>
    </div>
  </div>
);

export const FactorExplanation: React.FC<ExplanationProps> = ({ 
  fator = 1.3, 
  categoria = "alto", 
  bairro = "Exemplo" 
}) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      <TrendingUp className="h-5 w-5 text-green-600" />
      <h3 className="font-medium">De Onde Vem o Fator Imobiliário</h3>
    </div>

    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
      <div className="text-center">
        <div className="text-lg font-medium text-green-800">
          Fator {fator}x para {bairro}
        </div>
        <Badge variant={categoria === 'alto' ? 'default' : categoria === 'medio' ? 'secondary' : 'outline'} className="mt-2">
          {categoria === 'alto' ? 'Alto Padrão' : categoria === 'medio' ? 'Médio Padrão' : 'Padrão'}
        </Badge>
      </div>
    </div>

    <div className="space-y-3">
      <div>
        <strong>Análise de Mercado:</strong>
        <p className="text-sm text-muted-foreground mt-1">
          O fator é determinado através da análise de diversos indicadores: localização, 
          infraestrutura, valorização histórica, e demanda do mercado imobiliário.
        </p>
      </div>
      
      <div>
        <strong>Categorização:</strong>
        <div className="text-sm text-muted-foreground mt-1 space-y-1">
          <div>• <strong>Alto Padrão (1.2x - 1.5x):</strong> Bairros nobres, boa infraestrutura</div>
          <div>• <strong>Médio Padrão (1.0x - 1.2x):</strong> Bairros consolidados, infraestrutura adequada</div>
          <div>• <strong>Padrão (0.8x - 1.0x):</strong> Bairros em desenvolvimento, preços acessíveis</div>
        </div>
      </div>
      
      <div>
        <strong>Impacto nas Simulações:</strong>
        <p className="text-sm text-muted-foreground mt-1">
          Fatores mais altos indicam maior potencial de valorização, afetando diretamente 
          os scores de recomendação do sistema inteligente.
        </p>
      </div>
    </div>
  </div>
);

export const DiscrepancyExplanation: React.FC<ExplanationProps> = ({ 
  precoCalculado = 4550, 
  precoManual = 5200, 
  bairro = "Exemplo" 
}) => {
  const diferenca = Math.abs(precoCalculado - precoManual);
  const percentual = ((diferenca / precoCalculado) * 100).toFixed(1);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-orange-600" />
        <h3 className="font-medium">Por Que Existe Esta Discrepância?</h3>
      </div>

      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
        <div className="text-center space-y-2">
          <div className="text-orange-800">
            <div>Calculado: <span className="font-mono">R$ {precoCalculado}</span></div>
            <div>Manual: <span className="font-mono">R$ {precoManual}</span></div>
            <div className="font-medium">Diferença: {percentual}%</div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <strong>Preço Calculado:</strong>
          <p className="text-sm text-muted-foreground mt-1">
            Valor obtido multiplicando o preço base pelo fator do bairro. 
            Representa o preço teórico baseado na fórmula padrão.
          </p>
        </div>
        
        <div>
          <strong>Preço Manual:</strong>
          <p className="text-sm text-muted-foreground mt-1">
            Valor inserido manualmente, geralmente baseado em pesquisa de mercado específica, 
            lançamentos recentes ou condições particulares do bairro.
          </p>
        </div>
        
        <div>
          <strong>Quando é Normal:</strong>
          <div className="text-sm text-muted-foreground mt-1 space-y-1">
            <div>• Diferenças até 15% são consideradas normais</div>
            <div>• Refletem nuances específicas do mercado local</div>
            <div>• Podem indicar tendências de valorização recentes</div>
          </div>
        </div>
        
        <div>
          <strong>Quando Revisar:</strong>
          <div className="text-sm text-muted-foreground mt-1 space-y-1">
            <div>• Diferenças acima de 15% merecem atenção</div>
            <div>• Podem indicar desatualização dos dados</div>
            <div>• Considere usar a ferramenta de recálculo se necessário</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CategoryExplanation: React.FC<{ categoria: string }> = ({ categoria }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      <Building2 className="h-5 w-5 text-purple-600" />
      <h3 className="font-medium">Sistema de Categorização</h3>
    </div>

    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className={`p-3 rounded-lg border ${categoria === 'alto' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
          <Badge variant="default" className="mb-2">Alto Padrão</Badge>
          <div className="text-sm space-y-1">
            <div>Fator: 1.2x - 1.5x</div>
            <div>Características: Bairros nobres, excelente infraestrutura</div>
          </div>
        </div>
        
        <div className={`p-3 rounded-lg border ${categoria === 'medio' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
          <Badge variant="secondary" className="mb-2">Médio Padrão</Badge>
          <div className="text-sm space-y-1">
            <div>Fator: 1.0x - 1.2x</div>
            <div>Características: Bairros consolidados, boa infraestrutura</div>
          </div>
        </div>
        
        <div className={`p-3 rounded-lg border ${categoria === 'padrao' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
          <Badge variant="outline" className="mb-2">Padrão</Badge>
          <div className="text-sm space-y-1">
            <div>Fator: 0.8x - 1.0x</div>
            <div>Características: Bairros em desenvolvimento</div>
          </div>
        </div>
      </div>
      
      <div>
        <strong>Como é Determinada:</strong>
        <div className="text-sm text-muted-foreground mt-1 space-y-1">
          <div>• <strong>Infraestrutura:</strong> Qualidade de ruas, saneamento, energia</div>
          <div>• <strong>Localização:</strong> Proximidade ao centro, comércio, serviços</div>
          <div>• <strong>Valorização:</strong> Histórico de crescimento imobiliário</div>
          <div>• <strong>Demanda:</strong> Procura por imóveis na região</div>
        </div>
      </div>
    </div>
  </div>
);
