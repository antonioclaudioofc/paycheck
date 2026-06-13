import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sseManager } from "@/lib/sse-manager";
import { createTransactionSchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "20", 10),
      100,
    );
    const cursor = searchParams.get("cursor");
    const type = searchParams.get("type");
    const categoryId = searchParams.get("categoryId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: Prisma.TransactionWhereInput = {
      userId: session.user.id,
      active: true,
    };

    if (type === "INCOME" || type === "EXPENSE") {
      where.type = type;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    const transactions = await prisma.transaction.findMany({
      where,
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      orderBy: { date: "desc" },
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

    const hasNextPage = transactions.length > limit;
    const items = hasNextPage ? transactions.slice(0, limit) : transactions;
    const nextCursor = hasNextPage ? items[items.length - 1].id : null;

    return Response.json({
      data: items,
      nextCursor,
    });
  } catch (error) {
    console.error("[GET /api/transactions]", error);
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
    const validated = createTransactionSchema.safeParse(body);

    if (!validated.success) {
      return Response.json(
        { error: "Invalid data", details: validated.error.flatten() },
        { status: 400 },
      );
    }

    const transactionData = validated.data;

    const category = await prisma.category.findFirst({
      where: {
        id: transactionData.categoryId,
        active: true,
        OR: [
          { userId: session.user.id },
          { isDefault: true },
        ],
      },
    });

    if (!category) {
      return Response.json(
        { error: "Category not found or invalid" },
        { status: 400 },
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        categoryId: transactionData.categoryId,
        amount: transactionData.amount,
        type: transactionData.type,
        description: transactionData.description,
        date: transactionData.date,
        tags: transactionData.tags || [],
        isRecurring: transactionData.isRecurring || false,
        recurrence: transactionData.recurrence || null,
        notes: transactionData.notes || null,
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

    sseManager.sendToUser(session.user.id, "transaction-created", transaction);

    if (transaction.type === "EXPENSE") {
      const txDate = new Date(transaction.date);
      const month = txDate.getMonth() + 1; // 1-12
      const year = txDate.getFullYear();

      const budget = await prisma.budget.findUnique({
        where: {
          userId_categoryId_month_year: {
            userId: session.user.id,
            categoryId: transaction.categoryId,
            month,
            year,
          },
        },
      });

      if (budget && budget.active) {
        const aggregations = await prisma.transaction.aggregate({
          where: {
            userId: session.user.id,
            categoryId: transaction.categoryId,
            type: "EXPENSE",
            active: true,
            date: {
              gte: new Date(year, month - 1, 1),
              lt: new Date(year, month, 1),
            },
          },
          _sum: {
            amount: true,
          },
        });

        const totalSpent = aggregations._sum.amount
          ? Number(aggregations._sum.amount)
          : 0;
        const budgetAmount = Number(budget.amount);
        const percentage = (totalSpent / budgetAmount) * 100;

        if (percentage >= 80) {
          sseManager.sendToUser(session.user.id, "budget-alert", {
            categoryId: transaction.categoryId,
            categoryName: category.name,
            budgetAmount,
            totalSpent,
            percentage,
            severity: percentage >= 100 ? "danger" : "warning",
            message:
              percentage >= 100
                ? `You have exceeded 100% of your budget for category "${category.name}".`
                : `You have used ${Math.floor(percentage)}% of your budget for category "${category.name}".`,
          });
        }
      }
    }

    return Response.json(transaction, { status: 201 });
  } catch (error) {
    console.error("[POST /api/transactions]", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
export const dynamic = "force-dynamic";
