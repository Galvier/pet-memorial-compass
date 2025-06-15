
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, Code, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface DeveloperLayoutProps {
  children: React.ReactNode;
}

export const DeveloperLayout: React.FC<DeveloperLayoutProps> = ({ children }) => {
  const { user, userProfile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      toast.success('Logout realizado com sucesso');
    } catch (error) {
      toast.error('Erro ao fazer logout');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header específico para desenvolvedor */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <Code className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-xl font-bold text-white">Sistema de Diagnóstico</h1>
              <p className="text-sm text-gray-400">Pet Memorial - Modo Desenvolvedor</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {user && userProfile && (
              <div className="flex items-center space-x-3">
                <User className="w-6 h-6 text-blue-400" />
                <div className="text-right">
                  <p className="font-semibold text-white text-sm">{userProfile.nome}</p>
                  <p className="text-xs text-gray-400">{userProfile.email}</p>
                </div>
                <Badge variant="outline" className="bg-blue-900 text-blue-300 border-blue-600">
                  Desenvolvedor
                </Badge>
              </div>
            )}
            
            <Button 
              onClick={handleSignOut} 
              variant="outline" 
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="text-white">
        {children}
      </div>
    </div>
  );
};
