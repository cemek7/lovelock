"use client";

import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";

interface PuzzleCompleteProps {
  imageUrl: string;
  senderName: string;
  message: string;
  onClose?: () => void;
}

export default function PuzzleComplete({
  imageUrl,
  senderName,
  message,
  onClose,
}: PuzzleCompleteProps) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 px-4 py-8">
      <div className="flex min-h-full items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-lg"
        >
          <Card className="relative text-center">
            {onClose && (
              <button
                onClick={onClose}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/60 transition-colors hover:bg-white/20 hover:text-white"
                aria-label="Close"
              >
                ✕
              </button>
            )}

            <div className="mb-3 text-4xl">🎉</div>
            <h2 className="mb-2 font-[family-name:var(--font-display)] text-2xl font-bold text-gradient">
              You did it!
            </h2>
            <p className="mb-4 text-sm text-white/60">
              A special message from {senderName}
            </p>

            <div className="mb-4 overflow-hidden rounded-xl border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Revealed"
                className="w-full object-cover"
              />
            </div>

            <div className="mb-6 rounded-xl bg-love-500/10 border border-love-500/20 p-4">
              <p className="mb-1 text-xs font-medium text-love-300 uppercase tracking-wide">
                {senderName}&apos;s message
              </p>
              <p className="text-base text-white/90 leading-relaxed">
                {message.trim() ? message : "No message, just love. ❤️"}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/create">
                <Button>Make Your Own</Button>
              </Link>
              {onClose && (
                <Button variant="ghost" onClick={onClose}>
                  Close
                </Button>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
