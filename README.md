# Astro Starter Kit: Basics

```sh
bun create astro@latest -- --template basics
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src
│   ├── assets
│   │   └── astro.svg
│   ├── components
│   │   └── Welcome.astro
│   ├── layouts
│   │   └── Layout.astro
│   └── pages
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `bun install`             | Installs dependencies                            |
| `bun dev`             | Starts local dev server at `localhost:4321`      |
| `bun build`           | Build your production site to `./dist/`          |
| `bun preview`         | Preview your build locally, before deploying     |
| `bun astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `bun astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

## Deployment (Vercel)

The app is deployed on Vercel with the `@astrojs/vercel` adapter (`astro.config.mjs`). Pushing to `main` deploys automatically.

### Environment variables

Set these in Vercel → Project → Settings → Environment Variables (tick **Production**), then redeploy. Never commit them.

| Variable | Used for |
|---|---|
| `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY` | Loading orders in the browser (must be set before the build) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side saves (`src/pages/api/*`), settings, drafts, visit log |
| `DASHBOARD_PASSWORD` | Dashboard login |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | Telegram alerts and reminders (group chat IDs start with `-`) |
| `CRON_SECRET` | Optional: protects the reminder routes; Vercel cron sends it automatically |
| `GROQ_API_KEY` (+ optional `GROQ_MODEL`) | AI delivery-fee suggestions in Settings |
| `FAMILY_LINK_KEY` | Optional: fixed family calendar link key |
| `GOOGLE_SERVICE_ACCOUNT_JSON`, `GOOGLE_CALENDAR_ID` | Optional: live Google Calendar for family (whole service-account .json key + calendar ID; setup steps in `src/lib/google-calendar.ts`) |

Settings → **Telegram Alerts** on the live site shows which of the Telegram/Supabase settings the server can see and can send a test message.

### Scheduled reminders

`vercel.json` runs `/api/daily-reminder` (20:00 UTC = 4:00 AM PH) and `/api/tomorrow-reminder` (10:00 UTC = 6:00 PM PH). On the Hobby plan a cron may run any time within its hour.

### Local development

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # same build Vercel runs
```


