
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PetMemorialAPI } from '@/lib/api';
import { Produto } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface ProdutoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produto: Produto | null;
  onSave: () => void;
}

export const ProdutoDialog: React.FC<ProdutoDialogProps> = ({
  open,
  onOpenChange,
  produto,
  onSave
}) => {
  const [formData, setFormData] = useState({
    nome_produto: '',
    descricao: '',
    preco: '',
    categoria: 'Urna' as const,
    perfil_afinidade: 'Padrão' as const
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (produto) {
      setFormData({
        nome_produto: produto.nome_produto,
        descricao: produto.descricao,
        preco: produto.preco.toString(),
        categoria: produto.categoria,
        perfil_afinidade: produto.perfil_afinidade
      });
    } else {
      setFormData({
        nome_produto: '',
        descricao: '',
        preco: '',
        categoria: 'Urna',
        perfil_afinidade: 'Padrão'
      });
    }
  }, [produto, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome_produto || !formData.preco) {
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
      const produtoData = {
        nome_produto: formData.nome_produto,
        descricao: formData.descricao,
        preco: precoNumber,
        categoria: formData.categoria,
        perfil_afinidade: formData.perfil_afinidade
      };

      if (produto) {
        await PetMemorialAPI.updateProduto({
          ...produtoData,
          produto_id: produto.produto_id
        });
        toast({
          title: "Sucesso",
          description: "Produto atualizado com sucesso."
        });
      } else {
        await PetMemorialAPI.createProduto(produtoData);
        toast({
          title: "Sucesso",
          description: "Produto criado com sucesso."
        });
      }
      
      onSave();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar o produto.",
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
          <DialogTitle>
            {produto ? 'Editar Produto' : 'Novo Produto'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Produto *</Label>
            <Input
              id="nome"
              value={formData.nome_produto}
              onChange={(e) => setFormData(prev => ({ ...prev, nome_produto: e.target.value }))}
              placeholder="Digite o nome do produto"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Digite a descrição do produto"
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
                  <SelectItem value="Urna">Urna</SelectItem>
                  <SelectItem value="Cerimônia">Cerimônia</SelectItem>
                  <SelectItem value="Acessório">Acessório</SelectItem>
                  <SelectItem value="Pacote">Pacote</SelectItem>
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
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
