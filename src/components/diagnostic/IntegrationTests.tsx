
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { DiagnosticService } from '@/services/DiagnosticService';

interface TestResult {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  duration?: number;
  message?: string;
  details?: any;
}

export const IntegrationTests: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([
    { id: 'supabase', name: 'Conexão Supabase', status: 'pending' },
    { id: 'google-maps', name: 'Google Maps API', status: 'pending' },
    { id: 'geocoding', name: 'Serviço de Geocodificação', status: 'pending' },
    { id: 'n8n-webhook', name: 'Webhook n8n', status: 'pending' },
    { id: 'whatsapp', name: 'NotificationService WhatsApp', status: 'pending' },
    { id: 'stripe', name: 'Pagamentos Stripe', status: 'pending' },
    { id: 'edge-functions', name: 'Edge Functions', status: 'pending' },
  ]);

  const runTest = async (testId: string) => {
    setTests(prev => prev.map(test => 
      test.id === testId ? { ...test, status: 'running' } : test
    ));

    try {
      const startTime = Date.now();
      const result = await DiagnosticService.runIntegrationTest(testId);
      const duration = Date.now() - startTime;

      setTests(prev => prev.map(test => 
        test.id === testId ? { 
          ...test, 
          status: result.success ? 'success' : 'error',
          duration,
          message: result.message,
          details: result.details
        } : test
      ));
    } catch (error) {
      setTests(prev => prev.map(test => 
        test.id === testId ? { 
          ...test, 
          status: 'error',
          message: error instanceof Error ? error.message : 'Erro desconhecido'
        } : test
      ));
    }
  };

  const runAllTests = async () => {
    for (const test of tests) {
      await runTest(test.id);
      // Pequena pausa entre os testes
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'running':
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'default',
      error: 'destructive',
      running: 'secondary',
      pending: 'outline'
    } as const;
    
    const labels = {
      success: 'Sucesso',
      error: 'Erro',
      running: 'Executando',
      pending: 'Pendente'
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Testes de Integração</h2>
        <Button onClick={runAllTests} className="flex items-center gap-2">
          <PlayCircle className="h-4 w-4" />
          Executar Todos os Testes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {tests.map((test) => (
          <Card key={test.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base">{test.name}</CardTitle>
              {getStatusIcon(test.status)}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  {getStatusBadge(test.status)}
                  {test.duration && (
                    <span className="text-sm text-muted-foreground">
                      {test.duration}ms
                    </span>
                  )}
                </div>

                {test.message && (
                  <p className={`text-sm ${test.status === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                    {test.message}
                  </p>
                )}

                {test.details && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground">
                      Detalhes do teste
                    </summary>
                    <pre className="mt-2 bg-gray-100 p-2 rounded overflow-x-auto">
                      {JSON.stringify(test.details, null, 2)}
                    </pre>
                  </details>
                )}

                <Button 
                  onClick={() => runTest(test.id)} 
                  disabled={test.status === 'running'}
                  variant="outline" 
                  size="sm"
                  className="w-full"
                >
                  {test.status === 'running' ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Executando...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Executar Teste
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
