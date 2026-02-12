"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import ImageUploader from "@/components/create/ImageUploader";
import DifficultySelector from "@/components/create/DifficultySelector";
import MessageInput from "@/components/create/MessageInput";
import RevealDatePicker from "@/components/create/RevealDatePicker";
import Button from "@/components/ui/Button";
import { Difficulty, DIFFICULTY_CONFIG } from "@/types";
import { formatNaira } from "@/lib/utils";

export default function CreatePage() {
  const [step, setStep] = useState(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [message, setMessage] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [revealEnabled, setRevealEnabled] = useState(false);
  const [revealDate, setRevealDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelected = (file: File, preview: string) => {
    setImageFile(file);
    setImagePreview(preview);
  };

  const handleSubmit = async () => {
    if (!imageFile || !senderName.trim() || !senderEmail.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", imageFile);

      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) {
        const data = await uploadRes.json();
        throw new Error(data.error || "Upload failed");
      }
      const { image_path } = await uploadRes.json();

      const createRes = await fetch("/api/puzzles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_path,
          difficulty,
          message,
          sender_name: senderName,
          sender_email: senderEmail,
          reveal_at: revealEnabled && revealDate ? new Date(revealDate).toISOString() : undefined,
        }),
      });
      if (!createRes.ok) {
        const data = await createRes.json();
        throw new Error(data.error || "Failed to create puzzle");
      }
      const { puzzle_id } = await createRes.json();

      const payRes = await fetch("/api/payment/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ puzzle_id, email: senderEmail }),
      });
      if (!payRes.ok) {
        const data = await payRes.json();
        throw new Error(data.error || "Payment initialization failed");
      }
      const { authorization_url } = await payRes.json();

      window.location.href = authorization_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  const canProceedStep1 = !!imageFile;
  const canProceedStep2 = !!senderName.trim();
  const canSubmit = !!senderEmail.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderEmail);

  return (
    <main className="min-h-screen px-6 py-8">
      <nav className="mx-auto mb-12 flex max-w-lg items-center justify-between">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-lg font-semibold text-white/80"
        >
          LoveLock
        </Link>
        <span className="text-xs tracking-wide text-white/25">
          Step {step} of 3
        </span>
      </nav>

      <div className="mx-auto max-w-lg">
        {/* Progress bar */}
        <div className="mb-10 h-0.5 w-full bg-white/5">
          <motion.div
            className="h-full bg-gradient-to-r from-love-500 to-royal-500"
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-white/90">
                  Choose your photo
                </h2>
                <p className="mt-1 text-sm text-white/40">
                  This becomes the puzzle your partner solves.
                </p>
              </div>

              <ImageUploader
                onImageSelected={handleImageSelected}
                preview={imagePreview}
              />

              <div className="flex justify-end">
                <Button onClick={() => setStep(2)} disabled={!canProceedStep1}>
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-white/90">
                  Personalize
                </h2>
                <p className="mt-1 text-sm text-white/40">
                  Difficulty, message, and timing.
                </p>
              </div>

              <div className="space-y-6">
                <DifficultySelector selected={difficulty} onChange={setDifficulty} />

                <div className="h-px w-full bg-white/5" />

                <MessageInput
                  message={message}
                  senderName={senderName}
                  onMessageChange={setMessage}
                  onNameChange={setSenderName}
                />

                <div className="h-px w-full bg-white/5" />

                <RevealDatePicker
                  enabled={revealEnabled}
                  value={revealDate}
                  onToggle={setRevealEnabled}
                  onChange={setRevealDate}
                />
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="text-sm text-white/30 transition hover:text-white/60"
                >
                  Back
                </button>
                <Button onClick={() => setStep(3)} disabled={!canProceedStep2}>
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-white/90">
                  Checkout
                </h2>
                <p className="mt-1 text-sm text-white/40">
                  Review and pay to activate your puzzle.
                </p>
              </div>

              {/* Summary */}
              <div className="space-y-3 rounded-xl border border-white/5 bg-white/[0.02] p-5">
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Difficulty</span>
                  <span className="text-white/70">
                    {DIFFICULTY_CONFIG[difficulty].label}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Pieces</span>
                  <span className="text-white/70">
                    {DIFFICULTY_CONFIG[difficulty].description}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">From</span>
                  <span className="text-white/70">{senderName}</span>
                </div>
                {revealEnabled && revealDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Unlocks</span>
                    <span className="text-white/70">
                      {new Date(revealDate).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="h-px w-full bg-white/5" />
                <div className="flex justify-between">
                  <span className="text-sm text-white/50">Total</span>
                  <span className="text-base font-semibold text-white/90">
                    {formatNaira(DIFFICULTY_CONFIG[difficulty].priceKobo)}
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-white/50">
                  Your email
                </label>
                <input
                  type="text"
                  inputMode="email"
                  autoComplete="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white placeholder:text-white/20 focus:border-white/20 focus:outline-none"
                />
                <p className="mt-1.5 text-xs text-white/20">
                  For payment receipt and puzzle link delivery.
                </p>
              </div>

              {error && (
                <p className="text-sm text-love-400">{error}</p>
              )}

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="text-sm text-white/30 transition hover:text-white/60"
                >
                  Back
                </button>
                <Button
                  onClick={handleSubmit}
                  loading={loading}
                  disabled={!canSubmit}
                >
                  Pay {formatNaira(DIFFICULTY_CONFIG[difficulty].priceKobo)}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
