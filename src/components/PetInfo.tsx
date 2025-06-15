
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import { Pet } from '@/types';

interface PetInfoProps {
  pet?: Pet;
}

export const PetInfo: React.FC<PetInfoProps> = ({ pet }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-purple-primary">
          <Heart className="w-5 h-5" />
          <span>Dados do Pet</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Nome do Pet</label>
          <p className="text-lg font-semibold text-purple-primary">
            {pet?.nome_pet || 'Não informado'}
          </p>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-500">Idade</label>
          <p className="text-base">
            {pet?.idade_pet ? `${pet.idade_pet} anos` : 'Não informado'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
