"use client";

import { useEffect, useState } from "react";
import { getAllTransactions, UserTransaction, exportTransactionsToCSV } from "@/lib/transactions";
import { requireAdmin } from "@/lib/auth";
import TransactionFilters from "@/components/transaction-filters";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<UserTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<UserTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        await requireAdmin();
        const allTransactions = await getAllTransactions();
        setTransactions(allTransactions);
        setFilteredTransactions(allTransactions);
      } catch (error) {
        console.error("Error loading transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

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

  if (loading) {
    return (
      <div className="space-y-6">
        <section className="rounded-[2rem] bg-stone-950 px-6 py-8 text-white md:px-8">
          <div className="animate-pulse">
            <div className="h-4 bg-white/20 rounded w-32 mb-3"></div>
            <div className="h-8 bg-white/20 rounded w-64 mb-3"></div>
            <div className="h-4 bg-white/20 rounded w-96 mb-8"></div>
            <div className="grid gap-4 md:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-3xl bg-white/10 p-5 border border-white/10">
                  <div className="h-4 bg-white/20 rounded w-20 mb-4"></div>
                  <div className="h-8 bg-white/20 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="rounded-[2rem] bg-white p-6 shadow-xl md:p-8">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-stone-100 rounded-xl"></div>
            ))}
          </div>
        </section>
      </div>
    );
  }

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

        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-stone-900 mb-2">
              {transactions.length === 0 ? "Belum ada transaksi" : "Tidak ada transaksi yang sesuai filter"}
            </h3>
            <p className="text-stone-600">
              {transactions.length === 0
                ? "Transaksi Anda akan muncul di sini setelah ada aktivitas pembayaran."
                : "Coba ubah kriteria filter untuk melihat transaksi lainnya."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-stone-600">
                Menampilkan {filteredTransactions.length} dari {transactions.length} transaksi
              </p>
              <button
                onClick={handleExportCSV}
                disabled={filteredTransactions.length === 0}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-stone-400 rounded-lg transition"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>
            </div>
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border border-stone-200 rounded-xl hover:bg-stone-50 transition">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center">
                    {transaction.type === "subscription" && (
                      <svg className="w-5 h-5 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    )}
                    {transaction.type === "payment" && (
                      <svg className="w-5 h-5 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    )}
                    {transaction.type === "refund" && (
                      <svg className="w-5 h-5 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-stone-900">{getTypeLabel(transaction.type)}</p>
                    <p className="text-sm text-stone-600">{transaction.description || "Transaksi"}</p>
                    <p className="text-xs text-stone-500">
                      {new Date(transaction.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </p>
                  <p className="text-lg font-semibold text-stone-900 mt-1">
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}