
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Home, ArrowLeft } from 'lucide-react';
import { PaymentAPI } from '@/lib/paymentAPI';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setLoading(false);
        return;
      }

      try {
        // Em um cenário real, você verificaria o pagamento pelo session_id
        // Por agora, vamos apenas mostrar uma mensagem de sucesso
        setPaymentDetails({
          sessionId,
          status: 'paid',
          message: 'Pagamento processado com sucesso!'
        });
      } catch (error) {
        console.error('Erro ao verificar pagamento:', error);
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Verificando pagamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">
            Pagamento Realizado!
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Seu pagamento foi processado com sucesso. Você receberá um e-mail de confirmação em breve.
          </p>
          
          {sessionId && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">ID da Transação:</p>
              <p className="font-mono text-xs break-all">{sessionId}</p>
            </div>
          )}
          
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

export default PaymentSuccess;
