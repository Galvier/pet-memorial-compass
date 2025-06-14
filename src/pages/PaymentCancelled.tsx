
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, Home } from 'lucide-react';

const PaymentCancelled: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-600">
            Pagamento Cancelado
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Seu pagamento foi cancelado. Nenhuma cobrança foi realizada.
          </p>
          
          <p className="text-sm text-gray-500">
            Se você mudou de ideia, pode tentar novamente a qualquer momento.
          </p>
          
          <div className="space-y-2">
            <Link to="/meus-atendimentos" className="block">
              <Button className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar aos Atendimentos
              </Button>
            </Link>
            
            <Link to="/" className="block">
              <Button variant="outline" className="w-full">
                <Home className="w-4 h-4 mr-2" />
                Ir para Início
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentCancelled;
