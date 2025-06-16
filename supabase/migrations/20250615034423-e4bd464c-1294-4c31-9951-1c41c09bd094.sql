
-- Criar tabela de cache geográfico para armazenar resultados de análises
CREATE TABLE public.geocache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  location_key TEXT NOT NULL UNIQUE,
  municipio_id TEXT,
  municipio_nome TEXT,
  uf TEXT,
  score INTEGER NOT NULL,
  renda_media DECIMAL(10,2),
  source TEXT NOT NULL CHECK (source IN ('IBGE', 'CACHE', 'ESTIMATIVA', 'FALLBACK')),
  last_checked TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para melhor performance
CREATE INDEX idx_geocache_location_key ON public.geocache(location_key);
CREATE INDEX idx_geocache_municipio_id ON public.geocache(municipio_id);
CREATE INDEX idx_geocache_source ON public.geocache(source);
CREATE INDEX idx_geocache_last_checked ON public.geocache(last_checked);

-- Habilitar RLS para permitir acesso público aos dados de cache
ALTER TABLE public.geocache ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura geral dos dados de cache
CREATE POLICY "Allow public read access to geocache" 
  ON public.geocache 
  FOR SELECT 
  USING (true);

-- Política para permitir inserção/atualização pelos serviços
CREATE POLICY "Allow service write access to geocache" 
  ON public.geocache 
  FOR ALL 
  USING (true);

-- Criar tabela para estimativas de cidades conhecidas
CREATE TABLE public.city_estimates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city_name TEXT NOT NULL,
  state_code TEXT NOT NULL,
  estimated_income DECIMAL(10,2) NOT NULL,
  score INTEGER NOT NULL,
  population_range TEXT,
  region TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(city_name, state_code)
);

-- Índices para a tabela de estimativas
CREATE INDEX idx_city_estimates_city_state ON public.city_estimates(city_name, state_code);
CREATE INDEX idx_city_estimates_region ON public.city_estimates(region);

-- RLS para estimativas de cidades
ALTER TABLE public.city_estimates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to city estimates" 
  ON public.city_estimates 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow service write access to city estimates" 
  ON public.city_estimates 
  FOR ALL 
  USING (true);

-- Inserir algumas estimativas iniciais para cidades conhecidas
INSERT INTO public.city_estimates (city_name, state_code, estimated_income, score, population_range, region) VALUES
('Belo Horizonte', 'MG', 3500.00, 40, 'Grande', 'Sudeste'),
('Montes Claros', 'MG', 2200.00, 30, 'Média', 'Sudeste'),
('Uberlândia', 'MG', 3200.00, 38, 'Grande', 'Sudeste'),
('Contagem', 'MG', 2800.00, 35, 'Grande', 'Sudeste'),
('Juiz de Fora', 'MG', 2900.00, 36, 'Média', 'Sudeste'),
('Betim', 'MG', 2600.00, 33, 'Média', 'Sudeste'),
('São Paulo', 'SP', 4500.00, 45, 'Metrópole', 'Sudeste'),
('Rio de Janeiro', 'RJ', 4200.00, 43, 'Metrópole', 'Sudeste'),
('Brasília', 'DF', 5000.00, 48, 'Grande', 'Centro-Oeste'),
('Salvador', 'BA', 2500.00, 32, 'Grande', 'Nordeste'),
('Fortaleza', 'CE', 2300.00, 31, 'Grande', 'Nordeste'),
('Recife', 'PE', 2600.00, 33, 'Grande', 'Nordeste'),
('Porto Alegre', 'RS', 3800.00, 42, 'Grande', 'Sul'),
('Curitiba', 'PR', 3600.00, 41, 'Grande', 'Sul'),
('Florianópolis', 'SC', 3900.00, 42, 'Média', 'Sul'),
('Goiânia', 'GO', 2800.00, 35, 'Grande', 'Centro-Oeste'),
('Manaus', 'AM', 2400.00, 32, 'Grande', 'Norte'),
('Belém', 'PA', 2200.00, 30, 'Grande', 'Norte');
