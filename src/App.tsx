"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  CirclePlay,
  Gauge,
  Play,
  Search,
  TerminalSquare,
  Workflow,
} from "lucide-react";
import { useMemo, useState } from "react";

type Screen = "explorer" | "debugger" | "performance";

const navItems: { key: Screen; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "explorer", label: "Explorer", icon: Workflow },
  { key: "debugger", label: "Debugger", icon: TerminalSquare },
  { key: "performance", label: "Performance", icon: Gauge },
];

const lineNumbers = Array.from({ length: 15 }, (_, i) => i + 1);

export default function App() {
  const [screen, setScreen] = useState<Screen>("explorer");
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("function orchestrateFlow() {\n  const payload = fetchPayload();\n  return payload.map(transform);\n}");

  const history = useMemo(
    () => [
      { id: "AuthPipeline.ts", status: "success", summary: "Executed in 81ms" },
      { id: "RetryEngine.py", status: "error", summary: "2 runtime exceptions" },
      { id: "QueueBalancer.js", status: "success", summary: "Executed in 56ms" },
    ],
    [],
  );

  return (
    <main className="h-screen flex flex-col bg-black overflow-hidden text-[var(--color-foreground)] font-ui">
      <header className="h-16 shrink-0 border-b border-[#424934] px-6 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="font-heading text-xl tracking-wide text-[var(--color-primary-fixed)]">CodeFlowViz</div>
          <nav className="flex items-center gap-4">
            {navItems.map((item) => (
              <button key={item.key} onClick={() => setScreen(item.key)} className={`px-3 py-1.5 rounded-md transition-transform hover:scale-105 active:scale-95 ${screen === item.key ? "text-[var(--color-primary-fixed)]" : "text-[#c2caae]"}`}>
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <label className="h-9 w-72 bg-[var(--color-surface-low)] border border-[#2d2d2d] rounded-md px-3 flex items-center gap-2">
            <Search className="h-4 w-4 text-[#6f7562]" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search flows..." className="flex-1 bg-transparent outline-none text-sm text-[#c2caae]" />
          </label>
          <button className="px-4 h-9 rounded-md bg-[var(--color-primary-fixed)] text-black text-sm font-semibold transition-transform hover:scale-105 active:scale-95">Deploy</button>
        </div>
      </header>

      <section className="flex-1 min-h-0 flex">
        <aside className="w-20 border-r border-[#222] bg-[var(--color-surface)] py-4 flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = screen === item.key;
            return (
              <button key={item.key} onClick={() => setScreen(item.key)} className="h-14 relative flex items-center justify-center text-[#b6b6b6] transition-transform hover:scale-105 active:scale-95">
                {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-9 w-[2px] bg-[var(--color-primary-fixed)] shadow-[0_0_8px_rgba(175,248,42,0.8)]" />}
                <Icon className={active ? "text-[var(--color-primary-fixed)]" : "text-[#8f8f8f]"} />
              </button>
            );
          })}
        </aside>

        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="flex-1 min-h-0"
          >
            {screen === "explorer" && (
              <div className="h-full p-4 grid grid-cols-[1fr_384px] gap-4">
                <section className="bg-[#141414] border border-[#262626] rounded-lg flex flex-col min-h-0">
                  <div className="h-10 px-4 border-b border-[#262626] flex items-center text-sm text-[#9fa68e]">main.js</div>
                  <div className="flex-1 min-h-0 flex">
                    <div className="w-12 border-r border-[#262626] py-3 text-right pr-3 font-code text-xs text-[#5a5a5a] space-y-2">
                      {lineNumbers.map((n) => <div key={n}>{n}</div>)}
                    </div>
                    <textarea value={source} onChange={(e) => setSource(e.target.value)} className="flex-1 bg-transparent p-3 outline-none resize-none font-code text-sm" />
                  </div>
                </section>
                <aside className="bg-[var(--color-surface-low)] border border-[#262626] rounded-lg p-4">
                  <h3 className="font-heading text-lg mb-3">Recent Scripts</h3>
                  <div className="space-y-3">
                    {history.map((item) => (
                      <article key={item.id} className="rounded-md border border-[#2d2d2d] bg-[var(--color-surface)] p-3">
                        <div className="flex justify-between items-center"><span className="text-sm">{item.id}</span><span className={`text-[11px] px-2 py-0.5 rounded-full ${item.status === "success" ? "bg-[var(--color-primary-fixed)] text-black" : "bg-[var(--color-error)] text-black"}`}>{item.status}</span></div>
                        <p className="mt-1 text-xs text-[#999]">{item.summary}</p>
                      </article>
                    ))}
                  </div>
                </aside>
              </div>
            )}

            {screen === "debugger" && (
              <div className="h-full flex flex-col p-4 gap-4">
                <div className="flex-1 min-h-0 grid grid-cols-[1fr_360px] gap-4">
                  <section className="bg-[var(--color-surface)] rounded-lg border border-[#262626] p-4 font-code text-sm">
                    {["def process_data(payload):", "    cleaned = []", "    for item in payload:", "        if item.get('valid'):", "            cleaned.append(item['value'])", "    result = sum(cleaned) / len(cleaned)", "    return result"].map((line, idx) => (
                      <div key={line} className={`pl-3 py-1 ${idx === 5 ? "border-l-2 border-[var(--color-primary-fixed)] bg-[#182109]" : ""}`}>
                        {idx === 5 && <CirclePlay className="inline h-3.5 w-3.5 mr-2 text-[var(--color-primary-fixed)]" />} {line}
                      </div>
                    ))}
                  </section>
                  <aside className="space-y-4">
                    <div className="bg-[var(--color-surface)] rounded-lg border border-[#262626] p-4">
                      <h4 className="font-heading mb-2">Locals</h4>
                      <div className="text-xs grid grid-cols-3 gap-y-1"><span>payload</span><span>list</span><span>14 items</span><span>cleaned</span><span>list</span><span>10 items</span><span>result</span><span>float</span><span>12.42</span></div>
                    </div>
                    <div className="bg-[var(--color-surface)] rounded-lg border border-[#262626] p-4">
                      <h4 className="font-heading mb-2">Call Stack</h4>
                      <div className="space-y-2 text-xs"><div className="pl-3 border-l border-[#3d3d3d]">main()</div><div className="pl-3 border-l border-[#3d3d3d]">pipeline()</div><div className="pl-3 border-l border-[var(--color-primary-fixed)] text-[var(--color-primary-fixed)]">process_data()</div></div>
                    </div>
                  </aside>
                </div>
                <div className="h-24 rounded-lg border border-[#262626] bg-[var(--color-surface)] px-5 flex items-center gap-4">
                  <button className="h-14 w-14 rounded-full bg-[var(--color-primary-fixed)] text-black grid place-items-center transition-transform hover:scale-105 active:scale-95"><Play className="h-6 w-6 fill-current" /></button>
                  <button className="transition-transform hover:scale-105 active:scale-95"><ChevronLeft /></button><button className="transition-transform hover:scale-105 active:scale-95"><ChevronRight /></button>
                  <div className="flex-1 h-6 relative"><div className="absolute top-1/2 -translate-y-1/2 h-1 w-full bg-[#303030] rounded-full" />{[10,25,46,68,92].map((p) => <span key={p} style={{ left: `${p}%` }} className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-[#6f6f6f]" />)}</div>
                </div>
              </div>
            )}

            {screen === "performance" && (
              <div className="h-full p-6 bg-[radial-gradient(circle_at_50%_50%,#aff82a22,transparent_70%)]">
                <div className="h-full rounded-xl border border-[#262626] bg-black/50 relative overflow-hidden">
                  {[["842", "active", "20%", "24%"], ["311", "", "54%", "18%"], ["917", "", "33%", "61%"], ["221", "", "72%", "52%"]].map(([id, state, left, top]) => (
                    <div key={id} style={{ left, top }} className={`absolute w-36 rounded-lg border border-[#2f2f2f] bg-[var(--color-surface)] p-3 ${state === "active" ? "ring-2 ring-[var(--color-primary-fixed)]" : ""}`}>
                      <div className="text-xs text-[#9a9a9a]">Node</div>
                      <div className="text-xl font-heading">{id}</div>
                      {state === "active" && <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-[var(--color-primary-fixed)] animate-ping" />}
                    </div>
                  ))}
                  <Activity className="absolute bottom-4 right-4 text-[var(--color-secondary)]" />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </section>
    </main>
  );
}
