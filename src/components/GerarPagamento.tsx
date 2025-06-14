
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Copy, Check, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface GerarPagamentoProps {
  atendimentoId: number;
  tutorWhatsapp: string;
  sugestoesGeradas?: any[];
}

export const GerarPagamento: React.FC<GerarPagamentoProps> = ({
  atendimentoId,
  tutorWhatsapp,
  sugestoesGeradas = []
}) => {
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [paymentLink, setPaymentLink] = useState<string>('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGeneratePayment = async () => {
    setGenerating(true);
    try {
      // Simular geração de link de pagamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const link = `https://pay.petmemorial.com/checkout/${atendimentoId}?amount=${customAmount || '50.00'}&item=${encodeURIComponent(selectedItem || 'Produto Personalizado')}`;
      setPaymentLink(link);
      
      console.log('Link de pagamento gerado:', link);
    } catch (error) {
      console.error('Erro ao gerar link de pagamento:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(paymentLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar link:', error);
    }
  };

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numPrice);
  };

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-green-800">
          <CreditCard className="w-5 h-5" />
          <span>Gerar Link de Pagamento</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-green-700">
          <p>
            <strong>Cliente:</strong> {tutorWhatsapp}
          </p>
          <p className="mt-1">
            Gere um link de pagamento para enviar ao cliente via WhatsApp.
          </p>
        </div>

        {/* Seleção de Item */}
        <div className="space-y-2">
          <Label htmlFor="item-select">Selecionar Item (Opcional)</Label>
          <Select value={selectedItem} onValueChange={setSelectedItem}>
            <SelectTrigger>
              <SelectValue placeholder="Escolha um produto sugerido..." />
            </SelectTrigger>
            <SelectContent>
              {sugestoesGeradas.map((sugestao: any, index: number) => (
                <SelectItem key={index} value={sugestao.nome}>
                  {sugestao.nome} - {sugestao.preco ? formatPrice(sugestao.preco) : 'Preço não definido'}
                </SelectItem>
              ))}
              <SelectItem value="custom">Produto Personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Valor Customizado */}
        <div className="space-y-2">
          <Label htmlFor="amount">Valor (R$)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="Ex: 150.00"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
          />
        </div>

        {/* Botão de Gerar */}
        <Button
          onClick={handleGeneratePayment}
          disabled={generating || (!selectedItem && !customAmount)}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {generating ? (
            'Gerando Link...'
          ) : (
            <>
              <DollarSign className="w-4 h-4 mr-2" />
              Gerar Link de Pagamento
            </>
          )}
        </Button>

        {/* Link Gerado */}
        {paymentLink && (
          <div className="space-y-3 p-4 bg-white rounded-lg border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-800">
                Link de Pagamento Gerado:
              </span>
              <Badge className="bg-green-100 text-green-800">
                Pronto para enviar
              </Badge>
            </div>
            
            <div className="p-3 bg-gray-50 rounded border text-sm font-mono break-all">
              {paymentLink}
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="flex-1"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-green-600" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Link
                  </>
                )}
              </Button>
              
              <Button
                onClick={() => window.open(`https://wa.me/${tutorWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Aqui está o link para finalizar o pagamento: ${paymentLink}`)}`)}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Enviar pelo WhatsApp
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
