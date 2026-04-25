// Calendar generation engine - Apprenticeship Program

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

export interface CalendarLabels {
  initialTitle: string;
  initialDesc: string;
  practicalTitleWith: (name: string) => string;
  practicalTitleGeneric: string;
  practicalDescWith: (name: string) => string;
  practicalDescGeneric: string;
  theoreticalDesc: string;
}

export interface GenerateOptions {
  start: Date;
  end: Date;
  diaTeorico: number;
  horaInicio: string;
  horaFim: string;
  turnoTercaSabado: boolean;
  cargaTotal: number;
  horasPorAulaTeorica?: number;
  cursoNome: string;
  parceiroNome?: string;
  conteudosTeoricos: { titulo: string; descricao?: string | null }[];
  labels?: CalendarLabels;
}

const DEFAULT_LABELS: CalendarLabels = {
  initialTitle: "🎓 Initial Concentration",
  initialDesc: "Onboarding and program introduction",
  practicalTitleWith: (n) => `💼 Class at partner · ${n}`,
  practicalTitleGeneric: "💼 Practical Activity",
  practicalDescWith: (n) => `Practical activity at partner ${n}.`,
  practicalDescGeneric: "Practical activity at the company.",
  theoreticalDesc: "Theoretical class",
};

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

function isWorkDay(date: Date, turnoTercaSabado: boolean): boolean {
  const dow = date.getDay();
  return turnoTercaSabado ? dow >= 2 && dow <= 6 : dow >= 1 && dow <= 5;
}

export function generateCalendar(opts: GenerateOptions, holidays: Holiday[]): CalendarDay[] {
  const {
    start, end, diaTeorico, horaInicio, horaFim, turnoTercaSabado,
    cargaTotal, cursoNome, parceiroNome, conteudosTeoricos,
  } = opts;
  const L = opts.labels ?? DEFAULT_LABELS;

  const horasPorAula = opts.horasPorAulaTeorica ?? durationHours(horaInicio, horaFim);
  const totalAulasTeoricas = Math.ceil(cargaTotal / Math.max(horasPorAula, 1));

  const days: CalendarDay[] = [];
  const horario = `${horaInicio} - ${horaFim}`;

  const initialDates: Date[] = [];
  let cursor = new Date(start);
  while (initialDates.length < 10 && cursor <= end) {
    const isWeekend = !isWorkDay(cursor, turnoTercaSabado);
    const holiday = isHoliday(cursor, holidays);
    if (!isWeekend && !holiday) initialDates.push(new Date(cursor));
    cursor = addDays(cursor, 1);
  }

  let aulasTeoricasAgendadas = 0;
  const teoricoSemanaUsado = new Set<string>();

  const weekKey = (d: Date) => {
    const onejan = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil(((d.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
    return `${d.getFullYear()}-${week}`;
  };

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
        title: L.initialTitle,
        time: horario,
        desc: L.initialDesc,
      });
    } else {
      const isTeoricoDia = date.getDay() === diaTeorico;
      const wk = weekKey(date);
      if (isTeoricoDia && aulasTeoricasAgendadas < totalAulasTeoricas && !teoricoSemanaUsado.has(wk)) {
        const conteudo = conteudosTeoricos.length
          ? conteudosTeoricos[aulasTeoricasAgendadas % conteudosTeoricos.length]
          : { titulo: cursoNome, descricao: L.theoreticalDesc };
        days.push({
          date,
          type: "theoretical",
          title: `📚 ${conteudo.titulo}`,
          time: horario,
          desc: conteudo.descricao || L.theoreticalDesc,
        });
        aulasTeoricasAgendadas++;
        teoricoSemanaUsado.add(wk);
      } else {
        days.push({
          date,
          type: "practical",
          title: parceiroNome ? L.practicalTitleWith(parceiroNome) : L.practicalTitleGeneric,
          time: "09:00 - 15:00",
          desc: parceiroNome ? L.practicalDescWith(parceiroNome) : L.practicalDescGeneric,
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
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
