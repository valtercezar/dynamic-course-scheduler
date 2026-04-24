
-- CURSOS
CREATE TABLE public.cursos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  carga_semanal INTEGER NOT NULL DEFAULT 4,
  carga_total INTEGER NOT NULL DEFAULT 400,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CONTEUDOS
CREATE TABLE public.conteudos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CURSO x CONTEUDOS
CREATE TABLE public.curso_conteudos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  curso_id UUID NOT NULL REFERENCES public.cursos(id) ON DELETE CASCADE,
  conteudo_id UUID NOT NULL REFERENCES public.conteudos(id) ON DELETE CASCADE,
  ordem INTEGER NOT NULL DEFAULT 0,
  UNIQUE(curso_id, conteudo_id)
);

-- PARCEIROS
CREATE TABLE public.parceiros (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TURMAS
CREATE TABLE public.turmas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  curso_id UUID NOT NULL REFERENCES public.cursos(id) ON DELETE RESTRICT,
  dia_teorico INTEGER NOT NULL DEFAULT 4, -- 0=Dom..6=Sab
  hora_inicio TEXT NOT NULL DEFAULT '08:00',
  hora_fim TEXT NOT NULL DEFAULT '14:00',
  turno_terca_a_sabado BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- JOVENS
CREATE TABLE public.jovens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  cpf TEXT,
  turma_id UUID REFERENCES public.turmas(id) ON DELETE SET NULL,
  parceiro_id UUID REFERENCES public.parceiros(id) ON DELETE SET NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FERIADOS
CREATE TABLE public.feriados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mes INTEGER NOT NULL,
  dia INTEGER NOT NULL,
  nome TEXT NOT NULL,
  UNIQUE(mes, dia)
);

INSERT INTO public.feriados (mes, dia, nome) VALUES
  (1, 1, 'Confraternização Universal'),
  (4, 21, 'Tiradentes'),
  (5, 1, 'Dia do Trabalho'),
  (9, 7, 'Independência do Brasil'),
  (10, 12, 'Nossa Senhora Aparecida'),
  (11, 2, 'Finados'),
  (11, 15, 'Proclamação da República'),
  (12, 25, 'Natal');

-- RLS: público para protótipo
ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conteudos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curso_conteudos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parceiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jovens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feriados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public all cursos" ON public.cursos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public all conteudos" ON public.conteudos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public all curso_conteudos" ON public.curso_conteudos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public all parceiros" ON public.parceiros FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public all turmas" ON public.turmas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public all jovens" ON public.jovens FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public all feriados" ON public.feriados FOR ALL USING (true) WITH CHECK (true);
