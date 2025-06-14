
import { supabase } from '@/integrations/supabase/client';

export interface PaymentItem {
  nome: string;
  preco: number;
  descricao?: string;
  quantidade?: number;
}

export interface CustomerInfo {
  nome: string;
  whatsapp: string;
}

export interface CreatePaymentRequest {
  atendimentoId: number;
  items: PaymentItem[];
  customerInfo: CustomerInfo;
}

export interface PaymentResponse {
  success: boolean;
  payment_link?: string;
  payment_id?: string;
  session_id?: string;
  amount?: number;
  error?: string;
}

export interface PaymentStatus {
  id: string;
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  payment_link: string;
  created_at: string;
  updated_at: string;
}

export class PaymentAPI {
  static async createPaymentLink(request: CreatePaymentRequest): Promise<PaymentResponse> {
    try {
      console.log('Criando link de pagamento:', request);

      const { data, error } = await supabase.functions.invoke('create-payment-link', {
        body: request,
      });

      if (error) {
        console.error('Erro ao criar pagamento:', error);
        throw new Error(error.message);
      }

      console.log('Link de pagamento criado:', data);
      return data;
    } catch (error) {
      console.error('Erro na API de pagamento:', error);
      throw error;
    }
  }

  static async checkPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    try {
      console.log('Verificando status do pagamento:', paymentId);

      const { data, error } = await supabase.functions.invoke('check-payment-status', {
        body: { payment_id: paymentId },
      });

      if (error) {
        console.error('Erro ao verificar status:', error);
        throw new Error(error.message);
      }

      console.log('Status do pagamento:', data);
      return data;
    } catch (error) {
      console.error('Erro na verificação de status:', error);
      throw error;
    }
  }

  static async getPaymentsByAtendimento(atendimentoId: number) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('atendimento_id', atendimentoId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar pagamentos:', error);
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar pagamentos:', error);
      throw error;
    }
  }
}
