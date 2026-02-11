import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { createAuthClient } from "@/lib/supabase-auth";

export async function GET(_request: NextRequest) {
  try {
    // Get authenticated user from Supabase Auth session
    const authClient = await createAuthClient();
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser();

    if (authError || !user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const email = user.email;
    const supabase = createServerClient();

    const { data: puzzles, error } = await supabase
      .from("puzzles")
      .select(
        "id, token, image_url, difficulty, grid_size, sender_name, status, reveal_at, first_opened_at, expires_at, completed_at, created_at"
      )
      .eq("sender_email", email)
      .neq("status", "pending_payment")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch puzzles error:", error);
      return NextResponse.json({ error: "Failed to fetch puzzles" }, { status: 500 });
    }

    // Generate signed thumbnail URLs
    const puzzlesWithUrls = await Promise.all(
      (puzzles || []).map(async (puzzle) => {
        const { data } = await supabase.storage
          .from("puzzle-images")
          .createSignedUrl(puzzle.image_url, 3600);

        return {
          ...puzzle,
          thumbnail_url: data?.signedUrl || null,
        };
      })
    );

    return NextResponse.json({ puzzles: puzzlesWithUrls, email });
  } catch (error) {
    console.error("Fetch puzzles error:", error);
    return NextResponse.json({ error: "Failed to fetch puzzles" }, { status: 500 });
  }
}
