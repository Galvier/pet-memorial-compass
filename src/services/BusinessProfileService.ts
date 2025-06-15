
export interface BusinessData {
  cep: string;
  empresas: number;
  cnaesPremium: number;
  cnaesComerciais: number;
  cnaesLocais: number;
  score: number;
  multiplier: number;
  category: 'Premium' | 'Misto' | 'Local';
  lastUpdated: string;
}

export interface CompanyData {
  cnae: string;
  atividade: string;
  categoria: 'premium' | 'comercial' | 'local';
  peso: number;
}

/**
 * Serviço para análise do perfil comercial baseado em CNAEs
 * Integra com BrasilAPI e analisa o perfil de negócios da região
 */
export class BusinessProfileService {
  private static readonly CACHE_KEY_PREFIX = 'business_';
  private static readonly CACHE_TTL_HOURS = 48;

  /**
   * Obtém dados do perfil comercial para um CEP
   */
  static async getBusinessProfile(cep: string): Promise<BusinessData> {
    console.log(`🏢 Analisando perfil comercial do CEP: ${cep}`);

    // Verificar cache primeiro
    const cachedData = this.getCachedData(cep);
    if (cachedData) {
      console.log(`📦 Perfil comercial do CEP ${cep} obtido do cache`);
      return cachedData;
    }

    // Simular consulta à BrasilAPI (em produção seria real)
    const companies = await this.simulateBrasilAPIQuery(cep);
    const analysis = this.analyzeCompanies(companies);

    const businessData: BusinessData = {
      cep,
      empresas: companies.length,
      cnaesPremium: analysis.premium,
      cnaesComerciais: analysis.comercial,
      cnaesLocais: analysis.local,
      score: analysis.score,
      multiplier: analysis.multiplier,
      category: analysis.category,
      lastUpdated: new Date().toISOString()
    };

    // Salvar no cache
    this.setCachedData(cep, businessData);

    console.log(`✅ Análise comercial concluída para CEP ${cep}: ${analysis.category} (multiplicador: ${analysis.multiplier}x)`);
    return businessData;
  }

  /**
   * Simula consulta à BrasilAPI (substituiria chamada real)
   */
  private static async simulateBrasilAPIQuery(cep: string): Promise<CompanyData[]> {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 800));

    // Gerar dados simulados baseados no perfil real de Montes Claros
    const companies: CompanyData[] = [];
    const numCompanies = 15 + Math.floor(Math.random() * 25); // 15-40 empresas

    // CNAEs Premium (Saúde, Advocacia, Consultoria, etc.)
    const premiumCNAEs = [
      { cnae: '8630-5/01', atividade: 'Atividade médica ambulatorial com recursos para realização de procedimentos cirúrgicos', peso: 3 },
      { cnae: '6911-2/01', atividade: 'Serviços advocatícios', peso: 2.5 },
      { cnae: '7020-4/00', atividade: 'Atividades de consultoria em gestão empresarial', peso: 2.5 },
      { cnae: '8630-5/02', atividade: 'Atividade médica ambulatorial com recursos para realização de exames complementares', peso: 2.8 },
      { cnae: '7490-1/99', atividade: 'Outras atividades profissionais, científicas e técnicas', peso: 2.2 }
    ];

    // CNAEs Comerciais (Comércio, Serviços Gerais)
    const comercialCNAEs = [
      { cnae: '4711-3/02', atividade: 'Supermercados', peso: 1.5 },
      { cnae: '4712-1/00', atividade: 'Comércio varejista de mercadorias em geral', peso: 1.3 },
      { cnae: '9602-5/01', atividade: 'Cabeleireiros', peso: 1.2 },
      { cnae: '5611-2/01', atividade: 'Restaurantes e similares', peso: 1.4 },
      { cnae: '4761-0/01', atividade: 'Comércio varejista de livros', peso: 1.3 }
    ];

    // CNAEs Locais (Serviços básicos, pequeno comércio)
    const localCNAEs = [
      { cnae: '9511-8/00', atividade: 'Reparação e manutenção de computadores e de equipamentos periféricos', peso: 1.0 },
      { cnae: '4789-0/99', atividade: 'Comércio varejista de outros produtos', peso: 0.8 },
      { cnae: '8121-4/00', atividade: 'Limpeza em prédios e em domicílios', peso: 0.9 },
      { cnae: '4520-0/01', atividade: 'Serviços de manutenção e reparação mecânica de veículos automotores', peso: 1.0 },
      { cnae: '5620-1/04', atividade: 'Fornecimento de alimentos preparados preponderantemente para consumo domiciliar', peso: 0.9 }
    ];

    // Distribuir empresas por categoria baseado no perfil da região
    const profileWeight = this.getCEPProfileWeight(cep);
    
    for (let i = 0; i < numCompanies; i++) {
      let selectedCNAE: any;
      let category: 'premium' | 'comercial' | 'local';

      const rand = Math.random();
      if (rand < profileWeight.premium) {
        selectedCNAE = premiumCNAEs[Math.floor(Math.random() * premiumCNAEs.length)];
        category = 'premium';
      } else if (rand < profileWeight.premium + profileWeight.comercial) {
        selectedCNAE = comercialCNAEs[Math.floor(Math.random() * comercialCNAEs.length)];
        category = 'comercial';
      } else {
        selectedCNAE = localCNAEs[Math.floor(Math.random() * localCNAEs.length)];
        category = 'local';
      }

      companies.push({
        cnae: selectedCNAE.cnae,
        atividade: selectedCNAE.atividade,
        categoria: category,
        peso: selectedCNAE.peso
      });
    }

    return companies;
  }

  /**
   * Define perfil esperado por CEP (baseado nos bairros de Montes Claros)
   */
  private static getCEPProfileWeight(cep: string): { premium: number; comercial: number; local: number } {
    // CEPs de bairros nobres (mais CNAEs premium)
    if (cep.startsWith('394') && ['01', '02', '03', '15', '16'].some(suffix => cep.includes(suffix))) {
      return { premium: 0.4, comercial: 0.35, local: 0.25 }; // Ibituruna, Morada do Sol, etc.
    }
    
    // CEPs do centro e bairros médios
    if (cep.startsWith('394') && ['00', '10', '11', '12'].some(suffix => cep.includes(suffix))) {
      return { premium: 0.25, comercial: 0.45, local: 0.30 }; // Centro, Todos os Santos, etc.
    }
    
    // CEPs de bairros periféricos
    return { premium: 0.1, comercial: 0.35, local: 0.55 }; // Major Prates, etc.
  }

  /**
   * Analisa a composição das empresas e calcula score
   */
  private static analyzeCompanies(companies: CompanyData[]): {
    premium: number;
    comercial: number; 
    local: number;
    score: number;
    multiplier: number;
    category: 'Premium' | 'Misto' | 'Local';
  } {
    const premium = companies.filter(c => c.categoria === 'premium').length;
    const comercial = companies.filter(c => c.categoria === 'comercial').length;
    const local = companies.filter(c => c.categoria === 'local').length;

    // Calcular score ponderado
    const totalWeight = companies.reduce((sum, company) => sum + company.peso, 0);
    const avgWeight = totalWeight / companies.length;

    // Determinar categoria e multiplicador
    let category: 'Premium' | 'Misto' | 'Local';
    let multiplier: number;

    const premiumRatio = premium / companies.length;
    
    if (premiumRatio >= 0.3 && avgWeight >= 2.0) {
      category = 'Premium';
      multiplier = 1.15 + (premiumRatio * 0.2); // 1.15 - 1.35
    } else if (premiumRatio >= 0.15 && avgWeight >= 1.3) {
      category = 'Misto';
      multiplier = 1.05 + (premiumRatio * 0.15); // 1.05 - 1.20
    } else {
      category = 'Local';
      multiplier = 1.00 + (avgWeight - 1.0) * 0.05; // 1.00 - 1.05
    }

    // Garantir limites
    multiplier = Math.max(1.00, Math.min(1.35, multiplier));
    multiplier = Math.round(multiplier * 100) / 100; // 2 casas decimais

    return {
      premium,
      comercial,
      local,
      score: Math.round(avgWeight * 100),
      multiplier,
      category
    };
  }

  /**
   * Cache management
   */
  private static getCacheKey(cep: string): string {
    return `${this.CACHE_KEY_PREFIX}${cep.replace(/\D/g, '')}`;
  }

  private static getCachedData(cep: string): BusinessData | null {
    try {
      const cacheKey = this.getCacheKey(cep);
      const cached = localStorage.getItem(cacheKey);
      
      if (!cached) return null;

      const data = JSON.parse(cached) as BusinessData;
      const cacheAge = Date.now() - new Date(data.lastUpdated).getTime();
      const maxAge = this.CACHE_TTL_HOURS * 60 * 60 * 1000;

      if (cacheAge > maxAge) {
        localStorage.removeItem(cacheKey);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Erro ao ler cache de dados comerciais:', error);
      return null;
    }
  }

  private static setCachedData(cep: string, data: BusinessData): void {
    try {
      const cacheKey = this.getCacheKey(cep);
      localStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Erro ao salvar cache de dados comerciais:', error);
    }
  }

  /**
   * Limpa cache antigo
   */
  static clearOldCache(): { cleared: number } {
    let cleared = 0;
    
    try {
      const keys = Object.keys(localStorage);
      const businessKeys = keys.filter(key => key.startsWith(this.CACHE_KEY_PREFIX));
      
      const maxAge = this.CACHE_TTL_HOURS * 60 * 60 * 1000;
      
      for (const key of businessKeys) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          const cacheAge = Date.now() - new Date(data.lastUpdated).getTime();
          
          if (cacheAge > maxAge) {
            localStorage.removeItem(key);
            cleared++;
          }
        } catch {
          localStorage.removeItem(key);
          cleared++;
        }
      }
    } catch (error) {
      console.warn('Erro ao limpar cache:', error);
    }

    return { cleared };
  }
}
