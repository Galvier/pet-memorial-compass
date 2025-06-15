
import { HomeIcon, Users, ClipboardList, Package, ShoppingCart, UserCheck, Users2, Clock } from "lucide-react";
import Index from "./pages/Index";
import Atendimentos from "./pages/Atendimentos";
import MeusAtendimentos from "./pages/MeusAtendimentos";
import FilaAtendimentos from "./pages/FilaAtendimentos";
import Atendentes from "./pages/Atendentes";
import Planos from "./pages/Planos";
import Itens from "./pages/Itens";

export const navItems = [
  {
    title: "Dashboard",
    to: "/dashboard",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "Fila de Atendimentos",
    to: "/fila-atendimentos",
    icon: <Clock className="h-4 w-4" />,
    page: <FilaAtendimentos />,
  },
  {
    title: "Meus Atendimentos",
    to: "/meus-atendimentos",
    icon: <UserCheck className="h-4 w-4" />,
    page: <MeusAtendimentos />,
  },
  {
    title: "Todos Atendimentos",
    to: "/atendimentos",
    icon: <ClipboardList className="h-4 w-4" />,
    page: <Atendimentos />,
  },
  {
    title: "Atendentes",
    to: "/atendentes",
    icon: <Users2 className="h-4 w-4" />,
    page: <Atendentes />,
  },
  {
    title: "Planos",
    to: "/planos",
    icon: <Package className="h-4 w-4" />,
    page: <Planos />,
  },
  {
    title: "Itens de Venda",
    to: "/itens",
    icon: <ShoppingCart className="h-4 w-4" />,
    page: <Itens />,
  },
];
