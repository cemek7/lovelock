import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-white/80">
        Page not found
      </h1>
      <p className="max-w-sm text-sm text-white/35">
        This page doesn&apos;t exist. The puzzle may have expired or the link is incorrect.
      </p>
      <Link
        href="/"
        className="mt-2 text-sm text-white/40 transition hover:text-white/70"
      >
        Go home
      </Link>
    </div>
  );
}
