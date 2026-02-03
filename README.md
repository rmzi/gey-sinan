# Gey Sinan

A Harari language learning app for diaspora youth reconnecting with their ancestral language.

**Gey Sinan** (ጌይ ሲናን) means "language of the city" in Harari — the Harari people call their city Harar "Gēy" and themselves "Gēy Usu'" (people of the city).

## About Harari

Harari is an endangered Ethiopian Semitic language spoken by ~25,000 people in the city of Harar and the diaspora. It is **distinct from Amharic** and uses three writing systems: Latin, Ethiopic (Ge'ez), and Arabic.

## Features

- Flashcard system with SM-2 spaced repetition
- Support for Latin, Ethiopic, and Arabic scripts
- Structured lessons with progressive unlocking
- Offline-capable PWA
- 4,629 vocabulary entries from Leslau's Etymological Dictionary

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
├── src/                    # Next.js app source
│   ├── app/               # App router pages
│   ├── components/        # React components
│   ├── data/              # Vocabulary & lesson data
│   ├── lib/               # Utilities (SRS, audio, storage)
│   └── stores/            # Zustand state management
├── scripts/               # Vocabulary workflow scripts
├── docs/                  # Documentation & research
├── harari-dictionary.csv  # 4,629 Harari words from Leslau
└── vocabulary.csv         # Curated app vocabulary
```

## Vocabulary Workflow

1. Edit `vocabulary.csv` to add/verify words
2. Run `node scripts/build-vocabulary.js` to generate `words.json`
3. Run `node scripts/list-audio-files.js` to see needed recordings
4. Upload audio with `node scripts/upload-audio-to-s3.js`

See [docs/CLAUDE.md](docs/CLAUDE.md) for detailed documentation.

## Tech Stack

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Zustand (state management)
- PWA with next-pwa

## License

MIT
