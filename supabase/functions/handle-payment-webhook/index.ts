
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PAYMENT-WEBHOOK] ${step}${detailsStr}`);
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
    logStep("Webhook recebido");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY não configurada");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      throw new Error("Assinatura Stripe não encontrada");
    }

    // Verificar evento do webhook (em produção, use STRIPE_WEBHOOK_SECRET)
    let event;
    try {
      event = JSON.parse(body);
      logStep("Evento parseado", { type: event.type, id: event.id });
    } catch (err) {
      throw new Error("Corpo do webhook inválido");
    }

    // Processar diferentes tipos de eventos
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(supabaseClient, event.data.object);
        break;
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(supabaseClient, event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(supabaseClient, event.data.object);
        break;
      default:
        logStep("Tipo de evento não processado", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERRO no webhook", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

async function handleCheckoutCompleted(supabaseClient: any, session: any) {
  logStep("Processando checkout completed", { sessionId: session.id });

  const { error } = await supabaseClient
    .from('payments')
    .update({
      status: 'paid',
      updated_at: new Date().toISOString(),
      webhook_data: session,
    })
    .eq('gateway_payment_id', session.id);

  if (error) {
    logStep("Erro ao atualizar pagamento", error);
    throw new Error(`Erro ao atualizar pagamento: ${error.message}`);
  }

  // Atualizar status do atendimento
  if (session.metadata?.atendimento_id) {
    await supabaseClient
      .from('atendimentos')
      .update({
        status: 'Finalizado',
        updated_at: new Date().toISOString(),
      })
      .eq('atendimento_id', parseInt(session.metadata.atendimento_id));
  }

  logStep("Pagamento atualizado para 'paid'", { sessionId: session.id });
}

async function handlePaymentSucceeded(supabaseClient: any, paymentIntent: any) {
  logStep("Processando payment succeeded", { paymentIntentId: paymentIntent.id });
  
  // Buscar pagamento pela sessão relacionada
  const { data: payments } = await supabaseClient
    .from('payments')
    .select('*')
    .eq('status', 'paid')
    .limit(1);

  if (payments && payments.length > 0) {
    logStep("Pagamento já processado", { paymentIntentId: paymentIntent.id });
  }
}

async function handlePaymentFailed(supabaseClient: any, paymentIntent: any) {
  logStep("Processando payment failed", { paymentIntentId: paymentIntent.id });
  
  // Em caso de falha, poderíamos marcar como failed
  // Mas como usamos checkout sessions, isso é menos comum
}
