import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import type { Puzzle, PuzzlePublic } from "@/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const supabase = createServerClient();

    const { data: puzzle, error } = await supabase
      .from("puzzles")
      .select("*")
      .eq("token", token)
      .single<Puzzle>();

    if (error || !puzzle) {
      return NextResponse.json({ error: "Puzzle not found" }, { status: 404 });
    }

    if (puzzle.status === "pending_payment") {
      return NextResponse.json({ error: "Puzzle payment pending" }, { status: 402 });
    }

    // Check if expired on read
    if (
      puzzle.status === "opened" &&
      puzzle.expires_at &&
      new Date(puzzle.expires_at) < new Date()
    ) {
      await supabase
        .from("puzzles")
        .update({ status: "expired" })
        .eq("id", puzzle.id)
        .eq("status", "opened");
      puzzle.status = "expired";
    }

    // Generate signed URL for the image (1 hour)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("puzzle-images")
      .createSignedUrl(puzzle.image_url, 3600);

    if (signedUrlError || !signedUrlData) {
      return NextResponse.json({ error: "Failed to load image" }, { status: 500 });
    }

    const publicData: PuzzlePublic = {
      token: puzzle.token,
      difficulty: puzzle.difficulty,
      grid_size: puzzle.grid_size,
      message: puzzle.message,
      sender_name: puzzle.sender_name,
      tile_order: puzzle.tile_order,
      status: puzzle.status,
      image_url: signedUrlData.signedUrl,
      reveal_at: puzzle.reveal_at,
      first_opened_at: puzzle.first_opened_at,
      expires_at: puzzle.expires_at,
      completed_at: puzzle.completed_at,
    };

    return NextResponse.json(publicData);
  } catch (error) {
    console.error("Fetch puzzle error:", error);
    return NextResponse.json({ error: "Failed to fetch puzzle" }, { status: 500 });
  }
}

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const supabase = createServerClient();

    const { error } = await supabase
      .from("puzzles")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("token", token)
      .eq("status", "opened");

    if (error) {
      console.error("Complete puzzle error:", error);
      return NextResponse.json({ error: "Failed to complete puzzle" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Complete puzzle error:", error);
    return NextResponse.json({ error: "Failed to complete puzzle" }, { status: 500 });
  }
}
