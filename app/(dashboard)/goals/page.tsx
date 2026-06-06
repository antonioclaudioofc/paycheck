"use client";

import React, { useState } from "react";
import { Target, Plus } from "lucide-react";
import { useGoals, useCreateGoal } from "@/hooks/use-goals";
import { createGoalSchema } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

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

          {error && <Alert type="error" message={error} className="mb-4" />}

          {success && (
            <Alert
              type="success"
              message="Meta criada com sucesso!"
              className="mb-4"
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Título do Objetivo"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Ex: Reserva de emergência, Viagem..."
            />

            <Input
              label="Valor Alvo (R$)"
              type="number"
              step="0.01"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              required
              placeholder="0.00"
            />

            <Input
              label="Valor Já Economizado (R$ - Opcional)"
              type="number"
              step="0.01"
              value={savedAmount}
              onChange={(e) => setSavedAmount(e.target.value)}
              placeholder="0.00"
            />

            <Input
              label="Prazo Limite (Opcional)"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />

            <Button
              type="submit"
              disabled={createGoal.isPending}
              className="w-full"
            >
              {createGoal.isPending ? "Criando..." : "Criar Meta"}
            </Button>
          </form>
        </div>

        <div className="lg:col-span-2 p-6 rounded-3xl glass border border-border space-y-6">
          <h3 className="font-bold text-lg flex items-center space-x-2">
            <Target className="w-5 h-5 text-primary" />
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
                          <p className="text-xs text-muted-foreground mt-0.5" suppressHydrationWarning>
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
