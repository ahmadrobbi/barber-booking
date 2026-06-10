import { NextRequest, NextResponse } from "next/server";
import { updateTransactionStatus } from "@/lib/transactions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transaction_id, status, payment_provider, provider_reference, metadata } = body;

    // Validate required fields
    if (!transaction_id || !status) {
      return NextResponse.json(
        { error: "Missing required fields: transaction_id and status" },
        { status: 400 }
      );
    }

    // Update transaction status
    const success = await updateTransactionStatus(transaction_id, status, {
      payment_provider,
      provider_reference,
      metadata,
    });

    if (!success) {
      return NextResponse.json(
        { error: "Transaction not found or update failed" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Transaction status updated successfully"
    });

  } catch (error) {
    console.error("Payment webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Support GET for webhook verification (some providers require this)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode");

  if (mode === "verify") {
    // Return verification response for payment providers
    return NextResponse.json({
      status: "webhook_endpoint_active",
      timestamp: new Date().toISOString()
    });
  }

  return NextResponse.json({ message: "Payment webhook endpoint" });
}
