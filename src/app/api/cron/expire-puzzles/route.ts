import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("puzzles")
      .update({ status: "expired" })
      .eq("status", "opened")
      .lt("expires_at", new Date().toISOString())
      .select("id");

    if (error) {
      console.error("Expire puzzles error:", error);
      return NextResponse.json({ error: "Failed to expire puzzles" }, { status: 500 });
    }

    return NextResponse.json({
      expired: data?.length || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cron error:", error);
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
  }
}
