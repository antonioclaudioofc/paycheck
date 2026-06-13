"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeftRight, Plus, Trash2 } from "lucide-react";
import {
  useTransactions,
  useCreateTransaction,
  useDeleteTransaction,
} from "@/hooks/use-transactions";
import { useCategories } from "@/hooks/use-categories";
import { createTransactionSchema } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export default function TransactionsPage() {
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

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Transações</h2>
        <p className="text-muted-foreground mt-1">
          Registre e gerencie suas entradas e saídas de caixa
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl glass border border-border h-fit space-y-6">
          <h3 className="font-bold text-lg flex items-center space-x-2">
            <Plus className="w-5 h-5 text-primary" />
            <span>Nova Transação</span>
          </h3>

          {error && <Alert type="error" message={error} />}
          {success && (
            <Alert type="success" message="Transação adicionada com sucesso!" />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Descrição"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Ex: Aluguel, Supermercado..."
            />

            <Input
              label="Valor (R$)"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              placeholder="0.00"
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Tipo"
                value={type}
                onChange={(e) =>
                  setType(e.target.value as "INCOME" | "EXPENSE")
                }
              >
                <option value="EXPENSE">Despesa</option>
                <option value="INCOME">Receita</option>
              </Select>

              <Input
                label="Data"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <Select
              label="Categoria"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {filteredCategories.length === 0 ? (
                <option value="">Nenhuma categoria cadastrada</option>
              ) : (
                filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))
              )}
            </Select>

            <Button
              type="submit"
              disabled={createTransaction.isPending}
              className="w-full"
            >
              {createTransaction.isPending
                ? "Adicionando..."
                : "Adicionar Transação"}
            </Button>
          </form>
        </div>

        <div className="lg:col-span-2 p-6 rounded-3xl glass border border-border space-y-6">
          <h3 className="font-bold text-lg flex items-center space-x-2">
            <ArrowLeftRight className="w-5 h-5 text-primary" />
            <span>Extrato</span>
          </h3>

          {loading ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              Carregando transações...
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              Nenhuma transação cadastrada.
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-secondary/50 border border-border/30"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-8 h-8 rounded-lg"
                      style={{
                        backgroundColor: tx.category?.color || "#2563eb",
                      }}
                    ></div>
                    <div>
                      <p className="font-semibold text-sm">{tx.description}</p>
                      <p
                        className="text-xs text-muted-foreground"
                        suppressHydrationWarning
                      >
                        {tx.category?.name} •{" "}
                        {new Date(tx.date).toLocaleDateString("pt-br")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <p
                      className={`font-bold text-sm ${
                        tx.type === "INCOME"
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {tx.type === "INCOME" ? "+" : "-"} R${" "}
                      {Number(tx.amount).toLocaleString("pt-br", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <button
                      onClick={() => handleDelete(tx.id)}
                      disabled={deleteTransaction.isPending}
                      className="text-red-400/70 hover:text-red-400 p-1 hover:bg-red-500/10 rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
