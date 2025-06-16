
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Dashboard } from "@/components/Dashboard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Heart, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user, userProfile, loading, isAtendente, isDeveloper } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && userProfile) {
      // Se o usuário é atendente, redirecionar para fila de atendimentos
      if (isAtendente()) {
        navigate('/fila-atendimentos');
        return;
      }
      
      // Se o usuário é desenvolvedor, redirecionar para diagnóstico
      if (isDeveloper()) {
        navigate('/diagnostico');
        return;
      }
    }
  }, [user, userProfile, loading, isAtendente, isDeveloper, navigate]);

  // Se não está logado, mostrar página de boas-vindas
  if (!user) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="text-center py-6">
            <div className="flex justify-center mb-4">
              <Heart className="w-16 h-16 text-purple-primary" />
            </div>
            <h1 className="text-4xl font-bold text-purple-primary mb-4">
              Pet Memorial
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Sistema de gestão para atendimento e memorial de pets
            </p>
            
            <div className="flex justify-center space-x-4">
              <Link to="/auth">
                <Button className="bg-purple-primary hover:bg-purple-primary/90">
                  <Users className="w-4 h-4 mr-2" />
                  Área do Atendente
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Se é admin, mostrar dashboard
  return (
    <Layout>
      <div className="space-y-6">
        <div className="text-center py-6">
          <div className="flex justify-center mb-4">
            <Heart className="w-16 h-16 text-purple-primary" />
          </div>
          <h1 className="text-4xl font-bold text-purple-primary mb-4">
            Pet Memorial
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Sistema de gestão para atendimento e memorial de pets
          </p>
        </div>
        
        <Dashboard />
      </div>
    </Layout>
  );
};

export default Index;
