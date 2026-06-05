"use client";

import React, { useState } from "react";
import { FolderTree, Plus } from "lucide-react";
import { useCategories, useCreateCategory } from "@/hooks/use-categories";
import { createCategorySchema } from "@/lib/validations";

export default function CategoriesPage() {
  const { data: categories = [], isLoading } = useCategories();
  const createCategory = useCreateCategory();

  const [name, setName] = useState("");
  const [color, setColor] = useState("#6366f1");
  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const validation = createCategorySchema.safeParse({ name, color, type });
    if (!validation.success) {
      const errorMsg = validation.error.errors[0]?.message || "Dados inválidos";
      setError(errorMsg);
      return;
    }

    createCategory.mutate(
      { name, color, type },
      {
        onSuccess: () => {
          setSuccess(true);
          setName("");
          setColor("#6366f1");
        },
        onError: (err: Error) => {
          setError(err.message || "Erro ao criar categoria");
        },
      },
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Categorias</h2>
        <p className="text-muted-foreground mt-1">
          Gerencie as categorias de suas receitas e despesas
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl glass border border-border h-fit space-y-6">
          <h3 className="font-bold text-lg flex items-center space-x-2">
            <Plus className="w-5 h-5 text-primary" />
            <span>Nova Categoria</span>
          </h3>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
              Categoria criada com sucesso!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Nome da Categoria
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                placeholder="Ex: Alimentação, Salário..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Cor de Identificação
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-12 rounded-xl bg-transparent border-0 cursor-pointer"
                />
                <span className="text-sm font-mono uppercase text-muted-foreground">
                  {color}
                </span>
              </div>
            </div>

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
                <option value="EXPENSE">Despesa (Saída)</option>
                <option value="INCOME">Receita (Entrada)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={createCategory.isPending}
              className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:brightness-110 active:scale-98 transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              {createCategory.isPending ? "Criando..." : "Criar Categoria"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 p-6 rounded-3xl glass border border-border space-y-6">
          <h3 className="font-bold text-lg flex items-center space-x-2">
            <FolderTree className="w-5 h-5 text-indigo-400" />
            <span>Suas Categorias</span>
          </h3>

          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              Carregando categorias...
            </div>
          ) : categories.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              Nenhuma categoria encontrada. Crie uma para começar!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-secondary/50 border border-border/30"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-8 h-8 rounded-lg"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <div>
                      <p className="font-semibold text-sm">{category.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {category.type === "INCOME" ? "Receita" : "Despesa"}
                      </p>
                    </div>
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
