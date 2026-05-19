"use client"
import React, { useState } from "react"
import { Settings2, ShieldCheck, ChevronUp, ChevronDown, Sparkles } from "lucide-react"
import ReferencesPanel, { ReferenceSelections } from "./ReferencesPanel"

type RefKey = keyof ReferenceSelections

interface RightSidebarProps {
  outputs: number
  setOutputs: (n: number) => void
  prompt: string
  setPrompt: (s: string) => void
  projectId: string | null
  onReferenceSelectionsChange: (s: ReferenceSelections) => void
}

type TabType = "references" | "settings"

export default function RightSidebar({
  outputs, setOutputs, prompt, setPrompt,
  projectId, onReferenceSelectionsChange,
}: RightSidebarProps) {
  const [activeTab, setActiveTab] = useState<TabType>("references")
  const [ratio, setRatio] = useState("4:5")
  const [selections, setSelections] = useState<ReferenceSelections>({})

  const handleSelect = (key: RefKey, value: string | null) => {
    const next = { ...selections }
    if (value === null) delete next[key]
    else next[key] = value
    setSelections(next)
    onReferenceSelectionsChange(next)
  }

  return (
    <div className="space-y-6">
      {/* ── Tabs Navigation ── */}
      <div className="flex p-1 bg-white/80 dark:bg-white/[0.02] backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-2xl shadow-soft">
        <button
          onClick={() => setActiveTab("references")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[12.5px] font-semibold transition-all relative ${
            activeTab === "references"
              ? "bg-primary/5 text-primary border border-primary/10 shadow-sm"
              : "text-muted-foreground/60 hover:text-foreground"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Style Presets
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[12.5px] font-semibold transition-all relative ${
            activeTab === "settings"
              ? "bg-primary/5 text-primary border border-primary/10 shadow-sm"
              : "text-muted-foreground/60 hover:text-foreground"
          }`}
        >
          <Settings2 className="h-3.5 w-3.5" />
          Campaign
        </button>
      </div>

      {/* ── Active Tab Display Panel ── */}
      <div className="transition-all duration-300">
        {activeTab === "references" ? (
          /* ── Tab 1: References Panel ── */
          <ReferencesPanel
            projectId={projectId}
            selections={selections}
            onSelect={handleSelect}
          />
        ) : (
          /* ── Tab 2: Generation Settings ── */
          <div className="rounded-[2rem] border border-black/5 dark:border-white/5 bg-white/80 dark:bg-white/[0.01] p-7 backdrop-blur-xl space-y-8 shadow-soft">
            <div className="flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-primary px-1 opacity-80">
              <Settings2 className="h-3.5 w-3.5" />
              Campaign Parameters
            </div>

            <div className="space-y-7">
              {/* Creative Direction */}
              <div className="space-y-3">
                <label className="text-[13px] font-medium text-foreground/80 block px-1">
                  Creative Direction
                </label>
                <textarea
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-2xl px-4 py-4 text-[13.5px] font-normal resize-none focus:outline-none focus:ring-2 focus:ring-primary/10 text-foreground/90 placeholder:text-muted-foreground/40 transition-all"
                  placeholder="e.g. High-end editorial fashion, natural daylight, rooftop setting…"
                />
                <p className="text-[11px] text-muted-foreground/50 leading-relaxed px-1">
                  Specify aesthetic nuances. The AI orchestrator will interpret these instructions with high-fidelity garment preservation.
                </p>
              </div>

              {/* Aspect Ratio */}
              <div className="space-y-4">
                <label className="text-[13px] font-medium text-foreground/80 block px-1">Output Resolution</label>
                <div className="grid grid-cols-3 gap-2">
                  {["1:1", "4:5", "9:16"].map((r) => (
                    <button
                      key={r}
                      onClick={() => setRatio(r)}
                      className={`py-2 rounded-xl text-[11px] font-bold border transition-all ${
                        ratio === r
                          ? "bg-primary text-white border-primary shadow-md"
                          : "bg-slate-50 dark:bg-white/[0.03] border-black/5 dark:border-white/5 text-muted-foreground/60 hover:border-primary/30"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Outputs per outfit */}
              <div className="space-y-3">
                <label className="text-[13px] font-medium text-foreground/80 block px-1">
                  Outputs per outfit
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 flex items-center justify-between bg-slate-50 dark:bg-white/[0.03] border border-black/5 dark:border-white/5 rounded-2xl px-5 py-3.5">
                    <span className="text-[13px] font-bold font-mono text-primary">{outputs}</span>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setOutputs(Math.max(1, outputs - 1))} className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors text-muted-foreground">
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      <div className="h-4 w-[1px] bg-black/5 dark:bg-white/5" />
                      <button onClick={() => setOutputs(Math.min(4, outputs + 1))} className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors text-muted-foreground">
                        <ChevronUp className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground/50 px-1">Max 4 campaign variations per garment</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Persistent Outfit-Lock indicator ── */}
      <div className="rounded-[1.5rem] border border-primary/10 bg-primary/5 p-5 space-y-2 relative overflow-hidden shadow-soft">
        <div className="absolute top-[-30px] right-[-30px] w-20 h-20 bg-primary/10 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-[0.15em] relative z-10">
          <ShieldCheck className="h-3.5 w-3.5" />
          Outfit-Lock Guard Enabled
        </div>
        <p className="text-[10px] text-muted-foreground/70 leading-relaxed relative z-10">
          All details (cuts, prints, textures, collar lines, seams) are fully protected. AI only reimagines background, scene elements, models, and pose.
        </p>
      </div>
    </div>
  )
}
