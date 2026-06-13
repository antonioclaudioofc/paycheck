"use client";

import React, { useState } from "react";
import { FolderTree, Plus, Edit2, Trash2, X, Lock } from "lucide-react";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/use-categories";
import { createCategorySchema } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Category } from "@/lib/types";
import { Session } from "next-auth";

export default function CategoriesClient({
  session,
}: {
  session: Session | null;
}) {
  const { data: categories = [], isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [name, setName] = useState("");
  const [color, setColor] = useState("#2b7fff");
  const [isDefault, setIsDefault] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isUserAdmin =
    session?.user?.role === "ADMIN" ||
    session?.user?.permissions?.includes("manage:categories");

  const startEdit = (category: Category) => {
    setError(null);
    setSuccess(null);
    setEditingCategory(category);
    setName(category.name);
    setColor(category.color);
    setIsDefault(category.isDefault || false);
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setName("");
    setColor("#2b7fff");
    setIsDefault(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      !window.confirm(`Tem certeza que deseja excluir a categoria "${name}"?`)
    ) {
      return;
    }
    setError(null);
    setSuccess(null);

    deleteCategory.mutate(id, {
      onSuccess: () => {
        setSuccess("Categoria excluída com sucesso!");
        if (editingCategory?.id === id) {
          cancelEdit();
        }
      },
      onError: (err: Error) => {
        setError(err.message || "Erro ao excluir categoria");
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validation = createCategorySchema.safeParse({
      name,
      color,
      isDefault,
    });
    if (!validation.success) {
      const errorMsg = validation.error.errors[0]?.message || "Dados inválidos";
      setError(errorMsg);
      return;
    }

    if (editingCategory) {
      updateCategory.mutate(
        {
          id: editingCategory.id,
          data: { name, color, isDefault },
        },
        {
          onSuccess: () => {
            setSuccess("Categoria atualizada com sucesso!");
            cancelEdit();
          },
          onError: (err: Error) => {
            setError(err.message || "Erro ao atualizar categoria");
          },
        },
      );
    } else {
      createCategory.mutate(
        { name, color, isDefault },
        {
          onSuccess: () => {
            setSuccess("Categoria criada com sucesso!");
            setName("");
            setColor("#2b7fff");
            setIsDefault(false);
          },
          onError: (err: Error) => {
            setError(err.message || "Erro ao criar categoria");
          },
        },
      );
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Categorias
        </h2>
        <p className="text-muted-foreground mt-1">
          Gerencie as categorias de suas receitas e despesas
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl glass border border-border h-fit space-y-6">
          <h3 className="font-bold text-lg flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Plus className="w-5 h-5 text-primary" />
              <span>
                {editingCategory ? "Editar Categoria" : "Nova Categoria"}
              </span>
            </span>
            {editingCategory && (
              <button
                onClick={cancelEdit}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
                title="Cancelar edição"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </h3>

          {error && <Alert type="error" message={error} />}
          {success && <Alert type="success" message={success} />}

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

            {isUserAdmin && (
              <div className="flex items-center space-x-2 py-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary cursor-pointer"
                />
                <label
                  htmlFor="isDefault"
                  className="text-sm font-medium text-foreground cursor-pointer selection:bg-transparent"
                >
                  Categoria Padrão (Global do Sistema)
                </label>
              </div>
            )}

            <div className="flex gap-2">
              {editingCategory && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={cancelEdit}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              )}
              <Button
                type="submit"
                disabled={createCategory.isPending || updateCategory.isPending}
                className="flex-1"
              >
                {editingCategory
                  ? updateCategory.isPending
                    ? "Salvando..."
                    : "Salvar Alterações"
                  : createCategory.isPending
                    ? "Criando..."
                    : "Criar Categoria"}
              </Button>
            </div>
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
              {categories.map((category) => {
                const isDefaultCat = category.isDefault;
                const canManage = !isDefaultCat || isUserAdmin;

                return (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-4 rounded-2xl bg-secondary/50 border border-border/30 hover:border-border/60 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className="w-8 h-8 rounded-lg shrink-0"
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-semibold text-sm text-foreground">
                            {category.name}
                          </p>
                          {isDefaultCat ? (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold tracking-wider rounded uppercase bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800/30">
                              Padrão
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold tracking-wider rounded uppercase bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800/30">
                              Personalizada
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {canManage ? (
                        <>
                          <button
                            onClick={() => startEdit(category)}
                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-all duration-200 cursor-pointer"
                            title="Editar Categoria"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(category.id, category.name)
                            }
                            disabled={deleteCategory.isPending}
                            className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all duration-200 cursor-pointer"
                            title="Excluir Categoria"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <div
                          className="p-2 text-muted-foreground/40"
                          title="Categorias padrão do sistema não podem ser excluídas ou editadas"
                        >
                          <Lock className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
