import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { verifyTransaction } from "@/lib/paystack";

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get("reference");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

  if (!reference) {
    return NextResponse.redirect(`${appUrl}/create?error=no_reference`);
  }

  try {
    const supabase = createServerClient();

    // First check if webhook already activated this puzzle
    const { data: existing } = await supabase
      .from("puzzles")
      .select("token, sender_email, reveal_at, status")
      .eq("payment_reference", reference)
      .single();

    if (existing?.token && existing.status !== "pending_payment") {
      // Already activated by webhook — just redirect to success
      return NextResponse.redirect(`${appUrl}/create/success?token=${existing.token}`);
    }

    // Webhook hasn't fired yet — verify with Paystack ourselves
    const verification = await verifyTransaction(reference);

    if (verification.data.status !== "success") {
      return NextResponse.redirect(`${appUrl}/create?error=payment_failed`);
    }

    const now = new Date().toISOString();

    // Record payment
    if (existing) {
      const { data: puzzleRow } = await supabase
        .from("puzzles")
        .select("id")
        .eq("payment_reference", reference)
        .single();

      if (puzzleRow?.id) {
        await supabase
          .from("payments")
          .upsert(
            {
              puzzle_id: puzzleRow.id,
              reference,
              amount: verification.data.amount,
              status: "success",
              verified_at: now,
            },
            { onConflict: "reference" }
          );
      }
    }

    // Activate puzzle
    const { data: puzzle } = await supabase
      .from("puzzles")
      .update({
        status: "active",
        paid_at: now,
      })
      .eq("payment_reference", reference)
      .eq("status", "pending_payment")
      .select("token")
      .single();

    const token = puzzle?.token || existing?.token;

    if (!token) {
      return NextResponse.redirect(`${appUrl}/create?error=puzzle_not_found`);
    }

    return NextResponse.redirect(`${appUrl}/create/success?token=${token}`);
  } catch (error) {
    console.error("Payment callback error:", error);
    return NextResponse.redirect(`${appUrl}/create?error=verification_failed`);
  }
}
