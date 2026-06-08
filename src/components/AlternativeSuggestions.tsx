/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { AlternativeTranslation, ThemeConfig } from "../types";
import { RefreshCcw, Sparkles } from "lucide-react";

interface AlternativeSuggestionsProps {
  items: AlternativeTranslation[];
  config: ThemeConfig;
  onApplyAlternative: (text: string, tone: string) => void;
}

export const AlternativeSuggestions: React.FC<AlternativeSuggestionsProps> = ({
  items,
  config,
  onApplyAlternative,
}) => {
  if (!items || items.length === 0) return null;

  return (
    <div className={`p-5 rounded-xl border ${config.borderClass} ${config.glowClass || ""} mt-6`}>
      <h3 className="text-sm font-semibold font-display tracking-wide mb-3 flex items-center gap-2">
        <Sparkles className={`w-4 h-4 ${config.accentClass}`} />
        Vibe check: Alternative Tones
      </h3>
      <div className="space-y-3" id="alternatives-list">
        {items.map((item, index) => (
          <div
            key={index}
            className={`p-3.5 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all duration-300 ${
              config.id === "clarity"
                ? "bg-slate-50 hover:bg-indigo-50/30"
                : config.id === "sepia"
                ? "bg-[#f4ebe1] hover:bg-[#ecdcb9]/45"
                : config.id === "cyberpunk"
                ? "bg-slate-950/70 border border-pink-500/10 hover:border-[#00ffff]/30"
                : "bg-indigo-950/30 border border-indigo-500/10 hover:border-violet-500/30"
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-bold text-xs uppercase tracking-wider font-mono opacity-80 px-2 py-0.5 rounded bg-black/10">
                  {item.tone}
                </span>
                <span className="text-[10px] opacity-60 italic">
                  {item.difference}
                </span>
              </div>
              <p className="text-sm font-sans tracking-tight opacity-90 pr-2">
                {item.text}
              </p>
            </div>
            <button
              onClick={() => onApplyAlternative(item.text, item.tone)}
              className={`self-end md:self-center flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold font-display cursor-pointer transition-all ${
                config.id === "clarity"
                  ? "bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700"
                  : config.id === "sepia"
                  ? "bg-[#ecdcb9] hover:bg-[#ebd2aa] text-[#5c401c]"
                  : config.id === "cyberpunk"
                  ? "bg-pink-950 hover:bg-pink-900/60 text-[#00ffff] border border-pink-500/20"
                  : "bg-violet-950/80 hover:bg-violet-900/40 text-violet-300 border border-violet-500/20"
              }`}
              title="Apply this tone as primary translation"
              id={`apply-alt-${index}`}
            >
              <RefreshCcw className="w-3 h-3" />
              Adopt Vibe
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
