import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { generateCalendar, groupByMonth, type CalendarDay } from "@/lib/calendar";
import { useMemo } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const Calendario = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const locale = i18n.language?.startsWith("pt") ? "pt-BR" : "en-US";
  const months = t("calendar.months", { returnObjects: true }) as string[];
  const weekdays = t("calendar.weekdays", { returnObjects: true }) as string[];

  const { data, isLoading } = useQuery({
    queryKey: ["jovem-full", id],
    queryFn: async () => {
      const [jovem, feriados] = await Promise.all([
        (supabase as any).from("jovens").select("*").eq("id", id).maybeSingle(),
        (supabase as any).from("feriados").select("*"),
      ]);
      if (jovem.error) throw jovem.error;
      if (!jovem.data) return null;
      const { data: turma } = await (supabase as any).from("turmas").select("*").eq("id", jovem.data.turma_id).maybeSingle();
      let curso: any = null, parceiro: any = null, conteudos: any[] = [];
      if (turma) {
        const cursoRes = await (supabase as any).from("cursos").select("*").eq("id", turma.curso_id).maybeSingle();
        curso = cursoRes.data;
        const links = await (supabase as any).from("curso_conteudos").select("conteudo_id").eq("curso_id", turma.curso_id);
        if (links.data?.length) {
          const ids = links.data.map((l: any) => l.conteudo_id);
          const cs = await (supabase as any).from("conteudos").select("*").in("id", ids);
          conteudos = cs.data ?? [];
        }
      }
      if (jovem.data.parceiro_id) {
        const r = await (supabase as any).from("parceiros").select("*").eq("id", jovem.data.parceiro_id).maybeSingle();
        parceiro = r.data;
      }
      return { jovem: jovem.data, turma, curso, parceiro, conteudos, feriados: feriados.data ?? [] };
    },
    enabled: !!id,
  });

  const calendar = useMemo(() => {
    if (!data?.jovem || !data.turma || !data.curso) return [];
    return generateCalendar({
      start: new Date(data.jovem.data_inicio + "T00:00:00"),
      end: new Date(data.jovem.data_fim + "T00:00:00"),
      diaTeorico: data.turma.dia_teorico,
      horaInicio: data.turma.hora_inicio,
      horaFim: data.turma.hora_fim,
      turnoTercaSabado: data.turma.turno_terca_a_sabado,
      cargaTotal: data.curso.carga_total,
      cursoNome: data.curso.nome,
      parceiroNome: data.parceiro?.nome,
      conteudosTeoricos: data.conteudos.map((c: any) => ({ titulo: c.titulo, descricao: c.descricao })),
      labels: {
        initialTitle: t("calendar.initialLabel"),
        initialDesc: t("calendar.initialDesc"),
        practicalTitleWith: (name: string) => t("calendar.practicalAt", { name }),
        practicalTitleGeneric: t("calendar.practicalGeneric"),
        practicalDescWith: (name: string) => t("calendar.practicalDesc", { name }),
        practicalDescGeneric: t("calendar.practicalDescGeneric"),
        theoreticalDesc: t("calendar.theoreticalDesc"),
      },
    }, data.feriados.map((f: any) => ({ mes: f.mes, dia: f.dia, nome: f.nome })));
  }, [data, t]);

  const grouped = useMemo(() => groupByMonth(calendar), [calendar]);

  if (isLoading) return <AppShell><p className="text-sm text-muted-foreground">{t("common.loading")}</p></AppShell>;
  if (!data?.jovem) return <AppShell><p>{t("calendar.notFound")}</p></AppShell>;
  if (!data.turma || !data.curso) return (
    <AppShell>
      <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> {t("common.back")}</Link>
      <Card className="bg-gradient-card p-8 text-center">
        <h2 className="mb-2 font-semibold">{t("calendar.incomplete")}</h2>
        <p className="text-sm text-muted-foreground">{t("calendar.incompleteHint")}</p>
      </Card>
    </AppShell>
  );

  const counts = calendar.reduce((acc, d) => { acc[d.type] = (acc[d.type] ?? 0) + 1; return acc; }, {} as Record<string, number>);

  return (
    <AppShell>
      <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> {t("common.back")}</Link>

      <Card className="mb-6 overflow-hidden border-0 bg-gradient-hero p-8 text-primary-foreground shadow-elevated">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider opacity-80">{t("calendar.title")}</p>
            <h1 className="text-3xl font-bold">{data.jovem.nome}</h1>
            <p className="mt-1 text-sm opacity-90">{data.curso.nome} · {data.turma.codigo}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
            <Stat label={t("calendar.start")} value={new Date(data.jovem.data_inicio).toLocaleDateString(locale)} />
            <Stat label={t("calendar.end")} value={new Date(data.jovem.data_fim).toLocaleDateString(locale)} />
            <Stat label={t("calendar.totalLoad")} value={`${data.curso.carga_total}h`} />
            <Stat label={t("calendar.partner")} value={data.parceiro?.nome ?? "—"} />
          </div>
        </div>
      </Card>

      <Card className="mb-6 flex flex-wrap items-center gap-4 bg-gradient-card p-4 text-xs">
        <Legend dot="bg-[hsl(var(--day-special))]" border="border-[hsl(var(--day-special-border))]" label={`${t("calendar.initial")} (${counts["special-initial"] ?? 0})`} />
        <Legend dot="bg-[hsl(var(--day-theoretical))]" border="border-[hsl(var(--day-theoretical-border))]" label={`${t("calendar.theoretical")} (${counts.theoretical ?? 0})`} />
        <Legend dot="bg-[hsl(var(--day-practical))]" border="border-[hsl(var(--day-practical-border))]" label={`${t("calendar.practical")} (${counts.practical ?? 0})`} />
        <Legend dot="bg-[hsl(var(--day-weekend))]" label={`${t("calendar.weekend")} (${counts.weekend ?? 0})`} />
        <Legend dot="bg-[hsl(var(--day-holiday))]" label={`${t("calendar.holiday")} (${counts.holiday ?? 0})`} />
      </Card>

      <TooltipProvider delayDuration={100}>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {grouped.map((m) => (
            <Card key={`${m.year}-${m.month}`} className="overflow-hidden bg-gradient-card p-0 shadow-soft hover-lift animate-scale-in">
              <div className="bg-gradient-month px-4 py-3 text-center text-sm font-bold uppercase tracking-wider text-primary-foreground">
                {months[m.month]} {m.year}
              </div>
              <MonthGrid month={m.month} year={m.year} days={m.days} weekdays={weekdays} weekendLabel={t("calendar.noActivities")} />
            </Card>
          ))}
        </div>
      </TooltipProvider>
    </AppShell>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl bg-white/10 px-3 py-2 backdrop-blur">
    <p className="text-[10px] uppercase tracking-wider opacity-80">{label}</p>
    <p className="text-sm font-semibold">{value}</p>
  </div>
);

const Legend = ({ dot, border, label }: { dot: string; border?: string; label: string }) => (
  <div className="flex items-center gap-2">
    <span className={cn("h-4 w-4 rounded-md border", dot, border ?? "border-transparent")} />
    <span className="text-muted-foreground">{label}</span>
  </div>
);

const MonthGrid = ({ month, year, days, weekdays, weekendLabel }: { month: number; year: number; days: CalendarDay[]; weekdays: string[]; weekendLabel: string }) => {
  const first = new Date(year, month, 1);
  const startPad = first.getDay();
  const cells: (CalendarDay | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  cells.push(...days);

  return (
    <div className="p-3">
      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {weekdays.map((w) => <div key={w}>{w}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => d ? <DayCell key={i} d={d} weekendLabel={weekendLabel} /> : <div key={i} />)}
      </div>
    </div>
  );
};

const typeStyles: Record<string, string> = {
  weekend: "bg-[hsl(var(--day-weekend))] text-[hsl(var(--day-weekend-fg))]",
  theoretical: "bg-[hsl(var(--day-theoretical))] text-[hsl(var(--day-theoretical-fg))] border border-[hsl(var(--day-theoretical-border))]",
  practical: "bg-[hsl(var(--day-practical))] text-[hsl(var(--day-practical-fg))] border border-[hsl(var(--day-practical-border))]",
  "special-initial": "bg-[hsl(var(--day-special))] text-[hsl(var(--day-special-fg))] border border-[hsl(var(--day-special-border))] font-bold",
  holiday: "bg-[hsl(var(--day-holiday))] text-[hsl(var(--day-holiday-fg))] font-bold",
};

const DayCell = ({ d, weekendLabel }: { d: CalendarDay; weekendLabel: string }) => {
  const cell = (
    <div className={cn("aspect-square cursor-pointer rounded-lg p-1 text-center text-xs font-medium transition-all hover:scale-110 hover:shadow-soft flex items-center justify-center", typeStyles[d.type])}>
      {d.date.getDate()}
    </div>
  );
  const hasTooltip = d.title || d.holidayName || d.type === "weekend";
  if (!hasTooltip) return cell;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{cell}</TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        {d.holidayName && <p className="font-semibold">🎉 {d.holidayName}</p>}
        {d.title && <p className="font-semibold">{d.title}</p>}
        {d.time && <p className="text-xs">⏰ {d.time}</p>}
        {d.desc && <p className="mt-1 text-xs opacity-90">{d.desc}</p>}
        {d.type === "weekend" && !d.holidayName && <p className="text-xs">{weekendLabel}</p>}
      </TooltipContent>
    </Tooltip>
  );
};

export default Calendario;
