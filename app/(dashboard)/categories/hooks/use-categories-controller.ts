"use client";

import React, { useState } from "react";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/use-categories";
import { createCategorySchema } from "@/lib/validations";
import { Category } from "@/lib/types";
import { Session } from "next-auth";

export function useCategoriesController(session: Session | null) {
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
    !!session?.user?.role &&
    (session.user.role === "ADMIN" ||
      session.user.permissions?.includes("manage:categories"));

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

  return {
    categories,
    isLoading,
    createCategory,
    updateCategory,
    deleteCategory,
    name,
    setName,
    color,
    setColor,
    isDefault,
    setIsDefault,
    editingCategory,
    error,
    success,
    isUserAdmin,
    startEdit,
    cancelEdit,
    handleDelete,
    handleSubmit,
  };
}
