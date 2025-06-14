
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Shield, 
  History,
  Users,
  Menu,
  X,
  LogOut,
  User,
  UserCheck
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, userProfile, signOut, isAdmin, isAtendente } = useAuth();

  // Filtrar navegação baseado no papel do usuário
  const getFilteredNavigation = () => {
    const baseNavigation = [];

    // Adicionar Dashboard apenas para admins
    if (isAdmin()) {
      baseNavigation.push({
        name: 'Dashboard',
        href: '/',
        icon: LayoutDashboard,
        roles: ['admin']
      });
    }

    // Adicionar "Meus Atendimentos" para atendentes
    if (isAtendente()) {
      baseNavigation.push({
        name: 'Meus Atendimentos',
        href: '/meus-atendimentos',
        icon: UserCheck,
        roles: ['atendente']
      });
    }

    // Adicionar páginas administrativas apenas para admins
    if (isAdmin()) {
      baseNavigation.push(
        { name: 'Planos', href: '/planos', icon: Shield, roles: ['admin'] },
        { name: 'Itens de Venda', href: '/itens', icon: Package, roles: ['admin'] },
        { name: 'Atendimentos', href: '/atendimentos', icon: History, roles: ['admin'] },
        { name: 'Atendentes', href: '/atendentes', icon: Users, roles: ['admin'] }
      );
    }

    return baseNavigation;
  };

  const navigation = getFilteredNavigation();

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
      toast.success('Logout realizado com sucesso');
    } catch (error) {
      toast.error('Erro ao fazer logout');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-purple-primary shadow-lg">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/e05dec48-f72b-4ede-af54-afc2d1bebeef.png" 
              alt="Terranova Pet Logo" 
              className="h-8 w-8"
            />
            <div>
              <h1 className="text-lg font-bold text-white">Terranova Pet</h1>
              <p className="text-xs text-yellow-primary">Painel Administrativo</p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white p-2"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="border-t border-purple-primary/20">
            <nav className="px-4 py-2">
              <div className="space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`group flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors ${
                        isActive(item.href)
                          ? 'bg-yellow-primary text-purple-primary'
                          : 'text-gray-300 hover:bg-purple-primary/50 hover:text-white'
                      }`}
                    >
                      <Icon
                        className={`mr-3 h-5 w-5 ${
                          isActive(item.href) ? 'text-purple-primary' : 'text-gray-400 group-hover:text-gray-300'
                        }`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
                
                {/* User info and logout for mobile */}
                {user && userProfile && (
                  <div className="border-t border-purple-primary/20 mt-4 pt-4">
                    <div className="flex items-center space-x-3 px-3 py-2">
                      <User className="w-6 h-6 text-yellow-primary" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{userProfile.nome}</p>
                        <p className="text-xs text-gray-300 truncate">{userProfile.email}</p>
                        <Badge variant="outline" className="bg-yellow-primary/20 text-yellow-primary border-yellow-primary mt-1">
                          {userProfile.role === 'atendente' ? 'Atendente' : 
                           userProfile.role === 'admin' ? 'Administrador' : 'Cliente'}
                        </Badge>
                      </div>
                    </div>
                    <Button 
                      onClick={handleSignOut} 
                      variant="ghost" 
                      size="sm"
                      className="w-full justify-start text-gray-300 hover:text-white hover:bg-purple-primary/50 mt-2"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair
                    </Button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-64 lg:block">
        <div className="bg-purple-primary shadow-lg h-full flex flex-col">
          <div className="flex h-16 items-center justify-center border-b border-purple-primary/20">
            <div className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/e05dec48-f72b-4ede-af54-afc2d1bebeef.png" 
                alt="Terranova Pet Logo" 
                className="h-8 w-8 text-yellow-primary"
              />
              <div>
                <h1 className="text-xl font-bold text-white">Terranova Pet</h1>
                <p className="text-xs text-yellow-primary">Painel Administrativo</p>
              </div>
            </div>
          </div>
          
          <nav className="mt-6 px-3 flex-1">
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive(item.href)
                        ? 'bg-yellow-primary text-purple-primary'
                        : 'text-gray-300 hover:bg-purple-primary/50 hover:text-white'
                    }`}
                  >
                    <Icon
                      className={`mr-3 h-5 w-5 ${
                        isActive(item.href) ? 'text-purple-primary' : 'text-gray-400 group-hover:text-gray-300'
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User info and logout for desktop */}
          {user && userProfile && (
            <div className="border-t border-purple-primary/20 p-4">
              <div className="flex items-center space-x-3 mb-3">
                <User className="w-8 h-8 text-yellow-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{userProfile.nome}</p>
                  <p className="text-xs text-gray-300 truncate">{userProfile.email}</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-yellow-primary/20 text-yellow-primary border-yellow-primary mb-3 w-full justify-center">
                {userProfile.role === 'atendente' ? 'Atendente' : 
                 userProfile.role === 'admin' ? 'Administrador' : 'Cliente'}
              </Badge>
              <Button 
                onClick={handleSignOut} 
                variant="ghost" 
                size="sm"
                className="w-full justify-start text-gray-300 hover:text-white hover:bg-purple-primary/50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className={`${user ? 'lg:pl-64' : ''}`}>
        <main className="py-4 lg:py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
