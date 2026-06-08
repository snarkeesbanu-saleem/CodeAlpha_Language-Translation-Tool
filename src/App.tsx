/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  LANGUAGES,
  TONES,
  THEMES,
} from "./data";
import {
  TranslationResult,
  HistoryItem,
  TranslationTone,
  AppTheme,
  ThemeConfig,
} from "./types";
import { ThemeSelector } from "./components/ThemeSelector";
import { GrammarBreakdown } from "./components/GrammarBreakdown";
import { IdiomBreakdown } from "./components/IdiomBreakdown";
import { AlternativeSuggestions } from "./components/AlternativeSuggestions";
import { HistoryList } from "./components/HistoryList";
import {
  Languages,
  ArrowRightLeft,
  Volume2,
  Copy,
  Trash2,
  Mic,
  MicOff,
  Star,
  RefreshCw,
  Upload,
  Sparkles,
  Info,
  HelpCircle,
  FileText,
  AlertCircle,
  Globe,
  Feather,
} from "lucide-react";

export default function App() {
  // UI and translation settings
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("Auto-Detect");
  const [targetLanguage, setTargetLanguage] = useState("Spanish");
  const [selectedTone, setSelectedTone] = useState<TranslationTone>("standard");
  const [currentTheme, setCurrentTheme] = useState<AppTheme>("clarity");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Advanced components result states
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);

  // Speech and utility state
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  // History & Phrasebook states (cached in localStorage)
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [savedPhrases, setSavedPhrases] = useState<HistoryItem[]>([]);

  // Drag & drop dragover indicator
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Dynamic config for current visually active style
  const activeConfig = THEMES.find((t) => t.id === currentTheme) || THEMES[0];

  // Loading steps text simulation
  const loadingStepsText = [
    "Analyzing input matrices...",
    "Querying linguistic context nodes...",
    "Reconstructing tone registers...",
    "Synthesizing idioms & cultural links...",
  ];

  // Load persistence states on mount
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem("translator_history");
      if (storedHistory) setHistory(JSON.parse(storedHistory));

      const storedSaved = localStorage.getItem("translator_saved");
      if (storedSaved) setSavedPhrases(JSON.parse(storedSaved));

      const storedTheme = localStorage.getItem("translator_theme") as AppTheme;
      if (storedTheme && THEMES.some((t) => t.id === storedTheme)) {
        setCurrentTheme(storedTheme);
      }
    } catch (e) {
      console.error("Local storage sync failure:", e);
    }
  }, []);

  // Save history to localStorage
  const persistHistory = (newHistory: HistoryItem[]) => {
    setHistory(newHistory);
    localStorage.setItem("translator_history", JSON.stringify(newHistory));
  };

  // Save phrasebook to localStorage
  const persistSavedPhrases = (newSaved: HistoryItem[]) => {
    setSavedPhrases(newSaved);
    localStorage.setItem("translator_saved", JSON.stringify(newSaved));
  };

  // Speech Recognition initialization
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;

      // Map matching languages to facilitate speech recognition precision locale
      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setSourceText((prev) => (prev ? prev + " " + transcript : transcript));
        }
      };

      rec.onerror = (e: any) => {
        console.error("Recording error:", e);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, []);

  // Set recording locale dynamically
  useEffect(() => {
    if (recognition) {
      recognition.lang = getLanguageLocale(sourceLanguage);
    }
  }, [sourceLanguage, recognition]);

  // Loading steps interval
  useEffect(() => {
    let intervalId: any;
    if (isLoading) {
      setLoadingStep(0);
      intervalId = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingStepsText.length);
      }, 1800);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isLoading]);

  const toggleRecording = () => {
    if (!recognition) {
      alert("Speech recognition is not supported in this browser. Try Google Chrome.");
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      setError(null);
      recognition.start();
    }
  };

  const getLanguageLocale = (lang: string): string => {
    const locales: Record<string, string> = {
      English: "en-US",
      Spanish: "es-ES",
      French: "fr-FR",
      German: "de-DE",
      Italian: "it-IT",
      Portuguese: "pt-PT",
      Russian: "ru-RU",
      "Chinese Simplified": "zh-CN",
      "Chinese Traditional": "zh-TW",
      Japanese: "ja-JP",
      Korean: "ko-KR",
      Arabic: "ar-SA",
      Hindi: "hi-IN",
      Bengali: "bn-IN",
      Turkish: "tr-TR",
      Dutch: "nl-NL",
      Vietnamese: "vi-VN",
      Swedish: "sv-SE",
      Polish: "pl-PL",
    };
    return locales[lang] || "en-US";
  };

  const playSpeech = (text: string, lang: string) => {
    if (!text || !text.trim()) return;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = getLanguageLocale(lang);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Your browser does not support client speech synthesis.");
    }
  };

  const handleTranslate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!sourceText || !sourceText.trim()) return;

    setIsLoading(true);
    setError(null);

    // Default target lang same as source safeguard
    if (sourceLanguage !== "Auto-Detect" && sourceLanguage === targetLanguage) {
      setError("Please select distinct source and target languages to execute translation.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: sourceText,
          sourceLanguage,
          targetLanguage,
          tone: selectedTone,
        }),
      });

      const contentType = response.headers.get("content-type") || "";
      if (!response.ok) {
        if (contentType.includes("application/json")) {
          const errData = await response.json();
          throw new Error(errData.error || "Translation engine returned an error status.");
        } else {
          const errorHtml = await response.text();
          throw new Error(`Server error (${response.status}). Please check your GEMINI_API_KEY if the translation fails.`);
        }
      }

      if (!contentType.includes("application/json")) {
        const textResponse = await response.text();
        throw new Error("Linguistic server is still restarting. Please wait a moment and try again.");
      }

      const result: TranslationResult = await response.json();

      setTranslatedText(result.translatedText);
      setTranslationResult(result);

      // Add to local history list
      const newItem: HistoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        sourceText: sourceText,
        translatedText: result.translatedText,
        sourceLanguage:
          sourceLanguage === "Auto-Detect" ? result.sourceLanguageDetected : sourceLanguage,
        targetLanguage,
        tone: selectedTone,
        timestamp: Date.now(),
        result,
      };

      const updatedHistory = [newItem, ...history].slice(0, 30);
      persistHistory(updatedHistory);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to communicate with translate endpoint.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwapLanguages = () => {
    if (sourceLanguage === "Auto-Detect") return;
    const temp = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(temp);
    // Also swap relevant texts if available
    if (translatedText) {
      setSourceText(translatedText);
      setTranslatedText("");
      setTranslationResult(null);
    }
  };

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    alert("Copied translation text to clipboard!");
  };

  const handleToggleFavoriteItem = (id: string) => {
    // Check if in history or phrasebook
    let isAlreadyInSaved = savedPhrases.some((x) => x.id === id);

    if (isAlreadyInSaved) {
      const filtered = savedPhrases.filter((x) => x.id !== id);
      persistSavedPhrases(filtered);

      // update history state bookmark pointer
      const updatedHistory = history.map((h) => (h.id === id ? { ...h, isFavorite: false } : h));
      persistHistory(updatedHistory);
    } else {
      // Find item either in history or construct one for current view
      const historyItem = history.find((h) => h.id === id);

      if (historyItem) {
        const itemToSave = { ...historyItem, isFavorite: true };
        persistSavedPhrases([itemToSave, ...savedPhrases]);

        const updatedHistory = history.map((h) => (h.id === id ? { ...h, isFavorite: true } : h));
        persistHistory(updatedHistory);
      }
    }
  };

  const handleToggleCurrentFavorite = () => {
    if (!translatedText || !translationResult) return;

    // Check if already in saved phrases
    const alreadySaved = savedPhrases.find(
      (p) => p.sourceText === sourceText && p.translatedText === translatedText
    );

    if (alreadySaved) {
      // Delete it
      const filtered = savedPhrases.filter((x) => x.id !== alreadySaved.id);
      persistSavedPhrases(filtered);
    } else {
      const newItem: HistoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        sourceText: sourceText,
        translatedText: translatedText,
        sourceLanguage:
          sourceLanguage === "Auto-Detect"
            ? translationResult.sourceLanguageDetected
            : sourceLanguage,
        targetLanguage,
        tone: selectedTone,
        timestamp: Date.now(),
        result: translationResult,
        isFavorite: true,
      };
      persistSavedPhrases([newItem, ...savedPhrases]);
    }
  };

  const isCurrentFavorite = () => {
    if (!translatedText) return false;
    return savedPhrases.some(
      (p) => p.sourceText === sourceText && p.translatedText === translatedText
    );
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setSourceText(item.sourceText);
    setTranslatedText(item.translatedText);
    setSourceLanguage(item.sourceLanguage);
    setTargetLanguage(item.targetLanguage);
    setSelectedTone(item.tone as TranslationTone);
    setTranslationResult(item.result);
    setError(null);
  };

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to delete all recent translation entries?")) {
      persistHistory([]);
    }
  };

  const handleDeleteHistoryItem = (id: string, isSavedOnly = false) => {
    if (isSavedOnly) {
      const filtered = savedPhrases.filter((x) => x.id !== id);
      persistSavedPhrases(filtered);
    } else {
      const filteredHistory = history.filter((x) => x.id !== id);
      persistHistory(filteredHistory);

      const filteredSaved = savedPhrases.filter((x) => x.id !== id);
      persistSavedPhrases(filteredSaved);
    }
  };

  const adoptAlternativeTranslation = (altText: string, altTone: string) => {
    if (!translationResult) return;
    setTranslatedText(altText);
    // Overwrite primary translate output
    setTranslationResult({
      ...translationResult,
      translatedText: altText,
    });
    // Create new history node reflect change
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substring(2, 9),
      sourceText: sourceText,
      translatedText: altText,
      sourceLanguage:
        sourceLanguage === "Auto-Detect"
          ? translationResult.sourceLanguageDetected
          : sourceLanguage,
      targetLanguage,
      tone: altTone as TranslationTone,
      timestamp: Date.now(),
      result: {
        ...translationResult,
        translatedText: altText,
      },
    };
    persistHistory([newItem, ...history].slice(0, 30));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readTextFile(file);
  };

  const readTextFile = (file: File) => {
    if (!file.type.startsWith("text/") && !file.name.endsWith(".txt") && !file.name.endsWith(".md")) {
      alert("Unsupported format. Please select a valid plain text or markdown document (.txt, .md).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setSourceText(content);
        alert(`Successfully imported document: ${file.name}`);
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = () => {
    setIsDraggingFile(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      readTextFile(file);
    }
  };

  const handleThemeChange = (theme: AppTheme) => {
    setCurrentTheme(theme);
    localStorage.setItem("translator_theme", theme);
  };

  return (
    <div className={`min-h-screen pb-12 w-full transition-all duration-500 font-sans ${activeConfig.bgClass}`}>
      {/* Visual background atmospheric enhancements */}
      {currentTheme === "cosmic" && (
        <div className="absolute inset-0 cosmic-stars opacity-45 pointer-events-none z-0" />
      )}
      {currentTheme === "cyberpunk" && (
        <div className="absolute inset-x-0 top-0 h-[450px] bg-gradient-to-b from-pink-500/5 to-transparent pointer-events-none z-0" />
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 pt-8 md:pt-12 relative z-10">
        {/* Header Block */}
        <header className="mb-8 text-center" id="app-header">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-xs font-semibold mb-3 tracking-wider uppercase border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5 animate-spin duration-3000" />
            Neural Live Translation Engine
          </div>
          <h1 className="text-3xl md:text-5xl font-black font-display tracking-tight mb-2 uppercase">
            Language <span className={activeConfig.accentClass}>Translator</span>
          </h1>
          <p className="text-xs md:text-sm opacity-75 max-w-xl mx-auto leading-relaxed">
            Harness real-time cloud nuance parsing to change vocabulary tones, extract metaphors, explore part-of-speech indexes, or speak voice outputs natively.
          </p>
        </header>

        {/* Outer Layout Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Workspace Column */}
          <main className="lg:col-span-8 flex flex-col gap-6" id="workspace">
            {/* Options Bar & Quick Swap selectors */}
            <div className={`p-4 rounded-xl ${activeConfig.cardClass} flex flex-wrap md:flex-nowrap items-center justify-between gap-4`}>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="flex flex-col gap-1 w-1/2 md:w-44">
                  <span className="text-[10px] uppercase tracking-wider font-mono opacity-50">Origin</span>
                  <select
                    value={sourceLanguage}
                    onChange={(e) => setSourceLanguage(e.target.value)}
                    className={`py-2 px-3 rounded-lg text-sm font-semibold outline-none focus:ring-1 focus:ring-indigo-500 ${activeConfig.inputClass}`}
                    id="source-language-select"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-center pt-4">
                  <button
                    onClick={handleSwapLanguages}
                    disabled={sourceLanguage === "Auto-Detect"}
                    className={`p-2 rounded-full cursor-pointer transition-all ${
                      sourceLanguage === "Auto-Detect"
                        ? "opacity-30 cursor-not-allowed"
                        : "hover:bg-black/10 active:scale-90"
                    }`}
                    title="Swap Source and Target Languages"
                    id="swap-languages-btn"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-col gap-1 w-1/2 md:w-44">
                  <span className="text-[10px] uppercase tracking-wider font-mono opacity-50">Target translation</span>
                  <select
                    value={targetLanguage}
                    onChange={(e) => setSourceLanguage((prev) => (prev === e.target.value ? "Auto-Detect" : prev)) || setTargetLanguage(e.target.value)}
                    className={`py-2 px-3 rounded-lg text-sm font-semibold outline-none focus:ring-1 focus:ring-indigo-500 ${activeConfig.inputClass}`}
                    id="target-language-select"
                  >
                    {LANGUAGES.filter((l) => l !== "Auto-Detect").map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action translate core button */}
              <button
                onClick={() => handleTranslate()}
                disabled={isLoading || !sourceText.trim()}
                className={`py-2.5 px-6 rounded-lg text-sm font-bold font-display tracking-wide uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                  isLoading || !sourceText.trim()
                    ? "opacity-55 cursor-not-allowed bg-slate-400 text-slate-700"
                    : activeConfig.buttonClass
                }`}
                id="translate-btn"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Analyzing Nuances...
                  </>
                ) : (
                  <>
                    <Languages className="w-4 h-4" />
                    Translate Text
                  </>
                )}
              </button>
            </div>

            {/* Source & Target Panels Side-By-Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Input Workspace Area */}
              <div
                className={`p-5 rounded-2xl ${activeConfig.cardClass} relative flex flex-col justify-between min-h-[320px] transition-all ${
                  isDraggingFile ? "ring-4 ring-indigo-500 bg-indigo-500/10" : ""
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                id="source-textarea-panel"
              >
                {isDraggingFile && (
                  <div className="absolute inset-0 bg-indigo-505/10 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center pointer-events-none z-20">
                    <FileText className="w-12 h-12 text-indigo-500 animate-bounce" />
                    <p className="text-sm font-semibold mt-2">Drop text file here to import content</p>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold font-mono uppercase tracking-wider opacity-60">Source Passage</span>
                    {sourceText && (
                      <span className="text-[9px] font-mono opacity-50 px-1.5 py-0.5 rounded bg-black/5">
                        {sourceText.length} characters
                      </span>
                    )}
                  </div>
                  <textarea
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    placeholder="Enter details, paste articles, drop a text file (.txt, .md), or press the mic key to speak aloud..."
                    className="w-full text-base font-sans bg-transparent resize-none border-0 focus:outline-none focus:ring-0 h-44 placeholder-slate-400/70"
                    id="input-text-area"
                  />
                </div>

                {/* Left side actions (Mic, upload, sound read, clear) */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200/5">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={toggleRecording}
                      className={`p-2.5 rounded-lg transition-all relative flex items-center justify-center cursor-pointer ${
                        isListening
                          ? "bg-red-500 text-white animate-pulse"
                          : "hover:bg-black/5 opacity-70 hover:opacity-100"
                      }`}
                      title={isListening ? "Listening... press to stop" : "Start Speech-to-Text Input"}
                      id="mic-record-btn"
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>

                    <label className="p-2.5 rounded-lg hover:bg-black/5 opacity-70 hover:opacity-100 cursor-pointer flex items-center justify-center transition-all">
                      <input
                        type="file"
                        accept=".txt,.md"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Upload className="w-4 h-4" title="Import Text / Markdown Document" />
                    </label>

                    {sourceText && (
                      <button
                        onClick={() => playSpeech(sourceText, sourceLanguage)}
                        className="p-2.5 rounded-lg hover:bg-black/5 opacity-70 hover:opacity-100 transition-all cursor-pointer"
                        title="Listen to input text speech synthesis"
                        id="play-source-speech-btn"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {sourceText && (
                    <button
                      onClick={() => {
                        setSourceText("");
                        setTranslatedText("");
                        setTranslationResult(null);
                        setError(null);
                      }}
                      className="text-xs uppercase font-mono px-2.5 py-1 rounded-md opacity-60 hover:opacity-100 hover:bg-black/5 text-inherit transition-all cursor-pointer"
                      id="clear-source-btn"
                    >
                      Clear Content
                    </button>
                  )}
                </div>
              </div>

              {/* Target Translated Workspace Area */}
              <div
                className={`p-5 rounded-2xl ${activeConfig.cardClass} relative flex flex-col justify-between min-h-[320px] transition-all`}
                id="target-textarea-panel"
              >
                <div>
                  <div className="flex items-center justify-between mb-3 text-[10px] font-bold font-mono uppercase tracking-wider opacity-60">
                    <span className="flex items-center gap-1">
                      Target Translation
                      {translationResult && sourceLanguage === "Auto-Detect" && (
                        <span className="normal-case opacity-80 px-1 rounded bg-indigo-500/15">
                          (Detected: {translationResult.sourceLanguageDetected})
                        </span>
                      )}
                    </span>
                    {translatedText && (
                      <span className="opacity-90 tracking-normal capitalize flex items-center gap-1 text-[9px] font-sans px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/25">
                        <Feather className="w-2.5 h-2.5" />
                        {selectedTone} tone
                      </span>
                    )}
                  </div>

                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-40 py-12" id="translator-loader">
                      <div className="relative mb-4">
                        <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                        <Sparkles className="w-5 h-5 text-amber-400 absolute inset-0 m-auto animate-pulse" />
                      </div>
                      <p className="text-xs font-mono opacity-80 uppercase tracking-widest">{loadingStepsText[loadingStep]}</p>
                    </div>
                  ) : translatedText ? (
                    <div className="h-44 overflow-y-auto pr-1">
                      <p className="text-base font-sans font-medium leading-relaxed tracking-tight whitespace-pre-wrap">
                        {translatedText}
                      </p>
                      {translationResult?.pronunciation && (
                        <p className="text-xs opacity-70 italic font-mono mt-3 border-t pt-2 border-slate-200/5 flex items-center gap-1">
                          <span className="not-italic bg-black/10 px-1 rounded uppercase text-[10px] font-bold">Sound:</span>
                          {translationResult.pronunciation}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-40 py-12 opacity-40">
                      <Languages className="w-10 h-10 mb-2" />
                      <p className="text-xs font-sans italic text-center">Your generated translation and phonetic pronouncers will render here.</p>
                    </div>
                  )}
                </div>

                {/* Right side actions (copy, favorite bookmark, sound check) */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200/5">
                  <div className="flex items-center gap-1.5">
                    {translatedText && (
                      <>
                        <button
                          onClick={() => playSpeech(translatedText, targetLanguage)}
                          className="p-2.5 rounded-lg hover:bg-black/5 opacity-70 hover:opacity-100 transition-all cursor-pointer"
                          title="Speak translated response loudly"
                          id="play-target-speech-btn"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => copyToClipboard(translatedText)}
                          className="p-2.5 rounded-lg hover:bg-black/5 opacity-70 hover:opacity-100 transition-all cursor-pointer"
                          title="Copy translation content"
                          id="copy-translation-btn"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <button
                          onClick={handleToggleCurrentFavorite}
                          className="p-2.5 rounded-lg hover:bg-black/5 opacity-70 hover:opacity-100 transition-all text-amber-500 cursor-pointer"
                          title={isCurrentFavorite() ? "Starred!" : "Star item / Save in Phrasebook"}
                          id="favorite-btn"
                        >
                          <Star className={`w-4 h-4 ${isCurrentFavorite() ? "fill-amber-500" : "opacity-50"}`} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Error notifications container */}
            {error && (
              <div className="p-4 bg-rose-500/10 border-l-4 border-rose-500 text-rose-500 rounded-lg flex items-start gap-2 text-sm leading-relaxed" id="error-banner">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold">Execution Error:</span> {error}
                </div>
              </div>
            )}

            {/* Smart metadata results grids */}
            {translationResult && !isLoading && (
              <div className="space-y-6">
                {/* Idioms and unique slangs */}
                <IdiomBreakdown items={translationResult.idioms || []} config={activeConfig} />

                {/* Dictionary definitions and word details */}
                <GrammarBreakdown items={translationResult.wordBreakdown || []} config={activeConfig} />

                {/* Alternative stylistic suggestions */}
                <AlternativeSuggestions
                  items={translationResult.alternatives || []}
                  config={activeConfig}
                  onApplyAlternative={adoptAlternativeTranslation}
                />
              </div>
            )}
          </main>

          {/* Sidebar / Settings Control matrix Column */}
          <aside className="lg:col-span-4 flex flex-col gap-6" id="settings-sidebar">
            {/* Theme atmosphere selection panel */}
            <ThemeSelector
              currentTheme={currentTheme}
              onChangeTheme={handleThemeChange}
              config={activeConfig}
            />

            {/* Tone selector */}
            <div className={`p-5 rounded-xl ${activeConfig.cardClass} ${activeConfig.glowClass || ""}`}>
              <h3 className="text-sm font-bold font-display uppercase tracking-wider mb-4 flex items-center gap-1.5 text-inherit">
                <Globe className="w-4 h-4" />
                Linguistic Nuance Tone
              </h3>
              <div className="space-y-2" id="tone-radio-group">
                {TONES.map((tone) => {
                  const isActive = selectedTone === tone.value;
                  return (
                    <button
                      key={tone.value}
                      onClick={() => setSelectedTone(tone.value)}
                      className={`w-full p-2.5 rounded-lg text-left transition-all ${
                        isActive
                          ? "bg-indigo-500/15 border-l-4 border-indigo-500 pl-3 font-semibold text-inherit"
                          : "hover:bg-black/5 opacity-70 hover:opacity-100 pl-2 text-inherit"
                      }`}
                      id={`tone-option-${tone.value}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold">{tone.label}</span>
                        {isActive && (
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        )}
                      </div>
                      <p className="text-[10px] opacity-60 leading-normal mt-0.5 pr-2">
                        {tone.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* History and phrasebook management */}
            <HistoryList
              items={history}
              savedPhrases={savedPhrases}
              config={activeConfig}
              onSelect={handleSelectHistoryItem}
              onToggleFavorite={handleToggleFavoriteItem}
              onClearHistory={handleClearHistory}
              onDelete={handleDeleteHistoryItem}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
