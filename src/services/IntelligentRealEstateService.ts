
import { SettingsService } from './SettingsService';
import { BairrosMontesService } from './BairrosMontesService';

export interface RealEstateCalculation {
  bairro: string;
  basePrice: number;
  multiplier: number;
  simulatedPrice: number;
  scoreFactor: number;
  source: 'intelligent_simulation';
  timestamp: string;
}

/**
 * Serviço de Simulação Inteligente de Mercado Imobiliário
 * Substitui o web scraping por cálculos baseados em dados configuráveis
 */
export class IntelligentRealEstateService {
  /**
   * Calcula o score imobiliário usando simulação inteligente
   */
  static async getRealEstateScore(bairro: string): Promise<number> {
    try {
      console.log(`🏠 Calculando score imobiliário inteligente para: ${bairro}`);

      // Passo 1: Buscar o preço base do m² nas configurações
      const basePrice = await SettingsService.getBasePriceMOC();
      console.log(`📊 Preço base do m²: R$ ${basePrice}`);

      // Passo 2: Buscar dados do bairro (incluindo multiplicadores)
      const bairroData = await BairrosMontesService.getBairroDataNormalized(bairro);
      
      let multiplier = 1.0;
      let simulatedPrice = basePrice;

      if (bairroData) {
        // Se tem dados específicos do bairro, usar o preço médio se disponível
        if (bairroData.preco_medio_m2 && bairroData.preco_medio_m2 > 0) {
          simulatedPrice = bairroData.preco_medio_m2;
          multiplier = simulatedPrice / basePrice;
        } else {
          // Usar fator imobiliário como multiplicador
          multiplier = bairroData.fator_imobiliario;
          simulatedPrice = basePrice * multiplier;
        }
        
        console.log(`✅ Dados do bairro encontrados - Multiplicador: ${multiplier}x`);
      } else {
        console.log(`⚠️ Bairro ${bairro} não encontrado, usando valores padrão`);
      }

      // Passo 3: Calcular o fator de pontuação baseado no preço simulado
      const scoreFactor = this.calculateScoreFactor(simulatedPrice);

      console.log(`📈 Score calculado para ${bairro}: ${scoreFactor} (Preço: R$ ${simulatedPrice.toFixed(2)}/m²)`);

      // Passo 4: Atualizar timestamp de análise de mercado (se necessário)
      if (bairroData) {
        await this.updateMarketAnalysisTimestamp(bairro);
      }

      return scoreFactor;
    } catch (error) {
      console.error(`❌ Erro no cálculo de score para ${bairro}:`, error);
      return 1.0; // Retorna fator neutro em caso de erro
    }
  }

  /**
   * Converte preço do m² em fator de pontuação
   */
  private static calculateScoreFactor(pricePerM2: number): number {
    if (pricePerM2 >= 4500) return 1.25;      // Alto padrão
    if (pricePerM2 >= 4000) return 1.20;      // Médio-alto+
    if (pricePerM2 >= 3500) return 1.15;      // Médio-alto
    if (pricePerM2 >= 3000) return 1.10;      // Médio
    if (pricePerM2 >= 2500) return 1.05;      // Médio-baixo
    return 1.00;                              // Padrão
  }

  /**
   * Obtém cálculo detalhado para análise
   */
  static async getDetailedCalculation(bairro: string): Promise<RealEstateCalculation> {
    const basePrice = await SettingsService.getBasePriceMOC();
    const bairroData = await BairrosMontesService.getBairroDataNormalized(bairro);
    
    let multiplier = 1.0;
    let simulatedPrice = basePrice;

    if (bairroData?.preco_medio_m2 && bairroData.preco_medio_m2 > 0) {
      simulatedPrice = bairroData.preco_medio_m2;
      multiplier = simulatedPrice / basePrice;
    } else if (bairroData?.fator_imobiliario) {
      multiplier = bairroData.fator_imobiliario;
      simulatedPrice = basePrice * multiplier;
    }

    return {
      bairro,
      basePrice,
      multiplier,
      simulatedPrice,
      scoreFactor: this.calculateScoreFactor(simulatedPrice),
      source: 'intelligent_simulation',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Atualiza timestamp da última análise de mercado
   */
  private static async updateMarketAnalysisTimestamp(bairro: string): Promise<void> {
    try {
      await BairrosMontesService.updateBairroData(bairro, {
        // Não atualizamos outros dados, apenas o timestamp
      });
    } catch (error) {
      console.warn(`Erro ao atualizar timestamp para ${bairro}:`, error);
    }
  }

  /**
   * Testa o sistema de simulação com diferentes cenários
   */
  static async runSimulationTest(): Promise<{
    basePrice: number;
    scenarios: Array<{
      bairro: string;
      calculation: RealEstateCalculation;
    }>;
  }> {
    const basePrice = await SettingsService.getBasePriceMOC();
    const testBairros = ['Centro', 'Ibituruna', 'Major Prates', 'Morada do Sol'];
    
    const scenarios = await Promise.all(
      testBairros.map(async (bairro) => ({
        bairro,
        calculation: await this.getDetailedCalculation(bairro)
      }))
    );

    return { basePrice, scenarios };
  }
}
