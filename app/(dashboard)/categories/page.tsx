"use client";

import React, { useState } from "react";
import { FolderTree, Plus } from "lucide-react";
import { useCategories, useCreateCategory } from "@/hooks/use-categories";
import { createCategorySchema } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export default function CategoriesPage() {
  const { data: categories = [], isLoading } = useCategories();
  const createCategory = useCreateCategory();

  const [name, setName] = useState("");
  const [color, setColor] = useState("#2b7fff");
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
          setColor("#2b7fff");
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

          {error && <Alert type="error" message={error} />}
          {success && (
            <Alert type="success" message="Categoria criada com sucesso!" />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nome da Categoria"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ex: Alimentação, Salário..."
            />

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Cor de Identificação
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-12 rounded-md bg-transparent border-0 cursor-pointer"
                />
                <span className="text-sm font-mono uppercase text-muted-foreground">
                  {color}
                </span>
              </div>
            </div>

            <Select
              label="Tipo"
              value={type}
              onChange={(e) => setType(e.target.value as "INCOME" | "EXPENSE")}
            >
              <option value="EXPENSE">Despesa (Saída)</option>
              <option value="INCOME">Receita (Entrada)</option>
            </Select>

            <Button
              type="submit"
              disabled={createCategory.isPending}
              className="w-full"
            >
              {createCategory.isPending ? "Criando..." : "Criar Categoria"}
            </Button>
          </form>
        </div>

        <div className="lg:col-span-2 p-6 rounded-3xl glass border border-border space-y-6">
          <h3 className="font-bold text-lg flex items-center space-x-2">
            <FolderTree className="w-5 h-5 text-primary" />
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
