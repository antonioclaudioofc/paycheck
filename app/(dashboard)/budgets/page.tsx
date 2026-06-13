import { auth } from "@/lib/auth";
import BudgetsClient from "./components/budgets-client";

export default async function BudgetsPage() {
  const session = await auth();

  return <BudgetsClient session={session} />;
}
