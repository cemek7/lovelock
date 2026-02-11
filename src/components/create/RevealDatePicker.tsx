"use client";

interface RevealDatePickerProps {
  enabled: boolean;
  value: string;
  onToggle: (enabled: boolean) => void;
  onChange: (value: string) => void;
}

export default function RevealDatePicker({
  enabled,
  value,
  onToggle,
  onChange,
}: RevealDatePickerProps) {
  const now = new Date();
  const min = now.toISOString().slice(0, 16);
  const max = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onToggle(!enabled)}
          className={`relative h-5 w-9 rounded-full transition-colors ${
            enabled ? "bg-white/30" : "bg-white/10"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
              enabled ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </button>
        <label className="text-sm text-white/50">
          Set a reveal date
        </label>
      </div>

      {enabled && (
        <div>
          <p className="mb-2 text-xs text-white/25">
            Your partner won&apos;t be able to open the puzzle until this date.
          </p>
          <input
            type="datetime-local"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            min={min}
            max={max}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white focus:border-white/20 focus:outline-none [color-scheme:dark]"
          />
        </div>
      )}
    </div>
  );
}
