"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";

export default function Hero() {
  return (
    <section className="flex min-h-[75vh] flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-xl text-center"
      >
        <p className="mb-4 text-sm tracking-widest uppercase text-white/30">
          A puzzle for someone you love
        </p>

        <h1 className="mb-5 font-[family-name:var(--font-display)] text-4xl font-bold leading-tight text-white/90 sm:text-5xl">
          Turn your photo into
          <br />
          <span className="text-gradient">a love letter</span>
        </h1>

        <p className="mx-auto mb-10 max-w-md text-base leading-relaxed text-white/45">
          Upload a photo. Write a message. Your partner solves the puzzle
          to reveal both.
        </p>

        <Link href="/create">
          <Button className="px-8 py-3.5">Create a Puzzle</Button>
        </Link>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-16"
        >
          <Link
            href="#how-it-works"
            className="text-xs tracking-wide text-white/25 transition hover:text-white/50"
          >
            How it works
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
