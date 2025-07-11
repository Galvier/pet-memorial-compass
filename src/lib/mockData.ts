
import { Plano, ItemDeVenda, Tutor, Atendimento, Pet, Atendente } from '@/types';

export const mockPlanos: Plano[] = [
  {
    plano_id: 1,
    nome_plano: "Plano Bronze",
    preco_base: 299.00,
    descricao_curta: "Cremação Coletiva e acesso ao Clube de Benefícios.",
    perfil_indicado: "Padrão"
  },
  {
    plano_id: 2,
    nome_plano: "Plano Prata",
    preco_base: 599.00,
    descricao_curta: "Cremação Individual e acesso ao Clube de Benefícios.",
    perfil_indicado: "Intermediário"
  },
  {
    plano_id: 3,
    nome_plano: "Plano Ouro",
    preco_base: 899.00,
    descricao_curta: "Cremação Individual com uma urna superior inclusa.",
    perfil_indicado: "Luxo"
  }
];

export const mockItensDeVenda: ItemDeVenda[] = [
  {
    item_id: 1,
    nome_item: "Cremação Coletiva (Imediata)",
    nome: "Cremação Coletiva (Imediata)",
    descricao: "Serviço de cremação coletiva para atendimento imediato",
    preco: 400.00,
    categoria: "Cremação",
    perfil_indicado: "Padrão",
    perfil_afinidade: "Padrão"
  },
  {
    item_id: 2,
    nome_item: "Cremação Individual (Imediata)",
    nome: "Cremação Individual (Imediata)",
    descricao: "Serviço de cremação individual para atendimento imediato",
    preco: 800.00,
    categoria: "Cremação",
    perfil_indicado: "Intermediário",
    perfil_afinidade: "Intermediário"
  },
  {
    item_id: 3,
    nome_item: "Urna Padrão",
    nome: "Urna Padrão",
    descricao: "Urna de qualidade padrão para conservação das cinzas",
    preco: 150.00,
    categoria: "Urna",
    perfil_indicado: "Intermediário",
    perfil_afinidade: "Intermediário"
  },
  {
    item_id: 4,
    nome_item: "Urna Superior",
    nome: "Urna Superior",
    descricao: "Urna premium com acabamento superior",
    preco: 350.00,
    categoria: "Urna",
    perfil_indicado: "Luxo",
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

export const mockPets: Pet[] = [
  {
    pet_id: 1,
    tutor_id: 1,
    nome_pet: "Rex",
    idade_pet: 14
  },
  {
    pet_id: 2,
    tutor_id: 2,
    nome_pet: "Luna",
    idade_pet: 8
  }
];

export const mockAtendentes: Atendente[] = [
  {
    atendente_id: 1,
    nome_atendente: "Ana Paula",
    email: "ana.paula@terranovapet.com",
    whatsapp_atendente: "5538999991111",
    status_disponibilidade: "Online"
  },
  {
    atendente_id: 2,
    nome_atendente: "Carlos Santos",
    email: "carlos.santos@terranovapet.com",
    whatsapp_atendente: "5538999992222",
    status_disponibilidade: "Online"
  },
  {
    atendente_id: 3,
    nome_atendente: "Lucia Ferreira",
    email: "lucia.ferreira@terranovapet.com",
    whatsapp_atendente: "5538999993333",
    status_disponibilidade: "Offline"
  }
];

export const mockAtendimentos: Atendimento[] = [
  {
    atendimento_id: 1,
    tutor_id: 1,
    pet_id: 1,
    data_inicio: "2024-06-14T10:30:00",
    status: "Sugestão enviada",
    status_atendimento: "BOT_ATIVO",
    tipo_atendimento: "Imediato",
    dados_coletados: {
      preferencias: { quer_cinzas: true },
      tipo_pet: "Cão",
      idade_pet: 14
    },
    sugestoes_geradas: [
      { nome: "Pacote Homenagem Superior", descricao: "Inclui Cremação Individual e uma Urna Superior.", preco: "1150.00" }
    ],
    tutor: mockTutores[0],
    pet: mockPets[0]
  },
  {
    atendimento_id: 2,
    tutor_id: 2,
    pet_id: 2,
    data_inicio: "2024-06-13T14:15:00",
    status: "Finalizado",
    status_atendimento: "FINALIZADO",
    tipo_atendimento: "Preventivo",
    dados_coletados: {
      interesse: "planos_preventivos"
    },
    sugestoes_geradas: [
      { nome: "Plano Bronze", descricao: "Cremação Coletiva e acesso ao Clube de Benefícios." },
      { nome: "Plano Prata", descricao: "Cremação Individual e acesso ao Clube de Benefícios." },
      { nome: "Plano Ouro", descricao: "Cremação Individual com uma urna superior inclusa." }
    ],
    tutor: mockTutores[1],
    pet: mockPets[1]
  }
];
