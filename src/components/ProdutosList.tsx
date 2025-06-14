
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Package, Edit, Trash2 } from 'lucide-react';
import { PetMemorialAPI } from '@/lib/api';
import { Produto } from '@/types';
import { ProdutoDialog } from './ProdutoDialog';
import { useToast } from '@/hooks/use-toast';

export const ProdutosList: React.FC = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const { toast } = useToast();

  const fetchProdutos = async () => {
    try {
      setLoading(true);
      const data = await PetMemorialAPI.getProdutos();
      setProdutos(data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os produtos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, []);

  const handleCreate = () => {
    setEditingProduto(null);
    setDialogOpen(true);
  };

  const handleEdit = (produto: Produto) => {
    setEditingProduto(produto);
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await PetMemorialAPI.deleteProduto(id);
        await fetchProdutos();
        toast({
          title: "Sucesso",
          description: "Produto excluído com sucesso."
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível excluir o produto.",
          variant: "destructive"
        });
      }
    }
  };

  const handleSave = async () => {
    await fetchProdutos();
    setDialogOpen(false);
  };

  const getPerfilBadge = (perfil: string) => {
    const variants = {
      'Padrão': 'secondary',
      'Intermediário': 'default',
      'Luxo': 'outline'
    } as const;
    
    return (
      <Badge variant={variants[perfil as keyof typeof variants] || 'default'}>
        {perfil}
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
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Produtos</h1>
          <p className="text-gray-600">Gerencie o catálogo de produtos e serviços</p>
        </div>
        <Button onClick={handleCreate} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {produtos.map((produto) => (
          <Card key={produto.produto_id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{produto.nome_produto}</CardTitle>
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="outline">{produto.categoria}</Badge>
                    {getPerfilBadge(produto.perfil_afinidade)}
                  </div>
                </div>
                <Package className="w-5 h-5 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {produto.descricao}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-green-600">
                  {formatPrice(produto.preco)}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(produto)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(produto.produto_id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {produtos.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            Nenhum produto cadastrado
          </h3>
          <p className="text-gray-500 mb-4">
            Comece adicionando seu primeiro produto ao catálogo.
          </p>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Produto
          </Button>
        </div>
      )}

      <ProdutoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        produto={editingProduto}
        onSave={handleSave}
      />
    </div>
  );
};
