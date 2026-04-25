import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import NotFound from "./pages/NotFound.tsx";
import Cursos from "./pages/Cursos.tsx";
import Conteudos from "./pages/Conteudos.tsx";
import Parceiros from "./pages/Parceiros.tsx";
import Turmas from "./pages/Turmas.tsx";
import Calendario from "./pages/Calendario.tsx";
import Auth from "./pages/Auth.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/jovens" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/cursos" element={<ProtectedRoute><Cursos /></ProtectedRoute>} />
          <Route path="/conteudos" element={<ProtectedRoute><Conteudos /></ProtectedRoute>} />
          <Route path="/parceiros" element={<ProtectedRoute><Parceiros /></ProtectedRoute>} />
          <Route path="/turmas" element={<ProtectedRoute><Turmas /></ProtectedRoute>} />
          <Route path="/calendario/:id" element={<ProtectedRoute><Calendario /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
