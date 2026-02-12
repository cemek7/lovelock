import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { verifyTransaction } from "@/lib/paystack";

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get("reference") || request.nextUrl.searchParams.get("trxref");

  if (!reference) {
    return NextResponse.json({ error: "No reference provided" }, { status: 400 });
  }

  try {
    const supabase = createServerClient();

    // Verify with Paystack
    const verification = await verifyTransaction(reference);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paystackData = verification.data as any;

    if (paystackData.status !== "success") {
      return NextResponse.json({ error: "Payment not successful" }, { status: 400 });
    }

    // Get token from Paystack metadata
    const metadataToken = paystackData.metadata?.puzzle_token as string | undefined;

    // Activate the puzzle (idempotent)
    const now = new Date().toISOString();

    await supabase
      .from("puzzles")
      .update({ status: "active", paid_at: now })
      .eq("payment_reference", reference)
      .eq("status", "pending_payment");

    // Record payment
    const puzzleId = paystackData.metadata?.puzzle_id as string | undefined;
    if (puzzleId) {
      await supabase
        .from("payments")
        .upsert(
          {
            puzzle_id: puzzleId,
            reference,
            amount: paystackData.amount,
            status: "success",
            verified_at: now,
          },
          { onConflict: "reference" }
        );
    }

    // Get the token — try metadata first, then DB
    let token = metadataToken;

    if (!token) {
      const { data: puzzle } = await supabase
        .from("puzzles")
        .select("token")
        .eq("payment_reference", reference)
        .single();
      token = puzzle?.token;
    }

    if (!token) {
      return NextResponse.json({ error: "Puzzle not found" }, { status: 404 });
    }

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Payment callback error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
