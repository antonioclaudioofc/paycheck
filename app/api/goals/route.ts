import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sseManager } from "@/lib/sse-manager";
import { createGoalSchema } from "@/lib/validations";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const goals = await prisma.goal.findMany({
      where: {
        userId: session.user.id,
        active: true,
      },
      orderBy: { deadline: "asc" },
    });

    return Response.json(goals);
  } catch (error) {
    console.error("[GET /api/goals]", error);
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
    const validated = createGoalSchema.safeParse(body);

    if (!validated.success) {
      return Response.json(
        { error: "Invalid data", details: validated.error.flatten() },
        { status: 400 },
      );
    }

    const goalData = validated.data;

    const goal = await prisma.goal.create({
      data: {
        userId: session.user.id,
        title: goalData.title,
        targetAmount: goalData.targetAmount,
        savedAmount: goalData.savedAmount,
        deadline: goalData.deadline || null,
        status: goalData.status,
      },
    });

    sseManager.sendToUser(session.user.id, "goal-created", goal);
    return Response.json(goal, { status: 201 });
  } catch (error) {
    console.error("[POST /api/goals]", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
export const dynamic = "force-dynamic";
