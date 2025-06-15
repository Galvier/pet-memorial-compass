
import React from 'react';
import { Layout } from '@/components/Layout';
import { DiagnosticDashboard } from '@/components/diagnostic/DiagnosticDashboard';

const Diagnostico = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="text-center py-4">
          <h1 className="text-3xl font-bold text-purple-primary mb-2">
            Diagnóstico do Sistema
          </h1>
          <p className="text-gray-600">
            Monitoramento, logs, testes de integração e verificações de saúde
          </p>
        </div>
        
        <DiagnosticDashboard />
      </div>
    </Layout>
  );
};

export default Diagnostico;
