interface ProgressBarProps {
  value: number; // 0 - 100
}

export default function ProgressBar({ value }: ProgressBarProps) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between text-xs text-white/50">
        <span>Progress</span>
        <span>{safeValue.toFixed(0)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-love-500 to-royal-500 transition-all"
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}
