
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Planos from "./pages/Planos";
import Itens from "./pages/Itens";
import Atendimentos from "./pages/Atendimentos";
import AtendimentoDetailPage from "./pages/AtendimentoDetail";
import Atendentes from "./pages/Atendentes";
import MeusAtendimentos from "./pages/MeusAtendimentos";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route 
              path="/planos" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <Planos />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/itens" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <Itens />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/atendimentos" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <Atendimentos />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/atendimentos/:id" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AtendimentoDetailPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/atendentes" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <Atendentes />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/meus-atendimentos" 
              element={
                <ProtectedRoute requireAtendente={true}>
                  <MeusAtendimentos />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
