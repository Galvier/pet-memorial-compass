
import { Produto, Tutor, Atendimento } from '@/types';

export const mockProdutos: Produto[] = [
  {
    produto_id: 1,
    nome_produto: "Urna Biodegradável Luxo",
    descricao: "Uma urna elegante feita com materiais biodegradáveis para uma despedida especial e sustentável.",
    preco: 1200.00,
    categoria: "Urna",
    perfil_afinidade: "Luxo"
  },
  {
    produto_id: 2,
    nome_produto: "Cerimônia de Despedida ao Pôr do Sol",
    descricao: "Uma homenagem emocionante em um local tranquilo com vista para o horizonte.",
    preco: 1800.00,
    categoria: "Cerimônia",
    perfil_afinidade: "Luxo"
  },
  {
    produto_id: 3,
    nome_produto: "Urna de Madeira Clássica",
    descricao: "Urna tradicional em madeira nobre, com acabamento refinado.",
    preco: 800.00,
    categoria: "Urna",
    perfil_afinidade: "Intermediário"
  },
  {
    produto_id: 4,
    nome_produto: "Memorial Simples",
    descricao: "Cerimônia de despedida simples e digna para seu pet querido.",
    preco: 400.00,
    categoria: "Cerimônia",
    perfil_afinidade: "Padrão"
  },
  {
    produto_id: 5,
    nome_produto: "Pacote Completo Premium",
    descricao: "Pacote completo incluindo urna, cerimônia e acessórios especiais.",
    preco: 2500.00,
    categoria: "Pacote",
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
    dados_coletados: {
      preferencias: ["quer_cinzas", "urna_em_casa"],
      tipo_pet: "Cão",
      idade_pet: "12 anos"
    },
    sugestoes_geradas: [
      { nome_produto: "Urna Biodegradável Luxo", preco: "1200.00" },
      { nome_produto: "Cerimônia de Despedida ao Pôr do Sol", preco: "1800.00" }
    ],
    tutor: mockTutores[0]
  },
  {
    atendimento_id: 2,
    tutor_id: 2,
    data_inicio: "2024-06-13T14:15:00",
    status: "Finalizado",
    dados_coletados: {
      preferencias: ["memorial_simples"],
      tipo_pet: "Gato",
      idade_pet: "8 anos"
    },
    sugestoes_geradas: [
      { nome_produto: "Urna de Madeira Clássica", preco: "800.00" },
      { nome_produto: "Memorial Simples", preco: "400.00" }
    ],
    tutor: mockTutores[1]
  }
];
