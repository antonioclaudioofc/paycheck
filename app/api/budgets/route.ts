import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sseManager } from "@/lib/sse-manager";
import { createBudgetSchema } from "@/lib/validations";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const budgets = await prisma.budget.findMany({
      where: {
        userId: session.user.id,
        active: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });

    return Response.json(budgets);
  } catch (error) {
    console.error("[GET /api/budgets]", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = createBudgetSchema.safeParse(body);

    if (!validated.success) {
      return Response.json(
        { error: "Invalid data", details: validated.error.flatten() },
        { status: 400 },
      );
    }

    const { categoryId, amount, month, year } = validated.data;

    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId: session.user.id,
        active: true,
      },
    });

    if (!category) {
      return Response.json(
        { error: "Category not found or invalid" },
        { status: 400 },
      );
    }

    const existingBudget = await prisma.budget.findUnique({
      where: {
        userId_categoryId_month_year: {
          userId: session.user.id,
          categoryId,
          month,
          year,
        },
      },
    });

    if (existingBudget) {
      const updatedBudget = await prisma.budget.update({
        where: { id: existingBudget.id },
        data: {
          amount,
          active: true,
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              color: true,
              icon: true,
            },
          },
        },
      });

      sseManager.sendToUser(session.user.id, "budget-updated", updatedBudget);
      return Response.json(updatedBudget);
    }

    const budget = await prisma.budget.create({
      data: {
        userId: session.user.id,
        categoryId,
        amount,
        month,
        year,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
      },
    });

    sseManager.sendToUser(session.user.id, "budget-created", budget);
    return Response.json(budget, { status: 201 });
  } catch (error) {
    console.error("[POST /api/budgets]", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
