"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import EmailForm from "@/components/dashboard/EmailForm";
import PuzzleCard from "@/components/dashboard/PuzzleCard";
import { createClient } from "@/lib/supabase";
import type { Difficulty, PuzzleStatus } from "@/types";

interface PuzzleListItem {
  id: string;
  token: string;
  thumbnail_url: string | null;
  difficulty: Difficulty;
  grid_size: number;
  sender_name: string;
  status: PuzzleStatus;
  reveal_at: string | null;
  first_opened_at: string | null;
  expires_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export default function MyPuzzlesPage() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  const [loading, setLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [puzzles, setPuzzles] = useState<PuzzleListItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const errorMessage = useMemo(() => {
    if (!errorParam) return null;
    switch (errorParam) {
      case "invalid_link":
        return "That magic link is invalid.";
      case "expired_link":
        return "That magic link has expired. Request a new one.";
      case "verification_failed":
        return "Verification failed. Try again.";
      default:
        return "Something went wrong.";
    }
  }, [errorParam]);

  const loadPuzzles = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/puzzles/mine");
      if (res.status === 401) {
        setAuthRequired(true);
        setLoading(false);
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to load puzzles");
      }
      const data = await res.json();
      setPuzzles(data.puzzles || []);
      setEmail(data.email || null);
      setAuthRequired(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load puzzles");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setEmail(null);
    setPuzzles([]);
    setAuthRequired(true);
  };

  useEffect(() => {
    loadPuzzles();
  }, []);

  return (
    <main className="min-h-screen px-6 py-8">
      <nav className="mx-auto mb-12 flex max-w-3xl items-center justify-between">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-lg font-semibold text-white/80"
        >
          LoveLock
        </Link>
        <Link href="/create" className="text-sm text-white/40 transition hover:text-white/70">
          Create
        </Link>
      </nav>

      <div className="mx-auto max-w-3xl">
        <h1 className="mb-1 font-[family-name:var(--font-display)] text-2xl font-bold text-white/90">
          My Puzzles
        </h1>
        <p className="mb-8 text-sm text-white/30">
          Track the puzzles you&apos;ve created.
        </p>

        {errorMessage && (
          <div className="mb-6 rounded-xl border border-love-500/20 bg-love-500/5 px-4 py-3 text-sm text-love-300/80">
            {errorMessage}
          </div>
        )}

        {loading && (
          <p className="text-sm text-white/30">Loading...</p>
        )}

        {!loading && authRequired && (
          <div className="max-w-sm">
            <p className="mb-5 text-sm text-white/40">
              Enter the email you used to create your puzzles. We&apos;ll send a magic link.
            </p>
            <EmailForm onSubmitted={() => null} />
          </div>
        )}

        {!loading && !authRequired && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              {email && (
                <span className="text-xs text-white/25">{email}</span>
              )}
              <div className="flex gap-4">
                <button
                  onClick={loadPuzzles}
                  className="text-xs text-white/30 transition hover:text-white/60"
                >
                  Refresh
                </button>
                <button
                  onClick={handleSignOut}
                  className="text-xs text-white/20 transition hover:text-white/50"
                >
                  Sign out
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-love-400">{error}</p>}

            {puzzles.length === 0 ? (
              <div className="py-12 text-center">
                <p className="mb-4 text-sm text-white/30">No puzzles yet.</p>
                <Link href="/create">
                  <Button>Create Your First</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {puzzles.map((puzzle) => (
                  <PuzzleCard key={puzzle.id} puzzle={puzzle} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
