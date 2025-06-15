
import React from 'react';
import { DeveloperLayout } from '@/components/DeveloperLayout';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';

const Analytics = () => {
  return (
    <DeveloperLayout>
      <div className="space-y-6 p-6 bg-background min-h-screen">
        <div className="text-center py-4">
          <h1 className="text-3xl font-bold text-primary mb-2">
            Analytics & Visualização de Dados
          </h1>
          <p className="text-muted-foreground">
            Análise completa dos dados de cruzamento, scores e performance do sistema
          </p>
        </div>
        
        <AnalyticsDashboard />
      </div>
    </DeveloperLayout>
  );
};

export default Analytics;
