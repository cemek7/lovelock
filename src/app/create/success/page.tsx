"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";

function SuccessContent() {
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get("token");
  const reference = searchParams.get("reference") || searchParams.get("trxref");

  const [token, setToken] = useState<string | null>(tokenParam);
  const [copied, setCopied] = useState(false);

  // If we have a reference, verify payment in background to activate the puzzle
  useEffect(() => {
    if (!reference) return;

    // Fire-and-forget: activate the puzzle via our callback endpoint
    fetch(`/api/payment/callback?reference=${encodeURIComponent(reference)}`)
      .then((res) => res.json())
      .then((data) => {
        // If we didn't have a token yet, use the one from verification
        if (!tokenParam && data.token) {
          setToken(data.token);
        }
      })
      .catch(() => {
        // Webhook will handle activation as backup
      });
  }, [reference, tokenParam]);

  const appUrl = typeof window !== "undefined" ? window.location.origin : "";
  const puzzleUrl = token ? `${appUrl}/puzzle/${token}` : "";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(puzzleUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!token) {
    return (
      <div className="text-center">
        <div className="mb-4 inline-block h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
        <p className="text-sm text-white/40">Confirming your payment...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto w-full max-w-md text-center"
    >
      <p className="mb-3 text-xs tracking-widest uppercase text-white/25">
        Payment confirmed
      </p>

      <h1 className="mb-3 font-[family-name:var(--font-display)] text-3xl font-bold text-white/90">
        Your puzzle is live
      </h1>

      <p className="mb-8 text-sm text-white/40">
        Share this link with your partner.
      </p>

      <div className="mb-3 flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-3">
        <input
          type="text"
          readOnly
          value={puzzleUrl}
          className="flex-1 bg-transparent text-sm text-white/60 outline-none"
        />
        <Button
          variant="secondary"
          onClick={handleCopy}
          className="shrink-0 px-4 py-2 text-sm"
        >
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>

      <p className="mb-10 text-xs text-white/20">
        Send this link to your partner to start the puzzle.
      </p>

      <div className="flex items-center justify-center gap-6">
        <Link href="/my-puzzles" className="text-sm text-white/40 transition hover:text-white/70">
          My Puzzles
        </Link>
        <Link href="/create">
          <Button>Create Another</Button>
        </Link>
      </div>
    </motion.div>
  );
}

export default function SuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <Suspense fallback={<div className="text-white/30">Loading...</div>}>
        <SuccessContent />
      </Suspense>
    </main>
  );
}
