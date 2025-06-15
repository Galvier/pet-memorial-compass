
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { secretName, testType } = await req.json();
    
    const secretValue = Deno.env.get(secretName);
    if (!secretValue) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: `Secret ${secretName} não encontrada` 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    let result = { success: false, message: 'Teste não implementado' };

    switch (testType) {
      case 'stripe':
        result = await testStripe(secretValue);
        break;
      case 'google-maps':
        result = await testGoogleMaps(secretValue);
        break;
      case 'n8n-webhook':
        result = await testN8nWebhook(secretValue);
        break;
      default:
        result = { success: false, message: `Tipo de teste desconhecido: ${testType}` };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false,
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function testStripe(secretKey: string) {
  try {
    const stripe = new Stripe(secretKey, { apiVersion: "2023-10-16" });
    
    // Testar listando produtos para verificar se a chave é válida
    await stripe.products.list({ limit: 1 });
    
    return { success: true, message: 'Conexão com Stripe OK' };
  } catch (error) {
    return { 
      success: false, 
      message: `Erro Stripe: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
    };
  }
}

async function testGoogleMaps(apiKey: string) {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=Montes+Claros+MG&key=${apiKey}`
    );
    
    if (!response.ok) {
      return { success: false, message: `Erro HTTP: ${response.status}` };
    }
    
    const result = await response.json();
    
    if (result.status === 'OK') {
      return { success: true, message: 'Google Maps API funcionando' };
    } else {
      return { success: false, message: `Google Maps erro: ${result.status}` };
    }
  } catch (error) {
    return { 
      success: false, 
      message: `Erro de conexão: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
    };
  }
}

async function testN8nWebhook(webhookUrl: string) {
  try {
    // Validar formato da URL
    const url = new URL(webhookUrl);
    if (!url.protocol.startsWith('http')) {
      return { success: false, message: 'URL deve usar protocolo HTTP ou HTTPS' };
    }

    // Payload de teste
    const testPayload = {
      to: "5511999999999",
      text: "🧪 Teste de conectividade do webhook n8n - Pet Memorial",
      test: true,
      timestamp: new Date().toISOString()
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });

    if (response.ok) {
      return { 
        success: true, 
        message: `Webhook n8n respondeu: ${response.status}` 
      };
    } else {
      return { 
        success: false, 
        message: `Webhook retornou erro: ${response.status} - ${response.statusText}` 
      };
    }
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('Invalid URL')) {
      return { success: false, message: 'URL inválida' };
    }
    return { 
      success: false, 
      message: `Erro de conexão: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
    };
  }
}
