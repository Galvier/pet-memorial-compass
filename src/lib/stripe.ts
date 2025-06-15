
// Configuração do Stripe para o frontend
export const STRIPE_PUBLISHABLE_KEY = "pk_test_51Ra3XZFVT4cfSfcdThYv13ixvO1byAzQtu2322C38A2uq8xVWd6U0jc7EpHDjD3rbNh0ln5A4I18Ukb2dulSzCKd00mgQJ90oA";

// Para futuras implementações do Stripe.js no frontend
export const stripeConfig = {
  publishableKey: STRIPE_PUBLISHABLE_KEY,
  currency: 'brl',
  country: 'BR'
};
