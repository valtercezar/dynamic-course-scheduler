# Dynamic Course Scheduler

Production-ready full-stack scheduling system designed to simulate real-world enterprise workflows, including authentication, business rules, and scalable backend architecture.

🔗 **Live Demo**: https://dynamic-scheduler-app.onrender.com/

---

## 📸 Preview

![App Screenshot](./docs/screenshot.png)

---

## 🚀 Overview

This application manages Brazil's **Young Apprentice (Jovem Aprendiz)** program by centralizing apprentices, courses, classes, and partner companies, and automatically generating a **2-year activity calendar** based on complex business rules.

The project was designed and enhanced to simulate **real-world backend systems**, focusing on business logic, API design, and scalability.

---

## ✨ Features

### Core

🔐 Authentication — Email + password (Supabase Auth)
🌐 Internationalization — English (default) and Portuguese
📊 Dashboard — KPIs, charts, upcoming contract endings
👥 Apprentices CRUD — full lifecycle management
🎓 Courses CRUD — weekly and total workload
📚 Content CRUD — linked training topics (many-to-many)
👨‍🏫 Classes CRUD — scheduling rules and configurations
🏢 Partners CRUD — companies for practical activities
📅 Dynamic Calendar — auto-generated per apprentice

---

## 🧠 Calendar Engine (Business Logic)

For each apprentice, the system generates a schedule based on:

* Initial onboarding (first 10 business days)
* Weekly theoretical classes until workload is completed
* Practical activities on remaining days
* Holiday handling (Brazil national holidays)
* Dynamic shift logic (including Tue–Sat schedules)

This simulates real enterprise scheduling rules.

---

## 🛠 Tech Stack

| Layer    | Technology                       |
| -------- | -------------------------------- |
| Frontend | React 18 + Vite                  |
| Language | TypeScript                       |
| Styling  | Tailwind CSS                     |
| UI       | shadcn/ui                        |
| Routing  | React Router                     |
| Data     | TanStack Query                   |
| Backend  | Supabase (Postgres + Auth + RLS) |
| Charts   | Recharts                         |

---

## 🔌 API (JWT Protected)

Endpoint:

```bash id="rgn48p"
POST /functions/v1/apprentice-api
Authorization: Bearer <JWT>
```

### Actions

* `stats` → system metrics
* `list_apprentices` → list with relations
* `calendar` → generated schedule per apprentice

---

## ⚙️ Getting Started

### Prerequisites

* Node 18+ or Bun

### Install & Run

```bash id="d01m61"
npm install
npm run dev
```

App runs at:
👉 http://localhost:5173

---

## 🗂️ Project Structure

```id="ml1txb"
src/
├── components/
├── pages/
├── hooks/
├── lib/
├── integrations/
```

* `lib/calendar.ts` → core business logic
* `hooks/useCrud.ts` → reusable data layer
* `components/` → UI and layout

---

## 🗄️ Database Schema

Managed by Supabase with relational structure:

* cursos
* conteudos
* curso_conteudos
* turmas
* parceiros
* jovens
* feriados

Includes foreign keys and RLS policies.

---

## 🌐 Internationalization

* Default: English
* Supported: English / Portuguese
* Stored in localStorage

---

## 🔐 Authentication

* Supabase Auth (email/password)
* JWT-based session
* Protected routes via guard

---

## 🧱 Architecture Highlights

* Stateless API secured with JWT
* Business logic isolated from UI
* Scalable relational database
* Clean separation of concerns

---

## 👨‍💻 Author

**Valter Cezar Costa**
Backend-focused developer with experience in API design, business logic, and system integration.

---

## 📄 License

Proprietary — internal apprenticeship management tool.
