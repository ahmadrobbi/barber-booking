"use client";

import { UserTransaction } from "@/lib/transactions";

interface TransactionListProps {
  transactions: UserTransaction[];
  allTransactionsCount: number;
  onExportCSV: () => void;
}

export default function TransactionList({ transactions, allTransactionsCount, onExportCSV }: TransactionListProps) {
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

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-stone-900 mb-2">
          {allTransactionsCount === 0 ? "Belum ada transaksi" : "Tidak ada transaksi yang sesuai filter"}
        </h3>
        <p className="text-stone-600">
          {allTransactionsCount === 0
            ? "Transaksi Anda akan muncul di sini setelah ada aktivitas pembayaran."
            : "Coba ubah kriteria filter untuk melihat transaksi lainnya."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-stone-600">
          Menampilkan {transactions.length} dari {allTransactionsCount} transaksi
        </p>
        <button
          onClick={onExportCSV}
          disabled={transactions.length === 0}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-stone-400 rounded-lg transition"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </button>
      </div>
      {transactions.map((transaction) => (
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
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: transaction.currency === "IDR" ? "IDR" : "USD",
              }).format(transaction.amount)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}