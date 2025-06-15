
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle, TestTube, Settings } from 'lucide-react';

interface IntegrationCardProps {
  id: string;
  name: string;
  icon: React.ReactNode;
  status: 'connected' | 'disconnected' | 'warning';
  configured: boolean;
  lastTested?: string;
  onTest: (id: string) => void;
  onConfigure: (id: string) => void;
  isLoading?: boolean;
}

export const IntegrationCard: React.FC<IntegrationCardProps> = ({
  id,
  name,
  icon,
  status,
  configured,
  lastTested,
  onTest,
  onConfigure,
  isLoading = false
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'disconnected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <XCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      connected: 'default',
      warning: 'secondary',
      disconnected: 'destructive'
    } as const;
    
    const labels = {
      connected: 'Conectado',
      warning: 'Configurado',
      disconnected: 'Desconectado'
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {labels[status as keyof typeof labels] || 'Desconhecido'}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          {icon}
          {name}
        </CardTitle>
        {getStatusIcon(status)}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          {getStatusBadge(status)}
          {lastTested && (
            <span className="text-xs text-muted-foreground">
              Testado: {lastTested}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={() => onTest(id)} 
            disabled={isLoading || !configured}
            variant="outline" 
            size="sm"
            className="flex-1"
          >
            <TestTube className="h-4 w-4 mr-1" />
            Testar
          </Button>
          <Button 
            onClick={() => onConfigure(id)}
            disabled={isLoading}
            variant="outline" 
            size="sm"
            className="flex-1"
          >
            <Settings className="h-4 w-4 mr-1" />
            Config
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
