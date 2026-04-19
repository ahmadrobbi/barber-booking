"use client";

import { UserTransaction, SUBSCRIPTION_PLANS } from "@/lib/transactions";

interface SubscriptionListProps {
  transactions: UserTransaction[];
}

export default function SubscriptionList({ transactions }: SubscriptionListProps) {
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

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-stone-900 mb-2">Belum ada langganan</h3>
        <p className="text-stone-600">Langganan pengguna akan muncul di sini.</p>
      </div>
    );
  }

  return (
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
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: transaction.currency === "IDR" ? "IDR" : "USD",
                }).format(transaction.amount)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}