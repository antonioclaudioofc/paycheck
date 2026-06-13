"use client";

import React from "react";
import Link from "next/link";
import { Landmark } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useRegisterController } from "../hooks/use-register-controller";

export default function RegisterClient() {
  const {
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
  } = useRegisterController();

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4 relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md p-8 rounded-3xl glass shadow-2xl relative">
        <div className="text-center mb-8 flex flex-col items-center">
          <Landmark className="w-12 h-12 text-primary mb-3" />
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Crie sua conta
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Comece a gerenciar suas finanças com clareza
          </p>
        </div>

        {error && <Alert type="error" message={error} className="mb-6" />}

        {success && (
          <Alert
            type="success"
            message="Conta criada com sucesso! Redirecionando..."
            className="mb-6"
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Nome Completo"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Digite seu nome"
            disabled={loading || success}
          />

          <Input
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Digite seu e-mail"
            disabled={loading || success}
          />

          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Crie uma senha"
            disabled={loading || success}
          />

          <Button
            type="submit"
            disabled={loading || success}
            className="w-full"
          >
            {loading ? "Criando conta..." : "Registrar"}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          Já possui uma conta?{" "}
          <Link
            href="/login"
            className="text-primary hover:underline font-semibold"
          >
            Faça login
          </Link>
        </div>
      </div>
    </main>
  );
}
