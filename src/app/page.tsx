"use client";

import { useMemo, useState } from "react";

type View = "explorer" | "debugger" | "performance" | "settings";

const topTabs: { key: View; label: string }[] = [
  { key: "explorer", label: "Explorer" },
  { key: "debugger", label: "Debugger" },
  { key: "performance", label: "Performance" },
];

const recentScripts = [
  { name: "AuthenticationFlow.js", lang: "Node.js", status: "3 Errors", nodes: 42, age: "2h ago" },
  { name: "DataAggregationPipeline.py", lang: "Python", status: "Success", nodes: 156, age: "Yesterday" },
  { name: "QueueBalancer.ts", lang: "TypeScript", status: "Success", nodes: 87, age: "3d ago" },
];

const variableRows = [
  { name: "currentLoad", type: "float", value: "0.8421" },
  { name: "retryCount", type: "int", value: "3" },
  { name: "isActive", type: "bool", value: "true" },
  { name: "payload", type: "obj", value: "{...}" },
];

export default function Home() {
  const [view, setView] = useState<View>("explorer");
  const [search, setSearch] = useState("");
  const [code, setCode] = useState(`// Paste your complex logic here...\n\nfunction processData(input) {\n  // High-contrast syntax highlighting will apply automatically\n  return input.filter(Boolean).map((item) => item * 42);\n}`);
  const [theme, setTheme] = useState("Void");
  const [stepSpeed, setStepSpeed] = useState(500);
  const [highContrast, setHighContrast] = useState(true);
  const [autopause, setAutopause] = useState(false);
  const [progress, setProgress] = useState(34);

  const filteredScripts = useMemo(
    () => recentScripts.filter((script) => script.name.toLowerCase().includes(search.toLowerCase())),
    [search],
  );

  return (
    <main className="min-h-screen bg-[#090a0b] text-[#f2f2ef]">
      <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[#2f3526] bg-[#090a0be8] px-4 backdrop-blur md:px-10">
        <div className="flex items-center gap-8">
          <h1 className="text-3xl font-semibold text-[#9bf134]">CodeFlowViz</h1>
          <nav className="hidden items-center gap-8 md:flex">
            {topTabs.map((tab) => (
              <button key={tab.key} onClick={() => setView(tab.key)} className={`pb-1 text-3xl/[1] md:text-[2rem] ${view === tab.key ? "border-b-2 border-[#9bf134] text-white" : "text-[#c7ccb7]"}`}>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search codebase..." className="hidden h-14 w-80 rounded-full border border-[#2f3526] bg-[#121511] px-6 text-xl outline-none xl:block" />
          <button className="rounded-full bg-[#9bf134] px-8 py-3 text-2xl font-semibold text-black">Deploy</button>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden min-h-[calc(100vh-5rem)] w-24 flex-col items-center justify-between border-r border-[#2f3526] bg-[#121411] py-8 md:flex">
          <div className="space-y-6 text-3xl text-[#b0b69e]">
            {[
              ["📁", "explorer"],
              ["🐞", "debugger"],
              ["📈", "performance"],
              ["⚙️", "settings"],
            ].map(([icon, key]) => (
              <button key={key} onClick={() => setView(key as View)} className={`grid h-14 w-14 place-content-center rounded-2xl border ${view === key ? "border-[#9bf134] bg-[#20261a]" : "border-transparent"}`}>
                {icon}
              </button>
            ))}
          </div>
          <div className="text-3xl">👤</div>
        </aside>

        <section className="grid flex-1 gap-4 p-4 md:grid-cols-3 md:p-10">
          <div className="space-y-4 rounded-2xl border border-[#2f3526] bg-[#121411] p-6 md:col-span-2">
            <h2 className="text-5xl font-semibold">{view === "settings" ? "Settings" : "New Trace Session"}</h2>
            <p className="text-2xl text-[#b5bba8]">Paste your script below to begin visualization flow.</p>
            <textarea value={code} onChange={(e) => setCode(e.target.value)} className="h-[48vh] w-full rounded-2xl border border-[#2f3526] bg-[#0d0f0d] p-5 font-mono text-xl text-[#d7e0c5] outline-none" />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {["Void", "Monokai", "Dracula"].map((opt) => (
                  <button key={opt} onClick={() => setTheme(opt)} className={`rounded-xl border px-4 py-2 ${theme === opt ? "border-[#9bf134] bg-[#2a3022]" : "border-[#2f3526]"}`}>{opt}</button>
                ))}
              </div>
              <button className="rounded-full bg-[#9bf134] px-8 py-3 text-xl font-semibold text-black">Start Tracing</button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-[#2f3526] bg-[#121411] p-6">
              <h3 className="text-3xl font-semibold">Recent Scripts</h3>
              <p className="mb-3 text-xl text-[#b5bba8]">Quickly load previous trace sessions.</p>
              <div className="space-y-3">
                {filteredScripts.map((script) => (
                  <button key={script.name} onClick={() => setCode(`// Loaded ${script.name}\n${code}`)} className="w-full rounded-xl border border-[#2f3526] bg-[#0f110f] p-4 text-left">
                    <div className="flex items-center justify-between text-xl"><span>{script.name}</span><span className="text-[#b5bba8]">{script.age}</span></div>
                    <div className="mt-2 text-sm text-[#b5bba8]">{script.lang} · {script.status} · {script.nodes} nodes traced</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#2f3526] bg-[#121411] p-6">
              <h3 className="mb-3 text-3xl font-semibold">Variable Inspector</h3>
              {variableRows.map((row) => (
                <div key={row.name} className="grid grid-cols-3 border-t border-[#2f3526] py-3 text-lg">
                  <span>{row.name}</span><span className="text-[#9bc2ff]">{row.type}</span><span>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-3 rounded-2xl border border-[#2f3526] bg-[#121411] p-6">
            <div className="mb-2 flex items-center justify-between text-xl"><span>Default Step Speed: {stepSpeed}ms</span><span>{highContrast ? "High Contrast On" : "High Contrast Off"}</span></div>
            <input type="range" min={10} max={2000} value={stepSpeed} onChange={(e) => setStepSpeed(Number(e.target.value))} className="w-full accent-[#9bf134]" />
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <button onClick={() => setHighContrast((v) => !v)} className="rounded-full border border-[#2f3526] px-5 py-2">Toggle Contrast</button>
              <button onClick={() => setAutopause((v) => !v)} className="rounded-full border border-[#2f3526] px-5 py-2">Auto-pause: {autopause ? "On" : "Off"}</button>
              <button onClick={() => setProgress((p) => Math.min(100, p + 8))} className="rounded-full border border-[#2f3526] px-5 py-2">Advance</button>
            </div>
            <div className="mt-4 h-2 rounded-full bg-[#2f3526]"><div className="h-full rounded-full bg-[#9bf134]" style={{ width: `${progress}%` }} /></div>
          </div>
        </section>
      </div>
    </main>
  );
}
