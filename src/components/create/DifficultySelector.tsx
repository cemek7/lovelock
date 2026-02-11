"use client";

import { Difficulty, DIFFICULTY_CONFIG } from "@/types";
import { formatNaira } from "@/lib/utils";

interface DifficultySelectorProps {
  selected: Difficulty;
  onChange: (d: Difficulty) => void;
}

export default function DifficultySelector({ selected, onChange }: DifficultySelectorProps) {
  const difficulties: Difficulty[] = ["easy", "medium", "hard"];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {difficulties.map((d) => {
        const config = DIFFICULTY_CONFIG[d];
        const isSelected = selected === d;

        return (
          <button
            key={d}
            type="button"
            onClick={() => onChange(d)}
            className={`rounded-xl p-4 text-left transition-all ${
              isSelected
                ? "border border-white/20 bg-white/[0.06]"
                : "border border-white/5 bg-white/[0.02] hover:border-white/10"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white/80">{config.label}</span>
              <span className="text-xs text-white/35">
                {formatNaira(config.priceKobo)}
              </span>
            </div>
            <p className="mt-1 text-xs text-white/30">{config.description}</p>
          </button>
        );
      })}
    </div>
  );
}
