import { Link } from "react-router-dom";
import { useList } from "@/hooks/useCrud";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  UsersRound,
  GraduationCap,
  BookOpen,
  Building2,
  Calendar,
  ArrowRight,
  TrendingUp,
  Clock,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

type Jovem = { id: string; nome: string; turma_id: string | null; parceiro_id: string | null; data_inicio: string; data_fim: string };
type Turma = { id: string; codigo: string; curso_id: string };
type Curso = { id: string; nome: string; carga_total: number; carga_semanal: number };
type Parceiro = { id: string; nome: string };
type Conteudo = { id: string; titulo: string };

const Dashboard = () => {
  const { data: jovens = [] } = useList<Jovem>("jovens");
  const { data: turmas = [] } = useList<Turma>("turmas");
  const { data: cursos = [] } = useList<Curso>("cursos");
  const { data: parceiros = [] } = useList<Parceiro>("parceiros");
  const { data: conteudos = [] } = useList<Conteudo>("conteudos");

  const today = new Date();
  const ativos = jovens.filter((j) => new Date(j.data_inicio) <= today && new Date(j.data_fim) >= today);
  const proximoFim = jovens
    .filter((j) => new Date(j.data_fim) >= today)
    .sort((a, b) => +new Date(a.data_fim) - +new Date(b.data_fim))
    .slice(0, 5);

  // Jovens por parceiro
  const porParceiro = parceiros.map((p) => ({
    nome: p.nome.length > 12 ? p.nome.slice(0, 12) + "…" : p.nome,
    total: jovens.filter((j) => j.parceiro_id === p.id).length,
  }));
  const semParceiro = jovens.filter((j) => !j.parceiro_id).length;
  if (semParceiro > 0) porParceiro.push({ nome: "Sem parceiro", total: semParceiro });

  // Jovens por curso (via turma)
  const porCurso = cursos.map((c) => {
    const turmaIds = turmas.filter((t) => t.curso_id === c.id).map((t) => t.id);
    return { nome: c.nome.length > 14 ? c.nome.slice(0, 14) + "…" : c.nome, total: jovens.filter((j) => j.turma_id && turmaIds.includes(j.turma_id)).length };
  });

  const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--destructive))", "hsl(var(--muted-foreground))"];

  const stats = [
    { label: "Jovens", value: jovens.length, sub: `${ativos.length} ativos`, icon: Users, to: "/jovens", color: "from-primary to-accent" },
    { label: "Turmas", value: turmas.length, sub: "abertas", icon: UsersRound, to: "/turmas", color: "from-accent to-primary" },
    { label: "Cursos", value: cursos.length, sub: "cadastrados", icon: GraduationCap, to: "/cursos", color: "from-success to-primary" },
    { label: "Parceiros", value: parceiros.length, sub: "empresas", icon: Building2, to: "/parceiros", color: "from-warning to-accent" },
    { label: "Conteúdos", value: conteudos.length, sub: "trilhas", icon: BookOpen, to: "/conteudos", color: "from-primary to-success" },
  ];

  return (
    <AppShell>
      <PageHeader title="Dashboard" subtitle="Visão geral do programa Jovem Aprendiz" />

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} to={s.to}>
              <Card className="hover-lift group relative overflow-hidden bg-gradient-card p-5">
                <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${s.color} opacity-10 blur-2xl transition-opacity group-hover:opacity-20`} />
                <div className="relative">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-3xl font-bold tracking-tight">{s.value}</div>
                  <div className="mt-1 text-sm font-medium">{s.label}</div>
                  <div className="text-xs text-muted-foreground">{s.sub}</div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="bg-gradient-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">Jovens por curso</h3>
          </div>
          {porCurso.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Sem dados ainda</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={porCurso}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="nome" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="bg-gradient-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-accent" />
            <h3 className="font-semibold">Distribuição por parceiro</h3>
          </div>
          {porParceiro.every((p) => p.total === 0) ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Sem dados ainda</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={porParceiro.filter((p) => p.total > 0)} dataKey="total" nameKey="nome" cx="50%" cy="50%" outerRadius={80} label>
                  {porParceiro.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Próximos términos */}
      <Card className="mt-6 bg-gradient-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-warning" />
            <h3 className="font-semibold">Próximos términos de contrato</h3>
          </div>
          <Link to="/jovens"><Button variant="ghost" size="sm">Ver todos <ArrowRight className="ml-1 h-3.5 w-3.5" /></Button></Link>
        </div>
        {proximoFim.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Nenhum jovem ativo</p>
        ) : (
          <div className="divide-y divide-border/60">
            {proximoFim.map((j) => {
              const turma = turmas.find((t) => t.id === j.turma_id);
              const dias = Math.ceil((+new Date(j.data_fim) - +today) / (1000 * 60 * 60 * 24));
              return (
                <Link key={j.id} to={`/calendario/${j.id}`} className="flex items-center justify-between py-3 transition-colors hover:bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-sm font-bold text-primary-foreground">{j.nome.charAt(0).toUpperCase()}</div>
                    <div>
                      <p className="text-sm font-medium">{j.nome}</p>
                      <p className="text-xs text-muted-foreground">Turma {turma?.codigo ?? "—"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{new Date(j.data_fim).toLocaleDateString("pt-BR")}</p>
                    <p className="text-xs text-muted-foreground">{dias} dias restantes</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Card>
    </AppShell>
  );
};

export default Dashboard;
