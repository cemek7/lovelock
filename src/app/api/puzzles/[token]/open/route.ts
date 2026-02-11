import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import type { Puzzle } from "@/types";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const supabase = createServerClient();

    const { data: puzzle, error: fetchError } = await supabase
      .from("puzzles")
      .select("*")
      .eq("token", token)
      .single<Puzzle>();

    if (fetchError || !puzzle) {
      return NextResponse.json({ error: "Puzzle not found" }, { status: 404 });
    }

    // Already opened — return existing expiry (idempotent)
    if (puzzle.first_opened_at) {
      return NextResponse.json({ expires_at: puzzle.expires_at });
    }

    // Must be active to open
    if (puzzle.status !== "active") {
      return NextResponse.json(
        { error: "Puzzle is not available", status: puzzle.status },
        { status: 400 }
      );
    }

    // Check reveal date gate
    if (puzzle.reveal_at && new Date(puzzle.reveal_at) > new Date()) {
      return NextResponse.json(
        { error: "Puzzle is not yet available", reveal_at: puzzle.reveal_at },
        { status: 403 }
      );
    }

    // Record first open, start 24h countdown
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const { error: updateError } = await supabase
      .from("puzzles")
      .update({
        first_opened_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        status: "opened",
      })
      .eq("id", puzzle.id)
      .eq("status", "active"); // Idempotent guard

    if (updateError) {
      console.error("Open puzzle error:", updateError);
      return NextResponse.json({ error: "Failed to open puzzle" }, { status: 500 });
    }

    return NextResponse.json({ expires_at: expiresAt.toISOString() });
  } catch (error) {
    console.error("Open puzzle error:", error);
    return NextResponse.json({ error: "Failed to open puzzle" }, { status: 500 });
  }
}
