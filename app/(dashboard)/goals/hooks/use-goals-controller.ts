"use client";

import React, { useState } from "react";
import { useGoals, useCreateGoal } from "@/hooks/use-goals";
import { createGoalSchema } from "@/lib/validations";

export function useGoalsController() {
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

  return {
    goals,
    isLoading,
    createGoal,
    title,
    setTitle,
    targetAmount,
    setTargetAmount,
    savedAmount,
    setSavedAmount,
    deadline,
    setDeadline,
    error,
    success,
    handleSubmit,
  };
}
