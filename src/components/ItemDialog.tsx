import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ItemDeVenda } from '@/types';

interface ItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: ItemDeVenda | Omit<ItemDeVenda, 'item_id'>) => void;
  item?: ItemDeVenda;
}

export const ItemDialog: React.FC<ItemDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  item
}) => {
  const [formData, setFormData] = useState({
    nome_item: item?.nome_item || '',
    descricao: item?.descricao || '',
    preco: item?.preco || 0,
    categoria: item?.categoria || '',
    perfil_indicado: item?.perfil_indicado || 'Padrão' as 'Padrão' | 'Intermediário' | 'Luxo'
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (item) {
      // Editando item existente
      onSubmit({
        item_id: item.item_id,
        nome_item: formData.nome_item,
        nome: formData.nome_item, // Alias para compatibilidade
        descricao: formData.descricao,
        preco: formData.preco,
        categoria: formData.categoria,
        perfil_indicado: formData.perfil_indicado,
        perfil_afinidade: formData.perfil_indicado // Alias para compatibilidade
      });
    } else {
      // Criando novo item
      onSubmit({
        nome_item: formData.nome_item,
        nome: formData.nome_item, // Alias para compatibilidade
        descricao: formData.descricao,
        preco: formData.preco,
        categoria: formData.categoria,
        perfil_indicado: formData.perfil_indicado,
        perfil_afinidade: formData.perfil_indicado // Alias para compatibilidade
      });
    }
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {item ? 'Editar Item' : 'Novo Item'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome_item">Nome do Item</Label>
            <Input
              id="nome_item"
              value={formData.nome_item}
              onChange={(e) => handleChange('nome_item', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleChange('descricao', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="preco">Preço</Label>
            <Input
              id="preco"
              type="number"
              step="0.01"
              value={formData.preco}
              onChange={(e) => handleChange('preco', parseFloat(e.target.value))}
              required
            />
          </div>

          <div>
            <Label htmlFor="categoria">Categoria</Label>
            <Input
              id="categoria"
              value={formData.categoria}
              onChange={(e) => handleChange('categoria', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="perfil_indicado">Perfil Indicado</Label>
            <Select
              value={formData.perfil_indicado}
              onValueChange={(value) => handleChange('perfil_indicado', value)}
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

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {item ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
