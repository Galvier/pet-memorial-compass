
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const AuthHeader: React.FC = () => {
  const { user, userProfile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
      toast.success('Logout realizado com sucesso');
    } catch (error) {
      toast.error('Erro ao fazer logout');
    }
  };

  if (!user || !userProfile) {
    return null;
  }

  return (
    <div className="flex items-center justify-between bg-white shadow-sm border-b p-4">
      <div className="flex items-center space-x-3">
        <User className="w-8 h-8 text-purple-primary" />
        <div>
          <h2 className="font-semibold text-gray-900">{userProfile.nome}</h2>
          <p className="text-sm text-gray-600">{userProfile.email}</p>
        </div>
        <Badge variant="outline" className="bg-purple-100 text-purple-800">
          {userProfile.role === 'atendente' ? 'Atendente' : 
           userProfile.role === 'admin' ? 'Administrador' : 'Cliente'}
        </Badge>
      </div>
      
      <Button onClick={handleSignOut} variant="outline" size="sm">
        <LogOut className="w-4 h-4 mr-2" />
        Sair
      </Button>
    </div>
  );
};
