import { useState } from "react";
import { useList, useUpsert, useRemove } from "@/hooks/useCrud";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, UsersRound } from "lucide-react";

type Turma = {
  id: string; codigo: string; curso_id: string; dia_teorico: number;
  hora_inicio: string; hora_fim: string; turno_terca_a_sabado: boolean;
};
type Curso = { id: string; nome: string };

const empty: Turma = { id: "", codigo: "", curso_id: "", dia_teorico: 4, hora_inicio: "08:00", hora_fim: "14:00", turno_terca_a_sabado: false };
const dias = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

const Turmas = () => {
  const { data = [] } = useList<Turma>("turmas");
  const { data: cursos = [] } = useList<Curso>("cursos");
  const upsert = useUpsert("turmas");
  const remove = useRemove("turmas");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Turma>(empty);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.curso_id) return;
    const payload: any = { ...form };
    if (!payload.id) delete payload.id;
    await upsert.mutateAsync(payload);
    setOpen(false); setForm(empty);
  };
  return (
    <AppShell>
      <PageHeader title="Turmas" subtitle="Vincule curso, dia teórico e horário"
        actions={
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setForm(empty); }}>
            <DialogTrigger asChild><Button className="bg-gradient-primary"><Plus className="h-4 w-4" /> Nova turma</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{form.id ? "Editar" : "Nova"} turma</DialogTitle></DialogHeader>
              <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Código</Label><Input required value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} /></div>
                  <div>
                    <Label>Curso</Label>
                    <Select value={form.curso_id} onValueChange={(v) => setForm({ ...form, curso_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>{cursos.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>Dia teórico</Label>
                    <Select value={String(form.dia_teorico)} onValueChange={(v) => setForm({ ...form, dia_teorico: Number(v) })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{dias.map((d, i) => <SelectItem key={i} value={String(i)}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Início</Label><Input type="time" value={form.hora_inicio} onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })} /></div>
                  <div><Label>Fim</Label><Input type="time" value={form.hora_fim} onChange={(e) => setForm({ ...form, hora_fim: e.target.value })} /></div>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div><Label>Turno terça a sábado</Label><p className="text-xs text-muted-foreground">Considera sábado como dia útil em vez de segunda</p></div>
                  <Switch checked={form.turno_terca_a_sabado} onCheckedChange={(c) => setForm({ ...form, turno_terca_a_sabado: c })} />
                </div>
                <DialogFooter><Button type="submit" className="bg-gradient-primary">Salvar</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {data.map((t) => {
          const curso = cursos.find((c) => c.id === t.curso_id);
          return (
            <Card key={t.id} className="hover-lift bg-gradient-card p-5">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent"><UsersRound className="h-5 w-5" /></div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold">Turma {t.codigo}</h3>
                  <p className="truncate text-xs text-muted-foreground">{curso?.nome ?? "—"}</p>
                </div>
              </div>
              <div className="mb-3 space-y-1 text-xs text-muted-foreground">
                <p>📚 Teórico: <span className="font-medium text-foreground">{dias[t.dia_teorico]}</span></p>
                <p>⏰ {t.hora_inicio} – {t.hora_fim}</p>
                {t.turno_terca_a_sabado && <p>📅 Turno terça-sábado</p>}
              </div>
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={() => { setForm(t); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => remove.mutate(t.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </Card>
          );
        })}
        {data.length === 0 && <p className="col-span-full text-sm text-muted-foreground">Nenhuma turma cadastrada.</p>}
      </div>
    </AppShell>
  );
};
export default Turmas;
