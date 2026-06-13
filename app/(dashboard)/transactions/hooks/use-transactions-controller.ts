"use client";

import React, { useEffect, useState } from "react";
import {
  useTransactions,
  useCreateTransaction,
  useDeleteTransaction,
} from "@/hooks/use-transactions";
import { useCategories } from "@/hooks/use-categories";
import { createTransactionSchema } from "@/lib/validations";

export function useTransactionsController() {
  const { data: txResponse, isLoading: loadingTx } = useTransactions({
    limit: 50,
  });
  const { data: allCategories = [], isLoading: loadingCategories } =
    useCategories();
  const createTransaction = useCreateTransaction();
  const deleteTransaction = useDeleteTransaction();

  const transactions = txResponse?.data || [];

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const filteredCategories = allCategories;

  useEffect(() => {
    Promise.resolve().then(() => {
      if (filteredCategories.length > 0) {
        if (!filteredCategories.some((c) => c.id === categoryId)) {
          setCategoryId(filteredCategories[0].id);
        }
      } else {
        setCategoryId("");
      }
    });
  }, [type, allCategories, categoryId, filteredCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!categoryId) {
      setError("Crie uma categoria primeiro.");
      return;
    }

    const parsedAmount = parseFloat(amount);
    const parsedDate = new Date(date);

    const validation = createTransactionSchema.safeParse({
      description,
      amount: parsedAmount,
      type,
      categoryId,
      date: parsedDate,
    });

    if (!validation.success) {
      const errorMsg = validation.error.errors[0]?.message || "Dados inválidos";
      setError(errorMsg);
      return;
    }

    createTransaction.mutate(
      {
        description,
        amount: parsedAmount,
        type,
        categoryId,
        date: parsedDate,
      },
      {
        onSuccess: () => {
          setSuccess(true);
          setDescription("");
          setAmount("");
        },
        onError: (err: Error) => {
          setError(err.message || "Erro ao criar transação");
        },
      },
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta transação?")) return;
    deleteTransaction.mutate(id, {
      onError: (err: Error) => {
        alert(err.message || "Erro ao excluir transação");
      },
    });
  };

  const loading = loadingTx || loadingCategories;

  return {
    transactions,
    filteredCategories,
    createTransaction,
    deleteTransaction,
    description,
    setDescription,
    amount,
    setAmount,
    type,
    setType,
    categoryId,
    setCategoryId,
    date,
    setDate,
    error,
    success,
    loading,
    handleSubmit,
    handleDelete,
  };
}
