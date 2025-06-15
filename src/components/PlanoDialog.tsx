import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plano } from '@/types';

interface PlanoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (plano: Plano | Omit<Plano, 'plano_id'>) => void;
  plano?: Plano;
}

export const PlanoDialog: React.FC<PlanoDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  plano
}) => {
  const [formData, setFormData] = useState({
    nome_plano: plano?.nome_plano || '',
    preco_base: plano?.preco_base || 0,
    descricao: plano?.descricao || '',
    descricao_curta: plano?.descricao_curta || '',
    perfil_indicado: plano?.perfil_indicado || 'Padrão' as 'Padrão' | 'Intermediário' | 'Luxo'
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (plano) {
      // Editando plano existente
      onSubmit({
        plano_id: plano.plano_id,
        nome_plano: formData.nome_plano,
        preco_base: formData.preco_base,
        descricao: formData.descricao,
        descricao_curta: formData.descricao_curta,
        perfil_indicado: formData.perfil_indicado
      });
    } else {
      // Criando novo plano
      onSubmit({
        nome_plano: formData.nome_plano,
        preco_base: formData.preco_base,
        descricao: formData.descricao,
        descricao_curta: formData.descricao_curta,
        perfil_indicado: formData.perfil_indicado
      });
    }
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {plano ? 'Editar Plano' : 'Novo Plano'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome_plano">Nome do Plano</Label>
            <Input
              id="nome_plano"
              value={formData.nome_plano}
              onChange={(e) => handleChange('nome_plano', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="preco_base">Preço Base</Label>
            <Input
              id="preco_base"
              type="number"
              step="0.01"
              value={formData.preco_base}
              onChange={(e) => handleChange('preco_base', parseFloat(e.target.value))}
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
            <Label htmlFor="descricao_curta">Descrição Curta</Label>
            <Input
              id="descricao_curta"
              value={formData.descricao_curta}
              onChange={(e) => handleChange('descricao_curta', e.target.value)}
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
              {plano ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
