
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-PAYMENT-STATUS] ${step}${detailsStr}`);
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
    const url = new URL(req.url);
    const paymentId = url.searchParams.get('payment_id');
    const atendimentoId = url.searchParams.get('atendimento_id');

    if (!paymentId && !atendimentoId) {
      throw new Error("payment_id ou atendimento_id são obrigatórios");
    }

    logStep("Verificando status do pagamento", { paymentId, atendimentoId });

    let query = supabaseClient.from('payments').select('*');
    
    if (paymentId) {
      query = query.eq('id', paymentId);
    } else {
      query = query.eq('atendimento_id', parseInt(atendimentoId!));
    }

    const { data: payment, error } = await query.single();

    if (error || !payment) {
      throw new Error("Pagamento não encontrado");
    }

    logStep("Status do pagamento encontrado", { 
      paymentId: payment.id, 
      status: payment.status,
      amount: payment.amount 
    });

    return new Response(JSON.stringify({
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      payment_link: payment.payment_link,
      created_at: payment.created_at,
      updated_at: payment.updated_at,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERRO", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
