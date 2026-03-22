# Gey Sinan Infrastructure & Platform Plan

## Context

Gey Sinan is a Harari language learning app currently running as a client-side Next.js PWA with no backend, no infrastructure, and no deployment pipeline. The app needs to evolve into a full platform with:
- Multiple web experiences (learning, dictionary, volunteer recording, admin)
- Native mobile apps (iOS + Android)
- A backend for data persistence, user auth, recording management, and admin workflows
- Proper AWS infrastructure with dev/prod separation
- Developer experience that's foolproof for onboarding contributors

This plan covers the migration from Next.js to Expo, the creation of a Django backend, and the AWS infrastructure to host everything.

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend | Expo (all-in-one) | Single codebase -> web + iOS + Android. Best native audio for recording/pronunciation. |
| Backend | Django + DRF | Django Admin for non-technical admins, ORM + Postgres, user's 5yr experience. |
| Admin panel | Django Admin | Free, powerful RBAC, file uploads, approval workflows. No custom FE needed. |
| Auth | django-allauth | Email + magic links + Google/Apple OAuth. All data in own Postgres. No external IdP. |
| Infrastructure | AWS (CloudFront + S3 + ECS Fargate) | Static hosting for Expo web, containers for Django. Not over-engineered — built for longevity. |
| IaC | Terraform | Cloud-agnostic, large community, existing AWS account. |
| CI/CD | GitHub Actions | Native GitHub integration, OIDC with AWS (no long-lived keys), EAS action for Expo. |
| Domain | Route 53 | Easy DNS + ACM cert management for all subdomains. |
| Database | PostgreSQL on RDS | Dev + prod instances, same account, separated by naming/tags. |
| Observability | Sentry + Grafana Cloud | Sentry for errors/perf, Grafana Cloud for metrics/logs/dashboards. Both free tier. |
| Pre-commit | pre-commit framework | Ruff (Python), ESLint (TS), secrets detection, no-commit-to-main. Foolproof for contributors. |

## Architecture

```
Subdomains:
  geysinan.com            -> CloudFront -> S3 (Expo web build)
  dictionary.geysinan.com -> CloudFront -> S3 (same Expo build, subdomain routing via CF Function)
  volunteer.geysinan.com  -> CloudFront -> S3 (same Expo build, subdomain routing via CF Function)
  admin.geysinan.com      -> CloudFront -> ALB -> ECS (Django Admin)
  api.geysinan.com        -> CloudFront -> ALB -> ECS (Django DRF)
  dev.* / dev-admin.*     -> Same pattern, dev environment

Backend:
  ECS Fargate -> Django (gunicorn) -> RDS Postgres
  ECS Fargate -> Celery worker (audio processing) -> SQS
  S3 buckets: static, media (audio/images), recordings (private), ml-corpus (private)

Native:
  iOS + Android via Expo EAS Build (same codebase as web)

Observability:
  Sentry -> application errors, performance traces (Django + Expo)
  Grafana Cloud -> metrics (via Alloy agent), logs (container stdout), dashboards
  CloudWatch -> raw log sink only (never open the console)
```

## Deployment Model

One codebase, three build outputs:

```
apps/expo/
  ├── npx expo export --platform web    -> dist/ -> S3 -> CloudFront (web)
  ├── eas build --platform ios          -> .ipa  -> Apple App Store
  └── eas build --platform android      -> .aab  -> Google Play Store

backend/
  └── docker build + push ECR           -> ECS Fargate (API + Admin)
```

### FE/BE Version Alignment

- **API versioning**: All endpoints under `/api/v1/`. Breaking changes create `/api/v2/`, old version stays alive.
- **Semver**: Shared version across monorepo. Release tag (`v0.3.0`) deploys both FE and BE.
- **Deploy order**: BE deploys first, then web, then native builds. CI enforces via `needs:` dependencies.
- **Backward compat**: BE supports current AND previous FE version. Never remove API fields — deprecate first.
- **Config endpoint**: `GET /api/v1/config/` returns `minimumAppVersion` so native apps can prompt updates.

## Monorepo Structure

```
gey-sinan/
  apps/
    expo/                         # Single Expo app -> web + iOS + Android
      app/                        # Expo Router (file-based)
        (tabs)/                   # Main learning experience
          _layout.tsx             # Tab bar: Learn, Dictionary, Record, Settings
          index.tsx               # Home/dashboard
          practice.tsx            # SM-2 review session
          learn/[lessonId].tsx    # Lesson page
          settings.tsx
          about.tsx
        (dictionary)/             # Dictionary experience
          _layout.tsx
          index.tsx               # Search, word of the day
        (volunteer)/              # Volunteer/recording experience
          _layout.tsx
          index.tsx               # Project context, consent
          setup.tsx               # Speaker registration
          speak.tsx               # Recording interface
          export.tsx              # Export recordings
        (landing)/                # Landing page (web)
          _layout.tsx
          index.tsx               # Gates of Harar, birdie, "niletina"
        _layout.tsx               # Root: fonts, providers, auth
      components/
        Flashcard.tsx             # Reanimated 3D flip
        AudioButton.tsx           # expo-av playback
        LessonCard.tsx
        ProgressBar.tsx
        ScriptToggle.tsx
        Birdie.tsx                # NEW: floating character, nav/help
      lib/
        srs.ts                    # Copy as-is
        types.ts                  # Copy as-is (Recording.blob -> filePath)
        audio.ts                  # Rewrite: expo-av
        recorder.ts              # Rewrite: expo-av + expo-sqlite
        storage.ts                # Mostly portable
        api.ts                    # NEW: Django API client
      stores/
        useProgress.ts            # Swap persist: localStorage -> MMKV
      data/
        words.json                # Bundled for offline
        lessons.json              # Bundled for offline
      assets/fonts/               # Amiri, Noto Sans Ethiopic
      app.json
      tailwind.config.ts          # NativeWind
  backend/
    manage.py
    config/
      settings/
        base.py, dev.py, prod.py
      urls.py, wsgi.py
    apps/
      vocabulary/                 # Word, DictionaryEntry, Phrase, Sentence, Lesson
      recordings/                 # Recording, Speaker
      progress/                   # UserProgress, UserLessonProgress, UserStreak
      users/                      # Custom User model
    requirements/
      base.txt, dev.txt, prod.txt
    Dockerfile                    # Multi-stage: python:3.12-slim, gunicorn
    docker-compose.yml            # Local dev: django + postgres + redis + celery
  infra/
    main.tf
    variables.tf
    outputs.tf
    environments/
      dev.tfvars, prod.tfvars
    modules/
      networking/                 # VPC, subnets, SGs
      dns/                        # Route 53, ACM
      database/                   # RDS
      storage/                    # S3 buckets
      cdn/                        # CloudFront + CF Functions
      ecs/                        # Fargate cluster, services, ALB
  .github/
    workflows/
      backend-ci.yml              # Lint + test on PR (pytest + Postgres service)
      backend-deploy.yml          # Build -> ECR -> ECS (dev on push, prod on tag)
      expo-ci.yml                 # Lint + typecheck + jest on PR
      expo-web-deploy.yml         # expo export -> S3 -> CF invalidation
      expo-native-build.yml       # EAS build on release tag
      infra-plan.yml              # Terraform plan on PR (posts to PR comment)
      infra-apply.yml             # Terraform apply on merge
  .pre-commit-config.yaml        # Ruff, ESLint, secrets detection, no-commit-to-main
  Makefile                        # setup, dev, test targets
  vocabulary.csv                  # Master data (stays at root)
  harari-dictionary.csv
  phrases.csv
  scripts/                        # Data pipeline scripts
```

## Developer Experience

### Onboarding (one command)

```bash
make setup   # Installs pre-commit hooks, Python/Node deps, starts DB, runs migrations, imports data
```

### Local Development

```bash
make dev     # docker compose up (Django+Postgres+Redis+Celery) + expo start
```

- Backend runs in Docker (hot reload via volume mount)
- Expo runs on host (needs simulator/emulator access)
- Pre-commit hooks block broken commits automatically

### Pre-commit Hooks

```yaml
# .pre-commit-config.yaml
- ruff (lint + format) for Python
- eslint for TypeScript
- trailing-whitespace, end-of-file-fixer, check-yaml
- check-added-large-files (max 500KB)
- no-commit-to-branch (blocks direct commits to main)
- detect-secrets (catches .env files, API keys)
```

### Docker Compose (local dev)

```yaml
services:
  db:       postgres:16-alpine (port 5432)
  redis:    redis:7-alpine (port 6379)
  backend:  Django runserver (port 8000, volume mount for hot reload)
  celery:   Celery worker (same image, volume mount)
```

## CI/CD Pipeline

```
On every PR:
  Backend:  ruff lint -> ruff format --check -> pytest (Postgres service) -> django check --deploy
  Expo:     eslint -> tsc --noEmit -> jest (unit + integration)
  Infra:    terraform plan (comment on PR)

On push to dev branch:
  Backend:  build Docker -> push ECR -> update ECS -> smoke test (/api/v1/health/)
  Expo:     expo export --platform web -> upload S3 -> invalidate CloudFront

On release tag (e.g., v0.3.0):
  Backend:  deploy to prod ECS (same pipeline, prod tfvars)
  Expo:     deploy to prod S3 + eas build (iOS + Android) + eas submit
  Order:    BE first -> web -> native (enforced via `needs:` in workflow)
```

### AWS Auth in CI

GitHub OIDC provider -> IAM role (no long-lived AWS keys in secrets).

## Testing Strategy

### Backend (pytest + pytest-django)
- **Unit**: Model validation, serializers, SM-2 calculation, management commands
- **Integration**: Auth flow e2e, progress sync merge logic, recording upload -> Celery -> S3
- **Database**: Always real Postgres (service container in CI), never SQLite
- **Fixtures**: factory_boy, not Django fixtures

### Frontend (jest + @testing-library/react-native)
- **Unit**: SRS algorithm, store actions, API client
- **Component**: Flashcard renders correct script, ScriptToggle state, ProgressBar width
- **Integration**: Lesson flow, recording flow, auth flow (mocked API)

### E2E (Maestro)
- YAML-based, runs on real simulators
- Critical paths only: lesson completion, recording, auth
- Runs on PRs to main (not every PR)

### Infrastructure
- `terraform plan` output as PR comment = the "test"
- Post-deploy smoke tests: health endpoint, CloudFront URL check

## Observability

| Signal | Tool | Example |
|--------|------|---------|
| Application errors | Sentry | "Recording upload failed with S3 permission error" |
| API latency (p50/p95/p99) | Sentry + Grafana | "Progress sync P95 is 800ms" |
| Error rate | Grafana | "Error rate spiked to 5% after deploy" |
| Container health | Grafana (ECS metrics) | "Memory at 85%, scale up" |
| DB performance | Grafana (CloudWatch data source) | "RDS CPU at 90%, slow dictionary queries" |
| Uptime | Grafana Synthetic Monitoring | "api.geysinan.com down for 3 min" |
| JS/native crashes | Sentry | "App crashes on iOS 16 when recording" |

**Setup**:
- Sentry SDK in Django (3 lines in settings) + Expo (init in root layout)
- Grafana Alloy agent as ECS sidecar (scrapes Prometheus metrics, ships logs)
- CloudWatch as raw log sink only — dashboards live in Grafana

**Cost**: ~$3-5/month (free tiers for Sentry + Grafana Cloud, minimal CloudWatch)

## Phased Implementation

### Phase 0: Foundation (Swarm: `foundation`)
**Goal**: Monorepo structure, Django skeleton, Docker, Terraform scaffold, pre-commit.

| Task | Parallel? | Details |
|------|-----------|---------|
| 0.1 Monorepo setup | Yes | pnpm workspaces, Makefile, .pre-commit-config.yaml |
| 0.2 Django project | Yes | Skeleton with split settings, custom User model, apps structure |
| 0.3 Django models | After 0.2 | Word, DictionaryEntry, Phrase, Sentence, Lesson, Recording, Speaker, UserProgress |
| 0.4 Data import commands | After 0.3 | `import_vocabulary`, `import_dictionary`, `import_phrases`, `import_lessons` |
| 0.5 Django Admin config | After 0.3 | Rich admin: 3-script display, search, filters, approve/reject actions, audio preview |
| 0.6 Docker + compose | After 0.2 | Multi-stage Dockerfile, compose with postgres + redis + django + celery |
| 0.7 Terraform scaffold | Yes | Provider config, state bucket, VPC, RDS (dev), S3 buckets |

### Phase 1: Backend API (Swarm: `backend-api`)
**Goal**: Django DRF API serving vocabulary, auth, progress sync, recording upload.

| Task | Details |
|------|---------|
| 1.1 Auth setup | django-allauth + dj-rest-auth + simplejwt. Email + magic links + Google OAuth. |
| 1.2 RBAC | Django groups: User, Admin, Technical Admin. DRF permission classes. |
| 1.3 Vocabulary API | `GET /api/v1/words/`, `/phrases/`, `/lessons/`, `/dictionary/` (search, paginate) |
| 1.4 Progress sync API | `POST /api/v1/progress/sync/` — bidirectional merge, last-write-wins, SM-2 aware |
| 1.5 Recording API | Speaker registration, recording upload (multipart), presigned S3 URLs |
| 1.6 Audio processing | Celery task: WebM -> WAV + MP3, trim silence, normalize, quality check |
| 1.7 Config endpoint | `GET /api/v1/config/` — API version, feature flags, minimum app version |
| 1.8 Sentry integration | sentry-sdk in Django settings, traces_sample_rate=0.1 |

### Phase 2: Expo Migration (Swarm: `expo-migration`)
**Goal**: Next.js -> Expo. Core learning experience working on web + iOS.

| Task | Parallel? | Details |
|------|-----------|---------|
| 2.1 Expo project init | First | Expo Router, NativeWind, TypeScript, font loading (Amiri, Noto Sans Ethiopic) |
| 2.2 Port logic layer | After 2.1 | Copy srs.ts, types.ts, words.json, lessons.json. Zustand persist -> MMKV. |
| 2.3 Core components | After 2.1 | Flashcard (reanimated flip), AudioButton (expo-av), ProgressBar, ScriptToggle |
| 2.4 Learning pages | After 2.2+2.3 | Home/dashboard, lesson/[id], practice (SM-2 review) |
| 2.5 Recording station | After 2.2+2.3 | Setup, speak (expo-av + metering visualizer), export |
| 2.6 Settings + about | After 2.4 | Script selection, about page |
| 2.7 API client + auth | After 2.4 | Django API integration, JWT auth, progress sync |
| 2.8 Sentry integration | After 2.1 | @sentry/react-native in root layout |

### Phase 3: Infrastructure Deploy (Swarm: `infra-deploy`)
**Goal**: Dev environment live on AWS. All dev subdomains accessible.

| Task | Details |
|------|---------|
| 3.1 Buy domain | Route 53 registration for geysinan.com |
| 3.2 ACM certificates | Wildcard `*.geysinan.com` in us-east-1 + regional |
| 3.3 ECS deployment | ECR repo, task definition, Fargate service, ALB with host-based routing |
| 3.4 CloudFront setup | Distributions for static (S3) and API/admin (ALB). CF Functions for subdomain routing. |
| 3.5 CI/CD pipelines | GitHub Actions: backend-ci/deploy, expo-ci/deploy, infra-plan/apply |
| 3.6 Observability | Grafana Cloud setup, Alloy agent as ECS sidecar, CloudWatch data source |
| 3.7 Dev environment | Full dev stack: dev.geysinan.com, dev-admin.geysinan.com, dev-api.geysinan.com |

### Phase 4: New Features (Swarm: `features`)
**Goal**: Dictionary, volunteer portal, birdie, landing page.

| Task | Details |
|------|---------|
| 4.1 Landing page | Gates of Harar hero, "Preserving Harari Language and Culture", birdie + "niletina!" CTA |
| 4.2 Dictionary page | Search (Latin/English/Ethiopic), word of the day, example sentences, contributor info, audio |
| 4.3 Volunteer portal | Project context, data privacy, consent form, AI acknowledgment, roadmap |
| 4.4 Birdie component | Floating character: navigation, help, support. Easter egg: "whooooo?" audio |
| 4.5 Subdomain routing | CloudFront Functions map Host header -> route group path |

### Phase 5: Polish & Ship (Swarm: `polish`)
**Goal**: Production-ready. App Store submission. Prod environment.

| Task | Details |
|------|---------|
| 5.1 Prod Terraform | Prod RDS, prod ECS, prod CloudFront |
| 5.2 Backup strategy | RDS automated backups (30-day), S3 versioning, prod->dev sync via pg_dump + scrub |
| 5.3 App Store prep | EAS build, icons, splash screens, store listings |
| 5.4 E2E tests | Maestro flows for critical paths |
| 5.5 Analytics | User signup counts, recording stats, learning aggregates (Django admin dashboard) |

## Key Migration Details

### Copies as-is (pure logic):
- `src/lib/srs.ts` — SM-2 algorithm, zero changes
- `src/lib/types.ts` — TypeScript interfaces (change `Recording.blob` to `filePath`)
- `src/data/words.json`, `src/data/lessons.json` — static data bundles

### Persistence swap (~10 lines):
- `src/stores/useProgress.ts` — Zustand persist: `localStorage` -> `react-native-mmkv`

### Full rewrite:
- `src/components/Flashcard.tsx` — CSS 3D transforms -> `react-native-reanimated` Y-axis rotation
- `src/lib/recorder.ts` — MediaRecorder + IndexedDB -> `expo-av` + `expo-sqlite`
- `src/lib/audio.ts` — `new Audio()` -> `expo-av` `Audio.Sound`
- All page components — `div/span` -> `View/Text`, CSS -> NativeWind, `next/link` -> `expo-router`

### Django models (key relationships):
- **Word** <- Sentence (FK), Recording (FK), UserProgress (FK)
- **Lesson** <- Word (M2M), UserLessonProgress (FK)
- **Speaker** <- Recording (FK)
- **DictionaryEntry** -> Word (nullable FK, for promoted entries)
- **User** <- UserProgress, UserLessonProgress, UserStreak (OneToOne)

### RBAC:
| Role | Permissions |
|------|------------|
| Non-authenticated | Read vocabulary, dictionary, about |
| User | + Sync progress, upload recordings, manage own profile |
| Admin (non-technical) | + Django Admin: approve recordings, verify words, manage lessons |
| Technical Admin | + Full Django Admin (superuser) |

## Open Items to Verify

1. **"niletina"**: Not in dictionary/vocabulary. "let" (ለት) = "go" exists as `verb-1`. Likely 1st person plural imperative ("let's go"). Verify with native speaker.
2. **Apple OAuth**: Requires Apple Developer Program ($99/yr). Defer until iOS app is ready for App Store.
3. **NAT Gateway cost**: $32/month minimum. Consider NAT instance or VPC endpoints for dev.
4. **Birdie character design**: Need art assets. Placeholder SVG initially.

## Estimated Monthly AWS Cost

| Resource | Dev | Prod |
|----------|-----|------|
| ECS Fargate (0.25 vCPU, 0.5GB) | ~$10 | ~$20 |
| RDS Postgres (db.t4g.micro) | ~$15 | ~$25 (t4g.small) |
| S3 (storage + requests) | ~$1 | ~$3 |
| CloudFront | ~$0 (free tier) | ~$5 |
| Route 53 | ~$1 | ~$1 |
| NAT Gateway | ~$32 | ~$32 |
| SQS | ~$0 | ~$0 |
| Sentry | $0 (free) | $0 (free) |
| Grafana Cloud | $0 (free) | $0 (free) |
| **Total** | **~$59** | **~$86** |

Note: NAT Gateway is the biggest cost. Can reduce to ~$27/$54 with NAT instance for dev.

## Verification Plan

1. **Phase 0**: `make setup && make dev` runs full local stack. `import_vocabulary` loads CSV data. Django Admin shows words with 3 scripts.
2. **Phase 1**: `curl localhost:8000/api/v1/words/` returns vocabulary. Auth flow works e2e. `pytest` passes with Postgres.
3. **Phase 2**: `npx expo start` runs on web + iOS simulator. Flashcard flip works. Recording captures audio. Progress persists.
4. **Phase 3**: `terraform apply -var-file=environments/dev.tfvars` deploys dev stack. All dev.* subdomains resolve with SSL. GitHub Actions deploy successfully.
5. **Phase 5**: Release tag triggers prod deploy. App Store submission accepted. Grafana dashboards show live metrics. Sentry captures test error.

## Swarm Decomposition

For `/swarm`, these work streams can run in parallel:

| Stream | Agent | Can Start | Depends On |
|--------|-------|-----------|------------|
| Django backend (models, admin, Docker) | worker | Immediately | — |
| Terraform infra (VPC, RDS, S3, ECS) | worker | Immediately | — |
| Expo scaffold + core components | worker | Immediately | — |
| Django API endpoints + auth | worker | After Django models | Stream 1 |
| Expo page migration | worker | After Expo scaffold | Stream 3 |
| CI/CD pipelines | worker | After Django + Expo scaffolds | Streams 1+3 |
| New features (dictionary, volunteer, birdie) | worker | After Expo pages | Stream 5 |
