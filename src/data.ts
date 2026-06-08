/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ToneOption, ThemeConfig, AppTheme } from "./types";

export const LANGUAGES = [
  "Auto-Detect",
  "English",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Russian",
  "Chinese Simplified",
  "Chinese Traditional",
  "Japanese",
  "Korean",
  "Arabic",
  "Hindi",
  "Bengali",
  "Turkish",
  "Dutch",
  "Vietnamese",
  "Swedish",
  "Polish",
];

export const TONES: ToneOption[] = [
  {
    value: "standard",
    label: "Standard",
    description: "Natural, accurate everyday translation",
    icon: "Languages",
  },
  {
    value: "formal",
    label: "Formal/Polite",
    description: "Respectful dialogue suited for business & clients",
    icon: "Shield",
  },
  {
    value: "casual",
    label: "Casual/Friendly",
    description: "Relaxed phrasing suited for peer & social chat",
    icon: "Smile",
  },
  {
    value: "slang",
    label: "Colloquial/Slang",
    description: "Infused with local idioms & active expressions",
    icon: "Zap",
  },
  {
    value: "professional",
    label: "Professional",
    description: "Corporate precision with industry clear standards",
    icon: "Briefcase",
  },
  {
    value: "poetic",
    label: "Poetic/Literary",
    description: "Evocative, rhythmic, and artistically framed",
    icon: "Feather",
  },
  {
    value: "simple",
    label: "Explain to a Child",
    description: "Extremely simplified, high accessibility words",
    icon: "Compass",
  },
];

export const THEMES: ThemeConfig[] = [
  {
    id: "clarity",
    name: "Glass Clarity",
    description: "Pristine white and indigo glassmorphism layout",
    bgClass: "bg-slate-50 text-slate-800 transition-colors duration-500",
    cardClass: "glass-card border border-white/60 shadow-xl shadow-slate-100/50 rounded-2xl",
    textClass: "text-slate-800",
    accentClass: "text-indigo-600",
    borderClass: "border-slate-200/80",
    buttonClass: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg hover:shadow-indigo-100",
    inputClass: "bg-white/85 border border-slate-200 focus:border-indigo-500 text-slate-800",
  },
  {
    id: "sepia",
    name: "Vintage Archive",
    description: "Warm paper parchment, elegant serifs, classic coffee styles",
    bgClass: "sepia-paper text-[#433422] transition-all duration-500",
    cardClass: "bg-[#faf6ee] border border-[#dfd2be] shadow-lg rounded-xl",
    textClass: "text-[#433422]",
    accentClass: "text-[#8c6239]",
    borderClass: "border-[#e6dccb]",
    buttonClass: "bg-[#5c401c] hover:bg-[#4a3316] text-[#faf6ee] shadow-sm",
    inputClass: "bg-[#f4ebe1] border border-[#d2c5b0] focus:border-[#8c6239] text-[#2b2012]",
  },
  {
    id: "cyberpunk",
    name: "Neon Grid",
    description: "Futuristic grid landscape with vibrant neon highlights",
    bgClass: "cyber-grid text-pink-50 transition-all duration-500",
    cardClass: "glass-card-dark border-2 border-pink-500/30 rounded-lg shadow-[0_0_20px_rgba(236,72,153,0.15)]",
    textClass: "text-pink-50",
    accentClass: "text-[#00ffff] drop-shadow-[0_0_5px_rgba(0,255,255,0.5)]",
    borderClass: "border-pink-500/20",
    buttonClass: "bg-pink-600 hover:bg-pink-500 text-white shadow-[0_0_12px_rgba(236,72,153,0.4)] border border-pink-400/50",
    inputClass: "bg-slate-950/80 border border-pink-500/45 focus:border-[#00ffff] text-pink-50 placeholder-pink-400/40",
    glowClass: "shadow-[inset_0_0_10px_rgba(236,72,153,0.05)]",
  },
  {
    id: "cosmic",
    name: "Stardust Void",
    description: "Deep space nebula, cosmic stars, elegant high-contrast purple",
    bgClass: "cosmic-void text-slate-100 transition-all duration-500 min-h-screen relative overflow-hidden",
    cardClass: "bg-[#0b0f19]/80 border border-indigo-500/30 rounded-2xl shadow-xl shadow-indigo-950/40 backdrop-blur-md",
    textClass: "text-slate-100",
    accentClass: "text-violet-400 drop-shadow-[0_0_3px_rgba(139,92,246,0.3)]",
    borderClass: "border-indigo-500/20",
    buttonClass: "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-xl shadow-violet-950/50 border border-violet-400/20",
    inputClass: "bg-indigo-950/30 border border-indigo-500/30 focus:border-violet-400 text-slate-100 placeholder-indigo-300/40",
    glowClass: "shadow-[inset_0_0_15px_rgba(99,102,241,0.05)]",
  },
];
