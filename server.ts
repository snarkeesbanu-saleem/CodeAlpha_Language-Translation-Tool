/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

import fs from "fs";
dotenv.config();

const LOG_FILE = path.join(process.cwd(), "server_debug.log");
function logDebug(message: string) {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] ${message}\n`;
  console.log(logLine.trim());
  try {
    fs.appendFileSync(LOG_FILE, logLine);
  } catch (err) {
    // ignore
  }
}

// Clear log on boot
try {
  fs.writeFileSync(LOG_FILE, `Server debugging log initialized at ${new Date().toISOString()}\n`);
} catch (err) {}

logDebug("Starting Express server configuration...");
// Check which env variables are set (without leaking security values)
logDebug(`Active Environment: NODE_ENV=${process.env.NODE_ENV}`);
logDebug(`GEMINI_API_KEY is present: ${!!process.env.GEMINI_API_KEY}`);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

// Request logging middleware
app.use((req, res, next) => {
  logDebug(`Request received: ${req.method} ${req.url}`);
  next();
});

// Lazy initializer for GoogleGenAI to prevent boot crashes when key isn't provided yet
let aiClient: GoogleGenAI | null = null;
function getAiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is not defined. Please add it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API endpoint for Translation using advanced model
app.post("/api/translate", async (req, res) => {
  logDebug(`[ROUTE] POST /api/translate starting. Body: ${JSON.stringify(req.body)}`);
  try {
    const { text, sourceLanguage, targetLanguage, tone } = req.body;

    if (!text || !text.trim()) {
      logDebug("[ROUTE] POST /api/translate Bad Request: No input text");
      return res.status(400).json({ error: "No input text provided." });
    }

    const ai = getAiClient();
    logDebug("[ROUTE] POST /api/translate: Initialized AI client, calling Gemini models...");

    const systemInstruction = `You are a high-fidelity, nuance-aware multi-lingual translator. 
Your task is to translate the user text accurately from the source language to the target language with the specified tone.

Tone definitions:
- "standard": Balanced, natural, grammatically sound translation.
- "formal": Respectful, polite, suited for business, academic or official writing.
- "casual": Friendly, relaxed, natural for peers, friends or social media.
- "slang": Colloquial, includes local slang/idioms matching current speech patterns where available.
- "professional": Corporate, precise, using industry-appropriate jargon and stylistic clarity.
- "poetic": Artistic, focused on flow, rhythm, metaphor, beauty and evocative word choices.
- "simple": Extremely straightforward, uses simple vocabulary appropriate for explaining a concept to a child.

Instructions:
1. Detect the original language if sourceLanguage is "Auto-Detect". Set 'sourceLanguageDetected' to the English name of the detected language (e.g., "Spanish", "Japanese"). Otherwise, use the user's provided sourceLanguage.
2. Provide 'translatedText' exactly in the targetLanguage with the precise tone specified.
3. Provide a 'pronunciation' guide/transcription for the translated text to help users say it out loud (e.g., return Romaji for Japanese, Pinyin for Chinese, or a general phonetics system/phonetic spelling for other non-English languages). If targetLanguage is English, provide any phonetic guidance that helps second-language speakers if they are struggling.
4. "idioms": If the source text or translated text contains idioms, metaphors, slang, or unique cultural references, list them. Explain their raw meaning and general cultural context in English. If none are present, return an empty array.
5. "wordBreakdown": Analyze 2 to 4 key words or tokens from the translation. Specify their part of speech and English meaning. This serves as a mini glossary to aid learning.
6. "alternatives": Provide 2 to 3 alternative translations in OTHER complementary tones (e.g., if formal was requested, give a casual alternative, etc.), explaining in English what makes them stylistically different.`;

    const prompt = `Translate this text:
---
Source Text: "${text}"
Requested Tone: "${tone || "standard"}"
Source Language Specified: "${sourceLanguage || "Auto-Detect"}"
Target Language Specified: "${targetLanguage}"
---`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            translatedText: {
              type: Type.STRING,
              description: "The primary translated text in the target language.",
            },
            sourceLanguageDetected: {
              type: Type.STRING,
              description: "The English name of the detected source language (e.g. Spanish, German).",
            },
            pronunciation: {
              type: Type.STRING,
              description: "Phonetic spelling, romaji, pinyin or sounding guide of the translated text.",
            },
            idioms: {
              type: Type.ARRAY,
              description: "Any idioms, slang, or unique grammatical metaphors used in translation.",
              items: {
                type: Type.OBJECT,
                properties: {
                  original: {
                    type: Type.STRING,
                    description: "The idiom in the target language (or source language if relevant).",
                  },
                  meaning: {
                    type: Type.STRING,
                    description: "Literal or directly equivalent meaning of the idiom in English.",
                  },
                  culturalCtx: {
                    type: Type.STRING,
                    description: "Explanation of why or when this idiom/metaphor is spoken.",
                  },
                },
                required: ["original", "meaning", "culturalCtx"],
              },
            },
            wordBreakdown: {
              type: Type.ARRAY,
              description: "A compact dictionary breakdown of 2-4 key words or phrases.",
              items: {
                type: Type.OBJECT,
                properties: {
                  word: {
                    type: Type.STRING,
                    description: "The target-language word or phrase analyzed.",
                  },
                  partOfSpeech: {
                    type: Type.STRING,
                    description: "Noun, Verb, Adjective, Particle, Expression, etc.",
                  },
                  meaning: {
                    type: Type.STRING,
                    description: "Compact English definition or translation.",
                  },
                },
                required: ["word", "partOfSpeech", "meaning"],
              },
            },
            alternatives: {
              type: Type.ARRAY,
              description: "Alternative translations in differing tones/contexts.",
              items: {
                type: Type.OBJECT,
                properties: {
                  text: {
                    type: Type.STRING,
                    description: "The translated text reflecting the alternative tone.",
                  },
                  tone: {
                    type: Type.STRING,
                    description: "Name of the alternative tone (e.g. casual, professional, formal).",
                  },
                  difference: {
                    type: Type.STRING,
                    description: "A 1-sentence descriptor in English of how the vibe holds.",
                  },
                },
                required: ["text", "tone", "difference"],
              },
            },
          },
          required: ["translatedText", "sourceLanguageDetected"],
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response returned from the translation engine.");
    }

    const resultData = JSON.parse(responseText.trim());
    logDebug("[ROUTE] POST /api/translate completed successfully with parsed results.");
    return res.json(resultData);
  } catch (error: any) {
    logDebug(`[ROUTE ERROR] POST /api/translate failed: ${error.stack || error.message}`);
    return res.status(500).json({
      error: error.message || "An unexpected error occurred during translation.",
    });
  }
});

// Configure Vite or Static Assets based on environment
async function setupServer() {
  logDebug(`[SETUP] Configuring Vite & Express routing...`);
  if (process.env.NODE_ENV !== "production") {
    logDebug("[SETUP] Starting dev server using Vite middleware Mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    logDebug("[SETUP] Vite dev middleware loaded successfully.");
  } else {
    logDebug("[SETUP] Production setting detected. Loading dist static asset mapping...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    logDebug("[SETUP] Static file mapped.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    logDebug(`[LISTEN] Server successfully listening at http://0.0.0.0:${PORT}`);
  });
}

setupServer().catch((err) => {
  logDebug(`[FATAL BOOT ERROR]: ${err.stack || err.message}`);
  process.exit(1);
});
