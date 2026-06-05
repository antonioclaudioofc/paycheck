// app/api/register/route.ts
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório").max(100),
  email: z.string().email("Endereço de e-mail inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = registerSchema.safeParse(body);

    if (!validated.success) {
      return Response.json(
        { error: "Dados inválidos", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, password } = validated.data;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return Response.json(
        { error: "Este e-mail já está cadastrado" },
        { status: 400 }
      );
    }

    // Hash the password (cost factor of 12 as per security rules)
    const passwordHash = await bcrypt.hash(password, 12);

    // Create the user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return Response.json(
      { message: "Usuário registrado com sucesso", user },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/register]", error);
    return Response.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
export const dynamic = "force-dynamic";
