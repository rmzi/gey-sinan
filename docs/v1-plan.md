# Gey Sinan — Phase 3 Plan (Draft)

## Status: APPROVED — v1 plan for Memphis Harari Festival launch

---

## Critical Context (captured from founder conversation, 2026-03-14)

### Community & Distribution Strategy

Every year there is a gathering of Hararis in North America. The next one will be in Memphis. The founder's uncles and first cousin Samir are the organizers. They have set up dedicated time during the "Harari Festival" day for the founder to reveal Gey Sinan to the community and share it widely on social media.

**Distribution plan:**
- Live reveal at the Harari Festival in Memphis
- Physical flyers with QR codes that attendees can photograph and share via WhatsApp
- WhatsApp viral distribution is the primary channel — the reach within the Harari diaspora community through WhatsApp is substantial
- Social media amplification from the festival event

### Population & Scale Correction

**IMPORTANT**: Previous documentation cited ~25,000 speakers. The founder corrects this — the 2007 figure was approximately **250,000**, not 25,000. The community has grown since then (people have had children). The actual global Harari population is significantly larger than academic sources suggest.

This changes the scale assumptions: 10,000 users is not 40% of the community — it is closer to 3-4%, which is a realistic adoption target for a free community tool with WhatsApp-driven distribution.

### Census / Community Data Vision

The founder's personal goal extends beyond language learning. Gey Sinan, as a free service, creates an opportunity to gather voluntary community census data that does not exist anywhere else:

> "The real goal of this application, personally, is to even get some actual census data about our community. As a free service, I believe I can ask for volunteership in return. Tell me how many speakers live in your household and their level of speaking. That's it. I'll try my best to account for double counting without revealing any personal information, which will be difficult, but based on traffic and location, I believe this will provide an incredibly rich dataset for me to connect our diasporic community."

**Key design requirements for census feature:**
- Lightweight: "How many speakers in your household?" + fluency level per person
- Privacy-preserving: no personal information revealed
- De-duplication strategy needed (difficult without PII — possible approaches: household-level hashing, geographic clustering, optional household codes)
- Traffic and location data as supplementary signals for estimating community size/distribution
- The resulting dataset would be unprecedented — no comprehensive Harari diaspora census exists

### Family Involvement

- The founder's uncles and cousin Samir are festival organizers — direct community leadership connection
- The founder demoed the app to family (dad and uncles) on 2026-03-13 — they learned new words and recognized the project's significance
- Cousin (different from Samir) is taking over visual design, will create Figma boards using SVGs
- Current app UI is the baseline for Figma work

---

## Grill Answers Collected

### Q1: Image Sourcing Strategy
**Answer:** No AI-generated images, no external stock photography.
- **Primary:** Cousin creates SVG illustrations — consistent, culturally appropriate, scalable vector format
- **Secondary:** Community-contributed photos for culturally specific items
- **During development:** Organized placeholders (no AI) tracked in a spreadsheet, to be replaced by cousin's SVGs
- **Phased approach:** Universal categories first (body, colors, numbers), culturally specific later

### Q2: Target Audience
- Primarily diaspora in North America, but global Harari diaspora
- WhatsApp is the distribution channel (viral within community)
- Memphis Harari Festival is the launch event
- 10,000 accounts is the gradual target (approx 3-4% of estimated community of 250K+)
- QR codes on physical flyers for easy sharing

### Q3-Q7: Pending
- Infrastructure budget
- Retention mechanism (anti-Duolingo but what replaces notifications?)
- Monorepo comfort level
- Cousin's design timeline / handoff process
- Recording station cloud upload urgency

---

## Architecture Direction (emerging from research)

### Mobile: React Native / Expo
- Reuses React/TS knowledge and business logic (srs.ts, types.ts, Zustand stores)
- Expo Router mirrors Next.js App Router file-based routing
- EAS Build for iOS/Android CI/CD
- UI must be rewritten (React Native primitives, not DOM/Tailwind)

### Backend: Supabase
- Postgres for user data, progress sync, census data
- Auth with magic links (low friction for non-technical users)
- Storage for recordings, audio, images
- Free tier covers 50K MAU — sufficient for years

### Audio/Images: S3 + CloudFront
- Already partially wired (upload script exists)
- CDN delivery with aggressive caching
- SVG images are tiny — entire illustration set could be under 5MB

### Monorepo Structure (proposed)
```
packages/
  core/          <- types.ts, srs.ts, storage abstractions
  api-client/    <- Supabase client, auth, sync
apps/
  web/           <- Next.js (existing, evolved)
  mobile/        <- Expo / React Native (new)
```

---

## Memphis Festival — Multi-Purpose Event

The Memphis Harari Festival is not just the launch event. It is simultaneously:

1. **App reveal** — Live demo and community distribution via QR codes / WhatsApp
2. **Recording corpus collection** — Many native speakers in one place. The recording station should capture multiple takes of each word from multiple speakers to build a rich audio library of pronunciation variants
3. **Census data seed** — First wave of household speaker data from engaged community members
4. **Community feedback** — Live user testing with the target audience

### Audio Recording Goal at Memphis
- Multiple takes per word from multiple speakers = rich pronunciation library
- This corpus feeds three downstream uses:
  a) **App audio** — Select the clearest canonical pronunciation per word for in-app playback
  b) **Pronunciation variants** — Archive all recordings to represent dialectal variation
  c) **Vocal model training** — Long-term goal: build a pronunciation training model that helps learners practice and get feedback on their pronunciation. Requires diverse speaker data. The speech model roadmap (docs/speech-model-roadmap.md) targets 500+ recordings across 20+ speakers for embedding-based scoring, and 10+ hours for a fine-tuned recognizer.

### Memphis Recording Station — Refined UX

**Hardware:** iPad + lavalier microphone (clip-on, close to speaker's mouth = consistent audio quality, no pop filter needed, hands-free for the speaker)

**Recording flow per word:**
1. Display the target word (all three scripts + English)
2. Speaker says the word **a few times** (multiple isolated takes)
3. Speaker says the word **in a sentence a few times** (contextual pronunciation, natural prosody)
4. Advance to next word

**End of session:**
- Ask if the volunteer would like a photo taken
- Single photo captured on the iPad
- Photo sent to their email address

**Why this matters:**
- Multiple takes per word = best-take selection + training data variety
- Word-in-sentence = natural prosody, coarticulation data, and future phrase segmentation (Montreal Forced Aligner can extract word boundaries from sentence recordings)
- The photo + email creates a personal memento and a re-engagement channel. The volunteer gave their email — this is an opt-in contact for future recording campaigns, app updates, and community connection
- Email list from Memphis becomes the seed distribution list for app launch notifications

**Technical implications:**
- Recording station needs a "sentence mode" in addition to current word mode (the `RecordingMode = 'word' | 'phrase'` type already exists in types.ts but phrase mode is not yet implemented)
- Need email capture field in speaker registration
- Need photo capture integration (iPad camera via browser or native)
- Need email delivery system (Supabase Edge Functions + Resend/SendGrid for transactional email)
- Lav mic means audio quality checks can be tighter (narrower acceptable amplitude range, less background noise tolerance needed)

### Q3: Infrastructure Budget
**Answer:** Budget is flexible — "however much it needs to cost."
- Prefers not to rely on AWS, but it's what he knows best
- **Critical concern: data protection.** Does not want the dataset/system exposed to people who would manipulate it
- This means: auth is not optional, rate limiting matters, the census data and recording corpus need access controls
- The Harari speaker dataset and community census data are culturally sensitive — this is not just a language app, it's a community resource that could be exploited if unprotected

**Implications for architecture:**
- Supabase Row Level Security (RLS) is essential — Postgres policies that ensure users can only read/write their own progress
- Census data should be write-only for users, read-only for admin (the founder)
- Recording uploads should be authenticated — no anonymous uploads
- API rate limiting to prevent scraping of the vocabulary/audio corpus
- Admin dashboard for the founder to view census aggregates without exposing individual records
- Consider: should the vocabulary data itself be protected? Or is it fine to be public (it comes from published dictionaries)?

### Q4: Retention Mechanism
**Answer:** Anti-Duolingo is about the tone, not the mechanism. Notifications and engagement features are welcome — they just need to be meaningful, not manipulative.

**Confirmed features:**
- **Community leaderboard** — "for sure." Anonymized, city-level ("Hararis in DC learned 500 words this week"). Ties into the census/community mapping vision.
- **Weekly digest email** — Progress summary, community stats, new content
- **Family/household challenges** — "amazing... it makes me emotional." Household-level progress tracking, ties directly into the census feature (households are already the unit of measurement). Examples: "The Abdella household reviewed 45 words this week" or "3 households in Memphis are learning together"
- **Push notifications** — OK, but must be "incredibly meaningful." Not "don't forget to practice!" but rather: "Your grandmother's word 'gēy' — 3 families in Toronto learned it today" or "New recording from a native speaker in Harar: listen to how they say 'salaam'"

**Design principles for engagement:**
- Community-centered, not guilt-centered
- Every notification should make the user feel connected to something bigger
- Household as a unit of engagement (not individual competition)
- City-level community visibility creates a sense of diaspora togetherness
- The emotional core: "you are not alone in keeping this language alive"

### Q5: Design Timeline & Process
**Answer:**

**Timeline:**
- Target: **v1 release at the Memphis Harari Festival**
- It is mid-March 2026 now. Cousin starts **April 1**
- Cousin is being paid — treat as half-time work
- Festival date TBD but this gives roughly the development window

**Platform decision: LOCKED IN — Mobile app is primary.**
- The community expects "an app" — cousin's reaction: "yay we're gonna make an app"
- App Store / Google Play links are easier to share than web URLs (especially via WhatsApp and QR codes)
- This is the definitive answer to the web vs. native question

**Design workflow:**
- Cousin is an artist who creates physical drawings
- Founder converts her physical art into SVGs using Adobe Illustrator (has the skill)
- Figma boards for mobile app UI design (cousin creates, founder + dev implement)

**NFC Charms — Physical Distribution Artifact:**
- Founder has a 3D printer and wants to create small charms that use NFC to link directly to the app
- Charm design ideas: jebena (traditional coffee pot) or something distinctly Harari, portable, and cute
- 3D modeling: founder wants to learn Blender, or friend Marie can model quickly (also has a 3D printer)
- NFC tag embedded in the 3D printed charm → tap phone to charm → opens App Store / Play Store listing
- This is a brilliant physical-to-digital bridge for community distribution at gatherings

**Implications:**
- The NFC charms mean we need the App Store / Play Store listings ready before the festival
- EAS Build (Expo) can produce the iOS/Android builds, but App Store review takes 1-3 days, Google Play review takes hours to days
- Need Apple Developer Account ($99/year) and Google Play Developer Account ($25 one-time) set up early
- The charm design should include the app icon / Ge'ez "ጌ" branding that cousin designs

### Q6: Recording Station Cloud Upload
**Answer:** "Yep! Let's send it straight up."
- Real-time upload to Supabase Storage as recordings are captured
- This means **Supabase backend must be ready before the Memphis festival**
- No more relying on IndexedDB + manual binary export for irreplaceable audio
- Local IndexedDB remains as offline fallback (if WiFi drops at the venue, queue uploads for when connectivity returns)
- This is a Phase 1 priority, not a nice-to-have

### Q7: Monorepo Comfort Level
**Skipping — implicitly answered.** The founder is comfortable with technical complexity (Adobe Illustrator, Blender, 3D printing, NFC programming). A Turborepo monorepo with packages/core + apps/web + apps/mobile is appropriate.

---

## Grill Complete — All Critical Questions Answered

### Summary of Decisions Made:
1. **Images:** Cousin's hand-drawn art → founder converts to SVG in Illustrator. No AI. Placeholders in spreadsheet during dev.
2. **Audience:** 250K+ global Harari community. 10K target = ~3-4%. WhatsApp + Memphis festival + NFC charms for distribution.
3. **Budget:** Flexible. Spend what's needed. No AWS preference but it's familiar.
4. **Data protection:** Critical. Census data and recordings must be secured. Auth required. No exposure to manipulation.
5. **Retention:** Community leaderboard (city-level), household challenges, weekly digest, meaningful push notifications. Anti-Duolingo in tone, not mechanism.
6. **Design:** Cousin starts April 1 (paid, half-time). Mobile app is locked in. Physical drawings → SVG conversion by founder.
7. **NFC charms:** 3D printed jebena or Harari cultural object with embedded NFC → App Store link.
8. **Recording station:** Real-time cloud upload to Supabase. Backend must be ready before Memphis.
9. **Census:** Lightweight household speaker count + fluency. Privacy-preserving. Unprecedented dataset.
10. **Memphis festival:** Simultaneous app launch, recording corpus collection, census seed, community feedback event.

### Addendum: Redundancy & Backups (founder emphasis)

The founder explicitly called out redundancy and backups. For recordings of an endangered language captured at a community festival, data loss is culturally irreversible. The backup strategy must be layered:

**Recording data (most critical):**
1. **Local on iPad** — IndexedDB as immediate capture (first copy)
2. **Real-time upload to Supabase Storage** — cloud copy created within seconds (second copy)
3. **Nightly S3 cross-backup** — Supabase Storage contents mirrored to S3 via scheduled function (third copy)
4. **Manual export at end of day** — operator downloads archive to USB drive per existing Memphis guide (fourth copy)

**User progress / census data:**
1. **Supabase Postgres** — primary (with Supabase's built-in daily backups on Pro plan)
2. **Point-in-time recovery** — Supabase Pro includes 7-day PITR
3. **Weekly pg_dump to S3** — automated via Edge Function for independent backup

**Vocabulary / lesson data:**
- Already in git (the CSV + JSON files). Git IS the backup.
- Any community-contributed corrections stored in Supabase should also export to CSV periodically

**Principle: No single point of failure for any data that cannot be recreated.**

---

# FINAL IMPLEMENTATION PLAN

## Context

Gey Sinan is evolving from a Next.js prototype (v0.2.0) into a production mobile app for the Harari diaspora community. The Memphis Harari Festival is the launch event. The app must be in the App Store and Google Play Store before the festival, with a working recording station that uploads to the cloud in real-time, a census survey feature, and placeholder images ready for the cousin's SVG illustrations.

## Architecture

```
gey-sinan/
  packages/
    core/                 # Shared business logic (both platforms)
      types.ts            # Word, Lesson, Speaker, Recording, Census types
      srs.ts              # SM-2 algorithm (unchanged)
      storage.ts          # Abstract storage interface
    api-client/           # Supabase client wrapper
      auth.ts             # Magic link auth
      progress.ts         # Sync user progress
      recordings.ts       # Upload/download recordings
      census.ts           # Household survey data
  apps/
    web/                  # Next.js (existing, evolved) — secondary platform
    mobile/               # Expo / React Native — PRIMARY platform
  supabase/
    migrations/           # Postgres schema
    functions/            # Edge Functions (email, S3 backup)
```

### Backend: Supabase
- **Auth**: Magic link (email, no password)
- **Database**: Postgres with Row Level Security
  - `users` — auth profiles
  - `progress` — per-user SRS data, lesson status, streaks
  - `census_responses` — household speaker counts (write-only for users, read-only for admin)
  - `speakers` — recording station registrations
  - `recordings` — metadata (audio files in Storage)
- **Storage**: Buckets for `recordings/`, `audio/` (canonical), `images/`
- **Edge Functions**: Transactional email (photo to volunteer), S3 cross-backup, weekly digest
- **RLS Policies**: Users read/write only their own data. Census is write-only. Recordings are authenticated-upload-only.

### Mobile: Expo / React Native
- Expo SDK 52+ with New Architecture (Fabric)
- Expo Router for file-based navigation
- expo-av for audio playback and recording
- expo-image for cached image display
- expo-notifications for meaningful push notifications
- EAS Build for iOS/Android CI/CD
- EAS Update for OTA JS updates (skip App Store review for content changes)
- Zustand with AsyncStorage persistence (same store logic as web)

### Media Delivery: S3 + CloudFront
- Audio files (canonical pronunciations): S3 → CloudFront CDN
- SVG illustrations: bundled in app initially, CDN for updates
- Recording uploads: Supabase Storage (real-time) → nightly S3 mirror

## Phased Implementation

### Phase 1: Foundation (now → April 1)
**Goal: Backend + monorepo + recording station cloud upload**

1. Set up Supabase project (Postgres, Auth, Storage)
2. Create database schema with RLS policies
3. Restructure repo into Turborepo monorepo (packages/core, apps/web, apps/mobile)
4. Extract shared code into packages/core (types.ts, srs.ts, storage abstraction)
5. Create packages/api-client with Supabase integration
6. Update recording station to upload to Supabase Storage in real-time
7. Add offline queue (IndexedDB fallback → sync when online)
8. Set up Apple Developer Account ($99/yr) and Google Play Developer Account ($25)

**Files to modify/create:**
- `packages/core/types.ts` (from `src/lib/types.ts` — add imageUrl, census types)
- `packages/core/srs.ts` (from `src/lib/srs.ts` — no changes needed)
- `packages/api-client/` (new)
- `supabase/migrations/001_initial_schema.sql` (new)
- `apps/web/` (move existing Next.js app here)

### Phase 2: Mobile App Shell (April 1 → April 15)
**Goal: Expo app with core learning flow, cousin starts design work**

1. Initialize Expo app with Expo Router
2. Implement core screens: Home, Lesson, Practice, Settings
3. Integrate packages/core for SRS and types
4. Integrate packages/api-client for auth and progress sync
5. Audio playback via expo-av
6. Three-script text rendering (test Arabic RTL early!)
7. Image placeholders in vocabulary data (tracked in spreadsheet for cousin)
8. Cousin begins Figma boards using current web app as baseline

**Key risk: Arabic RTL + Ethiopic rendering in React Native — test on real devices early**

### Phase 3: Recording Station + Census (April 15 → May 1)
**Goal: Memphis-ready recording experience on iPad**

1. Build recording station in Expo (iPad-optimized)
   - Speaker registration with email capture
   - Word mode: multiple takes per word
   - Sentence mode: word in context
   - Real-time upload to Supabase Storage
   - Offline queue with sync
2. Photo capture at end of session (expo-camera)
3. Email delivery: photo + thank you via Supabase Edge Function + Resend
4. Census survey screen (household speaker count + fluency levels)
5. Admin dashboard (founder-only) for census aggregate view

### Phase 4: Polish + App Store (May 1 → Festival)
**Goal: App Store / Play Store listings live, NFC charms ready**

1. Apply cousin's Figma designs to mobile app
2. Integrate first batch of SVG illustrations
3. Community leaderboard (city-level, anonymized)
4. Household view (family progress)
5. Push notification infrastructure (meaningful messages only)
6. EAS Build → TestFlight (iOS) + Internal Testing (Android)
7. App Store submission (allow 1-3 days for review)
8. Google Play submission (allow 1-2 days for review)
9. NFC charm programming (App Store / Play Store deep links)
10. QR code flyers for Memphis

### Post-Memphis
- Process recording corpus through audio pipeline
- Select canonical pronunciations for app audio
- Weekly digest email system
- Expand vocabulary (Tier 2: 300→600 words)
- Speech model experiments with Memphis corpus

## Verification

- [ ] Supabase project created with RLS policies
- [ ] Monorepo builds successfully (web + mobile)
- [ ] Auth flow works end-to-end (magic link → session)
- [ ] Progress syncs between devices (learn on phone, see progress on web)
- [ ] Recording uploads to Supabase Storage in real-time
- [ ] Offline recording queues and syncs when back online
- [ ] Census survey writes to Postgres, visible in admin view
- [ ] Three-script rendering correct on iOS and Android (especially Arabic RTL)
- [ ] Audio playback works via expo-av
- [ ] EAS Build produces installable iOS/Android binaries
- [ ] App Store and Play Store listings approved
- [ ] NFC charm opens correct store listing on tap
- [ ] 4-layer backup: iPad local → Supabase → S3 → USB export

## Key Existing Code to Reuse
- `src/lib/srs.ts` → `packages/core/srs.ts` (zero changes needed)
- `src/lib/types.ts` → `packages/core/types.ts` (extend with imageUrl, census types)
- `src/stores/useProgress.ts` → same Zustand logic, swap localStorage for AsyncStorage
- `src/lib/recorder.ts` → rewrite for expo-av, but same Recording/Speaker types
- `scripts/upload-audio-to-s3.js` → extend pattern for image uploads
- `docs/speech-model-roadmap.md` → still valid, Memphis corpus feeds Phase 2 scoring
- `docs/audio-processing-pipeline.md` → still valid for post-Memphis processing

## Documentation to Update
- `docs/CLAUDE.md` — correct speaker population from 25K to 250K+
- `docs/memphis-recording-guide.md` — update for iPad + lav mic + sentence mode + photo flow
- `docs/community-contributions.md` — add census participation, update speaker count
- `README.md` — update for monorepo structure
- New: `docs/adr/0001-react-native-expo.md` — ADR for mobile framework choice
- New: `docs/adr/0002-supabase-backend.md` — ADR for backend choice
- New: `docs/adr/0003-monorepo-structure.md` — ADR for code sharing strategy

### Census De-duplication: Household Codes

**Decision:** Use short random household codes (4 characters, e.g., "BI3D", "K7WA") for census de-duplication.

**How it works:**
1. First family member signs up and creates a household → system generates a 4-character code
2. They share the code with family (WhatsApp, verbally at gatherings, etc.)
3. Other household members enter the code to join the same household
4. Like "join this room" — familiar UX pattern, zero PII required

**Why this is elegant:**
- Solves de-duplication: one household = one code = one census entry, no matter how many family members use the app
- No PII needed: the code is the identifier, not a name or address
- Social/viral: sharing the code is a natural conversation ("join our household on Gey Sinan!")
- Family engagement: once a household exists, household challenges and progress tracking activate automatically
- The code becomes a point of pride: "our family is learning together"

**Technical design:**
- 4 alphanumeric characters (uppercase + digits, excluding ambiguous chars like 0/O, 1/I/L) = ~34^4 = ~1.3M possible codes. More than sufficient for 10K households.
- Charset: `ABCDEFGHJKMNPQRSTUVWXYZ23456789` (30 chars, no ambiguity)
- Collision check on generation
- Household table in Supabase: `{ code, created_at, city (optional, from first member's location) }`
- Users table gets `household_code` FK
- Census response attached to household, not individual

**Privacy note:** Even if someone guesses a code, all they can do is join a household. No data is exposed — they just see aggregate household stats (words learned, members count). The code is not reversible to any identity.

**Household naming:** Users can optionally name their household, ideally with surname (e.g., "The Abdella Family"). This becomes the display name on household challenges and leaderboards. It's opt-in — the code works without a name, but naming it makes the experience personal and the leaderboard meaningful ("The Abdella household learned 45 words this week").

**Visibility toggle:** Household surname display is fully voluntary. Users can:
- Show their family name on the leaderboard (public pride)
- Hide it and participate anonymously (private learning)
- Toggle visibility at any time in settings
This respects varying comfort levels with public participation while still enabling the community connection features.

---

## Architecture Update: No AWS

### Decision: Supabase Storage (app delivery) + Cloudflare R2 (ML corpus)

**Rationale:** The founder wants to detach from AWS entirely. The research confirms this is not only possible but simpler:

| Concern | Solution | Cost |
|---------|----------|------|
| App audio (MP3s) | Supabase Storage (public bucket, built-in CDN) | Included in $25/mo Pro |
| SVG illustrations | Supabase Storage (public bucket) | Included |
| Community recording uploads | Supabase Storage (authenticated bucket, RLS) | Included |
| ML WAV corpus (private, large) | Cloudflare R2 (zero egress, $0.015/GB) | ~$0/mo at current scale |
| CDN delivery | Supabase CDN (included) | Included |

**What changes:**
- Delete `scripts/upload-audio-to-s3.js` — replace with Supabase Storage upload script
- No AWS account, no IAM, no CloudFront configuration
- `audioUrl` in words.json points to Supabase Storage CDN URLs instead of S3
- R2 is only for the private ML training corpus (not user-facing)

**Why not R2 for everything:** We're already paying $25/mo for Supabase Pro (database + auth + storage + CDN bundled). Using Supabase Storage keeps everything in one dashboard, one bill, one set of credentials. If traffic scales beyond 200GB/mo egress, we migrate app audio to R2 — it's a one-script URL change since audioUrl is just a string in words.json.

**Escape hatch:** If Supabase ever becomes problematic, R2 is S3-compatible. The existing upload script pattern (CLI-based) works with R2 by adding `--endpoint-url`. Migration is a single afternoon.

---

## Census & Privacy — Refined Design

The founder emphasized: "this has to be very much segregated by family" and "I really do not want people to be identifiable beyond their immediate community. We have to be careful of abuse, tracking, etc. both from within the community as well as without."

### Privacy Principles

1. **No one outside a household sees household members.** The household is a walled unit. Other users see aggregate stats only.
2. **Leaderboard shows minimal identity:** First name + last initial at most (e.g., "Samir A."). Even this is opt-in.
3. **Census data is transparent TO the family, private FROM everyone else.** Families who share their name and elect transparency can see their own household data. No one else can see individual household census responses.
4. **Admin (founder) sees aggregates, not individuals.** Census dashboard shows: "47 households in DC, average 3.2 speakers per household, 62% heritage speakers." NOT "The Abdella family in DC has 4 speakers."
5. **Protect from both internal and external threats:**
   - **External:** No API endpoint exposes individual household data. Rate limiting on all endpoints. Auth required for any data access.
   - **Internal (community):** Prevent community members from identifying or tracking each other. No user search. No browsable directory. Household codes are the only linkage, and they're shared privately (WhatsApp, verbally).

### What Users See

**Within their household:**
- All member first names (opted-in)
- Household aggregate: words learned, streak, census response
- Household name (if set, e.g., "The Abdella Family")

**On the leaderboard (public):**
- City-level aggregates: "Hararis in Memphis: 12 households, 340 words learned this week"
- Household leaderboard (opt-in only): "A. Family — 45 words this week" (surname initial only, or hidden entirely)
- Individual entries: NEVER shown on public leaderboard

**What the founder/admin sees:**
- Aggregate census: total households, geographic distribution, speaker fluency breakdown
- No ability to drill into individual households from the admin view
- Raw data export requires explicit database query (not exposed in UI)

### Technical Implementation

```sql
-- Census responses are write-only for users
CREATE POLICY "Users can insert their own census" ON census_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can read only their own household's census
CREATE POLICY "Users can read own household census" ON census_responses
  FOR SELECT USING (
    household_code = (SELECT household_code FROM users WHERE id = auth.uid())
  );

-- No UPDATE or DELETE for regular users (immutable census entries)
-- Admin role has separate read-only aggregate views (no individual access in UI)
```

### Leaderboard Display Tiers (user chooses)

1. **Hidden** — household participates in city aggregates but is not listed individually
2. **Anonymous** — shows as "A Harari Family" with city only
3. **First name + last initial** — "Samir A. • Memphis" (maximum visibility, still not fully identifiable)

Default is **Hidden**. Users must actively choose to be more visible.

### Memphis Recording Station — Thermal Print Keepsake

**Addition:** Small thermal printer at the recording station. After the volunteer's photo is taken:

1. Photo is composited with a branded overlay:
   - Gey Sinan logo / ጌ character
   - "I helped preserve Harari" (in Ge'ez + English)
   - Volunteer's first name (optional)
   - QR code linking to App Store / Play Store
2. Printed on thermal receipt printer (black & white)
3. Volunteer walks away with a physical keepsake

**Why this is powerful:**
- Physical artifact creates emotional connection to the project
- The QR code on the print IS distribution — every keepsake is a flyer
- People show it to family, take photos of it, share on WhatsApp
- Cost: thermal printer ~$30, paper rolls ~$0.01/print
- Bluetooth connection to iPad — no wires

**Hardware:** Small Bluetooth thermal printer (e.g., Phomemo M02, MUNBYN). 58mm or 80mm width. Connects to iPad via Bluetooth.

**Technical:** expo-print or a Bluetooth printer SDK for the composited image. The overlay composition can be done client-side with canvas/SVG before sending to printer. Same composited image gets emailed to the volunteer.

---

## Vocabulary as Public Dataset — Community-Driven Data Mart

### Context (from founder, 2026-03-14)

The vocabulary dataset MUST be public. This is not just an app feature — it is a community resource. The founder tested the app with family and community members and they immediately found issues in the vocabulary data. The community wants to help fix and expand it.

> The founder wants the dataset to be "an easily accessible and highlighted addition" — a public data mart that people can browse, download, and contribute corrections back to.

### Design

**The vocabulary dataset is served as:**

1. **Full dataset download** — Complete CSV/JSON of all Harari vocabulary (currently 237 curated + 4,629 from Leslau). Downloadable from the app and from a public URL. This is the "data mart."

2. **Logical subsets** — Browsable groupings that make sense for different use cases:
   - By category (greetings, family, food, body parts, etc.)
   - By unit/lesson (the curriculum groupings)
   - By difficulty tier (Tier 1: survival, Tier 2: conversational, etc.)
   - By verification status (verified, pending, needs review)
   - By source (Leslau, Burton 1894, community-contributed)

3. **Contribution flow** — Users can flag issues and suggest corrections directly in the app:
   - "This word is wrong" — flag with suggested correction
   - "This word is missing" — suggest new entry with Latin + English (Ge'ez/Arabic added by verified contributors)
   - "This translation could be better" — suggest alternative English meaning
   - Corrections go into a moderation queue (not directly into the live dataset)
   - Founder/moderators review and approve corrections
   - Approved changes update the live vocabulary and get credited

### Technical Implementation

**Public API endpoint:**
- `GET /api/vocabulary` — full dataset (JSON)
- `GET /api/vocabulary?category=food` — filtered subset
- `GET /api/vocabulary?unit=3` — lesson grouping
- `GET /api/vocabulary/export` — CSV download
- Rate-limited but no auth required (public data)

**Contribution endpoint (authenticated):**
- `POST /api/vocabulary/suggest` — submit a correction or addition
- Stored in `vocabulary_suggestions` table in Supabase
- RLS: users can create suggestions, only admin can approve
- Suggestions include: word_id (if correction), field changed, old value, new value, contributor notes

**In-app UX:**
- Each word card has a small "Report issue" or "Suggest fix" button
- Vocabulary browser screen where users can explore the full dataset by category
- "Download dataset" link prominently placed (About page, Settings, or dedicated Data page)
- Attribution: show community contributors who helped verify/fix entries

**Data pipeline update:**
- vocabulary.csv remains the source of truth in git
- Approved Supabase suggestions get merged back into vocabulary.csv via a script
- build-vocabulary.js regenerates words.json
- This keeps git as the canonical backup while enabling community contributions through the app

### Why This Matters

This is potentially the largest openly-accessible Harari vocabulary dataset in digital form. Leslau's dictionary is a PDF from 1963. Making this structured, searchable, downloadable, and community-correctable is a significant contribution to Harari language preservation beyond the app itself. Researchers, other developers, and community members should be able to access and build on this data.

### Thermal Print Overlay — Trilingual Branding

The printed keepsake should display "Gey Sinan" in all three Harari scripts:
- **Ge'ez:** ጌይ ሲናን
- **Arabic:** قي سنان (needs verification from native speaker)
- **Latin:** Gey Sinan

This trilingual display IS the brand — it visually communicates what the app is about before anyone opens it. The three scripts on one small print are a statement: this language lives in all three writing systems.

**Note:** The Arabic rendering above is a placeholder — the correct Harari Arabic (Ajami) spelling must be verified by a community member. This is exactly the kind of correction the public vocabulary contribution flow would catch.

---

## Community Contributions as Push Notification Content

### Core Insight (from founder)

The most meaningful notification is **new content from the community**. Not "don't forget to practice" — instead: "A native speaker in Harar just recorded how they say 'salaam' — listen now." This is the draw that brings people back.

### User-Generated Content Flow

**Anyone can contribute:**
1. **Record a word** — Open the recording station anytime (not just at Memphis). Record your pronunciation of any word in the dataset.
2. **Suggest a new word** — Submit a word with Latin spelling + English meaning. Ge'ez/Arabic added by verified contributors or moderators.
3. **Suggest a revision** — Flag an existing word with a correction (spelling, translation, usage note).
4. **Submit a phrase/proverb** — Share common expressions, proverbs, or conversational patterns.

**Credit is given:**
- Every approved contribution is attributed to the contributor (first name + last initial, or anonymous — their choice)
- "This recording by Fatima A. from Toronto"
- "Word suggested by Ahmed M."
- "Correction verified by 3 community members"
- Contributors build visible reputation — top contributors could be highlighted monthly

**Moderation pipeline:**
1. User submits contribution (recording, word, revision)
2. Contribution enters moderation queue
3. Founder/moderators review and approve
4. Approved content goes live in the dataset
5. Push notification to community: "New recording added: listen to how [contributor] says '[word]'"
6. Contributor gets notified: "Your recording of '[word]' is now helping learners!"

### Notification Types (all content-driven, all meaningful)

| Notification | Example |
|---|---|
| New recording | "Fatima from Toronto recorded 'gēy' — hear a new voice" |
| New word added | "Community added 'zurbyan' (spiced rice) — learn it now" |
| Word corrected | "The community improved the translation for 'ahad' — check it out" |
| Community milestone | "100 families are now learning together across 8 cities" |
| Household activity | "The Abdella family learned 12 new words this week" |
| Weekly digest | "This week: 5 new recordings, 3 words corrected, 47 families active" |

**Every notification has a reason to tap.** New content to hear, new words to learn, community to connect with. Never guilt. Always giving, never taking.

---

## Important Context: Ramzi's Stance on Ge'ez Branding

**The founder's name is Ramzi.** (Not "the founder" — use his name.)

**On using the Ge'ez character ጌ as the app logo/brand:**

Ramzi is not a fan of using the Ge'ez character as the primary design element. His reasoning is historically grounded and should be respected throughout all design decisions:

> Amharic as a national language is a national project that specifically hurt the dissemination of the other distinct tribal languages of Ethiopia. The Ge'ez/Ethiopic script, while technically shared, is strongly associated with Amharic cultural dominance. Using it as the Gey Sinan brand could inadvertently signal alignment with the very system that marginalized Harari.

**This is not an anti-Amharic stance — it is a pro-Harari stance.** The app teaches all three scripts equally as a learning feature, but the brand identity should represent Harari distinctly, not through an Amharic-associated lens.

**Implications for design:**
- The current PWA icons (ጌ on emerald background) should be reconsidered
- The thermal print overlay should NOT default to Ge'ez as the primary script
- The app icon / brand mark should be designed by Ramzi's cousin with this context in mind
- Consider: Arabic script (historically Harari), Latin script (diaspora), a non-script visual mark (the walled city of Harar, the jebena, a Harari cultural symbol), or a trilingual treatment where no single script dominates
- The trilingual display of "Gey Sinan" on the thermal print is still valid — showing all three scripts equally, with none privileged as the "logo"

**For all documentation and conversation:** Refer to Ramzi by name, not as "the founder."

**Design cousin's name is Yesmin.** She is the artist creating physical drawings that Ramzi converts to SVGs in Illustrator. She starts April 1 (paid, half-time) and will create Figma boards for the mobile app UI. Use her name in all references.
