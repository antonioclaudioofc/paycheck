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

  const filteredCategories = allCategories.filter((c) => c.type === type);

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
        {/* Form panel */}
        <div className="p-6 rounded-3xl glass border border-border h-fit space-y-6">
          <h3 className="font-bold text-lg flex items-center space-x-2">
            <Plus className="w-5 h-5 text-primary" />
            <span>Nova Transação</span>
          </h3>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
              Transação adicionada com sucesso!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Descrição
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                placeholder="Ex: Aluguel, Supermercado..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Valor (R$)
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
                  Tipo
                </label>
                <select
                  value={type}
                  onChange={(e) =>
                    setType(e.target.value as "INCOME" | "EXPENSE")
                  }
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                >
                  <option value="EXPENSE">Despesa</option>
                  <option value="INCOME">Receita</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Data
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Categoria
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
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
              </select>
            </div>

            <button
              type="submit"
              disabled={createTransaction.isPending}
              className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:brightness-110 active:scale-98 transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              {createTransaction.isPending
                ? "Adicionando..."
                : "Adicionar Transação"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 p-6 rounded-3xl glass border border-border space-y-6">
          <h3 className="font-bold text-lg flex items-center space-x-2">
            <ArrowLeftRight className="w-5 h-5 text-indigo-400" />
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
                        backgroundColor: tx.category?.color || "#6366f1",
                      }}
                    ></div>
                    <div>
                      <p className="font-semibold text-sm">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">
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
export const dynamic = "force-dynamic";
