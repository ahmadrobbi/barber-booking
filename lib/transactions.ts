import { createAdminSupabase } from "@/lib/supabase";

export type UserTransaction = {
  id: string;
  user_id?: string | null;
  type: string;
  amount: number;
  currency: string;
  status: string;
  payment_method?: string;
  description?: string;
  reference_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at?: string;
};

export type TransactionFilters = {
  status?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
};

export async function getAllTransactions(
  limit = 100
): Promise<UserTransaction[]> {
  const supabase = createAdminSupabase();

  let query = supabase
    .from("user_transactions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (filters) {
    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }
    if (filters.type && filters.type !== "all") {
      query = query.eq("type", filters.type);
    }
    if (filters.dateFrom) {
      query = query.gte("created_at", filters.dateFrom);
    }
    if (filters.dateTo) {
      query = query.lte("created_at", filters.dateTo);
    }
    if (filters.search) {
      query = query.or(`description.ilike.%${filters.search}%,reference_id.ilike.%${filters.search}%`);
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }

  return data || [];
}

export async function createTransaction(
  transaction: Omit<UserTransaction, "id" | "created_at" | "updated_at">
): Promise<UserTransaction | null> {
  const supabase = createAdminSupabase();

  const { data, error } = await supabase
    .from("user_transactions")
    .insert(transaction)
    .select("*")
    .single();

  if (error) {
    console.error("Error creating transaction:", error);
    return null;
  }

  return data;
}

export async function updateTransactionStatus(
  transactionId: string,
  status: string,
  additionalData?: {
    payment_provider?: string;
    provider_reference?: string;
    metadata?: Record<string, any>;
  }
): Promise<boolean> {
  const supabase = createAdminSupabase();

  const updateData: any = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (additionalData) {
    if (additionalData.payment_provider) {
      updateData.payment_method = additionalData.payment_provider;
    }
    if (additionalData.provider_reference) {
      updateData.reference_id = additionalData.provider_reference;
    }
    if (additionalData.metadata) {
      updateData.metadata = additionalData.metadata;
    }
  }

  const { error } = await supabase
    .from("user_transactions")
    .update(updateData)
    .eq("id", transactionId);

  if (error) {
    console.error("Error updating transaction status:", error);
    return false;
  }

  return true;
}

export type SubscriptionPlan = {
  id: string;
  name: string;
  amount: number;
  currency: string;
  interval: "monthly" | "yearly";
  features: string[];
};

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "basic",
    name: "Basic",
    amount: 50000, // IDR
    currency: "IDR",
    interval: "monthly",
    features: ["Up to 100 bookings/month", "Basic reporting", "Email support"]
  },
  {
    id: "pro",
    name: "Professional",
    amount: 150000, // IDR
    currency: "IDR",
    interval: "monthly",
    features: ["Unlimited bookings", "Advanced reporting", "Priority support", "Custom branding"]
  },
  {
    id: "enterprise",
    name: "Enterprise",
    amount: 500000, // IDR
    currency: "IDR",
    interval: "monthly",
    features: ["Everything in Pro", "API access", "White-label solution", "Dedicated support"]
  }
];

export async function createSubscriptionTransaction(
  userId: string,
  planId: string,
  paymentMethod?: string
): Promise<UserTransaction | null> {
  const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
  if (!plan) {
    console.error("Invalid subscription plan:", planId);
    return null;
  }

  const transaction = await createTransaction({
    user_id: userId,
    type: "subscription",
    amount: plan.amount,
    currency: plan.currency,
    status: "pending",
    payment_method: paymentMethod,
    description: `Subscription ${plan.name} - ${plan.interval}`,
    reference_id: `sub_${userId}_${Date.now()}`,
    metadata: {
      plan_id: planId,
      interval: plan.interval,
      features: plan.features
    }
  });

  return transaction;
}

export async function processRecurringSubscription(
  userId: string,
  planId: string
): Promise<UserTransaction | null> {
  // This would be called by a cron job or scheduled task
  // For now, we'll create a new subscription transaction
  return createSubscriptionTransaction(userId, planId);
}

export async function getUserActiveSubscription(userId: string): Promise<UserTransaction | null> {
  const supabase = createAdminSupabase();

  const { data, error } = await supabase
    .from("user_transactions")
    .select("*")
    .eq("user_id", userId)
    .eq("type", "subscription")
    .in("status", ["completed", "paid"])
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error("Error fetching user subscription:", error);
    return null;
  }

  return data?.[0] || null;
}

export async function exportTransactionsToCSV(filters?: TransactionFilters): Promise<string> {
  const transactions = await getAllTransactions(filters);

  if (transactions.length === 0) {
    return "";
  }

  // CSV header
  const headers = [
    "ID",
    "User ID",
    "Type",
    "Amount",
    "Currency",
    "Status",
    "Payment Method",
    "Description",
    "Reference ID",
    "Created At",
    "Updated At"
  ];

  // CSV rows
  const rows = transactions.map(transaction => [
    transaction.id,
    transaction.user_id,
    transaction.type,
    transaction.amount.toString(),
    transaction.currency,
    transaction.status,
    transaction.payment_method || "",
    transaction.description || "",
    transaction.reference_id || "",
    transaction.created_at,
    transaction.updated_at
  ]);

  // Combine headers and rows
  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(","))
    .join("\n");

  return csvContent;
}
