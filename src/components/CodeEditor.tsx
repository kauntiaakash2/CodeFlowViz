"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useFlowStore } from "@/lib/store";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export function CodeEditor() {
  const code = useFlowStore((state) => state.code);
  const setCode = useFlowStore((state) => state.setCode);
  const language = useFlowStore((state) => state.language);

  return (
    <motion.div
      className="h-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--panel)] shadow-2xl"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3 text-sm font-medium text-[var(--foreground)]">
        <span className="tracking-tight">Code Editor</span>
        <span className="rounded-full bg-[#1c1c1c] px-3 py-1 text-xs text-[var(--accent)]">
          Monaco
        </span>
      </div>
      <div className="h-[600px] min-h-[420px] w-full">
        <MonacoEditor
          height="100%"
          language={language === "cpp" ? "cpp" : "javascript"}
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value ?? "")}
          options={{
            fontSize: 13,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>
    </motion.div>
  );
}
