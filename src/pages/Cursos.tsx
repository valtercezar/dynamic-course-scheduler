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
import { Plus, Pencil, Trash2, GraduationCap } from "lucide-react";

type Curso = { id: string; nome: string; carga_semanal: number; carga_total: number };

const empty = { id: "", nome: "", carga_semanal: 4, carga_total: 400 };

const Cursos = () => {
  const { t } = useTranslation();
  const { data = [] } = useList<Curso>("cursos");
  const upsert = useUpsert("cursos");
  const remove = useRemove("cursos");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Curso>(empty);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { ...form };
    if (!payload.id) delete payload.id;
    await upsert.mutateAsync(payload);
    setOpen(false);
    setForm(empty);
  };

  return (
    <AppShell>
      <PageHeader
        title={t("courses.title")}
        subtitle={t("courses.subtitle")}
        actions={
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setForm(empty); }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary"><Plus className="h-4 w-4" /> {t("courses.new")}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{form.id ? t("courses.edit") : t("courses.new")}</DialogTitle></DialogHeader>
              <form onSubmit={submit} className="space-y-4">
                <div><Label>{t("courses.name")}</Label><Input required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>{t("courses.weeklyHours")}</Label><Input type="number" min={1} value={form.carga_semanal} onChange={(e) => setForm({ ...form, carga_semanal: Number(e.target.value) })} /></div>
                  <div><Label>{t("courses.totalHours")}</Label><Input type="number" min={1} value={form.carga_total} onChange={(e) => setForm({ ...form, carga_total: Number(e.target.value) })} /></div>
                </div>
                <DialogFooter><Button type="submit" className="bg-gradient-primary">{t("common.save")}</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {data.map((c) => (
          <Card key={c.id} className="hover-lift bg-gradient-card p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><GraduationCap className="h-5 w-5" /></div>
              <div className="min-w-0">
                <h3 className="truncate font-semibold">{c.nome}</h3>
                <p className="text-xs text-muted-foreground">{t("courses.perWeek", { w: c.carga_semanal, t: c.carga_total })}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => { setForm(c); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
              <Button size="sm" variant="ghost" onClick={() => remove.mutate(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </Card>
        ))}
        {data.length === 0 && <p className="col-span-full text-sm text-muted-foreground">{t("courses.empty")}</p>}
      </div>
    </AppShell>
  );
};

export default Cursos;
