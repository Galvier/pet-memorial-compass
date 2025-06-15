
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SystemStatus } from './SystemStatus';
import { LogsViewer } from './LogsViewer';
import { IntegrationTests } from './IntegrationTests';
import { PerformanceMonitor } from './PerformanceMonitor';
import { ConfigurationPanel } from './ConfigurationPanel';
import { IntegrationsConfig } from './IntegrationsConfig';
import { DebugTools } from './DebugTools';
import { CacheManagement } from './CacheManagement';
import { Activity, Database, Settings, TestTube, Zap, Bug, Puzzle, HardDrive } from 'lucide-react';

export const DiagnosticDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto">
          <TabsList className="grid w-full grid-cols-8 min-w-[800px] h-auto">
            <TabsTrigger value="overview" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3">
              <Activity className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="cache" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3">
              <HardDrive className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Cache</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3">
              <Puzzle className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Integrações</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3">
              <Database className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Logs</span>
            </TabsTrigger>
            <TabsTrigger value="tests" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3">
              <TestTube className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Testes</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3">
              <Zap className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Performance</span>
            </TabsTrigger>
            <TabsTrigger value="debug" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3">
              <Bug className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Debug</span>
            </TabsTrigger>
            <TabsTrigger value="config" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3">
              <Settings className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Config</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="mt-6">
          <TabsContent value="overview" className="space-y-4">
            <SystemStatus />
          </TabsContent>

          <TabsContent value="cache" className="space-y-4">
            <CacheManagement />
          </TabsContent>

          <TabsContent value="integrations" className="space-y-4">
            <IntegrationsConfig />
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <LogsViewer />
          </TabsContent>

          <TabsContent value="tests" className="space-y-4">
            <IntegrationTests />
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <PerformanceMonitor />
          </TabsContent>

          <TabsContent value="debug" className="space-y-4">
            <DebugTools />
          </TabsContent>

          <TabsContent value="config" className="space-y-4">
            <ConfigurationPanel />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
