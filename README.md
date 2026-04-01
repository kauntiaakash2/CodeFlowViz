# CodeFlow Visualizer

Interactive, production-style playground to parse code into execution steps, auto-layout a flow graph, and step through state. Ships with JavaScript/TypeScript (Babel) and lightweight C++ support.

## Stack
- Next.js 14 (App Router) + TypeScript + Tailwind
- React Flow for graphing, dagre for layout
- Monaco Editor for code editing
- Zustand for state, Framer Motion for motion
- Babel parser for JS/TS, regex-based lightweight parser for C++

## Features
- Three-panel layout: Monaco editor, React Flow visualizer, controls + variable tracker
- Step engine: play/pause, step, reset; highlights active node
- Variable tracker: snapshots per step
- Dark theme (bg #0a0a0a, accent #FF6B00)
- Language toggle (JS/TS or C++) with sample code per language

## Quickstart
```bash
npm install
npm run dev
# app at http://localhost:3000
```

## Scripts
- `npm run dev` — start dev server (Turbopack)
- `npm run lint` — lint
- `npm run build` — production build

## Usage
1) Paste or edit code in the editor.
2) Choose language (JS/TS or C++).
3) Play/step/reset to walk the flow; the active node glows orange.
4) Watch live variables in the tracker.

## Notes on parsing
- JS/TS: parsed via Babel AST; expressions are evaluated best-effort for simple literals/ops.
- C++: minimal regex-based extraction for demo (declarations, assignments, if/for/while/return, calls). For real C++ coverage, swap to tree-sitter-cpp or clang-based parsing and map to `FlowStep`.

## Architecture (high level)
- State: `src/lib/store.ts` (Zustand) — code, language, steps/nodes/edges, playback
- Parsing/layout: `src/lib/ast.ts` — build steps, dagre layout, JS/TS + C++ paths
- UI: `src/app/page.tsx` wires panels
	- Editor: `src/components/CodeEditor.tsx`
	- Flow: `src/components/FlowCanvas.tsx`
	- Controls: `src/components/StepControls.tsx`
	- Variables: `src/components/VariableTracker.tsx`

## Known warnings
- Next.js may warn about multiple lockfiles; set `turbopack.root` or keep a single lockfile.
- React Flow may warn about recreating nodeTypes/edgeTypes; current usage is acceptable for this setup, but memoizing a custom node map would silence it.

## Deploy
Push to GitHub, then deploy on Vercel (auto-detects Next.js). Ensure environment uses Node 18+.
