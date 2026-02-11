import { Metadata } from "next";
import { createServerClient } from "@/lib/supabase-server";
import PuzzlePageClient from "@/components/puzzle/PuzzlePageClient";
import PuzzleLocked from "@/components/puzzle/PuzzleLocked";
import Link from "next/link";
import type { Puzzle } from "@/types";

interface Props {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  return {
    title: `Solve the Love Puzzle — LoveLock`,
    description: "Someone special created a love puzzle just for you. Solve it to reveal their message.",
    openGraph: {
      title: "Someone made you a Love Puzzle!",
      description: "Solve the puzzle to reveal a special photo and love message.",
      url: `/puzzle/${token}`,
    },
  };
}

export default async function PuzzlePage({ params }: Props) {
  const { token } = await params;
  const supabase = createServerClient();

  const { data: puzzle, error } = await supabase
    .from("puzzles")
    .select("*")
    .eq("token", token)
    .single<Puzzle>();

  if (error || !puzzle) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="text-center">
          <h1 className="mb-2 font-[family-name:var(--font-display)] text-2xl font-bold text-white/80">
            Puzzle not found
          </h1>
          <p className="mb-6 text-sm text-white/35">
            This puzzle may have been removed or the link is incorrect.
          </p>
          <Link href="/" className="text-sm text-white/40 transition hover:text-white/70">
            Go home
          </Link>
        </div>
      </main>
    );
  }

  if (puzzle.status === "pending_payment") {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="text-center">
          <h1 className="mb-2 font-[family-name:var(--font-display)] text-2xl font-bold text-white/80">
            Not ready yet
          </h1>
          <p className="text-sm text-white/35">
            The creator hasn&apos;t completed payment for this puzzle.
          </p>
        </div>
      </main>
    );
  }

  if (puzzle.status === "expired") {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="text-center">
          <h1 className="mb-2 font-[family-name:var(--font-display)] text-2xl font-bold text-white/80">
            Time&apos;s up
          </h1>
          <p className="text-sm text-white/35">
            This puzzle has expired. The 24-hour window has passed.
          </p>
        </div>
      </main>
    );
  }

  // Check reveal date
  if (
    puzzle.reveal_at &&
    new Date(puzzle.reveal_at) > new Date() &&
    puzzle.status === "active" &&
    !puzzle.first_opened_at
  ) {
    return (
      <PuzzleLocked
        revealAt={puzzle.reveal_at}
        senderName={puzzle.sender_name}
      />
    );
  }

  const { data: signedUrlData } = await supabase.storage
    .from("puzzle-images")
    .createSignedUrl(puzzle.image_url, 3600);

  if (!signedUrlData?.signedUrl) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <p className="text-sm text-white/35">Failed to load puzzle image.</p>
      </main>
    );
  }

  return (
    <PuzzlePageClient
      token={puzzle.token}
      gridSize={puzzle.grid_size}
      tileOrder={puzzle.tile_order}
      imageUrl={signedUrlData.signedUrl}
      message={puzzle.message}
      senderName={puzzle.sender_name}
      status={puzzle.status}
      expiresAt={puzzle.expires_at}
      completedAt={puzzle.completed_at}
    />
  );
}
