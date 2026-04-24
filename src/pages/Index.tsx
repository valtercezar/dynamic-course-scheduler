import { useState } from "react";
import { Link } from "react-router-dom";
import { useList, useUpsert, useRemove } from "@/hooks/useCrud";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Calendar, ArrowRight, User } from "lucide-react";

type Jovem = { id: string; nome: string; cpf: string | null; turma_id: string | null; parceiro_id: string | null; data_inicio: string; data_fim: string };
type Turma = { id: string; codigo: string };
type Parceiro = { id: string; nome: string };

const today = new Date().toISOString().slice(0, 10);
const inTwoYears = new Date(Date.now() + 1000 * 60 * 60 * 24 * 730).toISOString().slice(0, 10);

const empty: Jovem = { id: "", nome: "", cpf: "", turma_id: null, parceiro_id: null, data_inicio: today, data_fim: inTwoYears };

const Index = () => {
  const { data = [], isLoading } = useList<Jovem>("jovens");
  const { data: turmas = [] } = useList<Turma>("turmas");
  const { data: parceiros = [] } = useList<Parceiro>("parceiros");
  const upsert = useUpsert("jovens");
  const remove = useRemove("jovens");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Jovem>(empty);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { ...form };
    if (!payload.id) delete payload.id;
    await upsert.mutateAsync(payload);
    setOpen(false); setForm(empty);
  };

  return (
    <AppShell>
      <PageHeader
        title="Jovens Aprendizes"
        subtitle="Clique em um jovem para abrir seu calendário de atividades"
        actions={
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setForm(empty); }}>
            <DialogTrigger asChild><Button className="bg-gradient-primary"><Plus className="h-4 w-4" /> Novo jovem</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{form.id ? "Editar" : "Novo"} jovem</DialogTitle></DialogHeader>
              <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2"><Label>Nome</Label><Input required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></div>
                  <div><Label>CPF</Label><Input value={form.cpf ?? ""} onChange={(e) => setForm({ ...form, cpf: e.target.value })} /></div>
                  <div></div>
                  <div>
                    <Label>Turma</Label>
                    <Select value={form.turma_id ?? ""} onValueChange={(v) => setForm({ ...form, turma_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>{turmas.map((t) => <SelectItem key={t.id} value={t.id}>{t.codigo}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Parceiro</Label>
                    <Select value={form.parceiro_id ?? ""} onValueChange={(v) => setForm({ ...form, parceiro_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>{parceiros.map((p) => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Data início</Label><Input type="date" required value={form.data_inicio} onChange={(e) => setForm({ ...form, data_inicio: e.target.value })} /></div>
                  <div><Label>Data fim</Label><Input type="date" required value={form.data_fim} onChange={(e) => setForm({ ...form, data_fim: e.target.value })} /></div>
                </div>
                <DialogFooter><Button type="submit" className="bg-gradient-primary">Salvar</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : data.length === 0 ? (
        <Card className="bg-gradient-card p-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><User className="h-7 w-7" /></div>
          <h3 className="mb-1 font-semibold">Nenhum jovem cadastrado</h3>
          <p className="mb-4 text-sm text-muted-foreground">Cadastre cursos, turmas e parceiros antes — depois adicione um jovem para gerar o calendário.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.map((j) => {
            const turma = turmas.find((t) => t.id === j.turma_id);
            const parceiro = parceiros.find((p) => p.id === j.parceiro_id);
            return (
              <Card key={j.id} className="group hover-lift relative overflow-hidden bg-gradient-card p-0">
                <Link to={`/calendario/${j.id}`} className="block p-5">
                  <div className="mb-4 flex items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
                      <span className="text-lg font-bold">{j.nome.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold">{j.nome}</h3>
                      {j.cpf && <p className="text-xs text-muted-foreground">CPF: {j.cpf}</p>}
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <p>👥 Turma: <span className="font-medium text-foreground">{turma?.codigo ?? "—"}</span></p>
                    <p>🏢 Parceiro: <span className="font-medium text-foreground">{parceiro?.nome ?? "—"}</span></p>
                    <p>📅 {new Date(j.data_inicio).toLocaleDateString("pt-BR")} → {new Date(j.data_fim).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-primary">
                    <Calendar className="h-4 w-4" /> Abrir calendário
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
                <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={(e) => { e.preventDefault(); setForm(j); setOpen(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={(e) => { e.preventDefault(); remove.mutate(j.id); }}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </AppShell>
  );
};

export default Index;
