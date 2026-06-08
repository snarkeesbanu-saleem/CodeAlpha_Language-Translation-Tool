/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { WordBreakdownItem, ThemeConfig } from "../types";
import { BookOpen, HelpCircle } from "lucide-react";

interface GrammarBreakdownProps {
  items: WordBreakdownItem[];
  config: ThemeConfig;
}

export const GrammarBreakdown: React.FC<GrammarBreakdownProps> = ({
  items,
  config,
}) => {
  if (!items || items.length === 0) return null;

  return (
    <div className={`p-5 rounded-xl border ${config.borderClass} ${config.glowClass || ""} mt-6`}>
      <h3 className="text-sm font-semibold font-display tracking-wide mb-4 flex items-center gap-2">
        <BookOpen className={`w-4 h-4 ${config.accentClass}`} />
        Lexicon & Grammar Breakdown
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="grammar-breakdown-list">
        {items.map((item, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg flex flex-col justify-between ${
              config.id === "clarity"
                ? "bg-slate-100/60"
                : config.id === "sepia"
                ? "bg-[#ecdcb9]/50"
                : config.id === "cyberpunk"
                ? "bg-slate-950/50 border border-pink-500/10"
                : "bg-indigo-950/20 border border-indigo-500/10"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-base font-mono tracking-wide">
                  {item.word}
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    config.id === "clarity"
                      ? "bg-indigo-100 text-indigo-700"
                      : config.id === "sepia"
                      ? "bg-[#ecdcb9] text-[#5c401c]"
                      : config.id === "cyberpunk"
                      ? "bg-pink-950 text-pink-400 border border-pink-500/20"
                      : "bg-indigo-900/60 text-indigo-300"
                  }`}
                >
                  {item.partOfSpeech}
                </span>
              </div>
              <p className="text-xs opacity-90 font-sans mt-1">
                {item.meaning}
              </p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] opacity-60 flex items-center gap-1 mt-3">
        <HelpCircle className="w-3 h-3" />
        Analyze vocabulary to understand sentence structure, particles, and conjugations.
      </p>
    </div>
  );
};
