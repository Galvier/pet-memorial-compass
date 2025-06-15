
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { navItems } from "./nav-items";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import DevAuth from "./pages/DevAuth";
import Diagnostico from "./pages/Diagnostico";
import Analytics from "./pages/Analytics";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DeveloperProtectedRoute } from "./components/DeveloperProtectedRoute";
import FilaAtendimentos from "./pages/FilaAtendimentos";
import AtendimentoDetailPage from "./pages/AtendimentoDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dev-auth" element={<DevAuth />} />
          <Route 
            path="/diagnostico" 
            element={
              <DeveloperProtectedRoute>
                <Diagnostico />
              </DeveloperProtectedRoute>
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <DeveloperProtectedRoute>
                <Analytics />
              </DeveloperProtectedRoute>
            } 
          />
          {navItems.map(({ to, page }) => (
            <Route
              key={to}
              path={to}
              element={
                <ProtectedRoute>
                  {page}
                </ProtectedRoute>
              }
            />
          ))}
          <Route 
            path="/atendimentos/:id" 
            element={
              <ProtectedRoute>
                <AtendimentoDetailPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/fila-atendimentos" 
            element={
              <ProtectedRoute>
                <FilaAtendimentos />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
