
-- Atualizar o usuário existente para ter role 'developer'
UPDATE auth.users 
SET raw_user_meta_data = 
  CASE 
    WHEN raw_user_meta_data IS NULL THEN 
      '{"role": "developer"}'::jsonb
    ELSE 
      raw_user_meta_data || '{"role": "developer"}'::jsonb
  END
WHERE email = 'dev@holdingterranova.com.br';
