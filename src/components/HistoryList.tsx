/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { HistoryItem, ThemeConfig } from "../types";
import { History, Bookmark, Trash2, ArrowRight, Share2, Star } from "lucide-react";

interface HistoryListProps {
  items: HistoryItem[];
  savedPhrases: HistoryItem[];
  config: ThemeConfig;
  onSelect: (item: HistoryItem) => void;
  onToggleFavorite: (id: string) => void;
  onClearHistory: () => void;
  onDelete: (id: string, isSavedOnly?: boolean) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  items,
  savedPhrases,
  config,
  onSelect,
  onToggleFavorite,
  onClearHistory,
  onDelete,
}) => {
  const [activeTab, setActiveTab] = useState<"recent" | "saved">("recent");

  const listToRender = activeTab === "recent" ? items : savedPhrases;

  return (
    <div className={`p-5 rounded-xl border ${config.borderClass} ${config.glowClass || ""} mt-6`}>
      <div className="flex items-center justify-between border-b pb-3 mb-4 border-slate-200/10">
        <div className="flex gap-1.5 p-0.5 rounded-lg bg-black/5">
          <button
            onClick={() => setActiveTab("recent")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === "recent"
                ? "bg-white shadow-sm text-slate-800"
                : "opacity-60 text-inherit hover:opacity-100"
            }`}
            id="tab-recent shadow-sm"
          >
            <History className="w-3.5 h-3.5" />
            Recent ({items.length})
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === "saved"
                ? "bg-white shadow-sm text-slate-800"
                : "opacity-60 text-inherit hover:opacity-100"
            }`}
            id="tab-saved shadow-sm"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            Saved ({savedPhrases.length})
          </button>
        </div>

        {activeTab === "recent" && items.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-[10px] uppercase font-bold tracking-wider opacity-60 hover:opacity-100 text-rose-500 transition-all flex items-center gap-1 cursor-pointer"
            id="clear-all-btn"
          >
            <Trash2 className="w-3 h-3" />
            Clear All
          </button>
        )}
      </div>

      {listToRender.length === 0 ? (
        <div className="text-center py-6">
          {activeTab === "recent" ? (
            <p className="text-xs opacity-50 font-sans italic">Your speech and text history will appear here.</p>
          ) : (
            <p className="text-xs opacity-50 font-sans italic">Star translations to save them to your active Phrasebook!</p>
          )}
        </div>
      ) : (
        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
          {listToRender.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-lg border flex flex-col gap-2 transition-all ${
                config.id === "clarity"
                  ? "bg-white hover:bg-slate-50 border-slate-100 shadow-sm"
                  : config.id === "sepia"
                  ? "bg-[#fcfaf7] hover:bg-[#faf6ee] border-[#dfd2be]/60"
                  : config.id === "cyberpunk"
                  ? "bg-slate-950/40 hover:bg-pink-950/20 border-pink-500/10"
                  : "bg-indigo-950/40 hover:bg-indigo-950/70 border-indigo-500/10"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] font-mono opacity-60">
                  <span className="uppercase text-inherit font-semibold">{item.sourceLanguage}</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                  <span className="uppercase text-inherit font-semibold">{item.targetLanguage}</span>
                  <span className="opacity-40">•</span>
                  <span className="capitalize">{item.tone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleFavorite(item.id)}
                    className="p-1 rounded hover:bg-black/5 transition-all text-amber-500 cursor-pointer"
                    title={item.isFavorite ? "Remove from Favorites" : "Save to Favorites"}
                    id={`fav-${item.id}`}
                  >
                    <Star className={`w-3.5 h-3.5 ${item.isFavorite ? "fill-amber-500" : "opacity-40"}`} />
                  </button>
                  <button
                    onClick={() => onDelete(item.id, activeTab === "saved")}
                    className="p-1 rounded hover:bg-black/5 transition-all text-red-400 hover:text-red-500 cursor-pointer"
                    title="Remove item"
                    id={`del-${item.id}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div
                onClick={() => onSelect(item)}
                className="cursor-pointer group flex flex-col pr-2"
              >
                <p className="text-xs font-sans line-clamp-1 opacity-70 group-hover:opacity-100 transition-all font-medium">
                  {item.sourceText}
                </p>
                <p className="text-sm font-sans font-semibold mt-0.5 group-hover:text-amber-500/90 transition-all">
                  {item.translatedText}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
