"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";

import { useFlowStore } from "@/lib/store";

export function FlowCanvas() {
  const nodes = useFlowStore((state) => state.nodes);
  const edges = useFlowStore((state) => state.edges);
  const currentStep = useFlowStore((state) => state.currentStep);
  const speedMs = useFlowStore((state) => state.speedMs);
  const setCurrentStep = useFlowStore((state) => state.setCurrentStep);

  const displayNodes = useMemo(
    () =>
      nodes.map((node) => {
        const isActive = node.data.stepIndex === currentStep;
        return {
          ...node,
          draggable: false,
          selectable: false,
          className: "transition-all duration-200",
          style: {
            ...node.style,
            border: `1.25px solid ${isActive ? "#ff6b00" : "#1f1f1f"}`,
            boxShadow: isActive
              ? "0 0 0 2px rgba(255,107,0,0.3), 0 20px 40px rgba(0,0,0,0.5)"
              : "0 12px 30px rgba(0,0,0,0.35)",
            background: "#0f0f0f",
          },
          data: { ...node.data, active: isActive },
        };
      }),
    [nodes, currentStep],
  );

  const activeNode = displayNodes.find((node) => node.data.stepIndex === currentStep);
  const previousNode = displayNodes.find((node) => node.data.stepIndex === Math.max(currentStep - 1, 0));

  const isConditionPause = activeNode?.data.type === "condition";
  const isLoopCycle = activeNode?.data.type === "loop";
  const particleDuration = Math.max(speedMs / 1000, 0.3);

  return (
    <motion.div
      className="h-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--panel)] shadow-2xl"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.04 }}
    >
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3 text-sm font-medium text-[var(--foreground)]">
        <div className="flex items-center gap-2">
          <span className="tracking-tight">Flow Visualizer</span>
          <span className="text-xs text-zinc-400">ReactFlow</span>
        </div>
        <span className="rounded-full bg-[#1c1c1c] px-3 py-1 text-xs text-[var(--accent)]">
          Active: {activeNode?.data.label ?? ""}
        </span>
      </div>
      <div className="relative h-[600px] min-h-[420px]">
        <ReactFlow
          nodes={displayNodes}
          edges={edges}
          fitView
          className="bg-[#0d0d0d]"
          proOptions={{ hideAttribution: true }}
          zoomOnScroll
          panOnScroll
          onNodeClick={(_, node) => setCurrentStep(node.data.stepIndex)}
        >
          <Background gap={28} color="#1f1f1f" />
          <Controls className="!bg-[#0f0f0f] !border-[var(--border)] !text-[var(--foreground)]" />
        </ReactFlow>

        {activeNode && (
          <motion.div
            key={`particle-${currentStep}`}
            className="pointer-events-none absolute z-20 h-4 w-4 rounded-full"
            initial={{
              left: (previousNode?.position.x ?? activeNode.position.x) + 120,
              top: (previousNode?.position.y ?? activeNode.position.y) + 56,
              scale: 0.85,
              boxShadow: "0 0 0 0 rgba(255,107,0,0.45)",
            }}
            animate={{
              left: activeNode.position.x + 120,
              top: activeNode.position.y + 56,
              scale: isConditionPause ? [0.95, 1.15, 1] : 1,
              boxShadow: isLoopCycle
                ? [
                    "0 0 0 0 rgba(255,107,0,0.45)",
                    "0 0 0 12px rgba(255,107,0,0)",
                    "0 0 0 0 rgba(255,107,0,0.45)",
                  ]
                : "0 0 0 10px rgba(255,107,0,0)",
            }}
            transition={{
              left: { duration: particleDuration, ease: "easeInOut" },
              top: { duration: particleDuration, ease: "easeInOut" },
              scale: { duration: isConditionPause ? 0.45 : 0.2, ease: "easeInOut" },
              boxShadow: { duration: isLoopCycle ? 0.8 : 0.2, repeat: isLoopCycle ? Infinity : 0 },
            }}
            style={{
              background: "radial-gradient(circle at 30% 30%, #ffd09e 0%, #ff6b00 45%, #aa3e00 100%)",
            }}
          />
        )}
      </div>
    </motion.div>
  );
}
