/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { IdiomItem, ThemeConfig } from "../types";
import { Sparkles, Info } from "lucide-react";

interface IdiomBreakdownProps {
  items: IdiomItem[];
  config: ThemeConfig;
}

export const IdiomBreakdown: React.FC<IdiomBreakdownProps> = ({
  items,
  config,
}) => {
  if (!items || items.length === 0) return null;

  return (
    <div className={`p-5 rounded-xl border ${config.borderClass} ${config.glowClass || ""} mt-6`}>
      <h3 className="text-sm font-semibold font-display tracking-wide mb-3 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
        Cultural Context & Idioms
      </h3>
      <div className="space-y-4" id="idioms-list">
        {items.map((item, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg relative overflow-hidden flex flex-col gap-1.5 ${
              config.id === "clarity"
                ? "bg-indigo-50/40 border-l-4 border-indigo-600"
                : config.id === "sepia"
                ? "bg-[#ecdcb9]/30 border-l-4 border-[#5c401c]"
                : config.id === "cyberpunk"
                ? "bg-pink-950/20 border border-pink-500/10 border-l-4 border-pink-500"
                : "bg-violet-950/20 border border-violet-500/10 border-l-4 border-violet-500"
            }`}
          >
            <div className="font-bold text-base font-sans flex items-center justify-between">
              <span>&ldquo;{item.original}&rdquo;</span>
            </div>
            <div className="text-xs font-semibold opacity-90 italic">
              Literal Meaning: {item.meaning}
            </div>
            <p className="text-xs opacity-75 leading-relaxed font-sans mt-0.5">
              {item.culturalCtx}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
