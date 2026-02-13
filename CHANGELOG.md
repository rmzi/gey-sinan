# Changelog

## [0.2.0] - 2026-02-13T07:12:55+00:00

### Added
- Recording station for capturing native speaker pronunciations at community events
  - Speaker registration with consent form (`/record/setup`)
  - Recording interface with real-time waveform visualization (`/record/speak`)
  - Export page with stats and full archive download (`/record/export`)
  - IndexedDB storage for fully offline operation
- About page with project mission, 3-script explanation, and community CTA (`/about`)
- New exercise types: script matching (Latin → Ge'ez) and production (English → type Harari)
- 5 new curriculum units (11-15): Daily Actions, Food & Cooking, Around the House, At the Market, Emotions & Descriptions
- 65+ new vocabulary entries from Leslau's dictionary (237 total, up from 172)
- 15 new lessons (30 total, up from 15) with script_matching and production exercises
- PWA icons (192x192, 512x512) with Ge'ez "ጌ" character on emerald background
- Phrases dataset (`phrases.csv`) with 30 target phrases for recording station
- Priority word selection script (`scripts/select-priority-words.js`)
- Documentation: Memphis recording guide, curriculum design, audio processing pipeline, speech model roadmap, community contributions guide
- VERSION file and CHANGELOG

### Fixed
- Settings page etymology: changed "our home" to "language of the city"

### Changed
- Expanded ExerciseType to include `script_matching` and `production`
- Lesson page refactored to support multiple exercise types with type-specific UI
- Build script updated with new category difficulty mappings
- Home page now shows recording station link in header

## [0.1.0] - 2026-02-12

### Added
- Initial Next.js PWA scaffold with Tailwind CSS
- SM-2 spaced repetition algorithm
- 172 curated vocabulary entries with 3-script support (Latin, Ge'ez, Arabic)
- 15 lessons across 10 units
- Flashcard, multiple choice, and matching exercises
- Zustand state management with localStorage persistence
- Script toggle (Latin/Ge'ez/Arabic)
- Lesson progression with unlock system
- Practice/review session with streak tracking
