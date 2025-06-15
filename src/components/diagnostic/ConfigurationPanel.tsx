
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Settings, Key, Shield, Globe } from 'lucide-react';
import { DiagnosticService } from '@/services/DiagnosticService';

interface ConfigStatus {
  secrets: {
    [key: string]: boolean;
  };
  rls: {
    enabled: boolean;
    policies: number;
  };
  auth: {
    enabled: boolean;
    providers: string[];
  };
  urls: {
    site: string;
    redirect: string[];
  };
}

export const ConfigurationPanel: React.FC = () => {
  const [config, setConfig] = useState<ConfigStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const loadConfiguration = async () => {
    setLoading(true);
    try {
      const configData = await DiagnosticService.getConfiguration();
      setConfig(configData);
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfiguration();
  }, []);

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getStatusBadge = (status: boolean) => {
    return (
      <Badge variant={status ? 'default' : 'destructive'}>
        {status ? 'Configurado' : 'Não configurado'}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Configurações do Sistema</h2>
        <Button onClick={loadConfiguration} disabled={loading} variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Recarregar
        </Button>
      </div>

      {config && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Secrets e Variáveis de Ambiente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(config.secrets).map(([key, configured]) => (
                  <div key={key} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(configured)}
                      <span className="font-medium">{key}</span>
                    </div>
                    {getStatusBadge(configured)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Row Level Security (RLS)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(config.rls.enabled)}
                    <span className="font-medium">RLS Habilitado</span>
                  </div>
                  {getStatusBadge(config.rls.enabled)}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Políticas configuradas
                  </span>
                  <Badge variant="outline">
                    {config.rls.policies} políticas
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Autenticação e URLs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(config.auth.enabled)}
                    <span className="font-medium">Autenticação</span>
                  </div>
                  {getStatusBadge(config.auth.enabled)}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Provedores:</Label>
                  <div className="flex flex-wrap gap-2">
                    {config.auth.providers.map((provider) => (
                      <Badge key={provider} variant="secondary">
                        {provider}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Site URL:</Label>
                  <p className="text-sm text-muted-foreground font-mono">
                    {config.urls.site || 'Não configurado'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Redirect URLs:</Label>
                  <div className="space-y-1">
                    {config.urls.redirect.map((url, index) => (
                      <p key={index} className="text-sm text-muted-foreground font-mono">
                        {url}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recomendações de Configuração</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {!config.secrets.GOOGLE_MAPS_API_KEY && (
                  <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <XCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800">Google Maps API Key</p>
                      <p className="text-sm text-yellow-700">
                        Configure a chave da API do Google Maps para funcionalidade completa do mapa de calor.
                      </p>
                    </div>
                  </div>
                )}

                {!config.secrets.STRIPE_SECRET_KEY && (
                  <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <XCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800">Stripe Secret Key</p>
                      <p className="text-sm text-yellow-700">
                        Configure a chave secreta do Stripe para processar pagamentos.
                      </p>
                    </div>
                  </div>
                )}

                {config.rls.policies === 0 && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded">
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-800">Row Level Security</p>
                      <p className="text-sm text-red-700">
                        Nenhuma política RLS configurada. Isso pode ser um risco de segurança.
                      </p>
                    </div>
                  </div>
                )}

                {Object.values(config.secrets).every(Boolean) && config.rls.enabled && (
                  <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-800">Configuração Completa</p>
                      <p className="text-sm text-green-700">
                        Todas as configurações essenciais estão devidamente configuradas.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}
