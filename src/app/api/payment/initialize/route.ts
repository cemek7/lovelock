import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { createServerClient } from "@/lib/supabase-server";
import { initializeTransaction } from "@/lib/paystack";

export async function POST(request: NextRequest) {
  try {
    const { puzzle_id, email } = await request.json();

    if (!puzzle_id || !email) {
      return NextResponse.json({ error: "Missing puzzle_id or email" }, { status: 400 });
    }

    const supabase = createServerClient();

    // Fetch the puzzle to get the amount
    const { data: puzzle, error: fetchError } = await supabase
      .from("puzzles")
      .select("id, payment_amount, status, token")
      .eq("id", puzzle_id)
      .eq("status", "pending_payment")
      .single();

    if (fetchError || !puzzle) {
      return NextResponse.json({ error: "Puzzle not found or already paid" }, { status: 404 });
    }

    const reference = `ll_${nanoid(16)}`;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

    // Store reference on puzzle
    const { error: updateError } = await supabase
      .from("puzzles")
      .update({ payment_reference: reference })
      .eq("id", puzzle.id);

    if (updateError) {
      console.error("Update reference error:", updateError);
      return NextResponse.json({ error: "Failed to initialize payment" }, { status: 500 });
    }

    // Create payment record (pending)
    const { error: paymentError } = await supabase.from("payments").insert({
      puzzle_id: puzzle.id,
      reference,
      amount: puzzle.payment_amount,
      status: "pending",
    });

    if (paymentError) {
      console.error("Create payment error:", paymentError);
      return NextResponse.json({ error: "Failed to initialize payment" }, { status: 500 });
    }

    // Initialize Paystack transaction (no callback_url — popup handles redirect)
    const result = await initializeTransaction({
      email,
      amount: puzzle.payment_amount,
      reference,
      metadata: {
        puzzle_id: puzzle.id,
        puzzle_token: puzzle.token,
      },
    });

    return NextResponse.json({
      authorization_url: result.data.authorization_url,
      access_code: result.data.access_code,
      reference: result.data.reference,
      puzzle_token: puzzle.token,
    });
  } catch (error) {
    console.error("Payment init error:", error);
    return NextResponse.json({ error: "Failed to initialize payment" }, { status: 500 });
  }
}
