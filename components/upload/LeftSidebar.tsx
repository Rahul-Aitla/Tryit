"use client"
import React from "react"
import { Layout, Briefcase, Plus, Hash, Folder, Star } from "lucide-react"

export default function LeftSidebar() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/50 bg-card/30 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <Layout className="h-3 w-3" />
            Projects
          </div>
          <button className="p-1 hover:bg-secondary rounded-md transition-colors">
            <Plus className="h-3 w-3" />
          </button>
        </div>
        
        <nav className="space-y-1">
          {[
            { name: "Current Session", icon: Briefcase, active: true },
            { name: "Summer Shoot", icon: Folder, active: false },
            { name: "Catalog 2026", icon: Folder, active: false },
            { name: "Starred", icon: Star, active: false },
          ].map((item) => (
            <button
              key={item.name}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                item.active 
                  ? "bg-violet-600/10 text-violet-500 shadow-sm" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="rounded-2xl border border-border/50 bg-card/30 p-4 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 px-2">
          <Hash className="h-3 w-3" />
          Library
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {["Lighting", "Poses", "Models", "Styles"].map((cat) => (
            <button key={cat} className="flex flex-col items-start gap-1 p-3 rounded-xl bg-secondary/30 border border-border/30 hover:border-border transition-all hover:bg-secondary/50">
              <span className="text-xs font-semibold">{cat}</span>
              <span className="text-[10px] text-muted-foreground">12 assets</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
