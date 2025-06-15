
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface DeveloperProtectedRouteProps {
  children: React.ReactNode;
}

export const DeveloperProtectedRoute = ({ children }: DeveloperProtectedRouteProps) => {
  const { user, userProfile, loading, isDeveloper } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Lista de rotas permitidas para desenvolvedores
  const allowedDeveloperRoutes = ['/diagnostico', '/analytics'];

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/dev-auth');
        return;
      }

      if (!isDeveloper()) {
        navigate('/dev-auth');
        return;
      }

      // Se estiver em uma rota não permitida para desenvolvedor, redirecionar para diagnóstico
      if (!allowedDeveloperRoutes.includes(location.pathname)) {
        navigate('/diagnostico');
        return;
      }
    }
  }, [user, userProfile, loading, navigate, isDeveloper, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Verificar se o usuário tem permissão de desenvolvedor
  if (user && userProfile && isDeveloper()) {
    return <>{children}</>;
  }

  // Se chegou aqui, não tem permissão - será redirecionado pelo useEffect
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-4">Acesso Negado</h2>
        <p className="text-muted-foreground">Você precisa ser um desenvolvedor para acessar esta página.</p>
      </div>
    </div>
  );
};
