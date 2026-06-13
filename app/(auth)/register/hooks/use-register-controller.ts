"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/app/actions/auth";

export function useRegisterController() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Ocorreu um erro ao criar a conta.");
        setLoading(false);
      } else {
        const result = await loginAction({ email, password });

        if (result?.error) {
          setError(
            "Conta criada, mas ocorreu um erro no login automático. Vá para a tela de login.",
          );
          setLoading(false);
          setTimeout(() => {
            router.push("/login");
          }, 3000);
        } else {
          setSuccess(true);
          setLoading(false);
        }
      }
    } catch (err) {
      if (err instanceof Error && err.message === "NEXT_REDIRECT") {
        throw err;
      }
      console.error(err);
      setError("Falha na rede. Tente novamente.");
      setLoading(false);
    }
  };

  return {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    error,
    success,
    loading,
    handleSubmit,
  };
}
