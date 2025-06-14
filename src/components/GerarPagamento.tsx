
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreditCard, ExternalLink, CheckCircle, Clock, XCircle, Plus, Trash2 } from 'lucide-react';
import { PaymentAPI, PaymentItem, CustomerInfo } from '@/lib/paymentAPI';
import { toast } from 'sonner';

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
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<PaymentItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    nome: '',
    whatsapp: tutorWhatsapp
  });
  const [existingPayments, setExistingPayments] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadExistingPayments();
  }, [atendimentoId]);

  useEffect(() => {
    // Pré-popular itens com sugestões se disponíveis
    if (sugestoesGeradas && sugestoesGeradas.length > 0) {
      const suggestedItems: PaymentItem[] = sugestoesGeradas.map(sugestao => ({
        nome: sugestao.nome || sugestao.name || 'Item',
        preco: parseFloat(sugestao.preco || sugestao.price || '0'),
        descricao: sugestao.descricao || sugestao.description || '',
        quantidade: 1
      }));
      setItems(suggestedItems);
    } else {
      // Item padrão se não houver sugestões
      setItems([{ nome: '', preco: 0, descricao: '', quantidade: 1 }]);
    }
  }, [sugestoesGeradas]);

  const loadExistingPayments = async () => {
    try {
      const payments = await PaymentAPI.getPaymentsByAtendimento(atendimentoId);
      setExistingPayments(payments);
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
    }
  };

  const refreshPaymentStatus = async () => {
    setRefreshing(true);
    try {
      await loadExistingPayments();
      toast.success('Status dos pagamentos atualizado');
    } catch (error) {
      toast.error('Erro ao atualizar status dos pagamentos');
    } finally {
      setRefreshing(false);
    }
  };

  const addItem = () => {
    setItems([...items, { nome: '', preco: 0, descricao: '', quantidade: 1 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof PaymentItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      return total + (item.preco * (item.quantidade || 1));
    }, 0);
  };

  const handleCreatePayment = async () => {
    if (!customerInfo.nome.trim()) {
      toast.error('Nome do cliente é obrigatório');
      return;
    }

    const validItems = items.filter(item => item.nome.trim() && item.preco > 0);
    if (validItems.length === 0) {
      toast.error('Adicione pelo menos um item válido');
      return;
    }

    setIsLoading(true);
    try {
      const response = await PaymentAPI.createPaymentLink({
        atendimentoId,
        items: validItems,
        customerInfo
      });

      if (response.success && response.payment_link) {
        toast.success('Link de pagamento criado com sucesso!');
        
        // Abrir link em nova aba
        window.open(response.payment_link, '_blank');
        
        // Atualizar lista de pagamentos
        await loadExistingPayments();
        
        // Fechar modal
        setIsOpen(false);
      } else {
        toast.error(response.error || 'Erro ao criar link de pagamento');
      }
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      toast.error('Erro ao criar link de pagamento');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      paid: { label: 'Pago', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      failed: { label: 'Falhou', color: 'bg-red-100 text-red-800', icon: XCircle },
      cancelled: { label: 'Cancelado', color: 'bg-gray-100 text-gray-800', icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount / 100); // Converter de centavos
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <span>Gestão de Pagamento</span>
          </CardTitle>
          <div className="flex space-x-2">
            <Button 
              onClick={refreshPaymentStatus} 
              variant="outline" 
              size="sm"
              disabled={refreshing}
            >
              {refreshing ? 'Atualizando...' : 'Atualizar Status'}
            </Button>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Gerar Link de Pagamento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Criar Link de Pagamento</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  {/* Informações do Cliente */}
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Nome do Cliente *</Label>
                    <Input
                      id="customerName"
                      value={customerInfo.nome}
                      onChange={(e) => setCustomerInfo({...customerInfo, nome: e.target.value})}
                      placeholder="Nome completo do cliente"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerWhatsapp">WhatsApp</Label>
                    <Input
                      id="customerWhatsapp"
                      value={customerInfo.whatsapp}
                      onChange={(e) => setCustomerInfo({...customerInfo, whatsapp: e.target.value})}
                      placeholder="Número do WhatsApp"
                    />
                  </div>

                  {/* Lista de Itens */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Itens do Pagamento</Label>
                      <Button onClick={addItem} variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-1" />
                        Adicionar Item
                      </Button>
                    </div>

                    {items.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 p-3 border rounded-lg">
                        <div className="col-span-4">
                          <Input
                            placeholder="Nome do item"
                            value={item.nome}
                            onChange={(e) => updateItem(index, 'nome', e.target.value)}
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            placeholder="Preço"
                            value={item.preco || ''}
                            onChange={(e) => updateItem(index, 'preco', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            placeholder="Qtd"
                            value={item.quantidade || 1}
                            onChange={(e) => updateItem(index, 'quantidade', parseInt(e.target.value) || 1)}
                            min="1"
                          />
                        </div>
                        <div className="col-span-3">
                          <Input
                            placeholder="Descrição"
                            value={item.descricao || ''}
                            onChange={(e) => updateItem(index, 'descricao', e.target.value)}
                          />
                        </div>
                        <div className="col-span-1">
                          <Button
                            onClick={() => removeItem(index)}
                            variant="outline"
                            size="sm"
                            disabled={items.length === 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center font-semibold">
                      <span>Total:</span>
                      <span className="text-lg">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(calculateTotal())}
                      </span>
                    </div>
                  </div>

                  {/* Botões */}
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button onClick={() => setIsOpen(false)} variant="outline">
                      Cancelar
                    </Button>
                    <Button onClick={handleCreatePayment} disabled={isLoading}>
                      {isLoading ? 'Gerando...' : 'Gerar Link de Pagamento'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {existingPayments.length > 0 ? (
          <div className="space-y-3">
            <h4 className="font-medium">Pagamentos Criados:</h4>
            {existingPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    {getStatusBadge(payment.status)}
                    <span className="font-medium">{formatCurrency(payment.amount)}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Criado em: {new Date(payment.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                {payment.payment_link && (
                  <Button
                    onClick={() => window.open(payment.payment_link, '_blank')}
                    variant="outline"
                    size="sm"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Abrir Link
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum pagamento criado ainda.</p>
            <p className="text-sm">Clique em "Gerar Link de Pagamento" para começar.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
