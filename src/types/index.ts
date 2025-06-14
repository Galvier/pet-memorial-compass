
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
  status_atendimento: 'BOT_ATIVO' | 'ATRIBUIDO_HUMANO' | 'FINALIZADO';
  tipo_atendimento: 'Imediato' | 'Preventivo';
  dados_coletados?: any;
  sugestoes_geradas?: any;
  tutor?: Tutor;
  pet?: Pet;
}

export interface UserProfile {
  id: string;
  email: string;
  role: 'atendente' | 'admin' | 'cliente';
  nome: string;
}
