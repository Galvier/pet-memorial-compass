
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { navItems } from "./nav-items";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Diagnostico from "./pages/Diagnostico";
import { ProtectedRoute } from "./components/ProtectedRoute";
import FilaAtendimentos from "./pages/FilaAtendimentos";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route 
            path="/diagnostico" 
            element={
              <ProtectedRoute>
                <Diagnostico />
              </ProtectedRoute>
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
