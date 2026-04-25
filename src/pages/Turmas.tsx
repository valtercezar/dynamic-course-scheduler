import { useState } from "react";
import { useTranslation } from "react-i18next";
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

const Turmas = () => {
  const { t } = useTranslation();
  const dias = t("classes.days", { returnObjects: true }) as string[];
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
      <PageHeader title={t("classes.title")} subtitle={t("classes.subtitle")}
        actions={
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setForm(empty); }}>
            <DialogTrigger asChild><Button className="bg-gradient-primary"><Plus className="h-4 w-4" /> {t("classes.new")}</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{form.id ? t("classes.edit") : t("classes.new")}</DialogTitle></DialogHeader>
              <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>{t("classes.code")}</Label><Input required value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} /></div>
                  <div>
                    <Label>{t("classes.course")}</Label>
                    <Select value={form.curso_id} onValueChange={(v) => setForm({ ...form, curso_id: v })}>
                      <SelectTrigger><SelectValue placeholder={t("common.select")} /></SelectTrigger>
                      <SelectContent>{cursos.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>{t("classes.theoryDay")}</Label>
                    <Select value={String(form.dia_teorico)} onValueChange={(v) => setForm({ ...form, dia_teorico: Number(v) })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{dias.map((d, i) => <SelectItem key={i} value={String(i)}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>{t("classes.start")}</Label><Input type="time" value={form.hora_inicio} onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })} /></div>
                  <div><Label>{t("classes.end")}</Label><Input type="time" value={form.hora_fim} onChange={(e) => setForm({ ...form, hora_fim: e.target.value })} /></div>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div><Label>{t("classes.tueSat")}</Label><p className="text-xs text-muted-foreground">{t("classes.tueSatHint")}</p></div>
                  <Switch checked={form.turno_terca_a_sabado} onCheckedChange={(c) => setForm({ ...form, turno_terca_a_sabado: c })} />
                </div>
                <DialogFooter><Button type="submit" className="bg-gradient-primary">{t("common.save")}</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {data.map((tt) => {
          const curso = cursos.find((c) => c.id === tt.curso_id);
          return (
            <Card key={tt.id} className="hover-lift bg-gradient-card p-5">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent"><UsersRound className="h-5 w-5" /></div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold">{t("classes.title").slice(0, -1)} {tt.codigo}</h3>
                  <p className="truncate text-xs text-muted-foreground">{curso?.nome ?? "—"}</p>
                </div>
              </div>
              <div className="mb-3 space-y-1 text-xs text-muted-foreground">
                <p>📚 {t("classes.theory")}: <span className="font-medium text-foreground">{dias[tt.dia_teorico]}</span></p>
                <p>⏰ {tt.hora_inicio} – {tt.hora_fim}</p>
                {tt.turno_terca_a_sabado && <p>📅 {t("classes.tueSat")}</p>}
              </div>
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={() => { setForm(tt); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => remove.mutate(tt.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </Card>
          );
        })}
        {data.length === 0 && <p className="col-span-full text-sm text-muted-foreground">{t("classes.empty")}</p>}
      </div>
    </AppShell>
  );
};
export default Turmas;
