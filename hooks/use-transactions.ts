import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateTransactionInput } from "@/lib/validations";
import { Transaction, TransactionsResponse } from "@/lib/types";

export function useTransactions(filters: {
  limit?: number;
  cursor?: string | null;
  type?: string | null;
  categoryId?: string | null;
} = {}) {
  const { limit = 50, cursor, type, categoryId } = filters;

  return useQuery<TransactionsResponse>({
    queryKey: ["transactions", { limit, cursor, type, categoryId }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("limit", limit.toString());
      if (cursor) params.append("cursor", cursor);
      if (type) params.append("type", type);
      if (categoryId) params.append("categoryId", categoryId);

      const res = await fetch(`/api/transactions?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return res.json();
    },
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation<Transaction, Error, CreateTransactionInput>({
    mutationFn: async (data) => {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create transaction");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, string>({
    mutationFn: async (id) => {
      const res = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to delete transaction");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}
