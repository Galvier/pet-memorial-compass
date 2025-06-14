
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCheck } from 'lucide-react';
import { Atendente } from '@/types';
import { simulateAtendimentoAPI } from '@/api/atendimento';

interface AtendimentoAssignmentProps {
  atendimentoId: number;
  atendentesOnline: Atendente[];
  onAssignmentComplete: (atendenteId: number, atendenteData: Atendente) => void;
}

export const AtendimentoAssignment: React.FC<AtendimentoAssignmentProps> = ({
  atendimentoId,
  atendentesOnline,
  onAssignmentComplete
}) => {
  const [selectedAtendente, setSelectedAtendente] = useState<string>('');
  const [atribuindo, setAtribuindo] = useState(false);

  const handleAtribuirAtendimento = async () => {
    if (!selectedAtendente) return;

    setAtribuindo(true);
    try {
      await simulateAtendimentoAPI.atribuir(atendimentoId, {
        atendente_id: parseInt(selectedAtendente)
      });
      
      const atendenteData = atendentesOnline.find(a => a.atendente_id === parseInt(selectedAtendente));
      if (atendenteData) {
        onAssignmentComplete(parseInt(selectedAtendente), atendenteData);
      }
      
      console.log('Atendimento atribuído com sucesso!');
    } catch (error) {
      console.error('Erro ao atribuir atendimento:', error);
    } finally {
      setAtribuindo(false);
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-blue-900">Atribuir para Atendente</h3>
            <p className="text-sm text-blue-700">
              Selecione um atendente online para assumir este atendimento.
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <Select value={selectedAtendente} onValueChange={setSelectedAtendente}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Selecione um atendente..." />
                </SelectTrigger>
                <SelectContent>
                  {atendentesOnline.map((atendente) => (
                    <SelectItem 
                      key={atendente.atendente_id} 
                      value={atendente.atendente_id.toString()}
                    >
                      {atendente.nome_atendente}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={handleAtribuirAtendimento}
              disabled={!selectedAtendente || atribuindo}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {atribuindo ? (
                'Atribuindo...'
              ) : (
                <>
                  <UserCheck className="w-4 h-4 mr-2" />
                  Atribuir e Notificar
                </>
              )}
            </Button>
          </div>

          {atendentesOnline.length === 0 && (
            <p className="text-sm text-blue-600">
              Nenhum atendente online disponível no momento.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
