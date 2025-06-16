
-- Criar tabela de configurações globais do sistema
CREATE TABLE public.settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir configuração base do preço do m² para Montes Claros
INSERT INTO public.settings (key, value, description, category) VALUES 
('BASE_M2_PRICE_MOC', '3500', 'Preço base do metro quadrado em Montes Claros (R$)', 'real_estate');

-- Adicionar campos extras à tabela de bairros para melhor controle
ALTER TABLE public.bairros_montes_claros 
ADD COLUMN IF NOT EXISTS base_price_override NUMERIC,
ADD COLUMN IF NOT EXISTS market_analysis_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_market_update TIMESTAMP WITH TIME ZONE;

-- Atualizar alguns bairros com dados mais realistas baseados no mercado
UPDATE public.bairros_montes_claros SET 
  fator_imobiliario = 1.30,
  fator_comercial = 1.25,
  fator_atualizacao_calculado = 1.28,
  preco_medio_m2 = 4800,
  categoria = 'alto'
WHERE nome_bairro ILIKE 'ibituruna';

UPDATE public.bairros_montes_claros SET 
  fator_imobiliario = 1.25,
  fator_comercial = 1.20,
  fator_atualizacao_calculado = 1.23,
  preco_medio_m2 = 4600,
  categoria = 'alto'
WHERE nome_bairro ILIKE 'morada do sol';

UPDATE public.bairros_montes_claros SET 
  fator_imobiliario = 1.15,
  fator_comercial = 1.10,
  fator_atualizacao_calculado = 1.13,
  preco_medio_m2 = 3800,
  categoria = 'medio'
WHERE nome_bairro ILIKE 'centro';

UPDATE public.bairros_montes_claros SET 
  fator_imobiliario = 1.05,
  fator_comercial = 1.00,
  fator_atualizacao_calculado = 1.03,
  preco_medio_m2 = 2800,
  categoria = 'padrao'
WHERE nome_bairro ILIKE 'major prates';

-- Criar trigger para atualizar o campo updated_at na tabela settings
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_settings_updated_at_trigger
    BEFORE UPDATE ON public.settings
    FOR EACH ROW
    EXECUTE FUNCTION update_settings_updated_at();

-- Habilitar RLS na tabela settings (apenas admins/desenvolvedores podem modificar)
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Política para leitura (todos podem ler configurações)
CREATE POLICY "Allow read access to settings" ON public.settings
FOR SELECT USING (true);

-- Política para escrita (apenas usuários autenticados podem modificar)
CREATE POLICY "Allow write access to authenticated users" ON public.settings
FOR ALL USING (auth.uid() IS NOT NULL);
