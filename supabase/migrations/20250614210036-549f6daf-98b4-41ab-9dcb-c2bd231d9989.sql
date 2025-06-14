
-- Criar tabela de atendentes
CREATE TABLE public.atendentes (
  atendente_id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_atendente TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  whatsapp_atendente TEXT,
  status_disponibilidade TEXT DEFAULT 'Offline' CHECK (status_disponibilidade IN ('Online', 'Offline')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de tutores
CREATE TABLE public.tutores (
  tutor_id SERIAL PRIMARY KEY,
  id_whatsapp TEXT UNIQUE NOT NULL,
  nome_tutor TEXT NOT NULL,
  profissao TEXT,
  endereco TEXT,
  perfil_calculado TEXT DEFAULT 'Padrão' CHECK (perfil_calculado IN ('Padrão', 'Intermediário', 'Luxo')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de pets
CREATE TABLE public.pets (
  pet_id SERIAL PRIMARY KEY,
  tutor_id INTEGER REFERENCES public.tutores(tutor_id) ON DELETE CASCADE,
  nome_pet TEXT NOT NULL,
  idade_pet INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de atendimentos
CREATE TABLE public.atendimentos (
  atendimento_id SERIAL PRIMARY KEY,
  tutor_id INTEGER REFERENCES public.tutores(tutor_id) ON DELETE CASCADE,
  pet_id INTEGER REFERENCES public.pets(pet_id) ON DELETE CASCADE,
  atendente_responsavel_id INTEGER REFERENCES public.atendentes(atendente_id) ON DELETE SET NULL,
  data_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'Em andamento' CHECK (status IN ('Em andamento', 'Sugestão enviada', 'Finalizado')),
  status_atendimento TEXT DEFAULT 'BOT_ATIVO' CHECK (status_atendimento IN ('BOT_ATIVO', 'ATRIBUIDO_HUMANO', 'FINALIZADO')),
  tipo_atendimento TEXT DEFAULT 'Imediato' CHECK (tipo_atendimento IN ('Imediato', 'Preventivo')),
  dados_coletados JSONB,
  sugestoes_geradas JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.atendentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atendimentos ENABLE ROW LEVEL SECURITY;

-- Políticas para atendentes
CREATE POLICY "Atendentes podem ver seus próprios dados" 
  ON public.atendentes 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Atendentes podem atualizar seus próprios dados" 
  ON public.atendentes 
  FOR UPDATE 
  USING (user_id = auth.uid());

-- Políticas para tutores (visível para atendentes autenticados)
CREATE POLICY "Atendentes autenticados podem ver tutores" 
  ON public.tutores 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Políticas para pets (visível para atendentes autenticados)
CREATE POLICY "Atendentes autenticados podem ver pets" 
  ON public.pets 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Políticas para atendimentos
CREATE POLICY "Atendentes podem ver todos os atendimentos" 
  ON public.atendimentos 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Atendentes podem atualizar atendimentos atribuídos a eles" 
  ON public.atendimentos 
  FOR UPDATE 
  TO authenticated 
  USING (
    atendente_responsavel_id IN (
      SELECT atendente_id FROM public.atendentes WHERE user_id = auth.uid()
    )
  );

-- Inserir alguns dados de exemplo
INSERT INTO public.tutores (id_whatsapp, nome_tutor, profissao, endereco, perfil_calculado) VALUES
('5511987654321', 'Maria Silva', 'Veterinária', 'Rua das Flores, 123 - São Paulo, SP', 'Intermediário'),
('5511876543210', 'João Santos', 'Engenheiro', 'Av. Paulista, 456 - São Paulo, SP', 'Luxo'),
('5511765432109', 'Ana Costa', 'Professora', 'Rua da Escola, 789 - São Paulo, SP', 'Padrão');

INSERT INTO public.pets (tutor_id, nome_pet, idade_pet) VALUES
(1, 'Luna', 3),
(2, 'Max', 5),
(3, 'Bella', 2);

INSERT INTO public.atendimentos (tutor_id, pet_id, status, status_atendimento, tipo_atendimento, dados_coletados, sugestoes_geradas) VALUES
(1, 1, 'Em andamento', 'ATRIBUIDO_HUMANO', 'Imediato', '{"sintomas": "Perda de apetite", "urgencia": "alta"}', '[{"nome": "Cremação Premium", "preco": "800", "descricao": "Serviço completo de cremação"}]'),
(2, 2, 'Sugestão enviada', 'ATRIBUIDO_HUMANO', 'Preventivo', '{"sintomas": "Checkup anual", "urgencia": "baixa"}', '[{"nome": "Urna Personalizada", "preco": "450", "descricao": "Urna em madeira nobre"}]'),
(3, 3, 'Finalizado', 'FINALIZADO', 'Imediato', '{"sintomas": "Idade avançada", "urgencia": "média"}', '[{"nome": "Cerimônia Memorial", "preco": "600", "descricao": "Cerimônia de despedida"}]');

-- Função para criar perfil de atendente automaticamente após signup
CREATE OR REPLACE FUNCTION public.handle_new_attendant_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.atendentes (user_id, nome_atendente, email, status_disponibilidade)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome_atendente', 'Atendente'),
    NEW.email,
    'Online'
  );
  RETURN NEW;
END;
$$;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created_attendant
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_attendant_user();
