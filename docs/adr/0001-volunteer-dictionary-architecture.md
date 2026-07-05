# 0001. Volunteer and dictionary architecture

Date: 2026-07-05
Status: accepted

## Context

Gey Sinan needs two new public experiences beyond the core lesson app:

- A **dictionary browser** over the full ~4,600-entry Harari lexicon, with a
  way for native speakers to flag errors.
- A **volunteer recording station** where speakers contribute pronunciation
  audio for words that don't have it yet.

Both need to ship quickly, without a backend team, while `infra/` builds out
the longer-term Django + Postgres platform described in
`docs/infrastructure-plan.md`. We also already have `dictionary.geysinan.com`
and `volunteer.geysinan.com` planned as CloudFront distributions in front of
the same S3 bucket as the main app.

## Decision

**Serve both experiences from the existing Expo SPA**, routed by hostname:

- The CloudFront function that already exists to route these subdomains
  prepends `/dictionary` or `/volunteer` to the request URI based on the
  `Host` header before hitting S3. The SPA itself only ever sees a clean
  pathname (e.g. `/`), so on load it inspects `window.location.hostname`
  and redirects to `/dictionary` or `/volunteer` accordingly.
- No new deployable, no new repo, no new build pipeline — `/dictionary` and
  `/volunteer` are just more expo-router routes in `apps/expo/app/`.

**Fix suggestions go to a Google Sheet via Apps Script, not a backend.**
The suggest-a-fix form POSTs JSON to a Google Apps Script web app
(`doPost` → `appendRow`), documented in
`docs/volunteer/google-sheet-setup.md`. This gives editors a reviewable,
sortable queue with zero infrastructure and zero auth to build.

**Recordings upload directly to S3 via a presigned URL**, not through the
Expo app or a database. The client hits a small endpoint (a Lambda, per the
infra plan) with `?speakerId=&wordId=&contentType=`, receives
`{ url, key }`, and PUTs the audio blob straight to S3. Speaker identity and
consent are captured client-side and persisted locally (AsyncStorage) — the
Lambda only needs to mint scoped upload URLs, not manage speaker records.

## Consequences

**Easier:**
- No new service to deploy, monitor, or scale for either feature.
- Dictionary and volunteer routes ship in the same release cadence as the
  lesson app; a single `expo export --platform web` produces all three
  experiences.
- Fix review happens in a spreadsheet a non-technical maintainer already
  knows how to use.
- Recording uploads don't need a database write path or auth system before
  they're useful — audio lands in S3 immediately.

**Harder:**
- The CloudFront function and hostname-sniffing redirect are a coupled pair
  of implicit contracts — if either changes independently, both dictionary
  and volunteer routing break silently. This needs an integration check
  before deploys, not just unit tests.
- Fix suggestions and recordings live in two different, non-relational
  stores (a Sheet and an S3 bucket) with no foreign key to the eventual
  Postgres schema. Migrating them into the Django backend later means
  writing one-off import scripts for both.
- The Apps Script endpoint is a public URL baked into the client bundle;
  anyone can call `doPost` directly. This is acceptable because it can only
  append rows, but it's not a pattern to reuse for anything mutable.
- No server-side validation of upload requests beyond what the presigned-URL
  Lambda chooses to enforce (e.g. content-type, word existence) — abuse
  prevention lives entirely in that one function.
