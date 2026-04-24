import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Cursos from "./pages/Cursos.tsx";
import Conteudos from "./pages/Conteudos.tsx";
import Parceiros from "./pages/Parceiros.tsx";
import Turmas from "./pages/Turmas.tsx";
import Calendario from "./pages/Calendario.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/cursos" element={<Cursos />} />
          <Route path="/conteudos" element={<Conteudos />} />
          <Route path="/parceiros" element={<Parceiros />} />
          <Route path="/turmas" element={<Turmas />} />
          <Route path="/calendario/:id" element={<Calendario />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
