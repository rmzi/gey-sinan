# Audio Processing Pipeline

## Overview

After the Memphis recording station captures native speaker pronunciations, the recordings need to be processed before they can be used in the app or for ML training. This document covers the full pipeline from raw export to app-ready audio.

## Stage 1: Import

### From Recording Station Export
The recording station exports a binary archive containing:
- Manifest JSON with speaker metadata and recording references
- Audio blobs (WebM Opus format from browser MediaRecorder)

### Import Script (planned: `scripts/process-recordings.js`)
```bash
node scripts/process-recordings.js --input recordings-2026-02-13.bin --output ./raw-audio/
```

This will:
1. Parse the export format
2. Extract individual audio files: `raw-audio/{speaker-id}/{word-id}.webm`
3. Write the manifest as `raw-audio/manifest.json`
4. Validate all referenced recordings exist

## Stage 2: Format Conversion

Convert from WebM Opus to WAV (for processing) and MP3 (for app delivery).

```bash
# Convert all WebM to WAV (48kHz mono)
for f in raw-audio/**/*.webm; do
  ffmpeg -i "$f" -ar 48000 -ac 1 "${f%.webm}.wav"
done

# Convert WAV to MP3 for app delivery (128kbps)
for f in raw-audio/**/*.wav; do
  ffmpeg -i "$f" -codec:a libmp3lame -b:a 128k "${f%.wav}.mp3"
done
```

## Stage 3: Audio Cleanup

### Trim Silence
Remove leading/trailing silence (threshold: -40dB, minimum duration: 0.1s):
```bash
for f in raw-audio/**/*.wav; do
  sox "$f" "${f%.wav}-trimmed.wav" silence 1 0.1 -40d reverse silence 1 0.1 -40d reverse
done
```

### Normalize Volume
Target -16 LUFS (broadcast standard for speech):
```bash
for f in raw-audio/**/*-trimmed.wav; do
  ffmpeg -i "$f" -af loudnorm=I=-16:TP=-1.5:LRA=11 "${f%-trimmed.wav}-normalized.wav"
done
```

### Noise Reduction
For recordings with background noise, use sox noise profiling:
```bash
# Capture noise profile from a silent segment
sox noisy.wav -n noiseprof noise.prof

# Apply noise reduction
sox noisy.wav cleaned.wav noisered noise.prof 0.21
```

## Stage 4: Quality Validation

### Automated Checks
For each processed recording, verify:
- Duration: 0.5s - 8s (words should be 0.5-3s, phrases 2-8s)
- Peak amplitude: above -20dB (not too quiet)
- No clipping: peak below -0.5dB
- Sample rate: 48kHz
- Channels: mono

### Manual Review
Flag recordings that need human review:
- Multiple speakers detected (crosstalk)
- Unusual duration (too short or too long)
- Low signal-to-noise ratio
- Pronunciation variants that differ significantly from expected

## Stage 5: Multi-Speaker Selection

When multiple speakers record the same word:
1. **Canonical pronunciation**: Select the clearest native speaker recording as the primary
2. **Variants**: Archive all other recordings for ML training
3. **Dialect notes**: Tag any dialectal variations in the manifest

Selection criteria:
- Audio quality (SNR, clarity)
- Speaker fluency level (prefer native speakers)
- Pronunciation naturalness
- Consistency with other recordings from the same speaker

## Stage 6: Storage & Delivery

### Directory Structure
```
audio/
├── app/                    # MP3 files for app delivery
│   ├── words/
│   │   ├── ahad.mp3       # Canonical pronunciation
│   │   ├── kot.mp3
│   │   └── ...
│   └── phrases/
│       ├── salaam-aleykum.mp3
│       └── ...
├── ml/                     # WAV files for ML training
│   ├── speaker-abc/
│   │   ├── ahad.wav
│   │   ├── kot.wav
│   │   └── ...
│   └── speaker-def/
│       └── ...
└── manifest.json           # Complete metadata
```

### S3 Upload
```bash
# Upload app audio to S3
aws s3 sync audio/app/ s3://geysinan-audio/app/ --acl public-read

# Upload ML corpus (private)
aws s3 sync audio/ml/ s3://geysinan-audio/ml/
```

### CDN Configuration
- CloudFront distribution for app audio
- Cache-Control: max-age=31536000 (audio files are immutable)
- App references audio as `/audio/{word-latin}.mp3`

## Stage 7: Phrase Segmentation (Future)

For phrase recordings, use Montreal Forced Aligner to segment into component words:

1. Install MFA: `conda install -c conda-forge montreal-forced-aligner`
2. Prepare transcription files (word-level alignment)
3. Run alignment: `mfa align corpus_dir dictionary acoustic_model output_dir`
4. Extract word segments based on alignment timestamps

This enables:
- Reusing phrase recordings to supplement individual word audio
- Building a larger training corpus from fewer recording sessions
- Validating word boundaries for pronunciation scoring

## Checklist

- [ ] Import recordings from Memphis export
- [ ] Convert WebM → WAV → MP3
- [ ] Trim silence from all recordings
- [ ] Normalize volume to -16 LUFS
- [ ] Apply noise reduction where needed
- [ ] Run automated quality checks
- [ ] Manual review of flagged recordings
- [ ] Select canonical pronunciations for multi-speaker words
- [ ] Upload app audio to S3/CDN
- [ ] Archive ML corpus separately
- [ ] Update app audio URLs in vocabulary data
- [ ] Test audio playback in app
