import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Table = "cursos" | "conteudos" | "curso_conteudos" | "parceiros" | "turmas" | "jovens" | "feriados";

export function useList<T = any>(table: Table, select = "*", order: { column: string; ascending?: boolean } = { column: "created_at", ascending: false }) {
  return useQuery({
    queryKey: [table, select, order],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from(table).select(select).order(order.column, { ascending: order.ascending ?? false });
      if (error) throw error;
      return (data ?? []) as T[];
    },
  });
}

export function useUpsert(table: Table) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: any) => {
      const { error } = await (supabase as any).from(table).upsert(row);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [table] });
      toast.success("Salvo com sucesso");
    },
    onError: (e: any) => toast.error(e.message ?? "Erro ao salvar"),
  });
}

export function useRemove(table: Table) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [table] });
      toast.success("Excluído");
    },
    onError: (e: any) => toast.error(e.message ?? "Erro ao excluir"),
  });
}
