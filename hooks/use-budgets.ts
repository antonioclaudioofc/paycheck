import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateBudgetInput } from "@/lib/validations";
import { Budget } from "@/lib/types";

export function useBudgets() {
  return useQuery<Budget[]>({
    queryKey: ["budgets"],
    queryFn: async () => {
      const res = await fetch("/api/budgets");
      if (!res.ok) throw new Error("Failed to fetch budgets");
      return res.json();
    },
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();

  return useMutation<Budget, Error, CreateBudgetInput>({
    mutationFn: async (data) => {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create budget");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}
