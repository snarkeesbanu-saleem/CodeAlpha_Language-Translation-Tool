# Advanced Language Translation Tool

An elegant, feature-rich, full-stack translation application designed to preserve linguistic nuance, break down vocabulary, and adapt to custom stylistic tones. Built using React, TypeScript, Express, and Tailwind CSS.

## 🌟 Key Features

- **Atmospheric Visual Themes**: Switch dynamically between distinct high-quality visual experiences:
  - ✨ **Glass Clarity**: A pristine modern white and indigo glassmorphism layout.
  - 📖 **Vintage Archive**: Warm paper parchment with classic coffee tints and elegant serif typography.
  - ⚡ **Neon Grid**: A futuristic cyberpunk black background highlighted by vibrant cyan and pink glow matrices.
  - 🌌 **Stardust Void**: An immersive deep-space canvas carrying stars and premium violet nebulas.
- **Linguistic Vibe & Tone Registers**: Tailor translations to match real-world context with one click:
  - *Standard*: Natural and everyday accurate.
  - *Formal/Polite*: Respectful dialogue for commercial or professional settings.
  - *Casual/Friendly*: Relaxed phrasing for peer chats and social channels.
  - *Colloquial/Slang*: Infused with active regional phrases and expressions.
  - *Professional*: Precision corporate wording structure.
  - *Poetic/Literary*: Evocative, rhythmic, and beautifully framed.
  - *Explain to a Child*: Highly accessible, simplified vocabulary.
- **Cultural Context & Idioms Finder**: Automatically detects, translates, and explains the cultural significance behind idioms, metaphors, and slang found in the input.
- **Lexicon & Grammar Breakdown**: Extracts and identifies key verbs, nouns, and particles in a compact interactive dictionary glossary.
- **Vibe Checks & Alternatives**: Suggests multiple variations of your translation under differing hypothetical speech registers for instant comparison.
- **Speech Synthesis (TTS) & Phonetics**: Play verbal pronunciations natively in the browser, and read structural phonetic spelling cards.
- **Speech recognition (STT)**: Use your microphone to feed source passages using voice-to-text.
- **Document Imports**: Drag and drop or browse plain text (`.txt`) and markdown (`.md`) files to load long-form material instantly.
- **Persistent History & Favorites**: Bookmark favorite translations into a dedicated Phrasebook saved securely to your local browser storage.

---

## 🎨 Technology Stack

- **Frontend**: React (v19), TypeScript, Tailwind CSS, Lucide Icons, Motion Animations
- **Backend Service**: Express Server acting as a secured API proxy to prevent leaking client secrets
- **Module Bundler**: Vite Development Server & Custom Esbuild Backend Compiler

---

## 📦 Getting Started

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **Nihilo/Neural API Key** set as a system environment variable

### Environment Setup

Create a `.env` file at the root level matching this template:

```env
# Server Secret Keys
GEMINI_API_KEY="YOUR_SECURE_API_KEY"

# Public Hosting Reference
APP_URL="http://localhost:3000"
```

### Installation & Run

1. Install project packages:
   ```bash
   npm install
   ```

2. Run the application in local development mode:
   ```bash
   npm run dev
   ```
   *The server maps to standard port `3000` via [http://localhost:3000](http://localhost:3000).*

3. Build the application for production deployment:
   ```bash
   npm run build
   ```

4. Start Compiled Production Server:
   ```bash
   npm run start
   ```

---

## 📂 Folder Layout Architecture

```text
├── server.ts                 # Full-stack backend entry-point
├── metadata.json             # App metadata specifications
├── src/
│   ├── main.tsx              # Browser DOM renderer
│   ├── App.tsx               # Main dashboard control logic
│   ├── index.css             # CSS Imports & customized theme rules
│   ├── types.ts              # TypeScript interface contracts
│   ├── data.ts               # Constant dictionary lists & theme configurations
│   └── components/
│       ├── ThemeSelector.tsx # Visual background controller
│       ├── GrammarBreakdown.tsx # Lexical micro-dictionary renderers
│       ├── IdiomBreakdown.tsx   # Slang and cultural context card grid
│       ├── AlternativeSuggestions.tsx # Alternative vibe registers selectors
│       └── HistoryList.tsx   # Recent runs and favorited phrasebook list
```
