
-- Inserir os tutores corretos no banco Supabase que aparecem nos atendimentos
INSERT INTO tutores (nome_tutor, id_whatsapp, profissao, endereco, perfil_calculado) 
VALUES 
  ('Diego Suzano', '5538999998888', 'Empresário', 'Rua das Flores, 123, Centro, Montes Claros, MG', 'Luxo'),
  ('Maria Silva', '5538888887777', 'Professora', 'Av. Brasil, 456, Jardim, Montes Claros, MG', 'Intermediário')
ON CONFLICT (id_whatsapp) DO UPDATE SET
  nome_tutor = EXCLUDED.nome_tutor,
  profissao = EXCLUDED.profissao,
  endereco = EXCLUDED.endereco,
  perfil_calculado = EXCLUDED.perfil_calculado;

-- Remover dados antigos incorretos se existirem (endereços de São Paulo)
DELETE FROM tutores 
WHERE endereco LIKE '%São Paulo%' OR endereco LIKE '%SP%';
