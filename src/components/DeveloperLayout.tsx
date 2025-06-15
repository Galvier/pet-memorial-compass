
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
    <div className="min-h-screen bg-background">
      {/* Header específico para desenvolvedor */}
      <div className="bg-card border-b border-border p-4 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <Code className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Sistema de Diagnóstico</h1>
              <p className="text-sm text-muted-foreground">Pet Memorial - Modo Desenvolvedor</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {user && userProfile && (
              <div className="flex items-center space-x-3">
                <User className="w-6 h-6 text-primary" />
                <div className="text-right">
                  <p className="font-semibold text-foreground text-sm">{userProfile.nome}</p>
                  <p className="text-xs text-muted-foreground">{userProfile.email}</p>
                </div>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  Desenvolvedor
                </Badge>
              </div>
            )}
            
            <Button 
              onClick={handleSignOut} 
              variant="outline" 
              size="sm"
              className="border-border text-foreground hover:bg-accent"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="text-foreground bg-background">
        {children}
      </div>
    </div>
  );
};
