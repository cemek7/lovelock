import Link from "next/link";
import type { Difficulty, PuzzleStatus } from "@/types";

interface PuzzleCardProps {
  puzzle: {
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
  };
}

function statusLabel(status: PuzzleStatus) {
  switch (status) {
    case "active":
      return { text: "Ready", className: "text-white/50" };
    case "opened":
      return { text: "Opened", className: "text-love-300/70" };
    case "completed":
      return { text: "Completed", className: "text-green-300/70" };
    case "expired":
      return { text: "Expired", className: "text-white/25" };
    default:
      return { text: status, className: "text-white/30" };
  }
}

export default function PuzzleCard({ puzzle }: PuzzleCardProps) {
  const label = statusLabel(puzzle.status);
  const createdAt = new Date(puzzle.created_at).toLocaleDateString("en-NG", { dateStyle: "medium" });

  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-white/5 bg-white/[0.03]">
        {puzzle.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={puzzle.thumbnail_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-lg text-white/15">
            ?
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm text-white/70">
            {puzzle.sender_name || "Puzzle"}
          </span>
          <span className={`shrink-0 text-xs ${label.className}`}>{label.text}</span>
        </div>
        <p className="text-xs text-white/20">{createdAt}</p>
      </div>

      <Link
        href={`/puzzle/${puzzle.token}`}
        className="shrink-0 text-xs text-white/30 transition hover:text-white/60"
      >
        Open
      </Link>
    </div>
  );
}
