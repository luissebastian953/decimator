# Decimator 🔥

A Discord roast bot powered by Claude AI. Use `/roast` to generate a personalized roast of any server member with configurable heat level and language.

## Features

- **3 heat levels** — Mild, Spicy, Nuclear
- **5 languages** — English, Bahasa Indonesia, Tolaki, Hokkien, Khek (Hakka)
- **Personalized roasts** — uses target's display name, status, account age, roles, and join date as ammo
- **Cooldown system** — per-user cooldown to prevent spam
- **Channel lock** — optionally restrict roasts to a designated channel
- **Graceful fallback** — pre-written roasts per language if the API call fails

## Usage

```
/roast target:@user [reason] [heat:1-3] [lang:en|id|tolaki|hokkien|khek]
```

| Option | Description | Default |
|---|---|---|
| `target` | User to roast | required |
| `reason` | Why they're getting roasted | "existing" |
| `heat` | 1 = Mild, 2 = Spicy, 3 = Nuclear | 2 |
| `lang` | Roast language | en |

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

Copy `.env` and fill in the values:

```env
DISCORD_TOKEN=        # Bot token from Discord Developer Portal
DISCORD_CLIENT_ID=    # Application ID from General Information
DISCORD_GUILD_ID=     # Your server ID (right-click server → Copy ID)
ANTHROPIC_API_KEY=    # From console.anthropic.com
ROAST_CHANNEL_ID=     # Optional: lock roasts to one channel
ROAST_COOLDOWN=30     # Seconds between roasts per user
```

### 3. Invite the bot

In the [Discord Developer Portal](https://discord.com/developers/applications):
- **OAuth2 → URL Generator** → Scopes: `bot`, `applications.commands`
- Permissions: Send Messages, Use Slash Commands, Embed Links
- Open the generated URL and authorize the bot to your server

### 4. Register commands & run

```bash
pnpm run deploy   # Register /roast with Discord (run once)
pnpm dev          # Start in development mode
```

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Run with tsx (no build step) |
| `pnpm run deploy` | Register slash commands with Discord |
| `pnpm build` | Compile TypeScript → `dist/` |
| `pnpm start` | Run compiled output |
| `pnpm lint` | Check for lint errors |
| `pnpm lint:fix` | Auto-fix lint errors |
| `pnpm commit` | Interactive conventional commit prompt |

## Prompts

All system prompts are stored as plain markdown files in `prompts/` — edit them without touching TypeScript:

```
prompts/
├── heat-1.md          # Mild tone
├── heat-2.md          # Spicy tone
├── heat-3.md          # Nuclear tone
├── critical-rules.md  # Applied to all heat levels
├── lang-en.md
├── lang-id.md
├── lang-tolaki.md
├── lang-hokkien.md
└── lang-khek.md
```

## Deployment

**Railway (recommended)**
1. Push to GitHub
2. [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add env vars in the Variables tab
4. Set start command: `pnpm build && pnpm start`

**Fly.io**
```bash
fly launch
fly secrets set DISCORD_TOKEN=... DISCORD_CLIENT_ID=... DISCORD_GUILD_ID=... ANTHROPIC_API_KEY=...
fly deploy
```

## Stack

- [discord.js](https://discord.js.org/) v14
- [Anthropic SDK](https://github.com/anthropics/anthropic-sdk-typescript) — `claude-sonnet-4-20250514`
- TypeScript + tsx
- ESLint + Commitizen
