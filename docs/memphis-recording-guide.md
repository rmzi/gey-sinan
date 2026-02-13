# Memphis Recording Station - Operator Manual

## Overview

This guide covers setting up and running the Gey Sinan recording station at the North American Harari community gathering in Memphis. The goal is to capture native speaker pronunciations for the Gey Sinan language learning app.

## Equipment

### Primary Setup
- **Laptop/tablet** with Chrome or Firefox (recording station runs as a web app)
- **USB condenser microphone** (cardioid pattern recommended)
- **Pop filter** — critical for Harari ejective consonants (t', k', ch', etc.) which produce strong plosive air
- **Headphones** for the operator to monitor audio quality
- **USB-C hub** if the device has limited ports

### Backup
- **Portable USB recorder** (Zoom H1n or similar) — records directly to SD card
- **Extra SD cards** and a card reader for transfer

### Environment
- Find a **quiet corner** away from main gathering noise
- Use a tablecloth or soft surface to reduce table reflections
- Position speaker 6-8 inches from the microphone

### Signage
- Print QR codes linking to the recording station URL
- Signs in **English** and **Ge'ez script**: "ጌይ ሲናን — Help preserve our language! Record your voice."
- Have a few printed cards explaining the project for curious visitors

## App Setup

### Before the Event
1. Open the app on the recording device and navigate to `/record/setup`
2. Test the recording flow end-to-end with your own voice
3. Verify microphone access works (browser will prompt for permission)
4. The app works **fully offline** — all recordings are stored in the browser's IndexedDB
5. Clear browser cache if storage is low; each recording uses ~50-200KB

### At the Venue
1. Connect to venue WiFi if available (not required for recording)
2. Open the app and keep the browser tab active
3. Do NOT close the browser tab during the event — this is where recordings are stored

## Recording Workflow

### Step 1: Speaker Registration (`/record/setup`)

1. **Operator** fills in the speaker's information:
   - Name
   - Age range
   - Gender
   - Fluency level (native / fluent / partial / heritage)
   - Dialect notes (optional — e.g., "grew up in Harar old city" or "parents from Dire Dawa")

2. **Speaker** reviews and agrees to the consent form:
   - Use in app (required)
   - Language preservation (required)
   - ML training (optional)
   - Attribution: by name or anonymous

3. Click **Start Recording** — this takes you to the recording interface

### Step 2: Recording Session (`/record/speak`)

1. The screen shows a word in large text with its English translation
2. The **speaker** can choose their preferred script (Latin, Ge'ez, or Arabic) using the toggle at top
3. Recording flow for each word:
   - Speaker reads and understands the word
   - Tap the **red record button** to start
   - Speaker says the word clearly, at natural pace
   - Tap **stop** when done
   - **Listen back** using the audio player
   - Choose: **Accept** (saves and advances), **Re-record** (try again), or **Skip** (move on)

4. The system monitors audio quality:
   - **Too quiet** warning: speaker should move closer or speak louder
   - **Clipping** warning: speaker should move back or speak softer

### Step 3: Export (`/record/export`)

- Navigate to `/record/export` to see recording statistics
- **Export All Recordings** downloads a binary archive with all audio + metadata
- **Export Manifest Only** downloads a JSON summary without audio (useful for quick backup)
- Export every ~100 recordings as a safety measure

## Quality Tips

### For the Speaker
- Speak at a **natural pace** — not too slow, not rushed
- Say the word **once clearly**, not multiple times
- Wait a beat after tapping record before speaking (avoids clipping the start)
- For **ejective consonants** (t', k', ch', q), the pop filter helps, but angling slightly off-axis also reduces pops

### For the Operator
- Monitor the waveform visualization — it should show clear peaks without flattopping
- Ideal recording duration: **1-3 seconds** per word, **3-8 seconds** per phrase
- If background noise increases (music, crowd), pause recording and wait
- Keep the mic position consistent between speakers

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Mic not detected | Check USB connection. Try a different port. Refresh the browser page. Check browser permissions (Settings → Privacy → Microphone). |
| No sound in recording | Ensure the correct microphone is selected in browser (click address bar → site settings). |
| Storage full warning | Export current recordings immediately. Clear old exports from Downloads. If IndexedDB is full, export and then clear browser data for the site. |
| Recording too quiet | Move speaker closer to mic. Check system volume input level. |
| Recording clips/distorts | Move speaker back. Reduce system input gain. Add pop filter if not already using one. |
| Browser tab closed | Recordings are saved in IndexedDB and persist. Reopen the app and continue. The active speaker session is lost — register the speaker again. |
| App won't load offline | Ensure the service worker was cached during a previous online visit. |

## End of Day Checklist

1. **Export all recordings** from `/record/export`
2. **Export the manifest** separately as JSON backup
3. Copy exports to **two separate devices** (USB drive + cloud if WiFi available)
4. Note the total count: speakers registered, words recorded, any skipped
5. Check manifest JSON to verify speaker consent timestamps are present
6. Power down equipment, secure the microphone

## Speaker Talking Points

When inviting people to record:
- "We're building an app to help Harari kids learn our language"
- "It takes about 5-10 minutes to record 50 words"
- "Your voice will help the next generation hear real Harari pronunciation"
- "Everything is stored locally and you control how you're credited"
