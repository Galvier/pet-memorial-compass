
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Shield, Edit, Trash2 } from 'lucide-react';
import { PetMemorialAPI } from '@/lib/api';
import { Plano } from '@/types';
import { PlanoDialog } from './PlanoDialog';
import { useToast } from '@/hooks/use-toast';

export const PlanosList: React.FC = () => {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlano, setEditingPlano] = useState<Plano | null>(null);
  const { toast } = useToast();

  const fetchPlanos = async () => {
    try {
      setLoading(true);
      const data = await PetMemorialAPI.getPlanos();
      setPlanos(data);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os planos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanos();
  }, []);

  const handleCreate = () => {
    setEditingPlano(null);
    setDialogOpen(true);
  };

  const handleEdit = (plano: Plano) => {
    setEditingPlano(plano);
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este plano?')) {
      try {
        await PetMemorialAPI.deletePlano(id);
        await fetchPlanos();
        toast({
          title: "Sucesso",
          description: "Plano excluído com sucesso."
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível excluir o plano.",
          variant: "destructive"
        });
      }
    }
  };

  const handleSave = async () => {
    await fetchPlanos();
    setDialogOpen(false);
  };

  const getPlanoBadge = (nome: string) => {
    if (nome.includes('Bronze')) return <Badge className="bg-purple-primary/10 text-purple-primary border-purple-primary/20">Bronze</Badge>;
    if (nome.includes('Prata')) return <Badge className="bg-gray-100 text-gray-700 border-gray-200">Prata</Badge>;
    if (nome.includes('Ouro')) return <Badge className="bg-yellow-primary/10 text-yellow-primary border-yellow-primary/20">Ouro</Badge>;
    return <Badge variant="outline">Plano</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-gray-200 rounded"></div>
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
          <h1 className="text-3xl font-bold text-purple-primary mb-2">Planos Terranova Pet</h1>
          <p className="text-gray-600">Gerencie os planos preventivos disponíveis</p>
        </div>
        <Button 
          onClick={handleCreate} 
          className="bg-yellow-primary hover:bg-yellow-primary/90 text-purple-primary font-semibold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Plano
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {planos.map((plano) => (
          <Card key={plano.plano_id} className="hover:shadow-lg transition-shadow border-l-4 border-purple-primary/20 bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2 text-purple-primary">{plano.nome_plano}</CardTitle>
                  <div className="flex items-center space-x-2 mb-2">
                    {getPlanoBadge(plano.nome_plano)}
                  </div>
                </div>
                <Shield className="w-5 h-5 text-purple-primary/60" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">
                {plano.descricao_curta}
              </p>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(plano)}
                  className="border-purple-primary/30 text-purple-primary hover:bg-purple-primary hover:text-white"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(plano.plano_id)}
                  className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {planos.length === 0 && (
        <div className="text-center py-12">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            Nenhum plano cadastrado
          </h3>
          <p className="text-gray-500 mb-4">
            Comece adicionando os planos Bronze, Prata e Ouro.
          </p>
          <Button onClick={handleCreate} className="bg-yellow-primary hover:bg-yellow-primary/90 text-purple-primary font-semibold">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Plano
          </Button>
        </div>
      )}

      <PlanoDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        plano={editingPlano}
        onSubmit={handleSave}
      />
    </div>
  );
};
