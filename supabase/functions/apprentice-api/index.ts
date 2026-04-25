import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// ---- Calendar engine (mirrors src/lib/calendar.ts, server-side) ----
type Holiday = { mes: number; dia: number; nome: string };

function isHoliday(date: Date, holidays: Holiday[]) {
  return holidays.find(
    (h) => h.mes === date.getMonth() + 1 && h.dia === date.getDate(),
  );
}

function isWorkday(date: Date, tueToSat: boolean) {
  const dow = date.getDay(); // 0=Sun ... 6=Sat
  return tueToSat ? dow !== 0 && dow !== 1 : dow !== 0 && dow !== 6;
}

function generateCalendar(opts: {
  start: Date;
  end: Date;
  diaTeorico: number;
  cargaTotal: number;
  cargaSemanal: number;
  tueToSat: boolean;
  contents: { titulo: string; descricao: string | null }[];
  partner: string | null;
  holidays: Holiday[];
  horaInicio: string;
  horaFim: string;
}) {
  const days: any[] = [];
  let initialCount = 0;
  let theoreticalHours = 0;
  let contentIdx = 0;
  const cur = new Date(opts.start);

  while (cur <= opts.end) {
    const date = new Date(cur);
    const holiday = isHoliday(date, opts.holidays);
    const work = isWorkday(date, opts.tueToSat);

    if (holiday) {
      days.push({ date: date.toISOString().slice(0, 10), type: "holiday", title: holiday.nome });
    } else if (!work) {
      days.push({ date: date.toISOString().slice(0, 10), type: "off" });
    } else if (initialCount < 10) {
      initialCount++;
      days.push({
        date: date.toISOString().slice(0, 10),
        type: "initial",
        title: "Initial Concentration",
      });
    } else if (
      date.getDay() === opts.diaTeorico &&
      theoreticalHours < opts.cargaTotal
    ) {
      const c = opts.contents[contentIdx % Math.max(opts.contents.length, 1)];
      contentIdx++;
      theoreticalHours += opts.cargaSemanal;
      days.push({
        date: date.toISOString().slice(0, 10),
        type: "theoretical",
        title: c?.titulo ?? "Theoretical class",
        description: c?.descricao ?? null,
        time: `${opts.horaInicio}-${opts.horaFim}`,
      });
    } else {
      days.push({
        date: date.toISOString().slice(0, 10),
        type: "practical",
        title: opts.partner ? `Practical at ${opts.partner}` : "Practical",
        time: "09:00-15:00",
      });
    }
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return json({ error: "Unauthorized: missing JWT" }, 401);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const token = authHeader.replace("Bearer ", "");
  const { data: userData, error: userErr } = await supabase.auth.getUser(token);
  if (userErr || !userData.user) {
    return json({ error: "Unauthorized: invalid JWT" }, 401);
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const action = body?.action as string;

  try {
    if (action === "stats") {
      const [j, c, t, p] = await Promise.all([
        supabase.from("jovens").select("id, data_fim", { count: "exact" }),
        supabase.from("cursos").select("id", { count: "exact", head: true }),
        supabase.from("turmas").select("id", { count: "exact", head: true }),
        supabase.from("parceiros").select("id", { count: "exact", head: true }),
      ]);
      const today = new Date().toISOString().slice(0, 10);
      const active = (j.data ?? []).filter((x: any) => x.data_fim >= today).length;
      return json({
        user: userData.user.email,
        apprentices: { total: j.count ?? 0, active },
        courses: c.count ?? 0,
        classes: t.count ?? 0,
        partners: p.count ?? 0,
      });
    }

    if (action === "list_apprentices") {
      const { data, error } = await supabase
        .from("jovens")
        .select("id, nome, cpf, data_inicio, data_fim, turmas(codigo), parceiros(nome)")
        .order("nome");
      if (error) throw error;
      return json({ apprentices: data });
    }

    if (action === "calendar") {
      const jovemId = body?.jovem_id;
      if (!jovemId) return json({ error: "jovem_id required" }, 400);

      const { data: jovem, error: je } = await supabase
        .from("jovens")
        .select("*, turmas(*, cursos(*)), parceiros(nome)")
        .eq("id", jovemId)
        .maybeSingle();
      if (je) throw je;
      if (!jovem) return json({ error: "Apprentice not found" }, 404);

      const turma: any = jovem.turmas;
      if (!turma) return json({ error: "Apprentice has no class" }, 400);
      const curso: any = turma.cursos;

      const { data: links } = await supabase
        .from("curso_conteudos")
        .select("ordem, conteudos(titulo, descricao)")
        .eq("curso_id", curso.id)
        .order("ordem");
      const contents = (links ?? []).map((l: any) => l.conteudos).filter(Boolean);

      const { data: holidays } = await supabase
        .from("feriados")
        .select("mes, dia, nome");

      const days = generateCalendar({
        start: new Date(jovem.data_inicio),
        end: new Date(jovem.data_fim),
        diaTeorico: turma.dia_teorico,
        cargaTotal: curso.carga_total,
        cargaSemanal: curso.carga_semanal,
        tueToSat: turma.turno_terca_a_sabado,
        contents,
        partner: jovem.parceiros?.nome ?? null,
        holidays: holidays ?? [],
        horaInicio: turma.hora_inicio,
        horaFim: turma.hora_fim,
      });

      return json({
        apprentice: { id: jovem.id, name: jovem.nome },
        course: curso.nome,
        class: turma.codigo,
        days,
      });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e: any) {
    return json({ error: e.message ?? "Server error" }, 500);
  }
});
