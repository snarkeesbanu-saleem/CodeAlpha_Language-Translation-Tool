import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI, Type } from "@google/genai";

// Lazy initializer for GoogleGenAI to ensure clean handling if key is added later
let aiClient: GoogleGenAI | null = null;
function getAiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is not defined. Please add it to your environment variables on Vercel.");
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Setup CORS Headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { text, sourceLanguage, targetLanguage, tone } = req.body || {};

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "No input text provided." });
    }

    if (!targetLanguage) {
      return res.status(400).json({ error: "No target language provided." });
    }

    const ai = getAiClient();

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

    const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
    let lastError: any = null;
    let response = null;

    const config = {
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
    };

    for (const modelName of modelsToTry) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config,
        });
        break;
      } catch (err: any) {
        lastError = err;
        const errStr = err.message || "";
        const isTransient =
          errStr.includes("503") ||
          errStr.includes("UNAVAILABLE") ||
          errStr.includes("ResourceExhausted") ||
          errStr.includes("high demand") ||
          errStr.includes("Overloaded");
        if (!isTransient) {
          break;
        }
      }
    }

    if (!response) {
      throw lastError || new Error("All translation model options failed.");
    }

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response returned from the translation engine.");
    }

    const resultData = JSON.parse(responseText.trim());
    return res.status(200).json(resultData);
  } catch (error: any) {
    let cleanMessage = error.message || "An unexpected error occurred during translation.";
    try {
      const idx = cleanMessage.indexOf("{");
      if (idx !== -1) {
        const jsonPortion = cleanMessage.substring(idx);
        const parsed = JSON.parse(jsonPortion);
        if (parsed.error && parsed.error.message) {
          cleanMessage = parsed.error.message;
        }
      }
    } catch (_) {
      // safe fallback
    }

    return res.status(500).json({
      error: cleanMessage,
    });
  }
}
