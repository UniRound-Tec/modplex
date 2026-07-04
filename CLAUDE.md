# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is an AI API gateway/proxy built with Go. It aggregates 40+ upstream AI providers (OpenAI, Claude, Gemini, Azure, AWS Bedrock, etc.) behind a unified API, with user management, billing, rate limiting, and an admin dashboard.

This deployment ships under the display brand **Modplex** with a bespoke, "nothing-design" UI on the `default` theme. Nothing-design surfaces so far: the home route `/` (a GSAP scene-narrative landing, `web/default/src/features/home/landing/`), the auth screens (sign-in/up/etc.), all modals/sheets/dialogs, the shared public header, the pricing / Model Square page, and the authenticated **console chrome** (the app header `components/layout/components/app-header.tsx` + sidebar `app-sidebar.tsx`). Design tokens live in `web/default/src/styles/nothing-landing.css` (`--nd-*`). See **Nothing-design conventions** and **Branding & Attribution** below.

### Branding & Attribution (AGPL-3.0)

The project is licensed under AGPL-3.0 (see `LICENSE` and the per-file `Copyright (C) … zofar` headers). Two separate concerns:

- **Display name — customizable.** The user-facing product name and logo are deployment branding. Set them at runtime (Admin → Settings → `SystemName` / `Logo`); the baked fallbacks are `common/constants.go` (`SystemName`) and the `<title>`/meta in `web/{default,classic}/index.html`. This deployment uses **Modplex**.
- **Copyright / license / attribution — preserved.** Do NOT remove or replace the AGPL license, the `Copyright (C) … zofar` source-file headers, the upstream project credit, or the footer attribution linking to `github.com/zofar/modplex`. AGPL requires these be kept intact regardless of display branding; renaming the product does not extend to stripping them.

### Nothing-design conventions (`web/default`)

How the monochrome "nothing-design" look is applied without forking every component:

- **Token-remap scopes.** `nothing-landing.css` defines the `--nd-*` palette/fonts on scope classes and *remaps the app's theme tokens* (`--background`, `--foreground`, `--card`, `--muted`, `--border`, `--primary`, `--radius: 0`, …) to them inside `.modplex-auth`, `.modplex-pricing`, `.modplex-console`, and `.nd-modal`. Wrapping a subtree in one of these classes restyles all child Tailwind utilities (`bg-muted`, `border`, `text-foreground`, …) to the nothing idiom automatically — prefer this over editing each component. `.modplex-console` additionally remaps the `--sidebar-*` tokens (so it covers the console sidebar primitive); those sidebar remaps also live on `.nd-modal` so the mobile sidebar (a portaled `Sheet`) is covered. `.nd-scope` injects only the `--nd-*` token *values* + body font/color (no app-token remap, no bg) — use it on portaled dropdown/popover surfaces and on chrome (e.g. the header `<nav>`) so `var(--nd-*)` resolves outside a scope.
- **Helper classes:** `.nd-display` (Doto, hero numbers only), `.nd-label`/`.nd-eyebrow` (Space Mono, ALL CAPS labels), `.nd-mono`/`.nd-meta` (Space Mono, tabular figures for data). Brand mark is a red square (`bg-[#d71921]`, the one accent), matching `landing-header.tsx`. Note `.nd-label`/`.nd-eyebrow`/`.nd-display` set their own `color` and are **unlayered** (imported after Tailwind), so they win over plain Tailwind color utilities — to override the ink on an `.nd-label` element (e.g. an active/hover nav link) you must use the important modifier, `text-[var(--nd-text-display)]!`.
- **Shared header** (`components/layout/components/public-header.tsx`) is used by all public pages; it reuses the landing's self-contained controls (`LandingLangMenu`/`LandingThemeToggle`/`LandingNotifications`/`LandingProfile`) inside an `.nd-scope` nav, with mono nav links. The authenticated **console header** (`app-header.tsx`) mirrors this set inside a `.modplex-console` bar (red-square brand + mono `SidebarTrigger`/search/links); the legacy theme/preset/layout customizer (`ConfigDrawer`) was intentionally removed — the console keeps only the monochrome black-and-white theme (light/dark toggle retained).
- **Modal/sheet animations:** this Base UI build emits only `data-open`/`data-closed` (NOT `data-starting-style`/`data-ending-style`), so animate with `data-open:animate-in … data-closed:animate-out …` (tw-animate-css). For a sheet's *exit* animation to play, its caller must keep it mounted during close (drive `open` from state, keep the content model around) — don't conditionally unmount it on close.

### Model display name & marketplace usage

- **`DisplayName`** (`model_meta.go` `Model.DisplayName`, surfaced as `display_name` on `/api/pricing`): an optional friendly name shown in the Model Square; the API call contract is unchanged — `model_name` stays the identifier, and the card falls back to it when empty. Any new `Model` field MUST also be added to the `Select(...)` whitelist in `Model.Update()` or it won't persist.
- **Default marketplace sort = site-wide usage.** `usePricingData` merges per-model `total_tokens` from `/api/rankings?period=all` (the rankings feature) into each model as `usage_tokens`; the pricing page defaults to the `usage` sort and shows the figure under the price (`features/pricing`).

## Tech Stack

- **Backend**: Go 1.22+ (go.mod targets 1.25), Gin web framework, GORM v2 ORM
- **Frontend**: React 19, TypeScript, Rsbuild, Base UI, Tailwind CSS
- **Databases**: SQLite, MySQL, PostgreSQL (all three must be supported)
- **Cache**: Redis (go-redis) + in-memory cache
- **Auth**: JWT, WebAuthn/Passkeys, OAuth (GitHub, Discord, OIDC, etc.)
- **Frontend package manager**: Bun (preferred over npm/yarn/pnpm)

## Commands

The frontend must be built into `web/{default,classic}/dist` before the Go binary will serve it (the dist directories are embedded via `//go:embed` in `router/`). The repo root has a `makefile` that orchestrates both.

**Backend (run from repo root):**
- Run dev server: `go run main.go` (serves on `:3000` by default; honors `.env` — copy from `.env.example`)
- Build binary: `CGO_ENABLED=0 go build -o modplex` (SQLite uses the pure-Go `glebarez/sqlite` driver, so no CGO/gcc needed)
- Vet: `go vet ./...`
- Format: `gofmt -w <files>` (CI/review expect gofmt-clean code)
- Run all tests: `go test ./...`
- Run one package: `go test ./controller/`
- Run one test: `go test ./controller/ -run TestName -v`

**Frontend (default theme — run from `web/default/`):**
- Install: `bun install` (or `cd web && bun install` — `web/` is a Bun workspace shared by both themes)
- Dev server: `bun run dev`
- Build: `bun run build`
- Typecheck: `bun run typecheck` (`tsc -b`)
- Lint: `bun run lint` (eslint) / format: `bun run format`
- i18n: `bun run i18n:sync` (see Internationalization below)

**Combined / Docker dev (from repo root, via `makefile`):**
- `make build-all-frontends` — build both `web/default` and `web/classic`
- `make all` — build frontends, then `go run main.go`
- `make dev-web` — run both frontend dev servers (default `:5173`, classic `:5174`)
- `make dev-api` — start backend deps (Postgres etc.) via `docker-compose.dev.yml`
- `make reset-setup` — clear the first-run setup wizard state (deletes `setups`/root users) for re-testing onboarding

## Architecture

Layered architecture: Router -> Controller -> Service -> Model

```
router/        — HTTP routing (API, relay, dashboard, web)
controller/    — Request handlers
service/       — Business logic
model/         — Data models and DB access (GORM)
relay/         — AI API relay/proxy with provider adapters
  relay/channel/ — Provider-specific adapters (openai/, claude/, gemini/, aws/, etc.)
middleware/    — Auth, rate limiting, CORS, logging, distribution
setting/       — Configuration management (ratio, model, operation, system, performance)
common/        — Shared utilities (JSON, crypto, Redis, env, rate-limit, etc.)
dto/           — Data transfer objects (request/response structs)
constant/      — Constants (API types, channel types, context keys)
types/         — Type definitions (relay formats, file sources, errors)
i18n/          — Backend internationalization (go-i18n, en/zh)
oauth/         — OAuth provider implementations
pkg/           — Internal packages (cachex, ionet, billingexpr)
web/             — Frontend themes container
 web/default/   — Default frontend (React 19, Rsbuild, Base UI, Tailwind)
  web/classic/   — Classic frontend (React 18, Vite, Semi Design)
  web/default/src/i18n/ — Frontend internationalization (i18next, zh/en/fr/ru/ja/vi)
```

`main.go` is the entry point: it loads env/options, runs GORM auto-migration (`model.InitDB`), optionally connects the log DB and Redis, warms in-memory caches, and registers all routes via `router.SetRouter`. Routers split by concern: `api-router.go` (admin/user management APIs), `relay-router.go` (the AI proxy endpoints), `video-router.go`, `dashboard.go`, `web-router.go` (serves the embedded frontend `dist`).

### Relay request lifecycle (the core of this codebase)

A client request to an OpenAI-compatible endpoint flows: **route → `middleware/` (auth, token, distribution/channel-selection, rate limit) → top-level handler in `relay/` (e.g. `relay/compatible_handler.go`, `claude_handler.go`, `image_handler.go`, `audio_handler.go`, `responses_handler.go`) → provider Adaptor**.

- The request format is identified by a **relay mode** (`relay/constant/relay_mode.go`) and the selected channel has an **API type** (`constant/api_type.go`, e.g. `APITypeOpenAI`, `APITypeAnthropic`).
- `relay.GetAdaptor(apiType)` in `relay/relay_adaptor.go` maps the API type to a concrete adapter under `relay/channel/<provider>/`.
- Every chat/completion adapter implements the `channel.Adaptor` interface (`relay/channel/adapter.go`): `Init`, `GetRequestURL`, `SetupRequestHeader`, the `Convert*Request` family (OpenAI / Claude / Gemini / Embedding / Rerank / Audio / Image / Responses), `DoRequest`, `DoResponse`, `GetModelList`, `GetChannelName`. The handler calls these in order: convert the unified request to the provider's format, send it, then convert the provider response (streaming or not) back to the client's requested format and report `usage`.
- Async/long-running providers (video, image generation, Midjourney) use the separate `channel.TaskAdaptor` interface (same file), which adds billing hooks (`EstimateBilling`, `AdjustBillingOnSubmit`, `AdjustBillingOnComplete`) and a polling contract (`FetchTask`, `ParseTaskResult`). Task relay is driven by `relay/relay_task.go`.

### Adding a new provider/channel

1. Create `relay/channel/<provider>/` implementing `channel.Adaptor` (or `TaskAdaptor` for async tasks).
2. Add an `APIType<Provider>` constant in `constant/api_type.go` (keep `APITypeDummy` last — it is the count sentinel) and a channel type in `constant/channel.go`.
3. Register the adapter in the `GetAdaptor` switch in `relay/relay_adaptor.go`.
4. Follow **Rule 4** (StreamOptions) and **Rule 6** (preserve explicit zero values in request DTOs) below.

## Internationalization (i18n)

### Backend (`i18n/`)
- Library: `nicksnyder/go-i18n/v2`
- Languages: en, zh

### Frontend (`web/default/src/i18n/`)
- Library: `i18next` + `react-i18next` + `i18next-browser-languagedetector`
- Languages: en (base), zh (fallback), fr, ru, ja, vi
- Translation files: `web/default/src/i18n/locales/{lang}.json` — flat JSON, keys are English source strings
- Usage: `useTranslation()` hook, call `t('English key')` in components
- CLI tools: `bun run i18n:sync` (from `web/default/`)

## Project Skills (`.agents/skills/`)

This repo ships task-specific skills worth using when relevant:
- **classic-to-default-sync** — given a commit hash, audit `web/classic` changes and port them to `web/default` for feature parity.
- **i18n-translate** — find and complete missing frontend translations across all supported locales.
- **shadcn-ui** — project-aware shadcn/ui context (components.json, composition, theming) for `web/default` UI work.

## Rules

### Rule 1: JSON Package — Use `common/json.go`

All JSON marshal/unmarshal operations MUST use the wrapper functions in `common/json.go`:

- `common.Marshal(v any) ([]byte, error)`
- `common.Unmarshal(data []byte, v any) error`
- `common.UnmarshalJsonStr(data string, v any) error`
- `common.DecodeJson(reader io.Reader, v any) error`
- `common.GetJsonType(data json.RawMessage) string`

Do NOT directly import or call `encoding/json` in business code. These wrappers exist for consistency and future extensibility (e.g., swapping to a faster JSON library).

Note: `json.RawMessage`, `json.Number`, and other type definitions from `encoding/json` may still be referenced as types, but actual marshal/unmarshal calls must go through `common.*`.

### Rule 2: Database Compatibility — SQLite, MySQL >= 5.7.8, PostgreSQL >= 9.6

All database code MUST be fully compatible with all three databases simultaneously.

**Use GORM abstractions:**
- Prefer GORM methods (`Create`, `Find`, `Where`, `Updates`, etc.) over raw SQL.
- Let GORM handle primary key generation — do not use `AUTO_INCREMENT` or `SERIAL` directly.

**When raw SQL is unavoidable:**
- Column quoting differs: PostgreSQL uses `"column"`, MySQL/SQLite uses `` `column` ``.
- Use `commonGroupCol`, `commonKeyCol` variables from `model/main.go` for reserved-word columns like `group` and `key`.
- Boolean values differ: PostgreSQL uses `true`/`false`, MySQL/SQLite uses `1`/`0`. Use `commonTrueVal`/`commonFalseVal`.
- Use `common.UsingPostgreSQL`, `common.UsingSQLite`, `common.UsingMySQL` flags to branch DB-specific logic.

**Forbidden without cross-DB fallback:**
- MySQL-only functions (e.g., `GROUP_CONCAT` without PostgreSQL `STRING_AGG` equivalent)
- PostgreSQL-only operators (e.g., `@>`, `?`, `JSONB` operators)
- `ALTER COLUMN` in SQLite (unsupported — use column-add workaround)
- Database-specific column types without fallback — use `TEXT` instead of `JSONB` for JSON storage

**Migrations:**
- Ensure all migrations work on all three databases.
- For SQLite, use `ALTER TABLE ... ADD COLUMN` instead of `ALTER COLUMN` (see `model/main.go` for patterns).

### Rule 3: Frontend — Prefer Bun

Use `bun` as the preferred package manager and script runner for the frontend (`web/default/` directory):
- `bun install` for dependency installation
- `bun run dev` for development server
- `bun run build` for production build
- `bun run i18n:*` for i18n tooling

### Rule 4: New Channel StreamOptions Support

When implementing a new channel:
- Confirm whether the provider supports `StreamOptions`.
- If supported, add the channel to `streamSupportedChannels`.

### Rule 5: Upstream Relay Request DTOs — Preserve Explicit Zero Values

For request structs that are parsed from client JSON and then re-marshaled to upstream providers (especially relay/convert paths):

- Optional scalar fields MUST use pointer types with `omitempty` (e.g. `*int`, `*uint`, `*float64`, `*bool`), not non-pointer scalars.
- Semantics MUST be:
  - field absent in client JSON => `nil` => omitted on marshal;
  - field explicitly set to zero/false => non-`nil` pointer => must still be sent upstream.
- Avoid using non-pointer scalars with `omitempty` for optional request parameters, because zero values (`0`, `0.0`, `false`) will be silently dropped during marshal.

### Rule 6: Billing Expression System — Read `pkg/billingexpr/expr.md`

When working on tiered/dynamic billing (expression-based pricing), you MUST read `pkg/billingexpr/expr.md` first. It documents the design philosophy, expression language (variables, functions, examples), full system architecture (editor → storage → pre-consume → settlement → log display), token normalization rules (`p`/`c` auto-exclusion), quota conversion, and expression versioning. All code changes to the billing expression system must follow the patterns described in that document.
