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
   - `GEMINI_API_KEY` — free, no credit card; see "Turning on the real AI features" below. (Or `ANTHROPIC_API_KEY` if you'd rather pay for Claude.) Leave both unset to see the app with placeholder AI content.
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

The app supports two AI providers — you only need one. If both are set, Anthropic is used.

**Free option (recommended to start): Google Gemini**
1. Go to [aistudio.google.com](https://aistudio.google.com), sign in with a Google account — no credit card required.
2. Click **Get API key** → **Create API key**, copy it.
3. Add it as `GEMINI_API_KEY` in Vercel's environment variables → redeploy.

**Paid option: Anthropic (Claude)**
Get a key at [console.anthropic.com](https://console.anthropic.com) (requires adding billing/credits) and set it as `ANTHROPIC_API_KEY`.

Once either is set:

- The **Home** globe's chat panel gives real answers, grounded in your actual goals and calendar events.
- The **AI Newsletter** and **Crypto** tabs search the web for genuinely new AI news/tools and crypto news, explained in plain language, calibrated to what you've told it about yourself (Settings → "AI knowledge level").

## WeChat Work notifications

Lee lives in China, so the AI newsletter can push its daily digest into **WeChat Work (企业微信)** via a group bot webhook — the safe, ToS-compliant way to get messages into WeChat (personal-account automation is not, and risks a ban).

1. In WeChat Work, add a "Group Bot" to a chat and copy its webhook URL.
2. Paste it into the app's **Settings** tab under "WeChat Work bot webhook".

No redeploy needed — it's stored in the database, not an env var.

## Telegram notifications

Since personal WeChat accounts have no official bot API (and unofficial ones risk getting the account banned), Telegram is the easiest official alternative — Telegram's Bot API is free and fully sanctioned. Note: Telegram is blocked in mainland China, so this only works if the recipient uses a VPN.

1. In Telegram, message **@BotFather** → `/newbot` → follow the prompts. It gives you a bot token like `123456:ABC-DEF...`.
2. Add that token as `TELEGRAM_BOT_TOKEN` in Vercel's environment variables (Settings → Environment Variables), then redeploy.
3. Message your new bot anything (search for it by the username you gave it) to start a chat.
4. Get your chat ID by visiting `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates` in a browser (replace `<YOUR_TOKEN>`) — look for `"chat":{"id":...}` in the response.
5. Paste that number into the app's **Settings** tab under "Telegram chat ID".

## Automating the morning newsletter

`/api/cron/newsletter` generates a digest and pushes it to WeChat Work and/or Telegram, whichever is configured. `vercel.json` is already set up to call it daily at 23:00 UTC (≈ 07:00 Beijing/Shanghai time) via Vercel Cron — this is enabled automatically once the app is deployed on Vercel with `CRON_SECRET` set. Vercel sends that secret as a Bearer token automatically, so no extra setup is needed.

## Cryptocurrency tracking

Prices come from CoinGecko's free public API — no signup or API key required. Pick up to 5 coins to track in **Settings**; they show as a live ticker (refreshes every 10 seconds) on the **Home** page, and as detailed cards on the dedicated **Crypto** tab. The Crypto tab also has an on-demand AI news digest (via whichever AI provider is configured + web search, same pattern as the AI Newsletter) covering whatever coins you're tracking.

## Project structure

- `src/app/(dashboard)/` — the six tabs: Home (globe + voice assistant + crypto ticker), Goals, Calendar, AI Newsletter, Crypto, Settings
- `src/app/api/` — backend routes (goals, events, newsletter, crypto, settings, assistant chat, auth, cron)
- `src/lib/` — Prisma client, session/auth helpers, Anthropic client, WeChat/Telegram push, crypto price fetching, i18n dictionaries
- `prisma/schema.prisma` — data model (Postgres)

## Voice on the Home tab

Voice input/output uses the browser's built-in Web Speech API (works in Chrome/Edge). If unsupported, the mic button is disabled automatically and text chat still works.
