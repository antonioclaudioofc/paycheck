"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "@/lib/types";

export function useAdminController() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    data: users = [],
    isLoading,
    isError,
  } = useQuery<User[]>({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Falha ao carregar usuários");
      return res.json();
    },
  });

  const updateUserMutation = useMutation<
    User,
    Error,
    { id: string; role: "ADMIN" | "USER"; permissions: string[] }
  >({
    mutationFn: async ({ id, role, permissions }) => {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, permissions }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Erro ao atualizar usuário");
      }
      return res.json();
    },
    onSuccess: (data) => {
      setSuccess(`Usuário ${data.name || data.email} atualizado com sucesso!`);
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      setTimeout(() => setSuccess(null), 4000);
    },
    onError: (err: Error) => {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    },
  });

  const handleRoleToggle = (user: User) => {
    const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    const currentPerms = user.permissions.map((p) => p.name);

    updateUserMutation.mutate({
      id: user.id,
      role: newRole,
      permissions: currentPerms,
    });
  };

  const handlePermissionToggle = (user: User, perm: string) => {
    const currentPerms = user.permissions.map((p) => p.name);
    let newPerms: string[];
    if (currentPerms.includes(perm)) {
      newPerms = currentPerms.filter((p) => p !== perm);
    } else {
      newPerms = [...currentPerms, perm];
    }

    updateUserMutation.mutate({
      id: user.id,
      role: user.role,
      permissions: newPerms,
    });
  };

  return {
    users,
    isLoading,
    isError,
    error,
    success,
    updateUserMutation,
    handleRoleToggle,
    handlePermissionToggle,
  };
}
