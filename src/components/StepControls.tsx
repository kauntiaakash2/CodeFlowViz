"use client";

import { motion } from "framer-motion";
import { useFlowStore } from "@/lib/store";

export function StepControls() {
  const playing = useFlowStore((state) => state.playing);
  const play = useFlowStore((state) => state.play);
  const pause = useFlowStore((state) => state.pause);
  const reset = useFlowStore((state) => state.reset);
  const stepForward = useFlowStore((state) => state.stepForward);
  const currentStep = useFlowStore((state) => state.currentStep);
  const totalSteps = useFlowStore((state) => state.steps.length);

  const atEnd = currentStep >= Math.max(totalSteps - 1, 0);

  return (
    <motion.div
      className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-2xl"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.08 }}
    >
      <div className="flex items-center justify-between pb-3">
        <div>
          <p className="text-sm font-semibold text-[var(--foreground)]">Playback</p>
          <p className="text-xs text-zinc-400">
            Step {currentStep + 1} / {Math.max(totalSteps, 1)}
          </p>
        </div>
        <span className="rounded-full bg-[#1c1c1c] px-3 py-1 text-xs text-[var(--accent)]">Live</span>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <button
          type="button"
          className="rounded-xl border border-[var(--border)] bg-[#151515] px-3 py-2 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--accent)]"
          onClick={reset}
        >
          ⟲ Reset
        </button>
        <button
          type="button"
          className="col-span-2 rounded-xl border border-[var(--border)] bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-black transition hover:brightness-110"
          onClick={playing ? pause : play}
        >
          {playing ? "Pause" : "Play"}
        </button>
        <button
          type="button"
          className="rounded-xl border border-[var(--border)] bg-[#151515] px-3 py-2 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--accent)] disabled:opacity-50"
          onClick={stepForward}
          disabled={atEnd}
        >
          ↦ Step
        </button>
      </div>
    </motion.div>
  );
}
