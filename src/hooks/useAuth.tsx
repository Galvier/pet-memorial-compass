
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, nomeAtendente: string, role?: 'atendente' | 'admin' | 'developer') => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isAtendente: () => boolean;
  isAdmin: () => boolean;
  isDeveloper: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string) => {
    try {
      // Primeiro verificar os metadados do usuário para role
      const { data: userData } = await supabase.auth.getUser();
      const userRole = userData.user?.user_metadata?.role;
      
      console.log('Metadados do usuário:', userData.user?.user_metadata);
      console.log('Role detectado nos metadados:', userRole);

      // Se é developer, usar diretamente os metadados
      if (userRole === 'developer') {
        setUserProfile({
          id: userId,
          email: userData.user?.email || '',
          role: 'developer',
          nome: userData.user?.user_metadata?.nome_atendente || userData.user?.user_metadata?.nome || 'Desenvolvedor'
        });
        return;
      }

      // Para atendentes e admins, verificar na tabela atendentes
      const { data: atendenteData } = await supabase
        .from('atendentes')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (atendenteData) {
        // Usar role dos metadados se disponível, senão usar 'atendente' como padrão
        const finalRole = userRole === 'admin' ? 'admin' : 'atendente';
        
        setUserProfile({
          id: userId,
          email: atendenteData.email,
          role: finalRole as 'atendente' | 'admin',
          nome: atendenteData.nome_atendente
        });
      } else {
        // Se não está na tabela atendentes e não é developer, usar role dos metadados
        if (userRole === 'admin') {
          setUserProfile({
            id: userId,
            email: userData.user?.email || '',
            role: 'admin',
            nome: userData.user?.user_metadata?.nome_atendente || userData.user?.user_metadata?.nome || 'Administrador'
          });
        } else {
          console.warn('Usuário não encontrado na tabela atendentes e não é developer/admin');
          setUserProfile(null);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          fetchUserProfile(session.user.id);
        } else {
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, nomeAtendente: string, role: 'atendente' | 'admin' | 'developer' = 'atendente') => {
    const redirectUrl = `${window.location.origin}/`;
    
    console.log('Cadastrando usuário com role:', role);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          nome_atendente: nomeAtendente,
          role: role // Garantir que o role seja salvo nos metadados
        }
      }
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserProfile(null);
  };

  const isAtendente = () => {
    return userProfile?.role === 'atendente';
  };

  const isAdmin = () => {
    return userProfile?.role === 'admin';
  };

  const isDeveloper = () => {
    return userProfile?.role === 'developer';
  };

  const value = {
    user,
    session,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    isAtendente,
    isAdmin,
    isDeveloper,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
