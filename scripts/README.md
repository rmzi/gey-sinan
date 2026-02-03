# Gey Sinan Scripts

## Vocabulary Workflow

### 1. Edit vocabulary.csv

The master vocabulary file is `vocabulary.csv` in the project root. Edit this file to:
- Add new words
- Mark words as `verified` after native speaker review
- Track which audio files have been recorded

### 2. Build words.json

After updating the CSV, regenerate the app's vocabulary:

```bash
# Build with only verified entries
node scripts/build-vocabulary.js

# Build with ALL entries (for testing)
node scripts/build-vocabulary.js --all
```

### 3. List Required Audio Files

Generate a list of audio files needed:

```bash
# Simple list (default)
node scripts/list-audio-files.js

# JSON format (for programmatic use)
node scripts/list-audio-files.js --json

# CSV format (for spreadsheets)
node scripts/list-audio-files.js --csv > audio-needed.csv
```

### 4. Upload Audio to S3

Once you have recorded the audio files, upload them to S3:

```bash
# First, place audio files in public/audio/
# Supported formats: .mp3, .wav, .m4a

# Dry run (see what would be uploaded)
node scripts/upload-audio-to-s3.js --bucket geysinan-assets --dry-run

# Upload to S3
node scripts/upload-audio-to-s3.js --bucket geysinan-assets

# Upload and update words.json with S3 URLs
node scripts/upload-audio-to-s3.js --bucket geysinan-assets --update-words
```

**Prerequisites:**
- AWS CLI installed and configured
- `personal` AWS profile configured (`aws configure --profile personal`)
- S3 bucket created with public read access

### Audio Recording Guidelines

For best results when recording:

1. **Format**: MP3 at 128kbps or higher
2. **Sample rate**: 44.1kHz
3. **Channels**: Mono is fine for speech
4. **Duration**: Keep each word/phrase recording concise (1-3 seconds)
5. **Naming**: Use the exact filename from the list (e.g., `salaam.mp3`)
6. **Quality**: Record in a quiet environment, speak clearly

### File Naming Convention

Files should be named exactly as listed by the script:
- `salaam.mp3` - "salaam" (peace/hello)
- `ab.mp3` - "ab" (father)
- `ahad.mp3` - "ahad" (one)

The filenames are derived from the Latin transliteration of each Harari word.
