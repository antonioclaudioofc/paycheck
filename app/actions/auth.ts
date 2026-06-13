"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function loginAction(data: {
  email: string;
  password: CheckServerActions;
}) {
  try {
    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirectTo: "/",
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "E-mail ou senha incorretos." };
    }
    throw error;
  }
}

type CheckServerActions = string;
