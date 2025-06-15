
-- Criar tabela para registrar todas as transações de pagamento
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  atendimento_id INTEGER REFERENCES public.atendimentos(atendimento_id) ON DELETE CASCADE,
  gateway_payment_id TEXT, -- ID da transação no gateway (Stripe)
  status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, failed, cancelled
  amount INTEGER NOT NULL, -- Valor em centavos
  currency TEXT NOT NULL DEFAULT 'BRL',
  payment_link TEXT, -- URL do link de pagamento
  gateway_type TEXT NOT NULL DEFAULT 'stripe',
  items JSONB, -- Produtos/serviços incluídos no pagamento
  customer_info JSONB, -- Informações do cliente
  webhook_data JSONB, -- Dados recebidos do webhook
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Política para atendentes visualizarem apenas pagamentos dos seus atendimentos
CREATE POLICY "atendentes_view_own_payments" ON public.payments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.atendimentos a
    INNER JOIN public.atendentes at ON a.atendente_responsavel_id = at.atendente_id
    WHERE a.atendimento_id = payments.atendimento_id
    AND at.user_id = auth.uid()
  )
);

-- Política para admins visualizarem todos os pagamentos
CREATE POLICY "admins_view_all_payments" ON public.payments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.uid() = users.id
    AND users.raw_user_meta_data->>'role' = 'admin'
  )
);

-- Política para edge functions inserirem/atualizarem pagamentos
CREATE POLICY "edge_functions_manage_payments" ON public.payments
FOR ALL
USING (true);

-- Adicionar índices para performance
CREATE INDEX idx_payments_atendimento_id ON public.payments(atendimento_id);
CREATE INDEX idx_payments_gateway_payment_id ON public.payments(gateway_payment_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_created_at ON public.payments(created_at);

-- Adicionar campo payment_id na tabela atendimentos para relacionamento
ALTER TABLE public.atendimentos 
ADD COLUMN payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL;
