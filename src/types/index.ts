export interface Tutor {
  tutor_id: number;
  id_whatsapp: string;
  nome_tutor: string;
  profissao?: string;
  endereco?: string;
  perfil_calculado: 'Padrão' | 'Intermediário' | 'Luxo';
}

export interface Pet {
  pet_id: number;
  tutor_id: number;
  nome_pet: string;
  idade_pet?: number;
}

export interface Atendente {
  atendente_id: number;
  user_id?: string;
  nome_atendente: string;
  email: string;
  whatsapp_atendente: string;
  status_disponibilidade: 'Online' | 'Offline';
}

export interface Atendimento {
  atendimento_id: number;
  tutor_id: number;
  pet_id: number;
  atendente_responsavel_id?: number;
  data_inicio: string;
  status: 'Em andamento' | 'Sugestão enviada' | 'Finalizado';
  status_atendimento: 'BOT_ATIVO' | 'AGUARDANDO_NA_FILA' | 'ATRIBUIDO_HUMANO' | 'FINALIZADO';
  tipo_atendimento: 'Imediato' | 'Preventivo';
  dados_coletados?: any;
  sugestoes_geradas?: any;
  tutor?: Tutor;
  pet?: Pet;
  atendente?: Atendente;
}

export interface UserProfile {
  id: string;
  email: string;
  role: 'atendente' | 'admin' | 'cliente' | 'developer';
  nome: string;
}

// Tipos para Planos
export interface Plano {
  plano_id: number;
  nome_plano: string;
  preco_base: number;
  descricao?: string;
  descricao_curta: string;
  perfil_indicado: 'Padrão' | 'Intermediário' | 'Luxo';
}

// Tipos para Itens de Venda
export interface ItemDeVenda {
  item_id: number;
  nome_item: string;
  nome: string; // Alias para compatibilidade
  preco: number;
  descricao?: string;
  categoria: string;
  perfil_indicado: 'Padrão' | 'Intermediário' | 'Luxo';
  perfil_afinidade: 'Padrão' | 'Intermediário' | 'Luxo'; // Alias para compatibilidade
}

// Tipos para requisições de recomendação
export interface RecomendacaoRequest {
  id_whatsapp: string;
  nome_tutor: string;
  tipo_atendimento: 'Imediato' | 'Preventivo';
  pet: {
    nome: string;
    idade: number;
  };
  tutor: {
    profissao: string;
    endereco: string;
  };
  preferencias?: any;
  dadosColetados?: any;
  perfilTutor?: 'Padrão' | 'Intermediário' | 'Luxo';
}

export interface RecomendacaoResponse {
  tipo_sugestao?: string;
  sugestoes: any[];
  planos?: Plano[];
  itens?: ItemDeVenda[];
  justificativa?: string;
}

export interface AtribuirAtendimentoRequest {
  atendimentoId: number;
  atendenteId: number;
  atendente_id: number; // Alias para compatibilidade
}

export interface StatusAtendimentoResponse {
  status: 'BOT_ATIVO' | 'AGUARDANDO_NA_FILA' | 'ATRIBUIDO_HUMANO' | 'FINALIZADO';
  atendente?: Atendente;
}

// Novos tipos para análise IBGE
export interface LocationAnalysis {
  address: string;
  coordinates: { lat: number; lng: number } | null;
  sectorData: {
    id: string;
    name: string;
    municipio: string;
    uf: string;
  } | null;
  incomeData: {
    averageIncome: number;
    populationCount: number;
    dataYear: number;
  } | null;
  score: number;
  scoreReason: string;
  analysisDate: string;
  success: boolean;
}

export interface PerfilAnalysis {
  profissionScore: number;
  profissionReason: string;
  localizacaoScore: number;
  localizacaoAnalysis: LocationAnalysis;
  totalScore: number;
  perfilCalculado: 'Padrão' | 'Intermediário' | 'Luxo';
  calculationDate: string;
}

export interface IBGESectorData {
  id: string;
  name: string;
  municipio: string;
  uf: string;
}

export interface IBGEIncomeData {
  sectorId: string;
  averageIncome: number;
  populationCount: number;
  dataYear: number;
}

// Atualizar interface Tutor para incluir análise detalhada
export interface TutorEnhanced extends Tutor {
  perfilAnalysis?: PerfilAnalysis;
}

// Atualizar interface Atendimento para incluir análise detalhada
export interface AtendimentoEnhanced extends Atendimento {
  tutor?: TutorEnhanced;
}
