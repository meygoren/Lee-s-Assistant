# Lee's Assistant

A personal AI-powered dashboard: goals, a calendar, a daily AI newsletter tailored to Lee, and an interactive voice-enabled "Jarvis" globe on the home screen. Bilingual (Mandarin default, English toggle in Settings).

## Deploy to Vercel (no terminal needed)

This is the recommended way to run the app. See the step-by-step click-through guide in the project chat, or follow this summary:

1. In the Vercel dashboard, import this GitHub repo as a project (or point an existing project's **Production Branch** at this branch, in Project Settings → Git).
2. Project → **Storage** tab → **Create Database** → choose a Postgres database. Vercel automatically sets `DATABASE_URL` for you.
3. Project → **Settings** → **Environment Variables**, add:
   - `LEE_APP_PASSWORD` — the password you'll use to log in
   - `SESSION_SECRET` — any long random string
   - `CRON_SECRET` — any long random string (protects the automated morning newsletter job)
   - `ANTHROPIC_API_KEY` — optional; leave unset to see the app with placeholder AI content, add it later to turn on real AI
4. Redeploy (Vercel does this automatically after you add env vars, or click **Redeploy** in the Deployments tab).

That's it — the build step (`prisma generate && prisma db push`) creates all the database tables automatically, no migration commands to run by hand.

## Local development (optional)

```bash
npm install
cp .env.example .env.local
```

Edit `.env.local` and set `LEE_APP_PASSWORD`, `SESSION_SECRET`, and `DATABASE_URL` (a Postgres connection string — you can reuse the same one Vercel created for you, found in Vercel → Storage → your database → `.env.local` tab).

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in.

## Turning on the real AI features

Set `ANTHROPIC_API_KEY` (in Vercel's env vars, or `.env.local` for local dev). Once set:

- The **Home** globe's chat panel calls Claude for real answers, grounded in your actual goals and calendar events.
- The **AI Newsletter** tab searches the web for genuinely new AI news/tools and explains them in plain language, calibrated to what you've told it about yourself (Settings → "AI knowledge level").

## WeChat Work notifications

Lee lives in China, so the AI newsletter can push its daily digest into **WeChat Work (企业微信)** via a group bot webhook — the safe, ToS-compliant way to get messages into WeChat (personal-account automation is not, and risks a ban).

1. In WeChat Work, add a "Group Bot" to a chat and copy its webhook URL.
2. Paste it into the app's **Settings** tab under "WeChat Work bot webhook".

No redeploy needed — it's stored in the database, not an env var.

## Automating the morning newsletter

`/api/cron/newsletter` generates a digest and pushes it to WeChat Work if configured. `vercel.json` is already set up to call it daily at 23:00 UTC (≈ 07:00 Beijing/Shanghai time) via Vercel Cron — this is enabled automatically once the app is deployed on Vercel with `CRON_SECRET` set. Vercel sends that secret as a Bearer token automatically, so no extra setup is needed.

## Project structure

- `src/app/(dashboard)/` — the five tabs: Home (globe + voice assistant), Goals, Calendar, AI Newsletter, Settings
- `src/app/api/` — backend routes (goals, events, newsletter, settings, assistant chat, auth, cron)
- `src/lib/` — Prisma client, session/auth helpers, Anthropic client, WeChat push, i18n dictionaries
- `prisma/schema.prisma` — data model (Postgres)

## Voice on the Home tab

Voice input/output uses the browser's built-in Web Speech API (works in Chrome/Edge). If unsupported, the mic button is disabled automatically and text chat still works.
