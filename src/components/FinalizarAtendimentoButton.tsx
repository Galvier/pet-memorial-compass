
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Atendimento } from '@/types';

interface FinalizarAtendimentoButtonProps {
  atendimento: Atendimento;
  onFinalizacao?: () => void;
}

export const FinalizarAtendimentoButton: React.FC<FinalizarAtendimentoButtonProps> = ({
  atendimento,
  onFinalizacao
}) => {
  const [loading, setLoading] = useState(false);
  const { user, userProfile } = useAuth();

  const handleFinalizar = async () => {
    if (!user || !userProfile) {
      toast.error('Usuário não autenticado');
      return;
    }

    // Verificar se o usuário é o atendente responsável
    if (userProfile.role !== 'atendente') {
      toast.error('Apenas atendentes podem finalizar atendimentos');
      return;
    }

    try {
      setLoading(true);

      // Buscar dados do atendente logado
      const { data: atendenteData, error: atendenteError } = await supabase
        .from('atendentes')
        .select('atendente_id')
        .eq('user_id', user.id)
        .single();

      if (atendenteError) {
        console.error('Erro ao buscar dados do atendente:', atendenteError);
        toast.error('Erro ao identificar atendente');
        return;
      }

      // Verificar se o atendente é o responsável pelo atendimento
      if (atendimento.atendente_responsavel_id !== atendenteData.atendente_id) {
        toast.error('Você não é o responsável por este atendimento');
        return;
      }

      // Finalizar o atendimento
      const { error: updateError } = await supabase
        .from('atendimentos')
        .update({
          status_atendimento: 'FINALIZADO',
          status: 'Finalizado'
        })
        .eq('atendimento_id', atendimento.atendimento_id);

      if (updateError) {
        console.error('Erro ao finalizar atendimento:', updateError);
        toast.error('Erro ao finalizar atendimento');
        return;
      }

      toast.success('Atendimento finalizado com sucesso!');
      
      // Chamar callback se fornecido
      if (onFinalizacao) {
        onFinalizacao();
      }

    } catch (error) {
      console.error('Erro inesperado ao finalizar:', error);
      toast.error('Erro inesperado ao finalizar atendimento');
    } finally {
      setLoading(false);
    }
  };

  // Só mostrar o botão se o atendimento estiver atribuído e não finalizado
  if (atendimento.status_atendimento !== 'ATRIBUIDO_HUMANO') {
    return null;
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="outline" 
          className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
          disabled={loading}
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Finalizar Atendimento
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Finalizar Atendimento</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja finalizar este atendimento? Esta ação marcará o atendimento como concluído.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleFinalizar}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Finalizando...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Finalizar
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
