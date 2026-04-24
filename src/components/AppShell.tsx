import { Link, useLocation } from "react-router-dom";
import { Calendar, GraduationCap, BookOpen, Users, Building2, UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Jovens", icon: Users },
  { to: "/turmas", label: "Turmas", icon: UsersRound },
  { to: "/cursos", label: "Cursos", icon: GraduationCap },
  { to: "/conteudos", label: "Conteúdos", icon: BookOpen },
  { to: "/parceiros", label: "Parceiros", icon: Building2 },
];

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const loc = useLocation();
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
              <Calendar className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-bold gradient-text">Jovem Aprendiz</span>
              <span className="text-[10px] text-muted-foreground">Calendário de Atividades</span>
            </div>
          </Link>
          <nav className="flex items-center gap-1">
            {items.map((it) => {
              const active = loc.pathname === it.to || (it.to !== "/" && loc.pathname.startsWith(it.to));
              const Icon = it.icon;
              return (
                <Link
                  key={it.to}
                  to={it.to}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{it.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="container py-8 animate-fade-in">{children}</main>
    </div>
  );
};
