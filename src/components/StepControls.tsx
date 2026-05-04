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
  const history = useFlowStore((state) => state.history);
  const executionPath = useFlowStore((state) => state.executionPath);
  const speedMs = useFlowStore((state) => state.speedMs);
  const setSpeedMs = useFlowStore((state) => state.setSpeedMs);
  const currentNode = useFlowStore((state) => state.steps[state.currentStep]?.label ?? "-");
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
      <div className="mt-4 space-y-3">
        <label className="block text-xs text-zinc-400">
          Speed ({Math.round(1000 / speedMs)}x)
          <input
            type="range"
            min={300}
            max={2000}
            step={100}
            value={speedMs}
            onChange={(e) => setSpeedMs(Number(e.target.value))}
            className="mt-2 w-full accent-[var(--accent)]"
          />
        </label>
        <div className="rounded-xl border border-[var(--border)] bg-[#151515] p-3 text-xs text-zinc-300">
          <p>
            <span className="text-zinc-400">Current node:</span> {currentNode}
          </p>
          <p>
            <span className="text-zinc-400">Execution path:</span> {executionPath.length} nodes
          </p>
          <p>
            <span className="text-zinc-400">Visited history:</span> {history.length} steps
          </p>
        </div>
      </div>
    </motion.div>
  );
}
