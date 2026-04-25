import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Calendar } from "lucide-react";
import { toast } from "sonner";

const Auth = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!authLoading && session) return <Navigate to="/" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) throw error;
        toast.success(t("auth.signupSuccess"));
        setMode("signin");
      }
    } catch (err: any) {
      toast.error(err.message ?? t("auth.invalidCredentials"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-hero opacity-20" />
      <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
      <div className="absolute -right-32 bottom-20 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />

      <div className="absolute right-4 top-4 z-10">
        <LanguageSwitcher />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gradient-card p-8 shadow-elevated backdrop-blur-xl">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
              <Calendar className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold gradient-text">{t("brand.name")}</h1>
            <p className="mt-1 text-xs text-muted-foreground">{t("brand.tagline")}</p>
          </div>

          <h2 className="mb-1 text-center text-lg font-semibold">{t("auth.title")}</h2>
          <p className="mb-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? t("auth.subtitle") : t("auth.signupSubtitle")}
          </p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full bg-gradient-primary" disabled={loading}>
              {loading ? "…" : mode === "signin" ? t("auth.signIn") : t("auth.signUp")}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? (
              <>
                {t("auth.noAccount")}{" "}
                <button onClick={() => setMode("signup")} className="font-medium text-primary hover:underline">
                  {t("auth.createAccount")}
                </button>
              </>
            ) : (
              <>
                {t("auth.hasAccount")}{" "}
                <button onClick={() => setMode("signin")} className="font-medium text-primary hover:underline">
                  {t("auth.signIn")}
                </button>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
