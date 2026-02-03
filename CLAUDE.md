# Gey Sinan - Harari Language Learning App

## CRITICAL: This is a HARARI app, NOT Amharic

**Harari (ሐረሪ / حراري) is a distinct language from Amharic.** They are both Ethiopian Semitic languages but are NOT the same.

### Key Facts About Harari
- **Speakers**: ~25,000 people
- **Location**: City of Harar, southeastern Ethiopia + diaspora
- **ISO 639-3 code**: `har`
- **Native name**: Gēy Sinan (ጌይ ሲናን) meaning "language of the city"
- **Status**: Endangered/vulnerable language

### Harari vs Amharic
| Harari | Amharic |
|--------|---------|
| ~25,000 speakers | ~57 million speakers |
| Spoken in Harar | National language of Ethiopia |
| South Ethio-Semitic | South Ethio-Semitic (different branch) |
| Closer to Gurage languages | Closer to Argobba |

### Writing Systems
Harari uses THREE scripts (all must be supported):
1. **Latin** - Popular with diaspora, developed 1992 in Melbourne
2. **Ethiopic (Ge'ez)** - Official in Ethiopia since 1999
3. **Arabic** - Historical/traditional script

## Vocabulary Resources

When adding or verifying vocabulary, use these authoritative sources:

1. **Leslau's Etymological Dictionary** (~2,200 roots)
   - PDF: https://everythingharar.com/wp-content/uploads/2017/02/LesluHarariDictionary145.pdf

2. **Harfi Kitab** (Alphabet book with vocabulary)
   - PDF: https://harar.city/Content/assets/pdf/Harfi_Kitab.pdf

3. **Breakdown of Harari Grammar**
   - PDF: https://everythingharar.com/wp-content/uploads/2017/02/BreakdownHarariGrammerEH.pdf

4. **Glosbe Harari-English Dictionary**
   - https://glosbe.com/har/en

5. **Local research docs**: See `docs/` folder for compiled research

## App Name Etymology

"Gey Sinan" (ጌይ ሲናን) means "language of the city" in Harari:
- **Gēy** (ጌይ) = Harar / the city / home
- **Sinan** (ሲናን) = language

The Harari people refer to their city as "Gēy" and themselves as "Gēy Usu'" (people of the city).

## Target Audience

Harari diaspora youth reconnecting with their ancestral language. Many are:
- Born outside Ethiopia
- May have heard Harari from grandparents but don't speak it
- Want to connect with their heritage
- Need accessible, modern learning tools

## Dictionary & Vocabulary

### Harari Dictionary: `harari-dictionary.csv`

The main dictionary contains **4,629 unique Harari words** extracted from Wolf Leslau's Etymological Dictionary of Harari (1963). This is the most comprehensive Harari dictionary available.

| Column | Description |
|--------|-------------|
| `harari_latin` | Latin script spelling |
| `english` | English translation |
| `category` | Word category (noun, verb, adjective, etc.) |
| `notes` | Etymological notes (Arabic, Cushitic origins, etc.) |

### App Vocabulary: `vocabulary.csv`

The app uses a curated subset of vocabulary for lessons, tracked in `vocabulary.csv`:

| Column | Description |
|--------|-------------|
| `id` | Unique identifier |
| `harari_latin` | Latin script spelling |
| `harari_ethiopic` | Ge'ez script |
| `harari_arabic` | Arabic script |
| `english` | English translation |
| `category` | Word category (numbers, family, etc.) |
| `source` | Where the word came from (Burton 1894, Leslau, etc.) |
| `verified` | `pending`, `verified`, `rejected` |
| `audio_recorded` | `yes` or `no` |
| `notes` | Any additional notes |

### Dictionary Sources

1. **Leslau's Etymological Dictionary** (4,629 entries in `harari-dictionary.csv`)
   - Extracted via OCR from 86 dictionary pages
   - Includes etymological notes (Arabic, Cushitic, Semitic origins)
   - Categories: 2,288 nouns, 1,090 verbs, 320 adjectives, and more

2. **Burton 1894** (154 entries in `vocabulary.csv`)
   - Historical baseline vocabulary
   - Needs modern verification

### Validation Process

1. **Native speaker reviews** dictionary entries
2. Mark `verified` column as `verified` or `rejected`
3. Add corrections/notes as needed
4. Run script to generate `words.json` from verified entries only
5. Record audio for verified words

### Current Status

- **4,629 words** from Leslau's dictionary ready for verification
- **154 words** from Burton 1894 as baseline (needs modern verification)
- Arabic loanwords (Islamic phrases) likely stable
- Native Harari words need verification - may have shifted since 1894

## Development Notes

- **DO NOT** use Amharic vocabulary - Harari is a distinct language
- All vocabulary must be verified against Leslau's dictionary or native speakers
- Include all three scripts for every word
- Audio should be from native Harari speakers (not Amharic speakers)
- The app fills a gap: there are no modern Harari learning apps available
- Burton's 1894 vocabulary is historical - modern usage may differ
