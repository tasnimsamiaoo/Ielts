# Bilingual English-Bangla Reading Assistant & Lexicon

An interactive bilingual reading support system designed for Bengali-speaking IELTS candidates. Enables instant double-click and text-selection popovers that provide precise Bengali translations (বাংলা অর্থ), phonetic pronunciation guides, IELTS Academic Word List contextual definitions, and bilingual vocabulary notebook integration—without sacrificing English immersion.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The architectural design directly addresses your confirmed preferences:

- **Confirmed Translation Mode**: **Word and phrase instant popover with Bangla meaning (বাংলা অর্থ ও উচ্চারণ)**. When candidates double-click any word or select a phrase in the reading passage, an interactive card reveals the exact Bengali definition, pronunciation, CEFR level, and Cambridge context.
- **Confirmed Trigger Mechanism**: **Selection tooltip and double-click dictionary**. Retains official CDT immersion while providing friction-free bilingual assistance on demand.
- **Toolbar "Bangla Mode" (বাংলা মোড) Toggle**: An optional toolbar switch in the Reading Room that highlights academic terms and allows toggling bilingual hints.
- **Offline & Low-Latency Support**: Pre-populated with verified Bengali translations for all Cambridge Academic passage vocabulary, backed by an on-demand server translation fallback for novel words.

---

## 1. Overview & Core Concept

- **What It Does**: Bridges the comprehension gap for Bengali candidates tackling dense academic IELTS passages (e.g. archaeology, microclimates, renewable energy) by providing contextual Bengali meanings alongside formal English definitions on double-click or text selection.
- **Target Audience**: Bengali-speaking students and professionals aiming for Band 7.0–8.5+ who want to master academic terminology and eliminate misinterpretations.
- **Key Value**: Protects immersion (avoids the passive crutch of full-page machine translations) while guaranteeing comprehension of crucial qualifying words and complex collocations.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Double-Click or Text Selection in Reading Passage**:
   - Candidate double-clicks a word (e.g. *"microclimate"*, *"monumental"*, *"stratification"*) or highlights an idiom.
   - An interactive popover card immediately appears anchored above the selection.

2. **Bilingual Popover Card (English + বাংলা)**:
   - **Header**: Word title, British phonetic transcription (`/ˈmaɪ.krəʊˌklaɪ.mət/`), and audio speaker button.
   - **Bangla Core Meaning (বাংলা অর্থ)**: Highlighted in clean emerald/cyan typography:
     - `ক্ষুদ্র আবহাওয়া বা স্থানীয় জলবায়ু`
   - **Bengali Pronunciation Guide (বাংলা উচ্চারণ)**:
     - `মাইক্রোক্লাইমেট`
   - **Cambridge Academic Definition & English Example**:
     - English CEFR rating (e.g. `C1 Academic`), parts of speech, and passage citation.
   - **Bangla Contextual Explanation (বাংলা প্রেক্ষাপট)**:
     - How the term functions in the Andean agriculture context.
   - **One-Click Actions**:
     - "Listen Pronunciation" (British English audio)
     - "Save to Vocabulary Notebook (+10 XP)" with Bangla translation saved for future review.

3. **Reading Room Toolbar "বাংলা মোড" Toggle**:
   - A dedicated toggle button in the reading header: **`বাংলা (Bangla Assist)`**.
   - When active, academic terms in the text display subtle dotted underlines for one-tap definition access.

4. **Bilingual Vocabulary Notebook**:
   - The saved vocabulary drawer displays both the English word and its Bengali meaning side-by-side, with search and export capabilities.

### Visual Identity & Theme

- **Palette**: Clean slate background, official test navy, deep emerald accent for Bangla definitions (`#059669` light / `#10B981` dark), and violet CEFR badge tags.
- **Typography**: Paired display fonts with native Bengali script rendering (`SolaimanLipi`, `Hind Siliguri`, `system-ui`) for legibility.
- **Anti-Slop Restraint**: Unboxed metadata, zero decorative emoji clutter, adhering strictly to Section 1 of the Frontend Design Constitution.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Word & Phrase Popover vs. Full Passage Translation**
  - *Chosen Approach*: On-demand popover over full passage translation.
  - *Why*: Full-page translation damages IELTS reading performance because candidates read the Bengali translation instead of scanning English keywords; on-demand popovers maintain authentic English reading speed while demystifying difficult vocabulary.
- **Decision 2: Dual Storage (English + Bangla) in Vocabulary Store**
  - *Chosen Approach*: Persist `banglaMeaning` and `banglaPronunciation` directly into `DictionaryEntry` and `localStorage`.
  - *Why*: Allows candidates to review flashcards with Bengali hints offline without repeated lookups.
- **Decision 3: Offline Pre-Translation Dictionary + Server Translation Fallback**
  - *Chosen Approach*: Comprehensive local dictionary of Cambridge passage terms + `/api/ielts/translate/bangla` endpoint.
  - *Why*: Instant 0ms response for all practice passages, with seamless dynamic lookup for arbitrary words.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 Bilingual Reading Assistant Architecture                    │
│                                                                             │
│  ┌─────────────────────────┐          ┌──────────────────────────────────┐  │
│  │ Reading Passage Canvas  │─────────▶│ Double-Click / Range Selection   │  │
│  │ (Text paragraphs A-E)   │          └─────────────────┬────────────────┘  │
│  └─────────────────────────┘                            │                   │
│                                                         ▼                   │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                 Bilingual Lookup Engine (dictionary.ts)               │  │
│  │                                                                       │  │
│  │  1. Check Built-in ACADEMIC_DICTIONARY (with Bangla fields)           │  │
│  │  2. If missing, query /api/ielts/translate/bangla fallback            │  │
│  │  3. Return DictionaryEntry with:                                      │  │
│  │     - word, phonetic, partOfSpeech, cefr, definition                  │  │
│  │     - banglaMeaning (বাংলা অর্থ), banglaPronunciation (উচ্চারণ)        │  │
│  │     - banglaContext (বাংলা ব্যাখ্যা)                                  │  │
│  └────────────────────────────────────┬──────────────────────────────────┘  │
│                                       │                                     │
│  ┌────────────────────────────────────▼───────────────────────────────────┐  │
│  │                 Interactive QuickDefine Tooltip Component              │  │
│  │                                                                        │  │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │  │
│  │  │ microclimate [C1] 🔊                                             │  │  │
│  │  │ বাংলা অর্থ: ক্ষুদ্র আবহাওয়া বা স্থানীয় জলবায়ু                    │  │  │
│  │  │ উচ্চারণ: মাইক্রোক্লাইমেট                                         │  │  │
│  │  │ Definition: The localized climate of a restricted area.          │  │  │
│  │  │ [Save to Bilingual Notebook (+10 XP)]                            │  │  │
│  │  └─────────────────────────────────┬────────────────────────────────┘  │  │
│  │                                    │                                   │  │
│  │  ┌─────────────────────────────────┴────────────────────────────────┐  │  │
│  │  │            Saved Bilingual Vocabulary Notebook Drawer            │  │  │
│  │  │  - Lists saved terms with English + বাংলা meanings side-by-side  │  │  │
│  │  │  - Audio speech synthesis + review export                        │  │  │
│  │  └──────────────────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Entities & Data Mapping

- `DictionaryEntry` extended interface:
  ```ts
  export interface DictionaryEntry {
    word: string;
    phonetic?: string;
    partOfSpeech: string;
    cefr?: 'B1' | 'B2' | 'C1' | 'C2';
    definition: string;
    banglaMeaning?: string;
    banglaPronunciation?: string;
    banglaContext?: string;
    example?: string;
    synonyms?: string[];
    audioUrl?: string;
  }
  ```
