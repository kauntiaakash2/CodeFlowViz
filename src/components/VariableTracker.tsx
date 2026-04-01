"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

import { useFlowStore } from "@/lib/store";

export function VariableTracker() {
  const steps = useFlowStore((state) => state.steps);
  const currentStep = useFlowStore((state) => state.currentStep);

  const snapshot = useMemo(() => steps[currentStep]?.variables ?? {}, [steps, currentStep]);
  const entries = Object.entries(snapshot);

  return (
    <motion.div
      className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-2xl"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.12 }}
    >
      <div className="flex items-center justify-between pb-3">
        <div>
          <p className="text-sm font-semibold text-[var(--foreground)]">Variable Tracker</p>
          <p className="text-xs text-zinc-400">Live state per step</p>
        </div>
        <span className="rounded-full bg-[#1c1c1c] px-3 py-1 text-xs text-[var(--accent)]">
          {entries.length} vars
        </span>
      </div>
      <div className="space-y-2">
        {entries.length === 0 ? (
          <p className="text-xs text-zinc-500">No variables yet. Step through the flow.</p>
        ) : (
          entries.map(([key, value]) => (
            <div
              key={key}
              className="flex items-start justify-between rounded-xl border border-[var(--border)] bg-[#0f0f0f] px-3 py-2"
            >
              <span className="text-sm font-medium text-[var(--foreground)]">{key}</span>
              <code className="max-w-[60%] break-words text-xs text-[var(--accent)]">
                {JSON.stringify(value)}
              </code>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
