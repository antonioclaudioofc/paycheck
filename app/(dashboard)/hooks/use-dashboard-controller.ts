"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTransactions } from "@/hooks/use-transactions";
import { useBudgets } from "@/hooks/use-budgets";
import { useGoals } from "@/hooks/use-goals";
import { BudgetAlert } from "@/lib/types";

export function useDashboardController() {
  const queryClient = useQueryClient();

  const { data: recentTxResponse, isLoading: loadingRecent } = useTransactions({
    limit: 5,
  });
  const { data: statsTxResponse, isLoading: loadingStats } = useTransactions({
    limit: 100,
  });
  const { data: budgets = [], isLoading: loadingBudgets } = useBudgets();
  const { data: goals = [], isLoading: loadingGoals } = useGoals();

  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);

  const transactionsList = statsTxResponse?.data || [];
  let totalIncome = 0;
  let totalExpense = 0;

  transactionsList.forEach((t) => {
    const amt = Number(t.amount);
    if (t.type === "INCOME") {
      totalIncome += amt;
    } else {
      totalExpense += amt;
    }
  });

  const netBalance = totalIncome - totalExpense;
  const recentTransactions = recentTxResponse?.data || [];
  const loading =
    loadingRecent || loadingStats || loadingBudgets || loadingGoals;

  useEffect(() => {
    const eventSource = new EventSource("/api/sse");

    eventSource.addEventListener("connected", (e) => {
      console.log("Conectado ao SSE com sucesso!", e);
    });

    eventSource.addEventListener("transaction-created", (e) => {
      console.log("Nova transação criada em tempo real:", e);
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    });

    eventSource.addEventListener("budget-alert", (e) => {
      try {
        const messageEvent = e as MessageEvent;
        const data = JSON.parse(messageEvent.data) as BudgetAlert;
        setAlerts((prev) => {
          const filtered = prev.filter((a) => a.categoryId !== data.categoryId);
          return [data, ...filtered];
        });
      } catch (err) {
        console.error("Erro ao parsear alerta de orçamento:", err);
      }
    });

    return () => {
      eventSource.close();
    };
  }, [queryClient]);

  const removeAlert = (categoryId: string) => {
    setAlerts((prev) => prev.filter((a) => a.categoryId !== categoryId));
  };

  const currentMonthName = new Date().toLocaleString("pt-br", {
    month: "long",
  });
  const currentYear = new Date().getFullYear();

  return {
    recentTransactions,
    transactionsList,
    budgets,
    goals,
    alerts,
    totalIncome,
    totalExpense,
    netBalance,
    loading,
    removeAlert,
    currentMonthName,
    currentYear,
  };
}
