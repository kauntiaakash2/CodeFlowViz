"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

import { CodeEditor } from "@/components/CodeEditor";
import { FlowCanvas } from "@/components/FlowCanvas";
import { StepControls } from "@/components/StepControls";
import { VariableTracker } from "@/components/VariableTracker";
import { useFlowStore } from "@/lib/store";

export default function Home() {
  const code = useFlowStore((state) => state.code);
  const refreshFlow = useFlowStore((state) => state.refreshFlow);
  const playing = useFlowStore((state) => state.playing);
  const stepForward = useFlowStore((state) => state.stepForward);
  const pause = useFlowStore((state) => state.pause);
  const currentStep = useFlowStore((state) => state.currentStep);
  const totalSteps = useFlowStore((state) => state.steps.length);
  const language = useFlowStore((state) => state.language);
  const setLanguage = useFlowStore((state) => state.setLanguage);

  useEffect(() => {
    refreshFlow();
  }, [refreshFlow]);

  useEffect(() => {
    const id = setTimeout(() => refreshFlow(), 320);
    return () => clearTimeout(id);
  }, [code, refreshFlow]);

  useEffect(() => {
    if (!playing) return undefined;
    const id = setInterval(() => {
      stepForward();
    }, 900);
    return () => clearInterval(id);
  }, [playing, stepForward]);

  useEffect(() => {
    if (playing && currentStep >= totalSteps - 1) {
      pause();
    }
  }, [playing, currentStep, totalSteps, pause]);

  return (
    <main className="relative min-h-screen bg-[var(--background)] px-4 py-6 text-[var(--foreground)] sm:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(255,107,0,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,107,0,0.12),transparent_30%),radial-gradient(circle_at_50%_70%,rgba(255,107,0,0.06),transparent_28%)]" />

      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="flex flex-col gap-2">
          <motion.h1
            className="text-3xl font-semibold tracking-tight text-white sm:text-4xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            CodeFlow Visualizer
          </motion.h1>
          <motion.p
            className="max-w-3xl text-sm text-zinc-400 sm:text-base"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            Parse JavaScript to AST, translate into execution steps, and explore
            live flow with synced variables. Toggle JS/CPP to switch parser.
          </motion.p>
          <div className="mt-2 flex w-fit overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--panel)] text-xs font-medium text-[var(--foreground)]">
            {["javascript", "cpp"].map((lang) => (
              <button
                key={lang}
                type="button"
                className={`px-3 py-2 transition ${
                  language === lang ? "bg-[var(--accent)] text-black" : "hover:bg-[#151515]"
                }`}
                onClick={() => setLanguage(lang as "javascript" | "cpp")}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 xl:gap-6">
          <div className="lg:col-span-1">
            <CodeEditor />
          </div>
          <div className="lg:col-span-1">
            <FlowCanvas />
          </div>
          <div className="flex flex-col gap-4 lg:col-span-1">
            <StepControls />
            <VariableTracker />
          </div>
        </div>
      </div>
    </main>
  );
}
