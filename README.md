# Lee's Assistant

A personal AI-powered dashboard: goals, a calendar, a daily AI newsletter tailored to Lee, and an interactive voice-enabled "Jarvis" globe on the home screen. Bilingual (Mandarin default, English toggle in Settings).

## Quick start (local, no cloud accounts needed)

```bash
npm install
npx prisma migrate dev   # creates prisma/dev.db (SQLite) — already run once, but safe to re-run
cp .env.example .env.local
```

Edit `.env.local` and set at minimum:

- `LEE_APP_PASSWORD` — the password used to log in
- `SESSION_SECRET` — any long random string

Then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in. Everything works immediately with placeholder content for the AI assistant and newsletter — no Anthropic key required to see the app running.

## Turning on the real AI features

Add to `.env.local`:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Restart the dev server. Once set:

- The **Home** globe's chat panel calls Claude for real answers, grounded in your actual goals and calendar events.
- The **AI Newsletter** tab searches the web for genuinely new AI news/tools and explains them in plain language, calibrated to what you've told it about yourself (Settings → "AI knowledge level").

## WeChat Work notifications

Lee lives in China, so the AI newsletter can push its daily digest into **WeChat Work (企业微信)** via a group bot webhook — the safe, ToS-compliant way to get messages into WeChat (personal-account automation is not, and risks a ban).

1. In WeChat Work, add a "Group Bot" to a chat and copy its webhook URL.
2. Paste it into the app's **Settings** tab under "WeChat Work bot webhook".

No app restart needed — it's stored in the database, not an env var.

## Automating the morning newsletter

`/api/cron/newsletter` generates a digest and pushes it to WeChat Work if configured. It's protected by `CRON_SECRET` — set that in `.env.local` (and in your hosting provider's env vars) and only requests with a matching `Authorization: Bearer <CRON_SECRET>` header can trigger it.

`vercel.json` is already set up to call it daily at 23:00 UTC (≈ 07:00 Beijing/Shanghai time) if you deploy to Vercel and enable Vercel Cron. If you host elsewhere, point any scheduler (cron job, GitHub Actions, etc.) at that URL with the right header.

## Moving off SQLite later

This runs on local SQLite by default so you can try it immediately. To move to a real hosted Postgres database (e.g. Neon or Supabase) later:

1. Get a Postgres connection string.
2. Change `provider = "sqlite"` to `provider = "postgresql"` in `prisma/schema.prisma`.
3. Set `DATABASE_URL` to the Postgres connection string.
4. Run `npx prisma migrate dev` again.

No application code needs to change.

## Project structure

- `src/app/(dashboard)/` — the five tabs: Home (globe + voice assistant), Goals, Calendar, AI Newsletter, Settings
- `src/app/api/` — backend routes (goals, events, newsletter, settings, assistant chat, auth, cron)
- `src/lib/` — Prisma client, session/auth helpers, Anthropic client, WeChat push, i18n dictionaries
- `prisma/schema.prisma` — data model

## Voice on the Home tab

Voice input/output uses the browser's built-in Web Speech API (works in Chrome/Edge). If unsupported, the mic button is disabled automatically and text chat still works.
