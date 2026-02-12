import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { verifyTransaction } from "@/lib/paystack";

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get("reference") || request.nextUrl.searchParams.get("trxref");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

  if (!reference) {
    return NextResponse.redirect(`${appUrl}/create?error=no_reference`);
  }

  try {
    const supabase = createServerClient();

    // Always verify with Paystack to get the transaction details + metadata
    const verification = await verifyTransaction(reference);
    const paystackData = verification.data;

    if (paystackData.status !== "success") {
      return NextResponse.redirect(`${appUrl}/create?error=payment_failed`);
    }

    // Get token from Paystack metadata (most reliable source)
    const metadataToken = paystackData.metadata?.puzzle_token as string | undefined;

    // Try to activate the puzzle (idempotent — only updates if still pending)
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
      return NextResponse.redirect(`${appUrl}/create?error=puzzle_not_found`);
    }

    return NextResponse.redirect(`${appUrl}/create/success?token=${token}`);
  } catch (error) {
    console.error("Payment callback error:", error);
    return NextResponse.redirect(`${appUrl}/create?error=verification_failed`);
  }
}
