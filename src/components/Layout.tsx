
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  BarChart3, 
  Shield, 
  Package, 
  Users, 
  UserCheck, 
  HeadphonesIcon, 
  LogOut, 
  User,
  Menu
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userProfile, signOut, isAtendente, isAdmin } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
      toast.success('Logout realizado com sucesso');
    } catch (error) {
      toast.error('Erro ao fazer logout');
    }
  };

  // Itens do menu baseados no tipo de usuário
  const getMenuItems = () => {
    const baseItems = [
      {
        title: "Dashboard",
        url: "/",
        icon: BarChart3,
        show: true
      }
    ];

    const adminItems = [
      {
        title: "Planos",
        url: "/planos",
        icon: Shield,
        show: isAdmin()
      },
      {
        title: "Itens de Venda",
        url: "/itens",
        icon: Package,
        show: isAdmin()
      },
      {
        title: "Atendimentos",
        url: "/atendimentos",
        icon: HeadphonesIcon,
        show: isAdmin()
      },
      {
        title: "Atendentes",
        url: "/atendentes",
        icon: Users,
        show: isAdmin()
      }
    ];

    const atendenteItems = [
      {
        title: "Meus Atendimentos",
        url: "/meus-atendimentos",
        icon: UserCheck,
        show: isAtendente()
      }
    ];

    return [...baseItems, ...adminItems, ...atendenteItems].filter(item => item.show);
  };

  const AppSidebar = () => (
    <Sidebar>
      <SidebarHeader className="border-b border-purple-primary/20 p-4">
        <div className="flex items-center space-x-3">
          <Heart className="w-8 h-8 text-purple-primary" />
          <div>
            <h2 className="font-bold text-purple-primary">Terranova Pet</h2>
            <p className="text-sm text-gray-600">Painel Administrativo</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {getMenuItems().map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === item.url}
                  >
                    <button
                      onClick={() => navigate(item.url)}
                      className="w-full flex items-center"
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-purple-primary/20 p-4">
        {user && userProfile && (
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <User className="w-8 h-8 text-purple-primary" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{userProfile.nome}</h3>
                <p className="text-sm text-gray-600 truncate">{userProfile.email}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="bg-purple-100 text-purple-800">
                {userProfile.role === 'atendente' ? 'Atendente' : 
                 userProfile.role === 'admin' ? 'Administrador' : 'Cliente'}
              </Badge>
              <Button onClick={handleSignOut} variant="outline" size="sm">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
          </header>
          <main className="flex-1 p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
