import { getAllTransactions } from "@/lib/transactions";
import { requireAdmin } from "@/lib/auth";
import TransactionDashboard from "./client";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  await requireAdmin();

  const transactions = await getAllTransactions();

  return <TransactionDashboard initialTransactions={transactions} />;
}