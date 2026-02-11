import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function PuzzleLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <LoadingSpinner size="lg" />
      <p className="text-sm text-white/40">Loading your love puzzle...</p>
    </div>
  );
}
