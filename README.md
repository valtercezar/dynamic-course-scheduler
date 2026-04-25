# Young Apprentice — Activity Calendar

A modern web application to manage Brazil's **Jovem Aprendiz** (Young Apprentice) program. It centralizes courses, training content, partner companies, classes and apprentices, and **automatically generates a 2-year activity calendar** for each apprentice based on the program rules.

Built with **React + Vite + TypeScript + Tailwind CSS** on top of **Lovable Cloud** (managed Supabase) for authentication, database and persistence.

---

## ✨ Features

### Core
- 🔐 **Authentication** — Email + password sign in / sign up (Lovable Cloud)
- 🌐 **Internationalization** — English (default) and Portuguese, switchable on the fly
- 📊 **Dashboard** — KPIs, charts and upcoming contract endings
- 👥 **Apprentices CRUD** — name, document, dates, class and partner
- 🎓 **Courses CRUD** — with weekly and total workload (hours)
- 📚 **Content CRUD** — training topics linked to courses (many-to-many)
- 👨‍🏫 **Classes CRUD** — code, course, theoretical day, time range, shift type
- 🏢 **Partners CRUD** — companies hosting practical activities
- 📅 **Dynamic Calendar** — auto-generated per apprentice with tooltips

### Calendar generation rules
For each apprentice, the calendar is computed across the contract dates:

1. **Initial Concentration** — first **10 business days** are flagged as onboarding.
2. **Theoretical days** — once per week on the class's configured day, until the course's **total workload** is reached. Linked content rotates through the lessons.
3. **Practical activities** — every remaining business day, executed at the assigned **partner** (09:00–15:00 by default).
4. **Weekends** — Saturday + Sunday off, unless the class uses the **Tuesday → Saturday** shift (then Saturday counts as a workday and Monday is off).
5. **Holidays** — national holidays (pre-seeded) are highlighted in red and skip activities.

Hovering any day shows the lesson title, time range and description.

---

## 🧱 Tech Stack

| Layer        | Technology |
|--------------|------------|
| Framework    | React 18 + Vite 5 |
| Language     | TypeScript 5 |
| Styling      | Tailwind CSS v3 + semantic tokens (HSL) |
| UI kit       | shadcn/ui (Radix primitives) |
| Routing      | React Router v6 |
| Data fetching| TanStack Query v5 |
| Charts       | Recharts |
| i18n         | i18next + react-i18next + browser-languagedetector |
| Backend      | **Lovable Cloud** (Supabase: Postgres + Auth + RLS) |
| Icons        | lucide-react |
| Notifications| Sonner |

---

## 🚀 Getting started

### Prerequisites
- Node 18+ or [Bun](https://bun.sh)
- A Lovable Cloud–enabled project (auto-provisioned)

### Install & run
```bash
bun install      # or: npm install
bun run dev      # or: npm run dev
```

The app boots at `http://localhost:5173`. The Supabase URL and publishable key are auto-injected via `.env` (do not edit manually).

### Build for production
```bash
bun run build
bun run preview
```

---

## 🗂️ Project structure

```
src/
├── App.tsx                     # Routes + providers
├── main.tsx                    # Entry, mounts i18n
├── i18n/
│   ├── index.ts                # i18next bootstrap (default: English)
│   └── locales/
│       ├── en.ts               # English translations
│       └── pt.ts               # Portuguese translations
├── components/
│   ├── AppShell.tsx            # Top nav + language + sign out
│   ├── LanguageSwitcher.tsx    # EN / PT picker
│   ├── PageHeader.tsx
│   ├── ProtectedRoute.tsx      # Auth guard for private routes
│   └── ui/                     # shadcn components
├── hooks/
│   ├── useAuth.ts              # Session listener
│   └── useCrud.ts              # Generic list/upsert/remove via TanStack Query
├── lib/
│   ├── calendar.ts             # Calendar generation engine
│   └── utils.ts
├── pages/
│   ├── Auth.tsx                # Sign in / sign up
│   ├── Dashboard.tsx           # KPIs, charts, upcoming contracts
│   ├── Index.tsx               # Apprentices grid (entry to calendar)
│   ├── Calendario.tsx          # Per-apprentice dynamic calendar
│   ├── Cursos.tsx              # Courses CRUD
│   ├── Conteudos.tsx           # Content CRUD + course linking
│   ├── Turmas.tsx              # Classes CRUD
│   ├── Parceiros.tsx           # Partners CRUD
│   └── NotFound.tsx
├── integrations/supabase/      # Auto-generated client + types (do not edit)
└── index.css                   # Design tokens (HSL semantic)
```

---

## 🗄️ Database schema

Managed by Lovable Cloud (Supabase). All tables have UUID PKs and `created_at` timestamps.

| Table              | Purpose                                                          |
|--------------------|------------------------------------------------------------------|
| `cursos`           | Courses with `carga_semanal` and `carga_total` (hours)           |
| `conteudos`        | Training content (title + description)                           |
| `curso_conteudos`  | Many-to-many: course ↔ content with `ordem` (sort order)         |
| `turmas`           | Classes: code, course, theory weekday, time range, shift flag    |
| `parceiros`        | Partner companies                                                |
| `jovens`           | Apprentices: name, document, dates, FK to `turma` and `parceiro` |
| `feriados`         | Holidays seeded with Brazil's national list (month + day)        |

Foreign keys cascade where appropriate. RLS policies are configured in the Supabase migration files under `supabase/migrations/`.

---

## 🌐 Internationalization

- Default language: **English**
- Available: English (`en`), Portuguese (`pt`)
- User preference is persisted to `localStorage` (`lng` key)
- Switch via the globe icon in the header (or auth screen)

To add a new language, create `src/i18n/locales/<code>.ts` mirroring `en.ts`, register it in `src/i18n/index.ts`, and add an entry to `LanguageSwitcher.tsx`.

---

## 🔐 Authentication

- Email/password authentication via Supabase Auth
- Sign-up flow sends a verification email by default — users confirm before signing in
- All app routes (except `/auth`) are wrapped in `<ProtectedRoute>`
- Session is hydrated through `useAuth` using `onAuthStateChange` + `getSession`

---

## 🎨 Design system

All colors live in `src/index.css` as **HSL semantic tokens** (e.g. `--primary`, `--accent`, `--day-theoretical`). Components must use semantic classes (`bg-primary`, `text-foreground`) — never hardcoded colors. Gradients (`--gradient-primary`, `--gradient-hero`, `--gradient-card`) and shadows (`--shadow-glow`, `--shadow-elevated`) are reusable design primitives.

---

## 📜 Available scripts

| Script           | Action                       |
|------------------|------------------------------|
| `bun run dev`    | Start the dev server         |
| `bun run build`  | Production build             |
| `bun run preview`| Preview the production build |
| `bun run lint`   | Lint the codebase            |
| `bunx vitest run`| Run unit tests               |

---

## 🤝 Contributing

1. Use semantic design tokens — no raw colors in components.
2. Keep the calendar engine (`src/lib/calendar.ts`) pure and language-agnostic — pass labels in via `GenerateOptions.labels`.
3. Every new user-facing string must be added to **both** `en.ts` and `pt.ts`.
4. Database changes go through Supabase migrations.

---

## 🧠 About this project

This project is a dynamic course scheduling system designed to manage users, schedules, and course planning.

Although initially generated using modern tools, I actively customized and improved the backend logic, integrations, and system behavior.

The goal is to simulate real-world enterprise scenarios involving scheduling, data handling, and system extensibility.

---

## 👨‍💻 My Contributions

- Customized backend logic and API structure
- Improved system behavior and data handling
- Structured project for scalability and maintainability
- Prepared system for real-world use cases

---

## 🔌 Extra API (JWT-protected)

A dedicated REST endpoint is exposed via a serverless backend function and protected by JWT authentication (the same session token issued at sign-in).

**Endpoint**
```
POST /functions/v1/apprentice-api
Authorization: Bearer <JWT>
Content-Type: application/json
```

**Supported actions**

| Action            | Body                                  | Returns |
|-------------------|---------------------------------------|---------|
| `stats`           | `{ "action": "stats" }`               | Aggregated counts (apprentices, courses, classes, partners) |
| `list_apprentices`| `{ "action": "list_apprentices" }`    | All apprentices with their class + partner |
| `calendar`        | `{ "action": "calendar", "jovem_id": "<uuid>" }` | Generated 2-year calendar for a single apprentice |

**Example**
```bash
curl -X POST "$SUPABASE_URL/functions/v1/apprentice-api" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"action":"stats"}'
```

Every request validates the JWT server-side using Supabase Auth — unauthenticated calls return `401 Unauthorized`.

---

## 📄 License

Proprietary — internal apprenticeship management tool.
