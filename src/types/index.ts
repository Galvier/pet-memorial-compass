
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

export interface Pet {
  pet_id: number;
  tutor_id: number;
  nome_pet: string;
  idade_pet: number;
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
  pet_id: number;
  data_inicio: string;
  status: 'Em andamento' | 'Sugestão enviada' | 'Finalizado';
  status_atendimento: 'BOT_ATIVO' | 'HUMANO_ASSUMIU' | 'FINALIZADO';
  tipo_atendimento: 'Imediato' | 'Preventivo';
  dados_coletados: any;
  sugestoes_geradas: any;
  tutor?: Tutor;
  pet?: Pet;
}

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
  preferencias: {
    quer_cinzas?: boolean;
    [key: string]: any;
  };
}

export interface RecomendacaoResponse {
  tipo_sugestao: string;
  sugestoes: {
    nome: string;
    descricao: string;
    preco?: string;
  }[];
}
