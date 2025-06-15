
-- Habilitar RLS em todas as tabelas (caso ainda não estejam habilitadas)
ALTER TABLE public.atendentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atendimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Atendentes podem ver seus próprios dados" ON public.atendentes;
DROP POLICY IF EXISTS "Atendentes podem atualizar seus próprios dados" ON public.atendentes;
DROP POLICY IF EXISTS "Atendentes autenticados podem ver tutores" ON public.tutores;
DROP POLICY IF EXISTS "Atendentes autenticados podem ver pets" ON public.pets;
DROP POLICY IF EXISTS "Atendentes podem ver todos os atendimentos" ON public.atendimentos;
DROP POLICY IF EXISTS "Atendentes podem atualizar atendimentos atribuídos a eles" ON public.atendimentos;
DROP POLICY IF EXISTS "atendentes_view_own_payments" ON public.payments;
DROP POLICY IF EXISTS "admins_view_all_payments" ON public.payments;
DROP POLICY IF EXISTS "edge_functions_manage_payments" ON public.payments;

-- POLÍTICAS PARA ATENDENTES
-- Atendentes podem ver e atualizar seus próprios dados
CREATE POLICY "atendentes_own_profile" ON public.atendentes
FOR ALL USING (user_id = auth.uid());

-- Admins podem ver todos os atendentes
CREATE POLICY "admins_view_all_atendentes" ON public.atendentes
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.uid() = users.id
    AND users.raw_user_meta_data->>'role' IN ('admin', 'developer')
  )
);

-- POLÍTICAS PARA TUTORES
-- Atendentes autenticados podem ver e gerenciar tutores
CREATE POLICY "authenticated_users_manage_tutores" ON public.tutores
FOR ALL TO authenticated USING (true);

-- POLÍTICAS PARA PETS
-- Atendentes autenticados podem ver e gerenciar pets
CREATE POLICY "authenticated_users_manage_pets" ON public.pets
FOR ALL TO authenticated USING (true);

-- POLÍTICAS PARA ATENDIMENTOS
-- Atendentes podem ver todos os atendimentos
CREATE POLICY "atendentes_view_all_atendimentos" ON public.atendimentos
FOR SELECT TO authenticated USING (true);

-- Atendentes podem inserir novos atendimentos
CREATE POLICY "atendentes_insert_atendimentos" ON public.atendimentos
FOR INSERT TO authenticated WITH CHECK (true);

-- Atendentes podem atualizar atendimentos que estão atribuídos a eles
CREATE POLICY "atendentes_update_own_atendimentos" ON public.atendimentos
FOR UPDATE TO authenticated USING (
  atendente_responsavel_id IN (
    SELECT atendente_id FROM public.atendentes WHERE user_id = auth.uid()
  )
);

-- Admins podem atualizar qualquer atendimento
CREATE POLICY "admins_update_all_atendimentos" ON public.atendimentos
FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.uid() = users.id
    AND users.raw_user_meta_data->>'role' IN ('admin', 'developer')
  )
);

-- POLÍTICAS PARA PAYMENTS
-- Atendentes podem ver pagamentos dos seus atendimentos
CREATE POLICY "atendentes_view_own_payments" ON public.payments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.atendimentos a
    INNER JOIN public.atendentes at ON a.atendente_responsavel_id = at.atendente_id
    WHERE a.atendimento_id = payments.atendimento_id
    AND at.user_id = auth.uid()
  )
);

-- Admins podem ver todos os pagamentos
CREATE POLICY "admins_view_all_payments" ON public.payments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.uid() = users.id
    AND users.raw_user_meta_data->>'role' IN ('admin', 'developer')
  )
);

-- Edge functions podem gerenciar pagamentos (usando service role)
CREATE POLICY "service_role_manage_payments" ON public.payments
FOR ALL USING (auth.role() = 'service_role');

-- Atendentes autenticados podem inserir pagamentos
CREATE POLICY "authenticated_insert_payments" ON public.payments
FOR INSERT TO authenticated WITH CHECK (true);

-- Atendentes podem atualizar pagamentos dos seus atendimentos
CREATE POLICY "atendentes_update_own_payments" ON public.payments
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.atendimentos a
    INNER JOIN public.atendentes at ON a.atendente_responsavel_id = at.atendente_id
    WHERE a.atendimento_id = payments.atendimento_id
    AND at.user_id = auth.uid()
  )
);

-- Admins podem atualizar qualquer pagamento
CREATE POLICY "admins_update_all_payments" ON public.payments
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.uid() = users.id
    AND users.raw_user_meta_data->>'role' IN ('admin', 'developer')
  )
);
