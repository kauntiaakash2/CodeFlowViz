"use client";

import { Edge, Node } from "reactflow";
import { create } from "zustand";
import { buildFlow, FlowNodeData, FlowStep, type Language } from "./ast";

const defaultCode = `function analyze(numbers) {
  let total = 0;
  for (let n of numbers) {
    total = total + n;
  }
  const average = total / numbers.length;
  if (average > 5) {
    return average;
  }
  return total;
}

const result = analyze([1, 4, 6, 8]);`;

const defaultCpp = `#include <vector>
using namespace std;

int sum(vector<int> nums) {
  int total = 0;
  for (int n : nums) {
    total = total + n;
  }
  if (total > 10) {
    return total;
  }
  return total - 1;
}

int result = sum({2, 4, 5});`;

interface FlowState {
  code: string;
  language: Language;
  steps: FlowStep[];
  nodes: Node<FlowNodeData>[];
  edges: Edge[];
  currentStep: number;
  history: number[];
  executionPath: string[];
  speedMs: number;
  playing: boolean;
  setCode: (code: string) => void;
  setLanguage: (language: Language) => void;
  refreshFlow: () => void;
  play: () => void;
  pause: () => void;
  reset: () => void;
  stepForward: () => void;
  setCurrentStep: (step: number) => void;
  setSpeedMs: (speedMs: number) => void;
}

export const useFlowStore = create<FlowState>((set, get) => ({
  code: defaultCode,
  language: "javascript",
  steps: [],
  nodes: [],
  edges: [],
  currentStep: 0,
  history: [0],
  executionPath: [],
  speedMs: 900,
  playing: false,
  setCode: (code) => set({ code }),
  setLanguage: (language) => {
    set({
      language,
      code: language === "cpp" ? defaultCpp : defaultCode,
      currentStep: 0,
      history: [0],
      executionPath: [],
      playing: false,
    });
    const { steps, nodes, edges } = buildFlow(
      language === "cpp" ? defaultCpp : defaultCode,
      language,
    );
    set({ steps, nodes, edges, executionPath: steps.map((step) => step.id) });
  },
  refreshFlow: () => {
    const { code, language } = get();
    const { steps, nodes, edges } = buildFlow(code, language);
    set({
      steps,
      nodes,
      edges,
      currentStep: 0,
      history: [0],
      executionPath: steps.map((step) => step.id),
      playing: false,
    });
  },
  play: () => set({ playing: true }),
  pause: () => set({ playing: false }),
  reset: () => set({ currentStep: 0, history: [0], playing: false }),
  stepForward: () => {
    const { currentStep, steps, history } = get();
    const nextStep = currentStep + 1;
    if (nextStep < steps.length) {
      set({ currentStep: nextStep, history: [...history, nextStep] });
    } else {
      set({ playing: false });
    }
  },
  setCurrentStep: (step) => {
    const boundedStep = Math.max(step, 0);
    set((state) => ({ currentStep: boundedStep, history: [...state.history, boundedStep] }));
  },
  setSpeedMs: (speedMs) => set({ speedMs }),
}));
