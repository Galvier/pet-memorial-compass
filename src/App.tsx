
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Planos from "./pages/Planos";
import Itens from "./pages/Itens";
import Atendimentos from "./pages/Atendimentos";
import AtendimentoDetailPage from "./pages/AtendimentoDetail";
import Atendentes from "./pages/Atendentes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/planos" element={<Planos />} />
          <Route path="/itens" element={<Itens />} />
          <Route path="/atendimentos" element={<Atendimentos />} />
          <Route path="/atendimentos/:id" element={<AtendimentoDetailPage />} />
          <Route path="/atendentes" element={<Atendentes />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
