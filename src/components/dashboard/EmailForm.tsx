"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase";

interface EmailFormProps {
  onSubmitted?: () => void;
}

export default function EmailForm({ onSubmitted }: EmailFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email.trim()) {
      setError("Enter your email to continue");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/my-puzzles`,
        },
      });

      if (authError) {
        throw new Error(authError.message);
      }

      setSuccess(true);
      onSubmitted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send magic link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white placeholder:text-white/20 focus:border-white/20 focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-love-400">{error}</p>}
      {success && (
        <p className="text-sm text-white/50">
          Check your email for a magic link.
        </p>
      )}

      <Button type="submit" loading={loading} disabled={loading}>
        Send Magic Link
      </Button>
    </form>
  );
}
