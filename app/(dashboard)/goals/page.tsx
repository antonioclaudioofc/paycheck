"use client";

import React, { useState } from "react";
import { Target, Plus } from "lucide-react";
import { useGoals, useCreateGoal } from "@/hooks/use-goals";
import { createGoalSchema } from "@/lib/validations";

export default function GoalsPage() {
  const { data: goals = [], isLoading } = useGoals();
  const createGoal = useCreateGoal();

  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [savedAmount, setSavedAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const parsedTarget = parseFloat(targetAmount);
    const parsedSaved = savedAmount ? parseFloat(savedAmount) : 0;
    const parsedDeadline = deadline ? new Date(deadline) : null;

    const validation = createGoalSchema.safeParse({
      title,
      targetAmount: parsedTarget,
      savedAmount: parsedSaved,
      deadline: parsedDeadline,
      status: "ACTIVE",
    });

    if (!validation.success) {
      const errorMsg = validation.error.errors[0]?.message || "Dados inválidos";
      setError(errorMsg);
      return;
    }

    createGoal.mutate(
      {
        title,
        targetAmount: parsedTarget,
        savedAmount: parsedSaved,
        deadline: parsedDeadline,
        status: "ACTIVE",
      },
      {
        onSuccess: () => {
          setSuccess(true);
          setTitle("");
          setTargetAmount("");
          setSavedAmount("");
          setDeadline("");
        },
        onError: (err: Error) => {
          setError(err.message || "Erro ao criar meta");
        },
      },
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Metas de Economia</h2>
        <p className="text-muted-foreground mt-1">
          Defina objetivos e acompanhe o progresso de sua reserva financeira
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl glass border border-border h-fit space-y-6">
          <h3 className="font-bold text-lg flex items-center space-x-2">
            <Plus className="w-5 h-5 text-primary" />
            <span>Criar Nova Meta</span>
          </h3>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
              Meta criada com sucesso!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Título do Objetivo
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                placeholder="Ex: Reserva de emergência, Viagem..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Valor Alvo (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Valor Já Economizado (R$ - Opcional)
              </label>
              <input
                type="number"
                step="0.01"
                value={savedAmount}
                onChange={(e) => setSavedAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Prazo Limite (Opcional)
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={createGoal.isPending}
              className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:brightness-110 active:scale-98 transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              {createGoal.isPending ? "Criando..." : "Criar Meta"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 p-6 rounded-3xl glass border border-border space-y-6">
          <h3 className="font-bold text-lg flex items-center space-x-2">
            <Target className="w-5 h-5 text-indigo-400" />
            <span>Seus Objetivos</span>
          </h3>

          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              Carregando metas...
            </div>
          ) : goals.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              Nenhuma meta de economia definida.
            </div>
          ) : (
            <div className="space-y-6">
              {goals.map((goal) => {
                const target = Number(goal.targetAmount);
                const saved = Number(goal.savedAmount);
                const percentage = (saved / target) * 100;

                return (
                  <div
                    key={goal.id}
                    className="p-4 rounded-2xl bg-secondary/50 border border-border/30 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-base">{goal.title}</p>
                        {goal.deadline && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Prazo:{" "}
                            {new Date(goal.deadline).toLocaleDateString(
                              "pt-br",
                            )}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-foreground">
                          R$ {saved.toLocaleString("pt-br")} / R${" "}
                          {target.toLocaleString("pt-br")}
                        </p>
                        <p className="text-xs text-primary font-semibold mt-0.5">
                          {Math.floor(percentage)}% Concluído
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden border border-border/20">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
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
export const dynamic = "force-dynamic";
