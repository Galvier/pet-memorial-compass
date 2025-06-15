
-- Criar tabela para armazenar dados específicos dos bairros de Montes Claros
CREATE TABLE public.bairros_montes_claros (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_bairro TEXT NOT NULL UNIQUE,
  categoria TEXT NOT NULL CHECK (categoria IN ('alto', 'medio', 'padrao')),
  fator_imobiliario DECIMAL(4,2) DEFAULT 1.00,
  fator_comercial DECIMAL(4,2) DEFAULT 1.00,
  fator_atualizacao_calculado DECIMAL(4,2) DEFAULT 1.00,
  preco_medio_m2 DECIMAL(10,2),
  perfil_comercial TEXT,
  ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para melhor performance
CREATE INDEX idx_bairros_montes_claros_nome ON public.bairros_montes_claros(nome_bairro);
CREATE INDEX idx_bairros_montes_claros_categoria ON public.bairros_montes_claros(categoria);
CREATE INDEX idx_bairros_montes_claros_ativo ON public.bairros_montes_claros(ativo);

-- Habilitar RLS
ALTER TABLE public.bairros_montes_claros ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura geral
CREATE POLICY "Allow public read access to bairros_montes_claros" 
  ON public.bairros_montes_claros 
  FOR SELECT 
  USING (true);

-- Política para permitir escrita pelos serviços
CREATE POLICY "Allow service write access to bairros_montes_claros" 
  ON public.bairros_montes_claros 
  FOR ALL 
  USING (true);

-- Inserir dados iniciais dos bairros principais de Montes Claros
INSERT INTO public.bairros_montes_claros (nome_bairro, categoria, fator_imobiliario, fator_comercial, fator_atualizacao_calculado, preco_medio_m2, perfil_comercial) VALUES
-- Nível Alto
('Ibituruna', 'alto', 1.25, 1.20, 1.23, 4800.00, 'Premium'),
('Morada do Sol', 'alto', 1.22, 1.18, 1.20, 4600.00, 'Premium'),
('Augusta Mota', 'alto', 1.20, 1.15, 1.18, 4400.00, 'Premium'),

-- Nível Médio  
('Centro', 'medio', 1.15, 1.10, 1.13, 3800.00, 'Misto'),
('Todos os Santos', 'medio', 1.12, 1.08, 1.10, 3500.00, 'Misto'),
('Cândida Câmara', 'medio', 1.10, 1.05, 1.08, 3200.00, 'Misto'),

-- Nível Padrão
('Major Prates', 'padrao', 1.05, 1.02, 1.04, 2800.00, 'Local'),
('Maracanã', 'padrao', 1.03, 1.01, 1.02, 2600.00, 'Local'),
('Delfino Magalhães', 'padrao', 1.02, 1.00, 1.01, 2400.00, 'Local'),

-- Bairros adicionais
('São José', 'medio', 1.08, 1.06, 1.07, 3100.00, 'Misto'),
('Vila Oliveira', 'padrao', 1.04, 1.02, 1.03, 2700.00, 'Local'),
('Cintra', 'medio', 1.11, 1.07, 1.09, 3400.00, 'Misto'),
('Jaraguá', 'padrao', 1.03, 1.01, 1.02, 2500.00, 'Local'),
('Funcionários', 'medio', 1.13, 1.09, 1.11, 3600.00, 'Misto'),
('Vila Atlântida', 'padrao', 1.05, 1.03, 1.04, 2900.00, 'Local');

-- Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_bairros_montes_claros_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_bairros_montes_claros_updated_at
    BEFORE UPDATE ON public.bairros_montes_claros
    FOR EACH ROW
    EXECUTE FUNCTION update_bairros_montes_claros_updated_at();
