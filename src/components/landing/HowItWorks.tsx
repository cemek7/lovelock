"use client";

import { motion } from "framer-motion";
import { DIFFICULTY_CONFIG } from "@/types";
import { formatNaira } from "@/lib/utils";

const steps = [
  {
    number: "01",
    title: "Upload",
    description: "Choose a photo of you two.",
  },
  {
    number: "02",
    title: "Personalize",
    description: "Pick difficulty, write your message.",
  },
  {
    number: "03",
    title: "Share",
    description: "Send the link. They solve, you smile.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="px-6 py-24">
      <div className="mx-auto max-w-2xl">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-12 text-center text-xs tracking-widest uppercase text-white/25"
        >
          Three steps
        </motion.p>

        <div className="space-y-10">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-6"
            >
              <span className="font-[family-name:var(--font-display)] text-2xl font-bold text-white/10">
                {step.number}
              </span>
              <div>
                <h3 className="text-base font-medium text-white/80">
                  {step.title}
                </h3>
                <p className="mt-1 text-sm text-white/40">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <div className="mb-4 h-px w-full bg-white/5" />
          <div className="flex items-center justify-center gap-8 py-4">
            {(
              Object.entries(DIFFICULTY_CONFIG) as [
                string,
                (typeof DIFFICULTY_CONFIG.easy),
              ][]
            ).map(([, config]) => (
              <div key={config.label} className="text-center">
                <span className="text-sm font-medium text-white/60">
                  {config.label}
                </span>
                <span className="ml-2 text-sm text-white/25">
                  {formatNaira(config.priceKobo)}
                </span>
              </div>
            ))}
          </div>
          <div className="h-px w-full bg-white/5" />
        </motion.div>
      </div>
    </section>
  );
}
