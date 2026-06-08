/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { AppTheme, ThemeConfig } from "../types";
import { THEMES } from "../data";
import { Sparkles, Library, Flame, Compass } from "lucide-react";

interface ThemeSelectorProps {
  currentTheme: AppTheme;
  onChangeTheme: (theme: AppTheme) => void;
  config: ThemeConfig;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  onChangeTheme,
  config,
}) => {
  const getThemeIcon = (themeId: AppTheme) => {
    switch (themeId) {
      case "clarity":
        return <Compass className="w-5 h-5 text-indigo-600" />;
      case "sepia":
        return <Library className="w-5 h-5 text-[#8c6239]" />;
      case "cyberpunk":
        return <Flame className="w-5 h-5 text-pink-500" />;
      case "cosmic":
        return <Sparkles className="w-5 h-5 text-violet-400" />;
    }
  };

  return (
    <div className={`p-4 rounded-xl ${config.borderClass} border mb-6 ${config.glowClass || ""}`}>
      <h3 className="text-sm font-bold font-display uppercase tracking-wider mb-3 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-500" />
        Visual Atmosphere
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {THEMES.map((t) => {
          const isActive = currentTheme === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onChangeTheme(t.id)}
              className={`p-3 rounded-lg text-left transition-all duration-300 relative flex flex-col justify-between h-24 ${
                isActive
                  ? "ring-2 ring-indigo-500 bg-white/10"
                  : "bg-black/5 hover:bg-black/10 text-inherit"
              }`}
              id={`theme-btn-${t.id}`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-semibold text-xs py-0.5 font-display">
                  {t.name}
                </span>
                {getThemeIcon(t.id)}
              </div>
              <p className="text-[10px] opacity-70 leading-normal line-clamp-2">
                {t.description}
              </p>
              {isActive && (
                <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
