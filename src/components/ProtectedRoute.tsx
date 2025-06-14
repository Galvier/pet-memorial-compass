
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAtendente?: boolean;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requireAtendente = false, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, userProfile, loading, isAtendente, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
        return;
      }

      if (requireAtendente && !isAtendente()) {
        navigate('/auth');
        return;
      }

      if (requireAdmin && !isAdmin()) {
        navigate('/auth');
        return;
      }
    }
  }, [user, userProfile, loading, navigate, requireAtendente, requireAdmin, isAtendente, isAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-primary"></div>
      </div>
    );
  }

  // Verificar se o usuário tem permissão adequada
  if (user && userProfile) {
    if (requireAtendente && !isAtendente()) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h2>
            <p className="text-gray-600">Você precisa ser um atendente para acessar esta página.</p>
          </div>
        </div>
      );
    }

    if (requireAdmin && !isAdmin()) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h2>
            <p className="text-gray-600">Você precisa ser um administrador para acessar esta página.</p>
          </div>
        </div>
      );
    }

    return <>{children}</>;
  }

  return null;
};
