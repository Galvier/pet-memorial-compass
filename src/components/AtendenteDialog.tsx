
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PetMemorialAPI } from '@/lib/api';
import { Atendente } from '@/types';

interface AtendenteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  atendente?: Atendente;
  onSave: () => void;
}

export const AtendenteDialog: React.FC<AtendenteDialogProps> = ({
  open,
  onOpenChange,
  atendente,
  onSave,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome_atendente: '',
    whatsapp_atendente: '',
    status_disponibilidade: 'Online' as 'Online' | 'Offline'
  });

  useEffect(() => {
    if (atendente) {
      setFormData({
        nome_atendente: atendente.nome_atendente,
        whatsapp_atendente: atendente.whatsapp_atendente,
        status_disponibilidade: atendente.status_disponibilidade
      });
    } else {
      setFormData({
        nome_atendente: '',
        whatsapp_atendente: '',
        status_disponibilidade: 'Online'
      });
    }
  }, [atendente, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (atendente) {
        await PetMemorialAPI.updateAtendente({
          ...atendente,
          ...formData
        });
      } else {
        await PetMemorialAPI.createAtendente(formData);
      }
      
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar atendente:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {atendente ? 'Editar Atendente' : 'Adicionar Atendente'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Atendente</Label>
            <Input
              id="nome"
              value={formData.nome_atendente}
              onChange={(e) => setFormData({
                ...formData,
                nome_atendente: e.target.value
              })}
              placeholder="Ex: Ana Paula Silva"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              value={formData.whatsapp_atendente}
              onChange={(e) => setFormData({
                ...formData,
                whatsapp_atendente: e.target.value
              })}
              placeholder="Ex: 5538999991111"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status Inicial</Label>
            <Select
              value={formData.status_disponibilidade}
              onValueChange={(value: 'Online' | 'Offline') => setFormData({
                ...formData,
                status_disponibilidade: value
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Online">Online</SelectItem>
                <SelectItem value="Offline">Offline</SelectItem>
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
              className="bg-purple-primary hover:bg-purple-primary/90"
            >
              {loading ? 'Salvando...' : (atendente ? 'Atualizar' : 'Adicionar')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
