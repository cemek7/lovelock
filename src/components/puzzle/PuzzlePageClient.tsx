"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import Link from "next/link";
import PuzzleBoard from "@/components/puzzle/PuzzleBoard";
import ProgressBar from "@/components/puzzle/ProgressBar";
import PuzzleComplete from "@/components/puzzle/PuzzleComplete";
import Button from "@/components/ui/Button";
import { countCorrectTiles, isPuzzleSolved } from "@/lib/puzzle";
import type { PuzzleStatus } from "@/types";

interface PuzzlePageClientProps {
  token: string;
  gridSize: number;
  tileOrder: number[];
  imageUrl: string;
  message: string;
  senderName: string;
  status: PuzzleStatus;
  expiresAt: string | null;
  completedAt: string | null;
}

function formatCountdown(targetIso: string) {
  const diff = new Date(targetIso).getTime() - Date.now();
  if (diff <= 0) return null;
  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;
}

export default function PuzzlePageClient({
  token,
  gridSize,
  tileOrder: initialOrder,
  imageUrl,
  message,
  senderName,
  status: initialStatus,
  expiresAt,
  completedAt,
}: PuzzlePageClientProps) {
  const [tileOrder, setTileOrder] = useState<number[]>(initialOrder);
  const [puzzleStatus, setPuzzleStatus] = useState<PuzzleStatus>(initialStatus);
  const [expiresAtState, setExpiresAtState] = useState<string | null>(expiresAt ?? null);
  const [timeLeft, setTimeLeft] = useState<string | null>(
    expiresAt ? formatCountdown(expiresAt) : null
  );
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [showComplete, setShowComplete] = useState(initialStatus === "completed");

  const openedRef = useRef(false);
  const completedRef = useRef(initialStatus === "completed");

  const totalTiles = gridSize * gridSize;
  const correctCount = useMemo(() => countCorrectTiles(tileOrder), [tileOrder]);
  const progress = (correctCount / totalTiles) * 100;

  useEffect(() => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => setImage(img);
    img.onerror = () => setError("Failed to load puzzle image.");
  }, [imageUrl]);

  useEffect(() => {
    if (puzzleStatus !== "active" || openedRef.current) return;
    openedRef.current = true;

    fetch(`/api/puzzles/${token}/open`, { method: "POST" })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || "Failed to open puzzle");
        }
        return res.json();
      })
      .then((data: { expires_at?: string }) => {
        setPuzzleStatus("opened");
        if (data.expires_at) {
          setExpiresAtState(data.expires_at);
          setTimeLeft(formatCountdown(data.expires_at));
        }
      })
      .catch((err) => {
        openedRef.current = false;
        setError(err instanceof Error ? err.message : "Failed to open puzzle");
      });
  }, [puzzleStatus, token]);

  useEffect(() => {
    if (!expiresAtState || puzzleStatus === "completed" || puzzleStatus === "expired") return;
    const interval = setInterval(() => {
      const next = formatCountdown(expiresAtState);
      setTimeLeft(next);
      if (!next) {
        setPuzzleStatus("expired");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAtState, puzzleStatus]);

  useEffect(() => {
    if (puzzleStatus === "completed" || puzzleStatus === "expired") return;
    if (!isPuzzleSolved(tileOrder)) return;
    if (completedRef.current) return;

    completedRef.current = true;
    setPuzzleStatus("completed");
    setShowComplete(true);

    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });

    fetch(`/api/puzzles/${token}`, { method: "PATCH" }).catch(() => null);
  }, [tileOrder, puzzleStatus, token]);

  const disabled = puzzleStatus === "expired" || puzzleStatus === "completed";

  if (puzzleStatus === "expired") {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="text-center">
          <h1 className="mb-2 font-[family-name:var(--font-display)] text-2xl font-bold text-white/80">
            Time&apos;s up
          </h1>
          <p className="mb-6 text-sm text-white/35">
            The 24-hour window to solve this puzzle has passed.
          </p>
          <Link href="/" className="text-sm text-white/40 transition hover:text-white/70">
            Go home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-6" style={{ overscrollBehavior: "none" }}>
      <nav className="mx-auto mb-6 flex w-full max-w-5xl items-center justify-between">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-lg font-semibold text-white/80"
        >
          LoveLock
        </Link>
        {timeLeft && (
          <span className="text-xs text-white/30">
            {timeLeft} remaining
          </span>
        )}
      </nav>

      <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-white/90">
              Solve the puzzle
            </h1>
            <p className="mt-1 text-sm text-white/35">From {senderName}</p>
          </div>

          {error && <p className="text-sm text-love-400">{error}</p>}

          <PuzzleBoard
            gridSize={gridSize}
            tileOrder={tileOrder}
            image={image}
            disabled={disabled}
            onSwap={(fromIndex, toIndex) => {
              setTileOrder((prev) => {
                const next = [...prev];
                const temp = next[fromIndex];
                next[fromIndex] = next[toIndex];
                next[toIndex] = temp;
                return next;
              });
            }}
          />
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-sm text-white/50">
              {correctCount} of {totalTiles} tiles correct
            </p>
            <div className="mt-2">
              <ProgressBar value={progress} />
            </div>
          </div>

          <div className="h-px w-full bg-white/5" />

          <p className="text-xs text-white/25">
            Swap any two tiles by dragging. The puzzle completes when all tiles are in place.
          </p>

          {completedAt && (
            <p className="text-xs text-white/20">
              Completed {new Date(completedAt).toLocaleString("en-NG")}
            </p>
          )}
        </div>
      </div>

      {showComplete && (
        <PuzzleComplete
          imageUrl={imageUrl}
          senderName={senderName}
          message={message}
          onClose={() => setShowComplete(false)}
        />
      )}
    </main>
  );
}
