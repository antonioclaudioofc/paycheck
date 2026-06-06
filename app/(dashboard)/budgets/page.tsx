"use client";

import React, { useEffect, useState } from "react";
import { PiggyBank, Plus } from "lucide-react";
import { useBudgets, useCreateBudget } from "@/hooks/use-budgets";
import { useCategories } from "@/hooks/use-categories";
import { createBudgetSchema } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

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

          {error && <Alert type="error" message={error} />}
          {success && (
            <Alert type="success" message="Orçamento salvo com sucesso!" />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Categoria de Despesa"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
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
            </Select>

            <Input
              label="Limite Mensal (R$)"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              placeholder="0.00"
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Mês"
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value, 10))}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {getMonthName(m)}
                  </option>
                ))}
              </Select>

              <Select
                label="Ano"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value, 10))}
              >
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </Select>
            </div>

            <Button
              type="submit"
              disabled={createBudget.isPending}
              className="w-full"
            >
              {createBudget.isPending ? "Salvando..." : "Salvar Orçamento"}
            </Button>
          </form>
        </div>

        <div className="lg:col-span-2 p-6 rounded-3xl glass border border-border space-y-6">
          <h3 className="font-bold text-lg flex items-center space-x-2">
            <PiggyBank className="w-5 h-5 text-primary" />
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
                        backgroundColor: budget.category?.color || "#2563eb",
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
