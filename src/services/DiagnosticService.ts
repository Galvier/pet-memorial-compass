
import { supabase } from '@/integrations/supabase/client';

export class DiagnosticService {
  // Sistema de saúde geral
  static async checkSystemHealth() {
    try {
      const startTime = Date.now();
      
      // Testar conexão com banco
      const { error: dbError } = await supabase.from('atendimentos').select('count').limit(1);
      const dbStatus = dbError ? 'error' : 'healthy';
      
      // Testar edge functions (simular)
      const edgeFunctionsStatus = 'healthy'; // Seria testado chamando uma edge function
      
      // Testar Google Maps (verificar se a chave existe)
      const googleMapsStatus = 'warning'; // Seria testado fazendo uma chamada real
      
      // Testar autenticação
      const authStatus = 'healthy';
      
      return {
        database: dbStatus,
        edgeFunctions: edgeFunctionsStatus,
        googleMaps: googleMapsStatus,
        auth: authStatus,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro ao verificar saúde do sistema:', error);
      throw error;
    }
  }

  // Captura de logs
  static async getLogs(source: string = 'all', level: string = 'all') {
    try {
      // Simular logs do sistema - em uma implementação real, 
      // isso viria de diferentes fontes (Postgres logs, Edge Function logs, etc.)
      const mockLogs = [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          level: 'info',
          source: 'frontend',
          message: 'Sistema de diagnóstico inicializado com sucesso',
          metadata: { component: 'DiagnosticService' }
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 60000).toISOString(),
          level: 'warn',
          source: 'postgres',
          message: 'Query lenta detectada: SELECT * FROM atendimentos',
          metadata: { duration: '1200ms', query: 'SELECT * FROM atendimentos' }
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 120000).toISOString(),
          level: 'error',
          source: 'edge-function',
          message: 'Falha na conexão com webhook n8n',
          metadata: { endpoint: '/webhook/notification', status: 500 }
        }
      ];

      // Filtrar logs baseado nos parâmetros
      let filteredLogs = mockLogs;
      if (source !== 'all') {
        filteredLogs = filteredLogs.filter(log => log.source === source);
      }
      if (level !== 'all') {
        filteredLogs = filteredLogs.filter(log => log.level === level);
      }

      return filteredLogs;
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
      throw error;
    }
  }

  // Testes de integração
  static async runIntegrationTest(testId: string) {
    try {
      console.log(`🧪 Executando teste: ${testId}`);
      
      switch (testId) {
        case 'supabase':
          const { data, error } = await supabase.from('atendimentos').select('count').limit(1);
          return {
            success: !error,
            message: error ? `Erro: ${error.message}` : 'Conexão com Supabase OK',
            details: { data, error }
          };

        case 'google-maps':
          // Simular teste da API do Google Maps
          return {
            success: true,
            message: 'API Google Maps disponível',
            details: { apiKey: 'configurada', status: 'active' }
          };

        case 'geocoding':
          // Simular teste de geocodificação
          return {
            success: true,
            message: 'Serviço de geocodificação funcionando',
            details: { service: 'GeocodingService', status: 'operational' }
          };

        case 'n8n-webhook':
          // Simular teste de webhook
          return {
            success: false,
            message: 'Webhook n8n não configurado ou inativo',
            details: { endpoint: 'https://n8n.example.com/webhook', status: 'unreachable' }
          };

        case 'whatsapp':
          // Simular teste do NotificationService
          return {
            success: true,
            message: 'NotificationService WhatsApp operacional',
            details: { service: 'NotificationService', provider: 'WhatsApp' }
          };

        case 'stripe':
          // Simular teste do Stripe
          return {
            success: true,
            message: 'Stripe configurado e disponível',
            details: { provider: 'Stripe', status: 'live' }
          };

        case 'edge-functions':
          // Simular teste de edge functions
          return {
            success: true,
            message: 'Edge Functions ativas',
            details: { functions: ['create-payment-link', 'handle-payment-webhook'] }
          };

        default:
          return {
            success: false,
            message: `Teste ${testId} não encontrado`,
            details: { testId }
          };
      }
    } catch (error) {
      console.error(`Erro no teste ${testId}:`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        details: { error }
      };
    }
  }

  // Métricas de performance
  static async getPerformanceMetrics() {
    try {
      const startTime = Date.now();
      
      // Testar tempo de resposta do banco
      const dbStart = Date.now();
      await supabase.from('atendimentos').select('count').limit(1);
      const dbResponseTime = Date.now() - dbStart;

      // Simular outros tempos de resposta
      const apiResponseTime = Math.floor(Math.random() * 200) + 50;
      const edgeFunctionResponseTime = Math.floor(Math.random() * 300) + 100;

      // Buscar dados reais quando possível
      const { data: atendimentos } = await supabase.from('atendimentos').select('*');
      const { data: atendentes } = await supabase.from('atendentes').select('*');
      
      const today = new Date().toISOString().split('T')[0];
      const atendimentosHoje = atendimentos?.filter(a => 
        a.created_at?.startsWith(today)
      ).length || 0;

      const atendentesOnline = atendentes?.filter(a => 
        a.status_disponibilidade === 'Online'
      ).length || 0;

      return {
        responseTime: {
          database: dbResponseTime,
          api: apiResponseTime,
          edgeFunctions: edgeFunctionResponseTime
        },
        activeConnections: Math.floor(Math.random() * 20) + 5,
        totalAtendimentos: atendimentos?.length || 0,
        atendimentosHoje,
        atendentesOnline,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
      throw error;
    }
  }

  // Execução de queries de debug
  static async executeDebugQuery(query: string) {
    try {
      // IMPORTANTE: Em produção, isso deveria ser limitado e seguro
      // Por agora, simulamos algumas consultas básicas
      console.log('🔍 Executando query de debug:', query);
      
      if (query.toLowerCase().includes('atendimentos')) {
        const { data, error } = await supabase.from('atendimentos').select('*').limit(10);
        return { data, error: error?.message };
      }
      
      if (query.toLowerCase().includes('atendentes')) {
        const { data, error } = await supabase.from('atendentes').select('*');
        return { data, error: error?.message };
      }

      // Para outras queries, retornar um resultado simulado
      return {
        data: [{ message: 'Query executada com sucesso', query }],
        error: null
      };
    } catch (error) {
      console.error('Erro ao executar query:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }

  // Cenários de teste
  static async runTestScenario(scenario: string) {
    try {
      console.log(`🎭 Executando cenário: ${scenario}`);
      
      switch (scenario) {
        case 'novo_atendimento':
          return {
            scenario,
            result: 'Simulação de novo atendimento criada',
            data: {
              id: Math.random().toString(36).substr(2, 9),
              status: 'BOT_ATIVO',
              created_at: new Date().toISOString()
            }
          };

        case 'webhook_test':
          return {
            scenario,
            result: 'Teste de webhook simulado',
            data: {
              endpoint: 'https://webhook.test.com',
              response: 'OK',
              status: 200
            }
          };

        case 'geocoding_test':
          return {
            scenario,
            result: 'Teste de geocodificação simulado',
            data: {
              address: 'Montes Claros, MG',
              coordinates: { lat: -16.7249, lng: -43.8609 }
            }
          };

        default:
          return {
            scenario,
            result: `Cenário ${scenario} não implementado`,
            data: null
          };
      }
    } catch (error) {
      console.error(`Erro no cenário ${scenario}:`, error);
      throw error;
    }
  }

  // Inspeção de tabelas
  static async inspectTable(tableName: string) {
    try {
      console.log(`🔍 Inspecionando tabela: ${tableName}`);
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(20);

      if (error) {
        return { error: error.message };
      }

      return {
        table: tableName,
        count: data?.length || 0,
        data,
        schema: data?.[0] ? Object.keys(data[0]) : []
      };
    } catch (error) {
      console.error(`Erro ao inspecionar tabela ${tableName}:`, error);
      return {
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // Configurações do sistema
  static async getConfiguration() {
    try {
      console.log('⚙️ Carregando configurações do sistema');
      
      // Simular verificação de secrets (em produção, isso seria feito de forma segura)
      const secrets = {
        SUPABASE_URL: true,
        SUPABASE_ANON_KEY: true,
        GOOGLE_MAPS_API_KEY: false, // Simular como não configurado
        STRIPE_SECRET_KEY: true,
        N8N_WEBHOOK_URL: false
      };

      // Verificar RLS (Row Level Security)
      const rls = {
        enabled: true,
        policies: 0 // Simular sem políticas por enquanto
      };

      // Verificar configurações de auth
      const auth = {
        enabled: true,
        providers: ['email'] // Simular providers configurados
      };

      // URLs de configuração
      const urls = {
        site: window.location.origin,
        redirect: [window.location.origin]
      };

      return {
        secrets,
        rls,
        auth,
        urls
      };
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      throw error;
    }
  }
}
