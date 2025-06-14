
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DadosColetadosProps {
  dadosColetados: any;
}

export const DadosColetados: React.FC<DadosColetadosProps> = ({ dadosColetados }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados Coletados Detalhados</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-4 bg-gray-50 rounded-lg">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap">
            {JSON.stringify(dadosColetados, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};
