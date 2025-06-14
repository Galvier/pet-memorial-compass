
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Plus, Edit, Trash2, Power } from 'lucide-react';
import { PetMemorialAPI } from '@/lib/api';
import { Atendente } from '@/types';
import { AtendenteDialog } from './AtendenteDialog';

export const AtendentesList: React.FC = () => {
  const [atendentes, setAtendentes] = useState<Atendente[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAtendente, setEditingAtendente] = useState<Atendente | undefined>();

  useEffect(() => {
    fetchAtendentes();
  }, []);

  const fetchAtendentes = async () => {
    try {
      const data = await PetMemorialAPI.getAtendentes();
      setAtendentes(data);
    } catch (error) {
      console.error('Erro ao carregar atendentes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingAtendente(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (atendente: Atendente) => {
    setEditingAtendente(atendente);
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este atendente?')) {
      try {
        await PetMemorialAPI.deleteAtendente(id);
        await fetchAtendentes();
      } catch (error) {
        console.error('Erro ao excluir atendente:', error);
      }
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await PetMemorialAPI.toggleAtendenteStatus(id);
      await fetchAtendentes();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge className={status === 'Online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-purple-primary">Gerenciar Atendentes</h1>
          <p className="text-gray-600">Gerencie sua equipe de atendimento</p>
        </div>
        <Button onClick={handleAdd} className="bg-purple-primary hover:bg-purple-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Atendente
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {atendentes.map((atendente) => (
          <Card key={atendente.atendente_id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{atendente.nome_atendente}</CardTitle>
                {getStatusBadge(atendente.status_disponibilidade)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">WhatsApp</label>
                <p className="text-sm">{atendente.whatsapp_atendente}</p>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleStatus(atendente.atendente_id)}
                  className={atendente.status_disponibilidade === 'Online' ? 
                    'border-red-200 text-red-600 hover:bg-red-50' : 
                    'border-green-200 text-green-600 hover:bg-green-50'
                  }
                >
                  <Power className="w-3 h-3 mr-1" />
                  {atendente.status_disponibilidade === 'Online' ? 'Offline' : 'Online'}
                </Button>
                
                <div className="flex space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(atendente)}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(atendente.atendente_id)}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {atendentes.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            Nenhum atendente cadastrado
          </h3>
          <p className="text-gray-500 mb-4">
            Comece adicionando o primeiro membro da sua equipe.
          </p>
          <Button onClick={handleAdd} className="bg-purple-primary hover:bg-purple-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Primeiro Atendente
          </Button>
        </div>
      )}

      <AtendenteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        atendente={editingAtendente}
        onSave={fetchAtendentes}
      />
    </div>
  );
};
