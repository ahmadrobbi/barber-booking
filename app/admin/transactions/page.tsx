import { getUserTransactions } from "@/lib/user";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  await requireAdmin();

  const transactions = await getUserTransactions();

  const formatCurrency = (amount: number, currency: string = "IDR") => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: currency === "IDR" ? "IDR" : "USD",
    }).format(amount);
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
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-xl md:p-8">
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-stone-900 mb-2">Belum ada transaksi</h3>
            <p className="text-stone-600">Transaksi Anda akan muncul di sini setelah ada aktivitas pembayaran.</p>
          </div>
        ) : (
          <div className="space-y-4">
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