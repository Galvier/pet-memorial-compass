
export interface Plano {
  plano_id: number;
  nome_plano: string;
  descricao_curta: string;
}

export interface ItemDeVenda {
  item_id: number;
  nome: string;
  descricao: string;
  preco: number;
  categoria: 'Cremação' | 'Urna' | 'Acessório' | 'Cerimônia';
  perfil_afinidade: 'Padrão' | 'Intermediário' | 'Luxo';
}

export interface Tutor {
  tutor_id: number;
  id_whatsapp: string;
  nome_tutor: string;
  profissao: string;
  endereco: string;
  perfil_calculado: 'Padrão' | 'Intermediário' | 'Luxo';
}

export interface Atendimento {
  atendimento_id: number;
  tutor_id: number;
  data_inicio: string;
  status: 'Em andamento' | 'Sugestão enviada' | 'Finalizado';
  tipo_atendimento: 'Imediato' | 'Preventivo';
  dados_coletados: any;
  sugestoes_geradas: any;
  tutor?: Tutor;
}

export interface RecomendacaoRequest {
  id_whatsapp: string;
  nome_tutor: string;
  profissao: string;
  endereco: string;
  tipo_atendimento: 'Imediato' | 'Preventivo';
  preferencias: string[];
}

export interface RecomendacaoResponse {
  tipo_sugestao: string;
  sugestoes: {
    nome: string;
    descricao: string;
    preco?: string;
  }[];
}
