
export interface Produto {
  produto_id: number;
  nome_produto: string;
  descricao: string;
  preco: number;
  categoria: 'Urna' | 'Cerimônia' | 'Acessório' | 'Pacote';
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
  dados_coletados: any;
  sugestoes_geradas: any;
  tutor?: Tutor;
}

export interface RecomendacaoRequest {
  id_whatsapp: string;
  nome_tutor: string;
  profissao: string;
  endereco: string;
  preferencias: string[];
}

export interface RecomendacaoResponse {
  sugestoes: {
    nome_produto: string;
    descricao: string;
    preco: string;
  }[];
}
