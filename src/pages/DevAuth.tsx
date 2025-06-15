
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Code, Lock, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const DevAuth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, userProfile, signIn, isDeveloper } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && userProfile) {
      if (isDeveloper()) {
        navigate('/diagnostico');
      } else {
        toast.error('Acesso negado: credenciais de desenvolvedor necessárias');
        navigate('/');
      }
    }
  }, [user, userProfile, navigate, isDeveloper]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Credenciais inválidas. Verifique seu email e senha de desenvolvedor.');
        } else {
          toast.error(`Erro no login: ${error.message}`);
        }
      } else {
        toast.success('Login de desenvolvedor realizado com sucesso!');
      }
    } catch (error) {
      toast.error('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-700 p-4">
      <Card className="w-full max-w-md border-gray-600 bg-gray-800 text-white">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Code className="w-12 h-12 text-blue-400" />
          </div>
          <CardTitle className="text-2xl text-blue-400">
            Acesso Desenvolvedor
          </CardTitle>
          <p className="text-gray-300">Sistema de Diagnóstico Pet Memorial</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-dev" className="text-gray-200">Email do Desenvolvedor</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email-dev"
                  type="email"
                  placeholder="dev@petmemorial.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password-dev" className="text-gray-200">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password-dev"
                  type="password"
                  placeholder="Senha do desenvolvedor"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  required
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
              {loading ? 'Autenticando...' : 'Acessar Sistema de Diagnóstico'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-gray-700 rounded-lg">
            <h3 className="text-sm font-semibold text-yellow-400 mb-2">⚠️ Área Restrita</h3>
            <p className="text-xs text-gray-300">
              Este é um sistema de diagnóstico para desenvolvedores. 
              Apenas usuários com credenciais específicas podem acessar.
            </p>
          </div>

          <div className="mt-4 text-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-white"
            >
              ← Voltar ao sistema principal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DevAuth;
