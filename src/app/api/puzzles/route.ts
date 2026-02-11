import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { createServerClient } from "@/lib/supabase-server";
import { generateShuffledOrder, getGridSize, getPrice } from "@/lib/puzzle";
import { sanitizeText, checkRateLimit } from "@/lib/utils";
import { Difficulty, DIFFICULTY_CONFIG } from "@/types";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(`create:${ip}`, 10, 60000)) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { image_path, difficulty, message, sender_name, sender_email, reveal_at } = body;

    // Validate required fields
    if (!image_path || !difficulty || !sender_name || !sender_email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!DIFFICULTY_CONFIG[difficulty as Difficulty]) {
      return NextResponse.json({ error: "Invalid difficulty" }, { status: 400 });
    }

    if (message && message.length > 500) {
      return NextResponse.json({ error: "Message must be 500 characters or less" }, { status: 400 });
    }

    if (sender_name.length > 100) {
      return NextResponse.json({ error: "Name must be 100 characters or less" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sender_email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // Validate reveal_at if provided
    if (reveal_at) {
      const revealDate = new Date(reveal_at);
      if (isNaN(revealDate.getTime())) {
        return NextResponse.json({ error: "Invalid reveal date" }, { status: 400 });
      }
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + 30);
      if (revealDate > maxDate) {
        return NextResponse.json({ error: "Reveal date must be within 30 days" }, { status: 400 });
      }
    }

    const gridSize = getGridSize(difficulty as Difficulty);
    const totalTiles = gridSize * gridSize;
    const tileOrder = generateShuffledOrder(totalTiles);
    const token = nanoid(12);
    const amount = getPrice(difficulty as Difficulty);

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("puzzles")
      .insert({
        token,
        image_url: image_path,
        difficulty,
        grid_size: gridSize,
        message: sanitizeText(message || ""),
        sender_name: sanitizeText(sender_name),
        sender_email: sender_email.trim().toLowerCase(),
        tile_order: tileOrder,
        status: "pending_payment",
        payment_amount: amount,
        reveal_at: reveal_at || null,
      })
      .select("id, token")
      .single();

    if (error) {
      console.error("Create puzzle error:", error);
      return NextResponse.json({ error: "Failed to create puzzle" }, { status: 500 });
    }

    return NextResponse.json({
      puzzle_id: data.id,
      token: data.token,
      amount,
    });
  } catch (error) {
    console.error("Create puzzle error:", error);
    return NextResponse.json({ error: "Failed to create puzzle" }, { status: 500 });
  }
}
