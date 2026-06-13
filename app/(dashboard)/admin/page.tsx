import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AdminClient from "./components/admin-client";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return <AdminClient />;
}
