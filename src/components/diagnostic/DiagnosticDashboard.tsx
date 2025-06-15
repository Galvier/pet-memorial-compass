
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SystemStatus } from './SystemStatus';
import { PerformanceMonitor } from './PerformanceMonitor';
import { IntegrationsConfig } from './IntegrationsConfig';
import { DebugTools } from './DebugTools';
import { LogsViewer } from './LogsViewer';
import { CacheManagement } from './CacheManagement';
import { MontesClarosAnalysis } from './MontesClarosAnalysis';
import { MarketConfigPanel } from './MarketConfigPanel';

export const DiagnosticDashboard: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Painel de Diagnóstico</h1>
        <p className="text-muted-foreground">
          Monitoramento e configuração do sistema de atendimento
        </p>
      </div>

      <Tabs defaultValue="status" className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
          <TabsTrigger value="montes-claros">Análise Local</TabsTrigger>
          <TabsTrigger value="market-config">Mercado</TabsTrigger>
          <TabsTrigger value="debug">Debug</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="cache">Cache</TabsTrigger>
        </TabsList>

        <TabsContent value="status">
          <SystemStatus />
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceMonitor />
        </TabsContent>

        <TabsContent value="integrations">
          <IntegrationsConfig />
        </TabsContent>

        <TabsContent value="montes-claros">
          <MontesClarosAnalysis />
        </TabsContent>

        <TabsContent value="market-config">
          <MarketConfigPanel />
        </TabsContent>

        <TabsContent value="debug">
          <DebugTools />
        </TabsContent>

        <TabsContent value="logs">
          <LogsViewer />
        </TabsContent>

        <TabsContent value="cache">
          <CacheManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};
