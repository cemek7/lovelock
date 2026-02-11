import { NextResponse } from "next/server";

// Magic links are now handled by Supabase Auth (signInWithOtp on the client).
// This route is kept as a no-op to avoid 404s from any lingering references.
export async function POST() {
  return NextResponse.json(
    { error: "Magic links are now handled via Supabase Auth. Use the dashboard form directly." },
    { status: 410 }
  );
}
