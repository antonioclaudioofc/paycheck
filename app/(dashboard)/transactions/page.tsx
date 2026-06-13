import { auth } from "@/lib/auth";
import TransactionsClient from "./components/transactions-client";

export default async function TransactionsPage() {
  const session = await auth();

  return <TransactionsClient session={session} />;
}
