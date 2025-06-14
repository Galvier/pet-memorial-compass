
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Shield, 
  History,
  Menu,
  X
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Planos', href: '/planos', icon: Shield },
    { name: 'Itens de Venda', href: '/itens', icon: Package },
    { name: 'Atendimentos', href: '/atendimentos', icon: History },
  ];

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
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
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-64 lg:block">
        <div className="bg-purple-primary shadow-lg h-full">
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
          
          <nav className="mt-6 px-3">
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
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="py-4 lg:py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
