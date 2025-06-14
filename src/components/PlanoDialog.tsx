
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PetMemorialAPI } from '@/lib/api';
import { Plano } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface PlanoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plano: Plano | null;
  onSave: () => void;
}

export const PlanoDialog: React.FC<PlanoDialogProps> = ({
  open,
  onOpenChange,
  plano,
  onSave
}) => {
  const [formData, setFormData] = useState({
    nome_plano: '',
    descricao_curta: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (plano) {
      setFormData({
        nome_plano: plano.nome_plano,
        descricao_curta: plano.descricao_curta
      });
    } else {
      setFormData({
        nome_plano: '',
        descricao_curta: ''
      });
    }
  }, [plano, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome_plano || !formData.descricao_curta) {
      toast({
        title: "Erro",
        description: "Nome e descrição são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const planoData = {
        nome_plano: formData.nome_plano,
        descricao_curta: formData.descricao_curta
      };

      if (plano) {
        await PetMemorialAPI.updatePlano({
          ...planoData,
          plano_id: plano.plano_id
        });
        toast({
          title: "Sucesso",
          description: "Plano atualizado com sucesso."
        });
      } else {
        await PetMemorialAPI.createPlano(planoData);
        toast({
          title: "Sucesso",
          description: "Plano criado com sucesso."
        });
      }
      
      onSave();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar o plano.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-[#04422c]">
            {plano ? 'Editar Plano' : 'Novo Plano'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome_plano">Nome do Plano *</Label>
            <Input
              id="nome_plano"
              value={formData.nome_plano}
              onChange={(e) => setFormData(prev => ({ ...prev, nome_plano: e.target.value }))}
              placeholder="Ex: Plano Bronze"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao_curta">Descrição Curta *</Label>
            <Textarea
              id="descricao_curta"
              value={formData.descricao_curta}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao_curta: e.target.value }))}
              placeholder="Descrição dos benefícios do plano"
              rows={3}
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-[#04422c] hover:bg-[#04422c]/90"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
