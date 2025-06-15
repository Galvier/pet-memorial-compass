
import React from 'react';
import { DeveloperLayout } from '@/components/DeveloperLayout';
import { DiagnosticDashboard } from '@/components/diagnostic/DiagnosticDashboard';

const Diagnostico = () => {
  return (
    <DeveloperLayout>
      <div className="space-y-6 p-6 bg-background min-h-screen">
        <div className="text-center py-4">
          <h1 className="text-3xl font-bold text-primary mb-2">
            Diagnóstico do Sistema
          </h1>
          <p className="text-muted-foreground">
            Monitoramento, logs, testes de integração e verificações de saúde
          </p>
        </div>
        
        <DiagnosticDashboard />
      </div>
    </DeveloperLayout>
  );
};

export default Diagnostico;
