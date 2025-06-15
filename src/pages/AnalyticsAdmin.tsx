
import React from 'react';
import { Layout } from '@/components/Layout';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';

const AnalyticsAdmin = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="text-center lg:text-left">
          <h1 className="text-2xl lg:text-3xl font-bold text-purple-primary mb-2">
            Analytics Executivos
          </h1>
          <p className="text-sm lg:text-base text-gray-600">
            Insights de negócio e métricas estratégicas para tomada de decisão
          </p>
        </div>
        
        <AnalyticsDashboard />
      </div>
    </Layout>
  );
};

export default AnalyticsAdmin;
