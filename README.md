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

### `@Decimator` (mention)

Mention the bot in any channel — it reads the message, detects intent, and replies.

```
@Decimator roast this guy
@Decimator roast @someone
@Decimator explain what he said     ← reply to a message first
@Decimator                          ← no context, dry observation
```

Responds in the same language you write in. Shares the same cooldown as `/roast`.

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
- **Bot** tab → enable **Server Members Intent**, **Presence Intent**, and **Message Content Intent**
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
├── mention.md         # @mention handler tone
├── lang-en.md
├── lang-id.md
├── lang-zh.md
├── lang-ar.md
├── lang-tolaki.md
├── lang-hokkien.md
└── lang-khek.md
```

## Deployment

**Tencent Cloud — Lighthouse / CVM + Docker (recommended)**

> Pick a **Hong Kong or Singapore** region. Mainland-China regions cannot reach `discord.com` or `api.anthropic.com` without an outbound proxy.

1. Create a Lighthouse instance (轻量应用服务器, 2 vCPU / 2 GB is plenty) with the **Docker** application image, or a CVM with Docker installed
2. SSH in and pull the repo:
   ```bash
   git clone <your-repo-url> decimator && cd decimator
   ```
3. Create `.env` on the server with the same vars as local (`DISCORD_TOKEN`, `DISCORD_CLIENT_ID`, `DISCORD_GUILD_ID`, `ANTHROPIC_API_KEY`, and optionally `ROAST_CHANNEL_ID`, `ROAST_COOLDOWN`)
4. Build and run:
   ```bash
   docker compose up -d --build
   docker compose logs -f          # confirm the bot logged in
   ```
5. Redeploy after a change:
   ```bash
   git pull && docker compose up -d --build
   ```
6. Run `pnpm run deploy` locally after each command definition change

No inbound port and no security-group rule is needed — the bot is an outbound gateway
WebSocket client, not a server. `restart: unless-stopped` brings it back after a reboot.

**Tencent Cloud — TKE / Cloud Run (alternative)**
1. Build and push to TCR (Tencent Container Registry):
   ```bash
   docker build -t ccr.ccs.tencentyun.com/<namespace>/decimator:latest .
   docker push ccr.ccs.tencentyun.com/<namespace>/decimator:latest
   ```
2. Deploy as a single-replica workload, env vars as secrets, **no** service/ingress
3. Do **not** use SCF (Serverless Cloud Function) — the bot holds a persistent
   WebSocket and needs a long-running process

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
