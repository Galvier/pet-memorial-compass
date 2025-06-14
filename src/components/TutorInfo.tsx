
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Phone, MapPin } from 'lucide-react';
import { Tutor } from '@/types';

interface TutorInfoProps {
  tutor?: Tutor;
}

export const TutorInfo: React.FC<TutorInfoProps> = ({ tutor }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="w-5 h-5" />
          <span>Dados do Tutor</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Nome</label>
          <p className="text-lg font-semibold">{tutor?.nome_tutor}</p>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-500">WhatsApp</label>
          <div className="flex items-center space-x-2 mt-1">
            <Phone className="w-4 h-4 text-gray-400" />
            <p>{tutor?.id_whatsapp}</p>
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-500">Profissão</label>
          <p>{tutor?.profissao}</p>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-500">Endereço</label>
          <div className="flex items-start space-x-2 mt-1">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
            <p className="text-sm">{tutor?.endereco}</p>
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-500">Perfil Calculado</label>
          <div className="mt-1">
            <Badge variant="outline">{tutor?.perfil_calculado}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
