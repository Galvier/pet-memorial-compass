
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Shield, 
  History
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset
} from '@/components/ui/sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

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
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <Sidebar variant="floating" collapsible="icon">
          <SidebarHeader className="border-b border-purple-primary/20">
            <div className="flex items-center space-x-2 p-2">
              <img 
                src="/lovable-uploads/e05dec48-f72b-4ede-af54-afc2d1bebeef.png" 
                alt="Terranova Pet Logo" 
                className="h-8 w-8"
              />
              <div className="group-data-[collapsible=icon]:hidden">
                <h1 className="text-lg font-bold text-purple-primary">Terranova Pet</h1>
                <p className="text-xs text-yellow-primary">Painel Administrativo</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="bg-purple-primary">
            <SidebarMenu className="px-2 mt-4">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton 
                      asChild
                      isActive={isActive(item.href)}
                      className={`w-full transition-colors duration-200 ${
                        isActive(item.href)
                          ? 'bg-yellow-primary text-purple-primary hover:bg-yellow-primary/90'
                          : 'text-gray-300 hover:bg-purple-primary/50 hover:text-white'
                      }`}
                    >
                      <Link to={item.href} className="flex items-center space-x-3 px-3 py-2">
                        <Icon className="h-5 w-5" />
                        <span className="group-data-[collapsible=icon]:hidden">{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 bg-white border-b border-gray-200 px-4">
            <SidebarTrigger className="text-purple-primary hover:bg-purple-primary/10" />
            <div className="flex items-center space-x-2">
              <div className="lg:hidden">
                <h1 className="text-lg font-bold text-purple-primary">Terranova Pet</h1>
              </div>
            </div>
          </header>
          
          <main className="flex-1 p-4 lg:p-6">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
