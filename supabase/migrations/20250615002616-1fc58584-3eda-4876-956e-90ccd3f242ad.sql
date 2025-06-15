
-- Primeiro, vamos verificar e criar o enum se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_atendimento_enum') THEN
        CREATE TYPE status_atendimento_enum AS ENUM (
            'BOT_ATIVO', 
            'AGUARDANDO_NA_FILA', 
            'ATRIBUIDO_HUMANO', 
            'FINALIZADO'
        );
    END IF;
END $$;

-- Como a coluna status_atendimento é do tipo TEXT, vamos apenas atualizar a constraint
ALTER TABLE public.atendimentos 
DROP CONSTRAINT IF EXISTS atendimentos_status_atendimento_check;

ALTER TABLE public.atendimentos 
ADD CONSTRAINT atendimentos_status_atendimento_check 
CHECK (status_atendimento IN ('BOT_ATIVO', 'AGUARDANDO_NA_FILA', 'ATRIBUIDO_HUMANO', 'FINALIZADO'));

-- Habilitar notificações em tempo real para a tabela atendimentos
ALTER TABLE public.atendimentos REPLICA IDENTITY FULL;

-- Adicionar à publicação de realtime se ainda não estiver
DO $$
BEGIN
    -- Tentar adicionar a tabela à publicação, ignorando se já existir
    PERFORM pg_catalog.pg_publication_rel.prrelid 
    FROM pg_catalog.pg_publication_rel 
    JOIN pg_catalog.pg_class ON pg_class.oid = pg_publication_rel.prrelid 
    WHERE pg_class.relname = 'atendimentos';
    
    IF NOT FOUND THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.atendimentos;
    END IF;
EXCEPTION 
    WHEN duplicate_object THEN
        -- Tabela já está na publicação, ignorar
        NULL;
END $$;
