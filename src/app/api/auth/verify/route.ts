import { NextRequest, NextResponse } from "next/server";

// Verification is now handled by /api/auth/callback via Supabase Auth.
// This route redirects old magic links to the dashboard.
export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return NextResponse.redirect(`${appUrl}/my-puzzles?error=expired_link`);
}
