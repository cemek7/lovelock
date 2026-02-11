import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { verifyTransaction } from "@/lib/paystack";
import { sendPuzzleCreated } from "@/lib/email";

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get("reference");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

  if (!reference) {
    return NextResponse.redirect(`${appUrl}/create?error=no_reference`);
  }

  try {
    // Verify with Paystack
    const verification = await verifyTransaction(reference);

    if (verification.data.status !== "success") {
      return NextResponse.redirect(`${appUrl}/create?error=payment_failed`);
    }

    const supabase = createServerClient();
    const now = new Date().toISOString();

    // Record payment success (idempotent)
    const { data: refPuzzle } = await supabase
      .from("puzzles")
      .select("id")
      .eq("payment_reference", reference)
      .single();

    if (refPuzzle?.id) {
      const { error: paymentError } = await supabase
        .from("payments")
        .upsert(
          {
            puzzle_id: refPuzzle.id,
            reference,
            amount: verification.data.amount,
            status: "success",
            verified_at: now,
          },
          { onConflict: "reference" }
        );
      if (paymentError) {
        console.error("Callback payment upsert error:", paymentError);
      }
    }

    // Fallback activation if webhook hasn't fired yet (idempotent)
    const { data: puzzle } = await supabase
      .from("puzzles")
      .update({
        status: "active",
        paid_at: now,
      })
      .eq("payment_reference", reference)
      .eq("status", "pending_payment")
      .select("token, sender_email, reveal_at")
      .single();

    // If already activated by webhook, just fetch the token
    let token = puzzle?.token;
    let senderEmail = puzzle?.sender_email;
    let revealAt = puzzle?.reveal_at;

    if (!token) {
      const { data: existing } = await supabase
        .from("puzzles")
        .select("token, sender_email, reveal_at")
        .eq("payment_reference", reference)
        .single();

      token = existing?.token;
      senderEmail = existing?.sender_email;
      revealAt = existing?.reveal_at;
    }

    if (!token) {
      return NextResponse.redirect(`${appUrl}/create?error=puzzle_not_found`);
    }

    // Send confirmation email (non-blocking)
    if (senderEmail) {
      const shareUrl = `${appUrl}/puzzle/${token}`;
      const dashboardUrl = `${appUrl}/my-puzzles`;
      sendPuzzleCreated(senderEmail, shareUrl, dashboardUrl, revealAt).catch(
        (err) => console.error("Failed to send confirmation email:", err)
      );
    }

    return NextResponse.redirect(`${appUrl}/create/success?token=${token}`);
  } catch (error) {
    console.error("Payment callback error:", error);
    return NextResponse.redirect(`${appUrl}/create?error=verification_failed`);
  }
}
