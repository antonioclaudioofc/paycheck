import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return Response.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const { role, permissions } = body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent revoking own admin access
    if (user.id === session.user.id && role && role !== "ADMIN") {
      return Response.json(
        { error: "You cannot revoke your own admin rights" },
        { status: 400 },
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (role) {
      if (role !== "ADMIN" && role !== "USER") {
        return Response.json({ error: "Invalid role value" }, { status: 400 });
      }
      updateData.role = role;
    }

    // Run transaction
    await prisma.$transaction(async (tx) => {
      // Update basic fields like role
      if (Object.keys(updateData).length > 0) {
        await tx.user.update({
          where: { id },
          data: updateData,
        });
      }

      // Update permissions if supplied
      if (permissions !== undefined && Array.isArray(permissions)) {
        // Clear all current permissions
        await tx.permission.deleteMany({
          where: { userId: id },
        });

        // Add new permissions
        if (permissions.length > 0) {
          await tx.permission.createMany({
            data: permissions.map((perm: string) => ({
              userId: id,
              name: perm,
            })),
          });
        }
      }
    });

    // Return the updated user
    const updatedUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        permissions: {
          select: {
            name: true,
          },
        },
      },
    });

    return Response.json(updatedUser);
  } catch (error) {
    console.error("[PATCH /api/admin/users/[id]]", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
