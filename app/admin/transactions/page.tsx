import { getAllTransactions } from "@/lib/transactions";
import { requireAdmin } from "@/lib/auth";
import TransactionFilters from "@/components/transaction-filters";
import TransactionList from "@/components/transaction-list";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  await requireAdmin();

  const transactions = await getAllTransactions();

  return <TransactionDashboard initialTransactions={transactions} />;
}

  const handleFiltersChange = (filters: {
    status: string;
    type: string;
    dateFrom: string;
    dateTo: string;
    search: string;
  }) => {
    let filtered = transactions;

    if (filters.status !== "all") {
      filtered = filtered.filter(t => t.status === filters.status);
    }

    if (filters.type !== "all") {
      filtered = filtered.filter(t => t.type === filters.type);
    }

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(t => new Date(t.created_at) >= fromDate);
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(t => new Date(t.created_at) <= toDate);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(t =>
        (t.description?.toLowerCase().includes(searchLower)) ||
        (t.reference_id?.toLowerCase().includes(searchLower))
      );
    }

  const handleExportCSV = () => {
    const csvContent = exportTransactionsToCSV(filteredTransactions);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `transaksi_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-emerald-700 bg-emerald-100";
      case "pending":
        return "text-amber-700 bg-amber-100";
      case "failed":
        return "text-red-700 bg-red-100";
      case "cancelled":
        return "text-stone-700 bg-stone-100";
      default:
        return "text-stone-700 bg-stone-100";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "subscription":
        return "Langganan";
      case "payment":
        return "Pembayaran";
      case "refund":
        return "Pengembalian";
      case "commission":
        return "Komisi";
      default:
        return type;
    }
  };

import { getAllTransactions } from "@/lib/transactions";
import { requireAdmin } from "@/lib/auth";
import TransactionFilters from "@/components/transaction-filters";
import TransactionList from "@/components/transaction-list";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  await requireAdmin();

  const transactions = await getAllTransactions();

  return <TransactionDashboard initialTransactions={transactions} />;
}

"use client";

import { useState } from "react";
import { UserTransaction, exportTransactionsToCSV } from "@/lib/transactions";
import TransactionFilters from "@/components/transaction-filters";
import TransactionList from "@/components/transaction-list";

interface TransactionDashboardProps {
  initialTransactions: UserTransaction[];
}

function TransactionDashboard({ initialTransactions }: TransactionDashboardProps) {
  const [filteredTransactions, setFilteredTransactions] = useState<UserTransaction[]>(initialTransactions);

  const handleFiltersChange = (filters: {
    status: string;
    type: string;
    dateFrom: string;
    dateTo: string;
    search: string;
  }) => {
    let filtered = initialTransactions;

    if (filters.status !== "all") {
      filtered = filtered.filter(t => t.status === filters.status);
    }

    if (filters.type !== "all") {
      filtered = filtered.filter(t => t.type === filters.type);
    }

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(t => new Date(t.created_at) >= fromDate);
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(t => new Date(t.created_at) <= toDate);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(t =>
        (t.description?.toLowerCase().includes(searchLower)) ||
        (t.reference_id?.toLowerCase().includes(searchLower))
      );
    }

    setFilteredTransactions(filtered);
  };

  const handleExportCSV = () => {
    const csvContent = exportTransactionsToCSV(filteredTransactions);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `transaksi_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const transactionTotals = filteredTransactions.reduce(
    (totals, transaction) => {
      totals.total += transaction.amount;
      if (transaction.status === "paid" || transaction.status === "completed") {
        totals.completed += transaction.amount;
      }
      if (transaction.status === "pending") {
        totals.pending += transaction.amount;
      }
      if (transaction.status === "failed") {
        totals.failed += transaction.amount;
      }
      if (transaction.status === "refund") {
        totals.refunded += transaction.amount;
      }
      totals.counts[transaction.status] = (totals.counts[transaction.status] || 0) + 1;
      return totals;
    },
    {
      total: 0,
      completed: 0,
      pending: 0,
      failed: 0,
      refunded: 0,
      counts: {} as Record<string, number>,
    }
  );

  const formatCurrency = (amount: number, currency: string = "IDR") => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: currency === "IDR" ? "IDR" : "USD",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-stone-950 px-6 py-8 text-white md:px-8">
        <p className="text-xs uppercase tracking-[0.3em] text-amber-300/70">Financial Records</p>
        <h1 className="mt-3 text-3xl font-semibold md:text-4xl">
          Riwayat Transaksi
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
          Pantau semua transaksi pembayaran, langganan, dan komisi yang terkait dengan akun Anda.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl bg-white/10 p-5 border border-white/10">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-300">Total Semua</p>
            <p className="mt-4 text-3xl font-semibold text-white">{formatCurrency(transactionTotals.total)}</p>
          </div>
          <div className="rounded-3xl bg-white/10 p-5 border border-white/10">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-300">Sukses</p>
            <p className="mt-4 text-3xl font-semibold text-white">{formatCurrency(transactionTotals.completed)}</p>
            <p className="text-xs text-slate-400 mt-2">{transactionTotals.counts.completed || 0} transaksi</p>
          </div>
          <div className="rounded-3xl bg-white/10 p-5 border border-white/10">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-300">Pending</p>
            <p className="mt-4 text-3xl font-semibold text-white">{formatCurrency(transactionTotals.pending)}</p>
            <p className="text-xs text-slate-400 mt-2">{transactionTotals.counts.pending || 0} transaksi</p>
          </div>
          <div className="rounded-3xl bg-white/10 p-5 border border-white/10">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-300">Refund</p>
            <p className="mt-4 text-3xl font-semibold text-white">{formatCurrency(transactionTotals.refunded)}</p>
            <p className="text-xs text-slate-400 mt-2">{transactionTotals.counts.refund || 0} transaksi</p>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-xl md:p-8">
        <TransactionFilters onFiltersChange={handleFiltersChange} />

        <TransactionList
          transactions={filteredTransactions}
          allTransactionsCount={initialTransactions.length}
          onExportCSV={handleExportCSV}
        />
      </section>
    </div>
  );
}