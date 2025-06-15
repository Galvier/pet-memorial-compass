
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Database, Server, Globe, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { DiagnosticService } from '@/services/DiagnosticService';

interface SystemHealth {
  database: 'healthy' | 'warning' | 'error';
  edgeFunctions: 'healthy' | 'warning' | 'error';
  googleMaps: 'healthy' | 'warning' | 'error';
  auth: 'healthy' | 'warning' | 'error';
  lastUpdated: string;
}

export const SystemStatus: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(false);

  const checkSystemHealth = async () => {
    setLoading(true);
    try {
      console.log('🔍 Iniciando verificação de saúde do sistema...');
      const healthStatus = await DiagnosticService.checkSystemHealth();
      setHealth(healthStatus);
      console.log('✅ Verificação de saúde concluída:', healthStatus);
    } catch (error) {
      console.error('❌ Erro ao verificar saúde do sistema:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSystemHealth();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      healthy: 'default',
      warning: 'secondary',
      error: 'destructive'
    } as const;
    
    const labels = {
      healthy: 'Saudável',
      warning: 'Atenção', 
      error: 'Erro'
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {labels[status as keyof typeof labels] || 'Desconhecido'}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Status do Sistema</h2>
        <Button onClick={checkSystemHealth} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Banco de Dados</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {health && getStatusIcon(health.database)}
              {health && getStatusBadge(health.database)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Edge Functions</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {health && getStatusIcon(health.edgeFunctions)}
              {health && getStatusBadge(health.edgeFunctions)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Google Maps API</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {health && getStatusIcon(health.googleMaps)}
              {health && getStatusBadge(health.googleMaps)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Autenticação</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {health && getStatusIcon(health.auth)}
              {health && getStatusBadge(health.auth)}
            </div>
          </CardContent>
        </Card>
      </div>

      {health && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Última verificação: {new Date(health.lastUpdated).toLocaleString('pt-BR')}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h4 className="font-medium mb-2">Componentes Ativos</h4>
                  <ul className="text-sm space-y-1">
                    <li>✅ Sistema de atendimentos</li>
                    <li>✅ Mapa de calor de clientes</li>
                    <li>✅ Sistema de pagamentos</li>
                    <li>✅ Notificações WhatsApp</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Integrações</h4>
                  <ul className="text-sm space-y-1">
                    <li>📡 n8n Webhooks</li>
                    <li>🗺️ Google Maps Geocoding</li>
                    <li>💳 Stripe Payments</li>
                    <li>📱 WhatsApp API</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
