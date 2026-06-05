"use client";

import React, { useEffect, useState } from "react";
import { PiggyBank, Plus } from "lucide-react";
import { useBudgets, useCreateBudget } from "@/hooks/use-budgets";
import { useCategories } from "@/hooks/use-categories";
import { createBudgetSchema } from "@/lib/validations";

export default function BudgetsPage() {
  const { data: budgets = [], isLoading: loadingBudgets } = useBudgets();
  const { data: allCategories = [], isLoading: loadingCategories } =
    useCategories();
  const createBudget = useCreateBudget();

  const expenseCategories = allCategories.filter((c) => c.type === "EXPENSE");

  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (expenseCategories.length > 0 && !categoryId) {
      Promise.resolve().then(() => {
        setCategoryId(expenseCategories[0].id);
      });
    }
  }, [expenseCategories, categoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!categoryId) {
      setError("Crie uma categoria de despesa primeiro.");
      return;
    }

    const parsedAmount = parseFloat(amount);

    const validation = createBudgetSchema.safeParse({
      categoryId,
      amount: parsedAmount,
      month,
      year,
    });

    if (!validation.success) {
      const errorMsg = validation.error.errors[0]?.message || "Dados inválidos";
      setError(errorMsg);
      return;
    }

    createBudget.mutate(
      {
        categoryId,
        amount: parsedAmount,
        month,
        year,
      },
      {
        onSuccess: () => {
          setSuccess(true);
          setAmount("");
        },
        onError: (err: Error) => {
          setError(err.message || "Erro ao configurar orçamento");
        },
      },
    );
  };

  const getMonthName = (m: number) => {
    return new Date(2026, m - 1, 1).toLocaleString("pt-br", { month: "long" });
  };

  const loading = loadingBudgets || loadingCategories;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Orçamentos</h2>
        <p className="text-muted-foreground mt-1">
          Defina limites de gastos mensais por categoria para manter o controle
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl glass border border-border h-fit space-y-6">
          <h3 className="font-bold text-lg flex items-center space-x-2">
            <Plus className="w-5 h-5 text-primary" />
            <span>Definir Limite</span>
          </h3>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
              Orçamento salvo com sucesso!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Categoria de Despesa
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              >
                {expenseCategories.length === 0 ? (
                  <option value="">
                    Nenhuma categoria de despesa disponível
                  </option>
                ) : (
                  expenseCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Limite Mensal (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                placeholder="0.00"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Mês
                </label>
                <select
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value, 10))}
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {getMonthName(m)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Ano
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value, 10))}
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                >
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={createBudget.isPending}
              className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:brightness-110 active:scale-98 transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              {createBudget.isPending ? "Salvando..." : "Salvar Orçamento"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 p-6 rounded-3xl glass border border-border space-y-6">
          <h3 className="font-bold text-lg flex items-center space-x-2">
            <PiggyBank className="w-5 h-5 text-indigo-400" />
            <span>Limites Configurados</span>
          </h3>

          {loading ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              Carregando orçamentos...
            </div>
          ) : budgets.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              Nenhum orçamento configurado.
            </div>
          ) : (
            <div className="space-y-4">
              {budgets.map((budget) => (
                <div
                  key={budget.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-secondary/50 border border-border/30"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-8 h-8 rounded-lg"
                      style={{
                        backgroundColor: budget.category?.color || "#6366f1",
                      }}
                    ></div>
                    <div>
                      <p className="font-semibold text-sm">
                        {budget.category?.name}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        Referência: {getMonthName(budget.month)} de{" "}
                        {budget.year}
                      </p>
                    </div>
                  </div>
                  <p className="font-bold text-sm text-foreground">
                    R${" "}
                    {Number(budget.amount).toLocaleString("pt-br", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
