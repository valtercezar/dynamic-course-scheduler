import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Calendar, GraduationCap, BookOpen, Users, Building2, UsersRound, LayoutDashboard, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { supabase } from "@/integrations/supabase/client";

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const loc = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const items = [
    { to: "/", label: t("nav.dashboard"), icon: LayoutDashboard },
    { to: "/jovens", label: t("nav.youth"), icon: Users },
    { to: "/turmas", label: t("nav.classes"), icon: UsersRound },
    { to: "/cursos", label: t("nav.courses"), icon: GraduationCap },
    { to: "/conteudos", label: t("nav.content"), icon: BookOpen },
    { to: "/parceiros", label: t("nav.partners"), icon: Building2 },
  ];

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
              <Calendar className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-bold gradient-text">{t("brand.name")}</span>
              <span className="text-[10px] text-muted-foreground">{t("brand.tagline")}</span>
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
          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <Button variant="ghost" size="sm" onClick={signOut} title={t("auth.signOut")}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      <main className="container py-8 animate-fade-in">{children}</main>
    </div>
  );
};
