"use client";

import React, { useEffect, useState } from "react";
import { useBudgets, useCreateBudget } from "@/hooks/use-budgets";
import { useCategories } from "@/hooks/use-categories";
import { createBudgetSchema } from "@/lib/validations";

export function useBudgetsController() {
  const { data: budgets = [], isLoading: loadingBudgets } = useBudgets();
  const { data: allCategories = [], isLoading: loadingCategories } =
    useCategories();
  const createBudget = useCreateBudget();

  const expenseCategories = allCategories;

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

  return {
    budgets,
    expenseCategories,
    createBudget,
    categoryId,
    setCategoryId,
    amount,
    setAmount,
    month,
    setMonth,
    year,
    setYear,
    error,
    success,
    loading,
    handleSubmit,
    getMonthName,
  };
}
