"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  AlertTriangle,
  Bell,
  X,
} from "lucide-react";
import { useTransactions } from "@/hooks/use-transactions";
import { useBudgets } from "@/hooks/use-budgets";
import { useGoals } from "@/hooks/use-goals";
import { BudgetAlert } from "@/lib/types";

interface User {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export function DashboardClient({ user }: { user: User }) {
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

  return (
    <div className="space-y-8 relative">
      <div className="fixed top-6 right-6 z-50 flex flex-col space-y-4 max-w-sm w-full">
        {alerts.map((alert) => (
          <div
            key={alert.categoryId}
            className={`p-4 rounded-2xl glass border shadow-2xl flex items-start justify-between space-x-3 transition-all duration-300 animate-slide-in ${
              alert.severity === "danger"
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-amber-200 bg-amber-50 text-amber-800"
            }`}
          >
            <div className="flex items-start space-x-3">
              <AlertTriangle
                className={`w-5 h-5 mt-0.5 shrink-0 ${alert.severity === "danger" ? "text-red-600" : "text-amber-600"}`}
              />
              <div>
                <p className="font-bold text-sm">Alerta de Orçamento!</p>
                <p className="text-xs opacity-90 mt-1">{alert.message}</p>
                <div className="w-full bg-border/20 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full ${alert.severity === "danger" ? "bg-red-500" : "bg-yellow-500"}`}
                    style={{ width: `${Math.min(alert.percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <button
              onClick={() => removeAlert(alert.categoryId)}
              className="text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Olá, {user.name || "CLT"}
          </h2>
          <p className="text-muted-foreground mt-1">
            Aqui está o resumo das suas finanças em {currentMonthName} de{" "}
            {currentYear}.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl glass border border-border flex flex-col justify-between h-36">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-sm font-semibold">Saldo Atual</span>
            <Wallet className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p
              className={`text-xl md:text-2xl font-black ${netBalance >= 0 ? "text-emerald-600" : "text-red-600"}`}
            >
              R${" "}
              {netBalance.toLocaleString("pt-br", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Acumulado geral
            </p>
          </div>
        </div>

        <div className="p-6 rounded-3xl glass border border-border flex flex-col justify-between h-36">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-sm font-semibold">Receitas</span>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xl md:text-2xl font-black text-emerald-600">
              R${" "}
              {totalIncome.toLocaleString("pt-br", {
                minimumFractionDigits: 2,
              })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Entradas totais
            </p>
          </div>
        </div>

        <div className="p-6 rounded-3xl glass border border-border flex flex-col justify-between h-36">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-sm font-semibold">Despesas</span>
            <TrendingDown className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-xl md:text-2xl font-black text-red-600">
              R${" "}
              {totalExpense.toLocaleString("pt-br", {
                minimumFractionDigits: 2,
              })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Saídas totais</p>
          </div>
        </div>

        <div className="p-6 rounded-3xl glass border border-border flex flex-col justify-between h-36">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-sm font-semibold">Metas Poupança</span>
            <Bell className="w-5 h-5 text-amber-500 animate-pulse" />
          </div>
          <div>
            <p className="text-xl md:text-2xl font-black text-primary">
              {goals.length} Ativas
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Economia planejada
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-3xl glass border border-border space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">Últimas Transações</h3>
          </div>

          {loading ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              Carregando transações...
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              Nenhuma transação encontrada. Comece adicionando uma na aba de
              Transações!
            </div>
          ) : (
            <div className="space-y-4">
              {recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-secondary/50 border border-border/30 hover:border-primary/20 transition-all duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                      style={{
                        backgroundColor: `${tx.category?.color || "#2563eb"}20`,
                        color: tx.category?.color || "#2563eb",
                      }}
                    >
                      {tx.category?.name?.charAt(0) || "T"}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{tx.description}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {tx.category?.name} •{" "}
                        {new Date(tx.date).toLocaleDateString("pt-br")}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`font-bold text-sm ${
                      tx.type === "INCOME" ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {tx.type === "INCOME" ? "+" : "-"} R${" "}
                    {Number(tx.amount).toLocaleString("pt-br", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Budgets Card */}
          <div className="p-6 rounded-3xl glass border border-border space-y-6">
            <h3 className="font-bold text-lg">Limites de Orçamento</h3>

            {loading ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                Carregando orçamentos...
              </div>
            ) : budgets.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                Nenhum orçamento mensal configurado.
              </div>
            ) : (
              <div className="space-y-4">
                {budgets.map((budget) => {
                  const limit = Number(budget.amount);
                  const spent = transactionsList
                    .filter(
                      (t) =>
                        t.type === "EXPENSE" &&
                        t.category?.id === budget.category?.id,
                    )
                    .reduce((sum, t) => sum + Number(t.amount), 0);
                  const percentage = limit > 0 ? (spent / limit) * 100 : 0;

                  return (
                    <div key={budget.id} className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-semibold">
                          {budget.category?.name}
                        </span>
                        <span className="text-muted-foreground">
                          R${" "}
                          {spent.toLocaleString("pt-br", {
                            minimumFractionDigits: 2,
                          })}{" "}
                          / R${" "}
                          {limit.toLocaleString("pt-br", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2 overflow-hidden border border-border/20">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(percentage, 100)}%`,
                            backgroundColor:
                              budget.category?.color || "#2563eb",
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-6 rounded-3xl glass border border-border space-y-6">
            <h3 className="font-bold text-lg">Metas de Economia</h3>

            {loading ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                Carregando metas...
              </div>
            ) : goals.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                Nenhuma meta criada.
              </div>
            ) : (
              <div className="space-y-4">
                {goals.map((goal) => {
                  const target = Number(goal.targetAmount);
                  const saved = Number(goal.savedAmount);
                  const percentage = target > 0 ? (saved / target) * 100 : 0;

                  return (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-semibold">{goal.title}</span>
                        <span className="text-muted-foreground">
                          R${" "}
                          {saved.toLocaleString("pt-br", {
                            minimumFractionDigits: 2,
                          })}{" "}
                          / R${" "}
                          {target.toLocaleString("pt-br", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2 overflow-hidden border border-border/20">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default DashboardClient;
