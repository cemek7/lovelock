import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      <nav className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-lg font-semibold text-white/80"
        >
          LoveLock
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/my-puzzles"
            className="text-sm text-white/40 transition hover:text-white/70"
          >
            My Puzzles
          </Link>
          <Link
            href="/create"
            className="text-sm text-white/70 transition hover:text-white"
          >
            Create
          </Link>
        </div>
      </nav>
      <Hero />
      <HowItWorks />
      <footer className="pb-12 pt-20 text-center text-xs tracking-wide text-white/20">
        LoveLock
      </footer>
    </main>
  );
}
