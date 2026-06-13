"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, User as UserIcon, Settings, Loader2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { User } from "@/lib/types";

export default function AdminClient() {
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

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center space-x-2">
          <Shield className="w-8 h-8 text-primary" />
          <span>Painel de Administração</span>
        </h2>
        <p className="text-muted-foreground mt-1">
          Gerencie os usuários, cargos e permissões do sistema.
        </p>
      </div>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      <div className="p-6 rounded-3xl glass border border-border space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg flex items-center space-x-2">
            <Settings className="w-5 h-5 text-primary" />
            <span>Controle de Usuários</span>
          </h3>
        </div>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-muted-foreground text-sm space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span>Carregando lista de usuários...</span>
          </div>
        ) : isError ? (
          <div className="py-12 text-center text-red-500 text-sm">
            Erro ao carregar usuários. Por favor, tente novamente mais tarde.
          </div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-sm">
            Nenhum usuário cadastrado encontrado.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border/30">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-secondary/40 border-b border-border/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="p-4">Usuário</th>
                  <th className="p-4">Cargo (Role)</th>
                  <th className="p-4">Permissões Especiais</th>
                  <th className="p-4">Cadastrado em</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {users.map((user) => {
                  const hasManageCategories = user.permissions.some(
                    (p) => p.name === "manage:categories",
                  );
                  const isPending =
                    updateUserMutation.isPending &&
                    updateUserMutation.variables?.id === user.id;

                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-secondary/20 transition-colors duration-150 ${
                        isPending ? "opacity-60 pointer-events-none" : ""
                      }`}
                    >
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                            {user.name ? (
                              user.name[0].toUpperCase()
                            ) : (
                              <UserIcon className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-foreground">
                              {user.name || "Sem nome"}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-1 text-xs font-bold tracking-wider rounded-md uppercase border ${
                              user.role === "ADMIN"
                                ? "bg-red-500/10 text-red-500 border-red-500/20"
                                : "bg-zinc-500/10 text-zinc-500 border-zinc-500/20"
                            }`}
                          >
                            {user.role}
                          </span>
                          <button
                            onClick={() => handleRoleToggle(user)}
                            className="text-xs px-2.5 py-1.5 rounded-lg bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground font-medium transition-all duration-200 cursor-pointer"
                          >
                            Alterar Cargo
                          </button>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`perm-categories-${user.id}`}
                              checked={
                                hasManageCategories || user.role === "ADMIN"
                              }
                              disabled={user.role === "ADMIN"}
                              onChange={() =>
                                handlePermissionToggle(
                                  user,
                                  "manage:categories",
                                )
                              }
                              className="w-4 h-4 text-primary border-border rounded focus:ring-primary cursor-pointer disabled:cursor-not-allowed"
                            />
                            <label
                              htmlFor={`perm-categories-${user.id}`}
                              className={`text-xs font-medium cursor-pointer selection:bg-transparent ${
                                user.role === "ADMIN"
                                  ? "text-muted-foreground/60 cursor-not-allowed"
                                  : "text-foreground"
                              }`}
                            >
                              Criar/Editar categorias de sistema
                            </label>
                            {user.role === "ADMIN" && (
                              <span className="text-[10px] text-muted-foreground italic">
                                (Herdado de ADMIN)
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-xs text-muted-foreground font-mono">
                        {new Date(user.createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
