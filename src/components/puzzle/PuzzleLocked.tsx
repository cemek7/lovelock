"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface PuzzleLockedProps {
  revealAt: string;
  senderName: string;
}

function getTimeRemaining(target: Date) {
  const now = new Date();
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
}

export default function PuzzleLocked({ revealAt, senderName }: PuzzleLockedProps) {
  const target = new Date(revealAt);
  const [remaining, setRemaining] = useState(getTimeRemaining(target));

  useEffect(() => {
    const interval = setInterval(() => {
      const r = getTimeRemaining(target);
      setRemaining(r);
      if (!r) {
        clearInterval(interval);
        window.location.reload();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [target]);

  const units = remaining
    ? [
        { label: "days", value: remaining.days },
        { label: "hrs", value: remaining.hours },
        { label: "min", value: remaining.minutes },
        { label: "sec", value: remaining.seconds },
      ]
    : [];

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-sm text-center"
      >
        <p className="mb-4 text-xs tracking-widest uppercase text-white/25">
          Puzzle locked
        </p>

        <h1 className="mb-3 font-[family-name:var(--font-display)] text-2xl font-bold text-white/90">
          A surprise awaits
        </h1>

        <p className="mb-8 text-sm text-white/40">
          <span className="text-white/60">{senderName}</span> created a puzzle for you.
          It unlocks on{" "}
          <span className="text-white/60">
            {target.toLocaleString(undefined, {
              dateStyle: "long",
              timeStyle: "short",
            })}
          </span>
        </p>

        {remaining && (
          <div className="mb-8 flex items-center justify-center gap-6">
            {units.map((unit) => (
              <div key={unit.label} className="text-center">
                <div className="font-[family-name:var(--font-display)] text-3xl font-bold text-white/80">
                  {String(unit.value).padStart(2, "0")}
                </div>
                <div className="mt-1 text-xs text-white/25">{unit.label}</div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-white/20">
          Come back when it&apos;s time — you&apos;ll have 24 hours to solve it.
        </p>
      </motion.div>
    </main>
  );
}
