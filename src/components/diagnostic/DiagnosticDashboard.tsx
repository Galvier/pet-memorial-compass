
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SystemStatus } from './SystemStatus';
import { LogsViewer } from './LogsViewer';
import { IntegrationTests } from './IntegrationTests';
import { PerformanceMonitor } from './PerformanceMonitor';
import { ConfigurationPanel } from './ConfigurationPanel';
import { DebugTools } from './DebugTools';
import { Activity, Database, Settings, TestTube, Zap, Bug } from 'lucide-react';

export const DiagnosticDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 mb-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Logs</span>
          </TabsTrigger>
          <TabsTrigger value="tests" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            <span className="hidden sm:inline">Testes</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Performance</span>
          </TabsTrigger>
          <TabsTrigger value="debug" className="flex items-center gap-2">
            <Bug className="h-4 w-4" />
            <span className="hidden sm:inline">Debug</span>
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Config</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <SystemStatus />
        </TabsContent>

        <TabsContent value="logs">
          <LogsViewer />
        </TabsContent>

        <TabsContent value="tests">
          <IntegrationTests />
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceMonitor />
        </TabsContent>

        <TabsContent value="debug">
          <DebugTools />
        </TabsContent>

        <TabsContent value="config">
          <ConfigurationPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};
