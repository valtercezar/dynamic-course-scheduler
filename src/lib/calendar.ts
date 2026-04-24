// Calendar generation engine - Programa Jovem Aprendiz

export type DayType = "weekend" | "holiday" | "special-initial" | "theoretical" | "practical" | "outside";

export interface CalendarDay {
  date: Date;
  type: DayType;
  title?: string;
  time?: string;
  desc?: string;
  holidayName?: string;
}

export interface Holiday {
  mes: number; // 1-12
  dia: number;
  nome: string;
}

export interface GenerateOptions {
  start: Date;
  end: Date;
  diaTeorico: number; // 0=Dom..6=Sab
  horaInicio: string; // "08:00"
  horaFim: string; // "14:00"
  turnoTercaSabado: boolean;
  cargaTotal: number; // horas teóricas totais
  horasPorAulaTeorica?: number; // default = duração da turma
  cursoNome: string;
  parceiroNome?: string;
  conteudosTeoricos: { titulo: string; descricao?: string | null }[];
}

const isHoliday = (d: Date, holidays: Holiday[]) =>
  holidays.find((h) => h.mes === d.getMonth() + 1 && h.dia === d.getDate());

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const addDays = (d: Date, n: number) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

function durationHours(hi: string, hf: string): number {
  const [h1, m1] = hi.split(":").map(Number);
  const [h2, m2] = hf.split(":").map(Number);
  return (h2 + m2 / 60) - (h1 + m1 / 60);
}

/**
 * Determina se o dia da semana é "útil" para a regra:
 *  - Padrão: Seg-Sex (1..5)
 *  - Turno terça-a-sábado: 2..6
 */
function isWorkDay(date: Date, turnoTercaSabado: boolean): boolean {
  const dow = date.getDay();
  return turnoTercaSabado ? dow >= 2 && dow <= 6 : dow >= 1 && dow <= 5;
}

export function generateCalendar(opts: GenerateOptions, holidays: Holiday[]): CalendarDay[] {
  const {
    start, end, diaTeorico, horaInicio, horaFim, turnoTercaSabado,
    cargaTotal, cursoNome, parceiroNome, conteudosTeoricos,
  } = opts;

  const horasPorAula = opts.horasPorAulaTeorica ?? durationHours(horaInicio, horaFim);
  const totalAulasTeoricas = Math.ceil(cargaTotal / Math.max(horasPorAula, 1));

  const days: CalendarDay[] = [];
  const horario = `${horaInicio} - ${horaFim}`;

  // 1) Encontrar os primeiros 10 dias úteis a partir do start (concentração inicial)
  const initialDates: Date[] = [];
  let cursor = new Date(start);
  while (initialDates.length < 10 && cursor <= end) {
    const isWeekend = !isWorkDay(cursor, turnoTercaSabado);
    const holiday = isHoliday(cursor, holidays);
    if (!isWeekend && !holiday) initialDates.push(new Date(cursor));
    cursor = addDays(cursor, 1);
  }

  let aulasTeoricasAgendadas = 0;
  const teoricoSemanaUsado = new Set<string>(); // chave: yyyy-ww

  const weekKey = (d: Date) => {
    const onejan = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil(((d.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
    return `${d.getFullYear()}-${week}`;
  };

  // 2) Itera dia a dia entre start e end
  let d = new Date(start);
  while (d <= end) {
    const date = new Date(d);
    const holiday = isHoliday(date, holidays);
    const workDay = isWorkDay(date, turnoTercaSabado);

    if (holiday) {
      days.push({ date, type: "holiday", holidayName: holiday.nome });
    } else if (!workDay) {
      days.push({ date, type: "weekend" });
    } else if (initialDates.some((x) => sameDay(x, date))) {
      days.push({
        date,
        type: "special-initial",
        title: "🎓 Concentração Inicial",
        time: horario,
        desc: "Integração, boas-vindas, apresentação do programa",
      });
    } else {
      // Teórico: dia da semana == diaTeorico, 1x por semana, até bater carga
      const isTeoricoDia = date.getDay() === diaTeorico;
      const wk = weekKey(date);
      if (isTeoricoDia && aulasTeoricasAgendadas < totalAulasTeoricas && !teoricoSemanaUsado.has(wk)) {
        const conteudo = conteudosTeoricos.length
          ? conteudosTeoricos[aulasTeoricasAgendadas % conteudosTeoricos.length]
          : { titulo: cursoNome, descricao: "Aula teórica" };
        days.push({
          date,
          type: "theoretical",
          title: `📚 ${conteudo.titulo}`,
          time: horario,
          desc: conteudo.descricao || "Aula teórica do curso",
        });
        aulasTeoricasAgendadas++;
        teoricoSemanaUsado.add(wk);
      } else {
        days.push({
          date,
          type: "practical",
          title: parceiroNome ? `💼 Aula no parceiro · ${parceiroNome}` : "💼 Atividade Prática",
          time: "09:00 - 15:00",
          desc: parceiroNome ? `Atividade prática na empresa parceira ${parceiroNome}.` : "Atividade prática na empresa.",
        });
      }
    }

    d = addDays(d, 1);
  }

  return days;
}

export function groupByMonth(days: CalendarDay[]): { year: number; month: number; days: CalendarDay[] }[] {
  const map = new Map<string, { year: number; month: number; days: CalendarDay[] }>();
  for (const d of days) {
    const key = `${d.date.getFullYear()}-${d.date.getMonth()}`;
    if (!map.has(key)) map.set(key, { year: d.date.getFullYear(), month: d.date.getMonth(), days: [] });
    map.get(key)!.days.push(d);
  }
  return Array.from(map.values()).sort((a, b) => (a.year - b.year) || (a.month - b.month));
}

export const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export const WEEKDAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
