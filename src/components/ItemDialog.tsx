
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PetMemorialAPI } from '@/lib/api';
import { ItemDeVenda } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface ItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ItemDeVenda | null;
  onSave: () => void;
}

export const ItemDialog: React.FC<ItemDialogProps> = ({
  open,
  onOpenChange,
  item,
  onSave
}) => {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: '',
    categoria: 'Cremação' as ItemDeVenda['categoria'],
    perfil_afinidade: 'Padrão' as ItemDeVenda['perfil_afinidade']
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (item) {
      setFormData({
        nome: item.nome,
        descricao: item.descricao,
        preco: item.preco.toString(),
        categoria: item.categoria,
        perfil_afinidade: item.perfil_afinidade
      });
    } else {
      setFormData({
        nome: '',
        descricao: '',
        preco: '',
        categoria: 'Cremação',
        perfil_afinidade: 'Padrão'
      });
    }
  }, [item, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.preco) {
      toast({
        title: "Erro",
        description: "Nome e preço são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const precoNumber = parseFloat(formData.preco);
    if (isNaN(precoNumber) || precoNumber <= 0) {
      toast({
        title: "Erro",
        description: "Preço deve ser um número válido maior que zero.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const itemData = {
        nome: formData.nome,
        descricao: formData.descricao,
        preco: precoNumber,
        categoria: formData.categoria,
        perfil_afinidade: formData.perfil_afinidade
      };

      if (item) {
        await PetMemorialAPI.updateItemDeVenda({
          ...itemData,
          item_id: item.item_id
        });
        toast({
          title: "Sucesso",
          description: "Item atualizado com sucesso."
        });
      } else {
        await PetMemorialAPI.createItemDeVenda(itemData);
        toast({
          title: "Sucesso",
          description: "Item criado com sucesso."
        });
      }
      
      onSave();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar o item.",
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
            {item ? 'Editar Item' : 'Novo Item'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Item *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              placeholder="Digite o nome do item"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Digite a descrição do item"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="preco">Preço (R$) *</Label>
              <Input
                id="preco"
                type="number"
                step="0.01"
                min="0"
                value={formData.preco}
                onChange={(e) => setFormData(prev => ({ ...prev, preco: e.target.value }))}
                placeholder="0,00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={formData.categoria}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, categoria: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cremação">Cremação</SelectItem>
                  <SelectItem value="Urna">Urna</SelectItem>
                  <SelectItem value="Acessório">Acessório</SelectItem>
                  <SelectItem value="Cerimônia">Cerimônia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Perfil de Afinidade</Label>
            <Select
              value={formData.perfil_afinidade}
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, perfil_afinidade: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Padrão">Padrão</SelectItem>
                <SelectItem value="Intermediário">Intermediário</SelectItem>
                <SelectItem value="Luxo">Luxo</SelectItem>
              </SelectContent>
            </Select>
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
