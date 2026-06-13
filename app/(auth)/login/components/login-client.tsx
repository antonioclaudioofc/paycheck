"use client";

import React from "react";
import Link from "next/link";
import { Landmark } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useLoginController } from "../hooks/use-login-controller";

export default function LoginClient() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    handleSubmit,
  } = useLoginController();

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4 relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md p-8 rounded-3xl glass shadow-2xl relative">
        <div className="text-center mb-8 flex flex-col items-center">
          <Landmark className="w-12 h-12 text-primary mb-3" />
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Paycheck
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Entre na sua conta para controlar suas finanças
          </p>
        </div>

        {error && <Alert type="error" message={error} className="mb-6" />}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Digite seu e-mail"
            disabled={loading}
          />

          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Digite sua senha"
            disabled={loading}
          />

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          Não tem uma conta?{" "}
          <Link
            href="/register"
            className="text-primary hover:underline font-semibold"
          >
            Cadastre-se grátis
          </Link>
        </div>
      </div>
    </main>
  );
}
