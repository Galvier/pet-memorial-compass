
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

interface AnalysisRequest {
  type: 'single_neighborhood' | 'bulk_analysis' | 'validate_factors';
  bairro?: string;
  bairros?: Array<{
    nome_bairro: string;
    categoria: string;
    fator_atual: number;
    preco_medio_m2?: number;
  }>;
  basePrice?: number;
  context?: {
    proximidade_centro?: string;
    infraestrutura?: string;
    comercio_local?: string;
    transporte_publico?: string;
  };
}

interface AIAnalysisResult {
  bairro: string;
  fator_sugerido: number;
  confidence_score: number;
  reasoning: string;
  categoria_sugerida: 'alto' | 'medio' | 'padrao';
  justificativa_detalhada: string;
  pontos_fortes: string[];
  pontos_atencao: string[];
  comparacao_mercado: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: AnalysisRequest = await req.json();
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    let result;
    
    switch (requestData.type) {
      case 'single_neighborhood':
        result = await analyzeSingleNeighborhood(requestData);
        break;
      case 'bulk_analysis':
        result = await bulkAnalyzeNeighborhoods(requestData);
        break;
      case 'validate_factors':
        result = await validateExistingFactors(requestData);
        break;
      default:
        throw new Error('Invalid analysis type');
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in AI real estate analyzer:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function extractJsonFromResponse(text: string): any {
  // Remove markdown code blocks if present
  const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  
  // Try to find JSON object in the response
  const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error('Failed to parse extracted JSON:', e);
    }
  }
  
  // If no JSON found, try parsing the entire clean text
  try {
    return JSON.parse(cleanText.trim());
  } catch (e) {
    console.error('Failed to parse clean text as JSON:', e);
    throw new Error('Failed to parse AI response as JSON');
  }
}

async function analyzeSingleNeighborhood(request: AnalysisRequest): Promise<AIAnalysisResult> {
  const prompt = `
Você é um especialista em mercado imobiliário de Montes Claros, MG. Analise o bairro "${request.bairro}" e forneça uma análise detalhada para determinar o fator imobiliário.

CONTEXTO DO MERCADO:
- Preço base da cidade: R$ ${request.basePrice || 3500}/m²
- Sistema de fatores: 0.8x a 1.5x (sendo 1.0x = média da cidade)
- Categorias: Alto (1.2x-1.5x), Médio (1.0x-1.2x), Padrão (0.8x-1.0x)

INFORMAÇÕES DISPONÍVEIS:
${request.context ? Object.entries(request.context).map(([key, value]) => `- ${key}: ${value}`).join('\n') : '- Apenas o nome do bairro disponível'}

INSTRUÇÕES:
1. Analise as características do bairro em Montes Claros
2. Considere: localização, infraestrutura, valorização, demanda
3. Sugira um fator imobiliário preciso (ex: 1.25)
4. Classifique em uma categoria (alto/medio/padrao)
5. Forneça justificativa detalhada

RESPONDA APENAS COM JSON VÁLIDO (sem texto adicional antes ou depois):
{
  "fator_sugerido": 1.25,
  "confidence_score": 85,
  "categoria_sugerida": "alto",
  "reasoning": "Resumo executivo da análise",
  "justificativa_detalhada": "Análise completa dos critérios considerando localização, infraestrutura e demanda do mercado",
  "pontos_fortes": ["Ponto forte 1", "Ponto forte 2", "Ponto forte 3"],
  "pontos_atencao": ["Aspecto que requer atenção 1", "Aspecto que requer atenção 2"],
  "comparacao_mercado": "Como se compara com outros bairros de Montes Claros"
}

Seja preciso, objetivo e baseie-se em conhecimento real sobre Montes Claros.
`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em avaliação imobiliária de Montes Claros, MG. Responda SEMPRE em formato JSON válido, sem texto adicional.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const aiResponse = data.choices[0].message.content;
  
  console.log('Raw AI Response:', aiResponse);
  
  try {
    const analysisResult = extractJsonFromResponse(aiResponse);
    return {
      bairro: request.bairro!,
      ...analysisResult
    };
  } catch (parseError) {
    console.error('Parse error:', parseError);
    console.error('AI Response that failed to parse:', aiResponse);
    throw new Error('Failed to parse AI response as JSON');
  }
}

async function bulkAnalyzeNeighborhoods(request: AnalysisRequest): Promise<AIAnalysisResult[]> {
  const results: AIAnalysisResult[] = [];
  
  for (const bairro of request.bairros || []) {
    try {
      console.log(`Analyzing ${bairro.nome_bairro}...`);
      
      const singleRequest: AnalysisRequest = {
        type: 'single_neighborhood',
        bairro: bairro.nome_bairro,
        basePrice: request.basePrice,
        context: {
          categoria_atual: bairro.categoria,
          fator_atual: bairro.fator_atual.toString(),
          preco_medio: bairro.preco_medio_m2?.toString()
        }
      };
      
      const result = await analyzeSingleNeighborhood(singleRequest);
      results.push(result);
      
      // Pequeno delay para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`Error analyzing ${bairro.nome_bairro}:`, error);
      // Continuar com outros bairros mesmo se um falhar
    }
  }
  
  return results;
}

async function validateExistingFactors(request: AnalysisRequest): Promise<{
  discrepancias: Array<{
    bairro: string;
    fator_atual: number;
    fator_sugerido: number;
    confidence_score: number;
    justificativa: string;
    severidade: 'baixa' | 'media' | 'alta';
  }>;
  resumo: {
    total_analisados: number;
    discrepancias_encontradas: number;
    recomendacao_geral: string;
  };
}> {
  const prompt = `
Você é um auditor especialista em mercado imobiliário de Montes Claros, MG. Analise os fatores imobiliários atuais e identifique discrepâncias.

DADOS PARA ANÁLISE:
${JSON.stringify(request.bairros, null, 2)}

PREÇO BASE: R$ ${request.basePrice || 3500}/m²

INSTRUÇÕES:
1. Compare cada fator atual com o que seria apropriado
2. Identifique discrepâncias significativas (>15% de diferença)
3. Classifique severidade: baixa (<20%), média (20-30%), alta (>30%)
4. Forneça justificativas específicas

RESPONDA APENAS COM JSON VÁLIDO (sem texto adicional):
{
  "discrepancias": [
    {
      "bairro": "Nome do Bairro",
      "fator_atual": 1.20,
      "fator_sugerido": 1.35,
      "confidence_score": 90,
      "justificativa": "Explicação da discrepância baseada em características do bairro",
      "severidade": "media"
    }
  ],
  "resumo": {
    "total_analisados": 25,
    "discrepancias_encontradas": 3,
    "recomendacao_geral": "Análise geral do mercado e recomendações"
  }
}
`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Você é um auditor especialista em mercado imobiliário. Responda SEMPRE em formato JSON válido, sem texto adicional.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const aiResponse = data.choices[0].message.content;
  
  console.log('Raw Validation Response:', aiResponse);
  
  try {
    return extractJsonFromResponse(aiResponse);
  } catch (parseError) {
    console.error('Validation parse error:', parseError);
    console.error('Validation response that failed to parse:', aiResponse);
    throw new Error('Failed to parse AI validation response as JSON');
  }
}
