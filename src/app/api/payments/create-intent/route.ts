import { NextRequest, NextResponse } from "next/server";
import { createPaymentIntent } from "@/server-actions/payments/create-payment-intent";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, contractId, amount, currency, description } = body;

    if (!amount || (!bookingId && !contractId)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await createPaymentIntent({
      bookingId,
      contractId,
      amount,
      currency,
      description,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to create payment intent" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      clientSecret: result.clientSecret,
      paymentId: result.paymentId,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}

