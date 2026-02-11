import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { verifyWebhookSignature } from "@/lib/paystack";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    if (!signature || !verifyWebhookSignature(body, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);

    if (event.event !== "charge.success") {
      return NextResponse.json({ received: true });
    }

    const { reference } = event.data;
    if (!reference) {
      return NextResponse.json({ error: "No reference" }, { status: 400 });
    }

    const supabase = createServerClient();
    const now = new Date().toISOString();

    // Resolve puzzle id for payment record
    let puzzleId: string | null = event.data?.metadata?.puzzle_id || null;
    if (!puzzleId) {
      const { data: puzzle } = await supabase
        .from("puzzles")
        .select("id")
        .eq("payment_reference", reference)
        .single();
      puzzleId = puzzle?.id || null;
    }

    if (puzzleId) {
      const { error: paymentError } = await supabase
        .from("payments")
        .upsert(
          {
            puzzle_id: puzzleId,
            reference,
            amount: event.data?.amount || 0,
            status: "success",
            verified_at: now,
          },
          { onConflict: "reference" }
        );

      if (paymentError) {
        console.error("Webhook payment upsert error:", paymentError);
      }
    }

    // Idempotent activation — only update if still pending_payment
    const { error } = await supabase
      .from("puzzles")
      .update({
        status: "active",
        paid_at: now,
      })
      .eq("payment_reference", reference)
      .eq("status", "pending_payment");

    if (error) {
      console.error("Webhook activation error:", error);
      return NextResponse.json({ error: "Activation failed" }, { status: 500 });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
