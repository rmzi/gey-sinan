# Curriculum Design

## Philosophy

Gey Sinan's curriculum is designed for a specific learner: diaspora Harari youth who are **receptive bilinguals** — they can understand Harari when spoken by family but struggle to produce it themselves. This shapes every design decision, from word selection to exercise progression.

The goal is not academic fluency but **functional reconnection**: being able to greet elders properly, navigate Harar on a visit, participate in family conversations, and feel confident using the language.

## Tier System

### Tier 1: Survival Vocabulary (0-300 words)
**Status: Active (current app scope)**

Core vocabulary for basic communication:
- Greetings and Islamic phrases (salaam, bismillah, insha'allah)
- Family terms (critical for diaspora — these are the words heard most)
- Numbers 1-100
- Colors and basic descriptions
- Body parts
- Essential food and drink
- Pronouns and basic verbs
- Home and place vocabulary
- Market and shopping essentials
- Emotions and character descriptions

### Tier 2: Functional Conversation (300-600 words)
**Status: Planned (post-Memphis)**

Vocabulary for sustained interaction:
- Expanded verbs with basic conjugation patterns
- Time expressions and days
- Weather and nature
- Directions and spatial terms
- Social situations (introductions, hospitality)
- Phone conversation vocabulary
- Common phrases and idioms

### Tier 3: Intermediate Fluency (600-1,000 words)
**Status: Roadmap**

- Verb conjugation classes (Harari has complex morphology)
- Proverbs and cultural expressions
- Religious vocabulary
- Traditional crafts and cultural practices
- Extended descriptions and storytelling

### Tier 4: Advanced Reference (1,000+ words)
**Status: Aspirational**

- Literary and formal vocabulary
- Specialized terms (medicine, law, trade)
- Historical and archaic forms
- Full dictionary integration

## Word Selection Criteria

Words are selected from Leslau's 4,629-entry Etymological Dictionary of Harari using these priorities:

### 1. Swadesh List Basics
Universal core vocabulary that every language learner needs. Cross-referenced against the Swadesh 207-word list to ensure coverage.

### 2. Diaspora Relevance
Words needed for the specific scenarios diaspora youth face:
- **Visiting Harar**: directions, market vocabulary, place names
- **Phone calls with grandparents**: greetings, family terms, wellbeing phrases
- **Community gatherings**: social vocabulary, food terms, religious phrases
- **Identity expression**: "I am Harari," cultural terms

### 3. Cultural Markers
Harari-specific vocabulary that carries cultural weight:
- Traditional foods (zurbyan, kuskus, ful)
- Islamic phrases used in daily Harari speech
- Harar-specific place vocabulary
- Cultural practices and celebrations

### 4. Verb Expansion
Harari has ~1,090 verbs in the dictionary. Prioritized by frequency of use in daily speech, starting with the most concrete and physical (eat, go, come, see) and expanding to abstract (know, want, think).

### 5. Receptive-to-Productive Bridge
Words the target learner already recognizes aurally but cannot produce. These get special treatment: the app shows the word in writing (all 3 scripts), plays audio, then asks the learner to type or identify it — bridging comprehension to production.

## Three-Script Approach

Harari is unique among Ethiopian languages in its historical use of three writing systems:

| Script | Context | Importance |
|--------|---------|------------|
| **Latin** | Digital communication, diaspora texting | Most accessible for learners |
| **Ge'ez (Ethiopic)** | Formal writing, Ethiopian context | Connects to broader Ethiopian identity |
| **Arabic** | Historical manuscripts, Islamic context | Reflects Harar's Muslim heritage |

The app displays all three scripts for every word, with a user-selectable default. This matters because:
- Diaspora youth may encounter Harari written in any of these scripts
- Script recognition itself is a learning objective
- The `script_matching` exercise type leverages this multi-script reality

## Exercise Progression

Exercises are ordered from recognition to production:

1. **Multiple Choice** — See Harari word, pick English meaning (pure recognition)
2. **Matching** — Connect Harari words to English meanings (recognition with distraction)
3. **Script Matching** — See Latin form, identify correct Ge'ez script (cross-script recognition)
4. **Production** — See English, type the Harari Latin transliteration (active production)
5. **Listening** — Hear audio, identify the word (planned, requires recorded audio)

This progression mirrors the receptive-to-productive journey: from "I recognize this" to "I can produce this."

## Spaced Repetition

The app uses the SM-2 algorithm for long-term retention:

- **Quality ratings**: 0 (blackout) to 5 (perfect recall)
- **Interval growth**: 1 day → 6 days → exponential based on ease factor
- **Mastery threshold**: 3+ successful reviews with 21+ day interval
- **Minimum ease factor**: 1.3 (prevents intervals from collapsing)

Words are reviewed across sessions, not just within lessons. The home screen shows words due for review, encouraging daily practice.

## Sources

| Source | Entries | Coverage |
|--------|---------|----------|
| Wolf Leslau's Etymological Dictionary | 4,629 | Comprehensive linguistic reference |
| Richard Burton (1894) | ~150 | Historical spellings, pronunciation notes |
| Glosbe | ~100 | Modern usage, community-contributed |
| harar.city | ~10 | Cultural and identity vocabulary |

All entries are tagged with their source for verification tracking. Community verification at Memphis and beyond will mark entries as `verified`.
