
import { Plano, ItemDeVenda, Tutor, Atendimento } from '@/types';

export const mockPlanos: Plano[] = [
  {
    plano_id: 1,
    nome_plano: "Plano Bronze",
    descricao_curta: "Cremação Coletiva e acesso ao Clube de Benefícios."
  },
  {
    plano_id: 2,
    nome_plano: "Plano Prata", 
    descricao_curta: "Cremação Individual e acesso ao Clube de Benefícios."
  },
  {
    plano_id: 3,
    nome_plano: "Plano Ouro",
    descricao_curta: "Cremação Individual com uma urna superior inclusa."
  }
];

export const mockItensDeVenda: ItemDeVenda[] = [
  {
    item_id: 1,
    nome: "Cremação Coletiva (Imediata)",
    descricao: "Serviço de cremação coletiva para atendimento imediato",
    preco: 400.00,
    categoria: "Cremação",
    perfil_afinidade: "Padrão"
  },
  {
    item_id: 2,
    nome: "Cremação Individual (Imediata)",
    descricao: "Serviço de cremação individual para atendimento imediato",
    preco: 800.00,
    categoria: "Cremação",
    perfil_afinidade: "Intermediário"
  },
  {
    item_id: 3,
    nome: "Urna Padrão",
    descricao: "Urna de qualidade padrão para conservação das cinzas",
    preco: 150.00,
    categoria: "Urna",
    perfil_afinidade: "Intermediário"
  },
  {
    item_id: 4,
    nome: "Urna Superior",
    descricao: "Urna premium com acabamento superior",
    preco: 350.00,
    categoria: "Urna",
    perfil_afinidade: "Luxo"
  }
];

export const mockTutores: Tutor[] = [
  {
    tutor_id: 1,
    id_whatsapp: "5538999998888",
    nome_tutor: "Diego Suzano",
    profissao: "Empresário",
    endereco: "Rua das Flores, 123, Centro, Montes Claros, MG",
    perfil_calculado: "Luxo"
  },
  {
    tutor_id: 2,
    id_whatsapp: "5538888887777",
    nome_tutor: "Maria Silva",
    profissao: "Professora",
    endereco: "Av. Brasil, 456, Jardim, Montes Claros, MG",
    perfil_calculado: "Intermediário"
  }
];

export const mockAtendimentos: Atendimento[] = [
  {
    atendimento_id: 1,
    tutor_id: 1,
    data_inicio: "2024-06-14T10:30:00",
    status: "Sugestão enviada",
    tipo_atendimento: "Imediato",
    dados_coletados: {
      preferencias: ["quer_cinzas", "urna_em_casa"],
      tipo_pet: "Cão",
      idade_pet: "12 anos"
    },
    sugestoes_geradas: [
      { nome: "Pacote Homenagem Superior", descricao: "Inclui Cremação Individual e uma Urna Superior." }
    ],
    tutor: mockTutores[0]
  },
  {
    atendimento_id: 2,
    tutor_id: 2,
    data_inicio: "2024-06-13T14:15:00",
    status: "Finalizado",
    tipo_atendimento: "Preventivo",
    dados_coletados: {
      interesse: "planos_preventivos"
    },
    sugestoes_geradas: [
      { nome: "Plano Bronze", descricao: "Cremação Coletiva e acesso ao Clube de Benefícios." },
      { nome: "Plano Prata", descricao: "Cremação Individual e acesso ao Clube de Benefícios." },
      { nome: "Plano Ouro", descricao: "Cremação Individual com uma urna superior inclusa." }
    ],
    tutor: mockTutores[1]
  }
];
