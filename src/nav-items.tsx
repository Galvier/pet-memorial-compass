
import { HomeIcon, Users, ClipboardList, Package, ShoppingCart, UserCheck, Users2, Clock, BarChart3 } from "lucide-react";
import Index from "./pages/Index";
import Atendimentos from "./pages/Atendimentos";
import MeusAtendimentos from "./pages/MeusAtendimentos";
import FilaAtendimentos from "./pages/FilaAtendimentos";
import Atendentes from "./pages/Atendentes";
import Planos from "./pages/Planos";
import Itens from "./pages/Itens";
import AnalyticsAdmin from "./pages/AnalyticsAdmin";

export const navItems = [
  {
    title: "Fila de Atendimentos",
    to: "/fila-atendimentos",
    icon: <Clock className="h-4 w-4" />,
    page: <FilaAtendimentos />,
    roles: ['admin', 'atendente']
  },
  {
    title: "Meus Atendimentos",
    to: "/meus-atendimentos",
    icon: <UserCheck className="h-4 w-4" />,
    page: <MeusAtendimentos />,
    roles: ['atendente']
  },
  {
    title: "Todos Atendimentos",
    to: "/atendimentos",
    icon: <ClipboardList className="h-4 w-4" />,
    page: <Atendimentos />,
    roles: ['admin']
  },
  {
    title: "Analytics Executivos",
    to: "/analytics-admin",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <AnalyticsAdmin />,
    roles: ['admin']
  },
  {
    title: "Atendentes",
    to: "/atendentes",
    icon: <Users2 className="h-4 w-4" />,
    page: <Atendentes />,
    roles: ['admin']
  },
  {
    title: "Planos",
    to: "/planos",
    icon: <Package className="h-4 w-4" />,
    page: <Planos />,
    roles: ['admin']
  },
  {
    title: "Itens de Venda",
    to: "/itens",
    icon: <ShoppingCart className="h-4 w-4" />,
    page: <Itens />,
    roles: ['admin']
  },
];
