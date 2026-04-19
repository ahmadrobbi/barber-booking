"use client";

import { useEffect, useState } from "react";
import { getAllTransactions, UserTransaction, SUBSCRIPTION_PLANS, createSubscriptionTransaction } from "@/lib/transactions";
import { requireAdmin } from "@/lib/auth";

export default function SubscriptionsPage() {
  const [transactions, setTransactions] = useState<UserTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");

  useEffect(() => {
    const loadSubscriptions = async () => {
      try {
        await requireAdmin();
        const allTransactions = await getAllTransactions();
        const subscriptionTransactions = allTransactions.filter(t => t.type === "subscription");
        setTransactions(subscriptionTransactions);
      } catch (error) {
        console.error("Error loading subscriptions:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSubscriptions();
  }, []);

  const handleCreateSubscription = async () => {
    if (!selectedUserId || !selectedPlanId) return;

    try {
      const transaction = await createSubscriptionTransaction(selectedUserId, selectedPlanId);
      if (transaction) {
        setTransactions(prev => [transaction, ...prev]);
        setShowCreateForm(false);
        setSelectedUserId("");
        setSelectedPlanId("");
      }
    } catch (error) {
      console.error("Error creating subscription:", error);
    }
  };

  const subscriptionTotals = transactions.reduce(
    (totals, transaction) => {
      totals.total += transaction.amount;
      if (transaction.status === "completed" || transaction.status === "paid") {
        totals.active += transaction.amount;
      }
      if (transaction.status === "pending") {
        totals.pending += transaction.amount;
      }
      totals.counts[transaction.status] = (totals.counts[transaction.status] || 0) + 1;
      return totals;
    },
    {
      total: 0,
      active: 0,
      pending: 0,
      counts: {} as Record<string, number>,
    }
  );

  const formatCurrency = (amount: number, currency: string = "IDR") => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: currency === "IDR" ? "IDR" : "USD",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "paid":
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-stone-100 rounded-xl"></div>
          <div className="h-64 bg-stone-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-stone-950 px-6 py-8 text-white md:px-8">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-300/70">Subscription Management</p>
            <h1 className="mt-3 text-3xl font-semibold md:text-4xl">
              Langganan Pengguna
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
              Kelola langganan pengguna dan pantau pendapatan berulang.
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
          >
            Buat Langganan
          </button>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-white/10 p-5 border border-white/10">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-300">Total Pendapatan</p>
            <p className="mt-4 text-3xl font-semibold text-white">{formatCurrency(subscriptionTotals.total)}</p>
          </div>
          <div className="rounded-3xl bg-white/10 p-5 border border-white/10">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-300">Langganan Aktif</p>
            <p className="mt-4 text-3xl font-semibold text-white">{formatCurrency(subscriptionTotals.active)}</p>
            <p className="text-xs text-slate-400 mt-2">{subscriptionTotals.counts.completed || subscriptionTotals.counts.paid || 0} langganan</p>
          </div>
          <div className="rounded-3xl bg-white/10 p-5 border border-white/10">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-300">Pending</p>
            <p className="mt-4 text-3xl font-semibold text-white">{formatCurrency(subscriptionTotals.pending)}</p>
            <p className="text-xs text-slate-400 mt-2">{subscriptionTotals.counts.pending || 0} langganan</p>
          </div>
        </div>
      </section>

      {showCreateForm && (
        <section className="rounded-[2rem] bg-white p-6 shadow-xl md:p-8">
          <h2 className="text-xl font-semibold text-stone-900 mb-4">Buat Langganan Baru</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                User ID
              </label>
              <input
                type="text"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                placeholder="Masukkan User ID"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Paket Langganan
              </label>
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Pilih paket...</option>
                {SUBSCRIPTION_PLANS.map(plan => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} - {formatCurrency(plan.amount)}/{plan.interval === "monthly" ? "bulan" : "tahun"}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreateSubscription}
                disabled={!selectedUserId || !selectedPlanId}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-stone-400 text-white text-sm font-medium rounded-lg transition"
              >
                Buat Langganan
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-stone-600 hover:text-stone-800 border border-stone-300 rounded-lg hover:bg-stone-50 transition"
              >
                Batal
              </button>
            </div>
          </div>
        </section>
      )}

      <section className="rounded-[2rem] bg-white p-6 shadow-xl md:p-8">
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-stone-900 mb-2">Belum ada langganan</h3>
            <p className="text-stone-600">Langganan pengguna akan muncul di sini.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-stone-600">
                Menampilkan {transactions.length} langganan
              </p>
            </div>
            {transactions.map((transaction) => {
              const plan = SUBSCRIPTION_PLANS.find(p => p.id === transaction.metadata?.plan_id);
              return (
                <div key={transaction.id} className="flex items-center justify-between p-4 border border-stone-200 rounded-xl hover:bg-stone-50 transition">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-stone-900">
                        {plan?.name || "Langganan"} - {transaction.user_id}
                      </p>
                      <p className="text-sm text-stone-600">{transaction.description}</p>
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
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}