
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Package, Edit, Trash2 } from 'lucide-react';
import { PetMemorialAPI } from '@/lib/api';
import { ItemDeVenda } from '@/types';
import { ItemDialog } from './ItemDialog';
import { useToast } from '@/hooks/use-toast';

export const ItensDeVendaList: React.FC = () => {
  const [itens, setItens] = useState<ItemDeVenda[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemDeVenda | null>(null);
  const { toast } = useToast();

  const fetchItens = async () => {
    try {
      setLoading(true);
      const data = await PetMemorialAPI.getItensDeVenda();
      setItens(data);
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os itens.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItens();
  }, []);

  const handleCreate = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const handleEdit = (item: ItemDeVenda) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este item?')) {
      try {
        await PetMemorialAPI.deleteItemDeVenda(id);
        await fetchItens();
        toast({
          title: "Sucesso",
          description: "Item excluído com sucesso."
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível excluir o item.",
          variant: "destructive"
        });
      }
    }
  };

  const handleSave = async () => {
    await fetchItens();
    setDialogOpen(false);
  };

  const getPerfilBadge = (perfil: string) => {
    const variants = {
      'Padrão': 'bg-gray-100 text-gray-700 border-gray-200',
      'Intermediário': 'bg-purple-primary/10 text-purple-primary border-purple-primary/20',
      'Luxo': 'bg-yellow-primary/10 text-yellow-primary border-yellow-primary/20'
    } as const;
    
    return (
      <Badge className={variants[perfil as keyof typeof variants] || 'bg-gray-100 text-gray-700 border-gray-200'}>
        {perfil}
      </Badge>
    );
  };

  const getCategoryBadge = (categoria: string) => {
    const variants = {
      'Cremação': 'bg-red-50 text-red-700 border-red-200',
      'Urna': 'bg-green-50 text-green-700 border-green-200',
      'Acessório': 'bg-purple-primary/5 text-purple-primary border-purple-primary/10',
      'Cerimônia': 'bg-orange-50 text-orange-700 border-orange-200'
    } as const;
    
    return (
      <Badge className={variants[categoria as keyof typeof variants] || 'bg-gray-100 text-gray-700 border-gray-200'}>
        {categoria}
      </Badge>
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-40 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-purple-primary mb-2">Itens de Venda</h1>
          <p className="text-gray-600">Gerencie os itens e serviços disponíveis</p>
        </div>
        <Button 
          onClick={handleCreate} 
          className="bg-yellow-primary hover:bg-yellow-primary/90 text-purple-primary font-semibold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Item
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {itens.map((item) => (
          <Card key={item.item_id} className="hover:shadow-lg transition-shadow border-l-4 border-purple-primary/20 bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2 text-purple-primary">{item.nome}</CardTitle>
                  <div className="flex items-center space-x-2 mb-2 flex-wrap gap-1">
                    {getCategoryBadge(item.categoria)}
                    {getPerfilBadge(item.perfil_afinidade)}
                  </div>
                </div>
                <Package className="w-5 h-5 text-purple-primary/60" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {item.descricao}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-purple-primary">
                  {formatPrice(item.preco)}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(item)}
                    className="border-purple-primary/30 text-purple-primary hover:bg-purple-primary hover:text-white"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(item.item_id)}
                    className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {itens.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            Nenhum item cadastrado
          </h3>
          <p className="text-gray-500 mb-4">
            Comece adicionando seus primeiros itens de venda.
          </p>
          <Button onClick={handleCreate} className="bg-yellow-primary hover:bg-yellow-primary/90 text-purple-primary font-semibold">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Item
          </Button>
        </div>
      )}

      <ItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={editingItem}
        onSave={handleSave}
      />
    </div>
  );
};
