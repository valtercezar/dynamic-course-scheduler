import { useState } from "react";
import { useList, useUpsert, useRemove } from "@/hooks/useCrud";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, BookOpen, Link2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Conteudo = { id: string; titulo: string; descricao: string | null };
type Curso = { id: string; nome: string };

const Conteudos = () => {
  const { data = [] } = useList<Conteudo>("conteudos");
  const { data: cursos = [] } = useList<Curso>("cursos");
  const upsert = useUpsert("conteudos");
  const remove = useRemove("conteudos");
  const qc = useQueryClient();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Conteudo>({ id: "", titulo: "", descricao: "" });
  const [linkOpen, setLinkOpen] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { ...form };
    if (!payload.id) delete payload.id;
    await upsert.mutateAsync(payload);
    setOpen(false);
    setForm({ id: "", titulo: "", descricao: "" });
  };

  const { data: links = [] } = useQuery({
    queryKey: ["curso_conteudos_all"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("curso_conteudos").select("*");
      if (error) throw error;
      return data as { id: string; curso_id: string; conteudo_id: string }[];
    },
  });

  const linkConteudo = async (conteudoId: string, cursoId: string) => {
    const { error } = await (supabase as any).from("curso_conteudos").insert({ curso_id: cursoId, conteudo_id: conteudoId });
    if (error) toast.error(error.message); else { toast.success("Vinculado"); qc.invalidateQueries({ queryKey: ["curso_conteudos_all"] }); }
  };
  const unlink = async (id: string) => {
    const { error } = await (supabase as any).from("curso_conteudos").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Removido"); qc.invalidateQueries({ queryKey: ["curso_conteudos_all"] }); }
  };

  return (
    <AppShell>
      <PageHeader
        title="Conteúdos"
        subtitle="Cadastre conteúdos e vincule a cursos"
        actions={
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setForm({ id: "", titulo: "", descricao: "" }); }}>
            <DialogTrigger asChild><Button className="bg-gradient-primary"><Plus className="h-4 w-4" /> Novo conteúdo</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{form.id ? "Editar" : "Novo"} conteúdo</DialogTitle></DialogHeader>
              <form onSubmit={submit} className="space-y-4">
                <div><Label>Título</Label><Input required value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} /></div>
                <div><Label>Descrição</Label><Textarea value={form.descricao ?? ""} onChange={(e) => setForm({ ...form, descricao: e.target.value })} /></div>
                <DialogFooter><Button type="submit" className="bg-gradient-primary">Salvar</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="grid gap-3 md:grid-cols-2">
        {data.map((c) => {
          const myLinks = links.filter((l) => l.conteudo_id === c.id);
          return (
            <Card key={c.id} className="hover-lift bg-gradient-card p-5">
              <div className="mb-3 flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent"><BookOpen className="h-5 w-5" /></div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold">{c.titulo}</h3>
                  {c.descricao && <p className="text-xs text-muted-foreground">{c.descricao}</p>}
                </div>
              </div>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {myLinks.map((l) => {
                  const curso = cursos.find((x) => x.id === l.curso_id);
                  return (
                    <Badge key={l.id} variant="secondary" className="cursor-pointer" onClick={() => unlink(l.id)} title="Clique para desvincular">
                      {curso?.nome ?? "?"} ✕
                    </Badge>
                  );
                })}
              </div>
              <div className="flex items-center justify-between gap-2">
                <Select onValueChange={(v) => linkConteudo(c.id, v)} value="">
                  <SelectTrigger className="h-8 w-auto text-xs"><Link2 className="mr-1 h-3 w-3" /><SelectValue placeholder="Vincular curso" /></SelectTrigger>
                  <SelectContent>{cursos.map((x) => <SelectItem key={x.id} value={x.id}>{x.nome}</SelectItem>)}</SelectContent>
                </Select>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => { setForm(c); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => remove.mutate(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            </Card>
          );
        })}
        {data.length === 0 && <p className="col-span-full text-sm text-muted-foreground">Nenhum conteúdo cadastrado.</p>}
      </div>
    </AppShell>
  );
};

export default Conteudos;
