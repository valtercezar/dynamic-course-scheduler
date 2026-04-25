import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useList, useUpsert, useRemove } from "@/hooks/useCrud";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Building2 } from "lucide-react";

type P = { id: string; nome: string; descricao: string | null };
const empty: P = { id: "", nome: "", descricao: "" };

const Parceiros = () => {
  const { t } = useTranslation();
  const { data = [] } = useList<P>("parceiros");
  const upsert = useUpsert("parceiros");
  const remove = useRemove("parceiros");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<P>(empty);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { ...form };
    if (!payload.id) delete payload.id;
    await upsert.mutateAsync(payload);
    setOpen(false); setForm(empty);
  };
  return (
    <AppShell>
      <PageHeader title={t("partners.title")} subtitle={t("partners.subtitle")}
        actions={
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setForm(empty); }}>
            <DialogTrigger asChild><Button className="bg-gradient-primary"><Plus className="h-4 w-4" /> {t("partners.new")}</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{form.id ? t("partners.edit") : t("partners.new")}</DialogTitle></DialogHeader>
              <form onSubmit={submit} className="space-y-4">
                <div><Label>{t("partners.name")}</Label><Input required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></div>
                <div><Label>{t("partners.description")}</Label><Textarea value={form.descricao ?? ""} onChange={(e) => setForm({ ...form, descricao: e.target.value })} /></div>
                <DialogFooter><Button type="submit" className="bg-gradient-primary">{t("common.save")}</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {data.map((p) => (
          <Card key={p.id} className="hover-lift bg-gradient-card p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Building2 className="h-5 w-5" /></div>
              <div className="min-w-0">
                <h3 className="truncate font-semibold">{p.nome}</h3>
                {p.descricao && <p className="truncate text-xs text-muted-foreground">{p.descricao}</p>}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => { setForm(p); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
              <Button size="sm" variant="ghost" onClick={() => remove.mutate(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </Card>
        ))}
        {data.length === 0 && <p className="col-span-full text-sm text-muted-foreground">{t("partners.empty")}</p>}
      </div>
    </AppShell>
  );
};
export default Parceiros;
