/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface WordBreakdownItem {
  word: string;
  partOfSpeech: string;
  meaning: string;
}

export interface IdiomItem {
  original: string;
  meaning: string;
  culturalCtx: string;
}

export interface AlternativeTranslation {
  text: string;
  tone: string;
  difference: string;
}

export interface TranslationResult {
  translatedText: string;
  sourceLanguageDetected: string;
  pronunciation?: string;
  idioms?: IdiomItem[];
  wordBreakdown?: WordBreakdownItem[];
  alternatives?: AlternativeTranslation[];
}

export interface HistoryItem {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  tone: string;
  timestamp: number;
  result: TranslationResult;
  isFavorite?: boolean;
}

export type TranslationTone =
  | "standard"
  | "formal"
  | "casual"
  | "slang"
  | "professional"
  | "poetic"
  | "simple";

export interface ToneOption {
  value: TranslationTone;
  label: string;
  description: string;
  icon: string;
}

export type AppTheme = "clarity" | "sepia" | "cyberpunk" | "cosmic";

export interface ThemeConfig {
  id: AppTheme;
  name: string;
  description: string;
  bgClass: string;
  cardClass: string;
  textClass: string;
  accentClass: string;
  borderClass: string;
  buttonClass: string;
  inputClass: string;
  glowClass?: string;
}
