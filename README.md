# Decimator

A Discord bot powered by Claude AI. Roast server members or get cold, honest explanations — in multiple languages.

## Commands

### `/roast`

Generates a personalized roast of a target member. Pings the target on delivery.

```
/roast target:@user [reason] [heat:1-3] [lang] [style]
```

| Option | Description | Default |
|---|---|---|
| `target` | User to roast | required |
| `reason` | Why they're getting roasted | "existing" |
| `heat` | 1 = Mild, 2 = Spicy, 3 = Nuclear | 2 |
| `lang` | Roast language | en |
| `style` | `message` (plain) or `embed` | message |

### `/explain`

Cold, passive-aggressive explanation of a topic or person.

```
/explain [prompt] [target:@user]
```

At least one of `prompt` or `target` must be provided. Both can be combined.

## Languages

| Key | Language |
|---|---|
| `en` | English |
| `id` | Bahasa Indonesia |
| `zh` | 中文 (Mandarin) |
| `ar` | العربية (Arabic) |
| `tolaki` | Tolaki |
| `hokkien` | Hokkien |
| `khek` | Khek (Hakka) |

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

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
- **Bot** tab → enable **Server Members Intent** and **Presence Intent**
- **OAuth2 → URL Generator** → Scopes: `bot`, `applications.commands`
- Permissions: Send Messages, Use Slash Commands, Embed Links
- Open the generated URL and authorize the bot to your server

### 4. Register commands & run

```bash
pnpm run deploy   # Register slash commands with Discord (run once, re-run when commands change)
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

All system prompts live in `prompts/` — edit them without touching TypeScript, restart the bot to apply:

```
prompts/
├── heat-1.md          # Mild tone
├── heat-2.md          # Spicy tone
├── heat-3.md          # Nuclear tone
├── critical-rules.md  # Applied to all heat levels
├── explain.md         # /explain tone
├── lang-en.md
├── lang-id.md
├── lang-zh.md
├── lang-ar.md
├── lang-tolaki.md
├── lang-hokkien.md
└── lang-khek.md
```

## Deployment

**Railway (recommended)**
1. Push to GitHub
2. [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add env vars in the Variables tab
4. Build command: `pnpm build` — Start command: `pnpm start`
5. Run `pnpm run deploy` locally after each command definition change

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
