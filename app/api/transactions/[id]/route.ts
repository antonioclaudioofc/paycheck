import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sseManager } from "@/lib/sse-manager";
import { updateTransactionSchema } from "@/lib/validations";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
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
    });

    if (!transaction) {
      return Response.json({ error: "Transaction not found" }, { status: 404 });
    }

    return Response.json(transaction);
  } catch (error) {
    console.error("[GET /api/transactions/[id]]", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validated = updateTransactionSchema.safeParse(body);

    if (!validated.success) {
      return Response.json(
        { error: "Invalid data", details: validated.error.flatten() },
        { status: 400 },
      );
    }

    // Verify ownership and existence
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: session.user.id,
        active: true,
      },
    });

    if (!existingTransaction) {
      return Response.json({ error: "Transaction not found" }, { status: 404 });
    }

    if (validated.data.categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: validated.data.categoryId,
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
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: validated.data,
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

    sseManager.sendToUser(
      session.user.id,
      "transaction-updated",
      updatedTransaction,
    );

    return Response.json(updatedTransaction);
  } catch (error) {
    console.error("[PUT /api/transactions/[id]]", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: session.user.id,
        active: true,
      },
    });

    if (!existingTransaction) {
      return Response.json({ error: "Transaction not found" }, { status: 404 });
    }

    await prisma.transaction.update({
      where: { id },
      data: { active: false },
    });

    sseManager.sendToUser(session.user.id, "transaction-deleted", { id });

    return Response.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("[DELETE /api/transactions/[id]]", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
