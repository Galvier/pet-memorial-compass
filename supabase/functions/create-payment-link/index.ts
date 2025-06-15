
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  atendimentoId: number;
  items: Array<{
    nome: string;
    preco: number;
    descricao?: string;
    quantidade?: number;
  }>;
  customerInfo: {
    nome: string;
    whatsapp: string;
  };
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-PAYMENT-LINK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Iniciando criação de link de pagamento");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY não configurada");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Header de autorização não fornecido");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Erro de autenticação: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("Usuário não autenticado");

    const { atendimentoId, items, customerInfo }: PaymentRequest = await req.json();
    logStep("Dados recebidos", { atendimentoId, itemsCount: items.length });

    // Verificar se o atendimento existe e se o usuário tem acesso
    const { data: atendimento, error: atendimentoError } = await supabaseClient
      .from('atendimentos')
      .select(`
        *,
        atendentes!inner(user_id)
      `)
      .eq('atendimento_id', atendimentoId)
      .single();

    if (atendimentoError || !atendimento) {
      throw new Error("Atendimento não encontrado");
    }

    // Verificar se o usuário é admin ou responsável pelo atendimento
    const isAdmin = user.user_metadata?.role === 'admin';
    const isResponsible = atendimento.atendentes.user_id === user.id;
    
    if (!isAdmin && !isResponsible) {
      throw new Error("Usuário não tem permissão para criar pagamento para este atendimento");
    }

    logStep("Atendimento verificado", { atendimentoId, isAdmin, isResponsible });

    // Calcular valor total
    const totalAmount = items.reduce((total, item) => {
      const quantidade = item.quantidade || 1;
      return total + (item.preco * quantidade);
    }, 0);

    logStep("Valor total calculado", { totalAmount });

    // Inicializar Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Criar linha de itens para o Stripe
    const lineItems = items.map(item => ({
      price_data: {
        currency: "brl",
        product_data: {
          name: item.nome,
          description: item.descricao || '',
        },
        unit_amount: Math.round(item.preco * 100), // Converter para centavos
      },
      quantity: item.quantidade || 1,
    }));

    const origin = req.headers.get("origin") || "https://mhksmiryxulaotegdfvb.supabase.co";
    
    // Criar sessão de checkout do Stripe
    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/payment-cancelled`,
      metadata: {
        atendimento_id: atendimentoId.toString(),
        customer_whatsapp: customerInfo.whatsapp,
      },
      customer_email: user.email,
    });

    logStep("Sessão Stripe criada", { sessionId: session.id, url: session.url });

    // Salvar pagamento no banco de dados
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payments')
      .insert({
        atendimento_id: atendimentoId,
        gateway_payment_id: session.id,
        status: 'pending',
        amount: Math.round(totalAmount * 100), // Em centavos
        currency: 'BRL',
        payment_link: session.url,
        gateway_type: 'stripe',
        items: items,
        customer_info: customerInfo,
      })
      .select()
      .single();

    if (paymentError) {
      logStep("Erro ao salvar pagamento", paymentError);
      throw new Error(`Erro ao salvar pagamento: ${paymentError.message}`);
    }

    // Atualizar atendimento com referência ao pagamento
    await supabaseClient
      .from('atendimentos')
      .update({ payment_id: payment.id })
      .eq('atendimento_id', atendimentoId);

    logStep("Pagamento salvo com sucesso", { paymentId: payment.id });

    return new Response(JSON.stringify({
      success: true,
      payment_link: session.url,
      payment_id: payment.id,
      session_id: session.id,
      amount: totalAmount,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERRO", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
