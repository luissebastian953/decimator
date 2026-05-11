# Decimator — Setup Instructions

## Directory Structure

```
decimator/
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
├── eslint.config.mjs
├── prompts/
│   ├── heat-1.md               # Mild system prompt
│   ├── heat-2.md               # Spicy system prompt
│   ├── heat-3.md               # Nuclear system prompt
│   ├── critical-rules.md       # Appended to all heat levels
│   ├── lang-en.md
│   ├── lang-id.md
│   ├── lang-zh.md
│   ├── lang-tolaki.md
│   ├── lang-hokkien.md
│   └── lang-khek.md
└── src/
    ├── index.ts                # Bot entry point, client setup, interaction handler
    ├── deploy-commands.ts      # One-time script to register slash commands
    ├── config.ts               # Loads and exports env vars with validation
    ├── commands/
    │   └── roast.ts            # /roast slash command definition + execute()
    ├── services/
    │   └── roast-service.ts    # Claude API call, prompt construction, fallback roasts
    └── utils/
        ├── cooldown.ts         # Per-user cooldown tracker
        ├── load-prompt.ts      # Reads prompts/*.md files at startup
        └── languages.ts        # Language configs, labels, fallback roasts per language
```

---

## Phase 1: Project Scaffold

1. Initialize the project:
   ```bash
   pnpm init
   ```

2. Install dependencies:
   ```bash
   pnpm add discord.js @anthropic-ai/sdk dotenv
   pnpm add -D typescript @types/node tsx eslint typescript-eslint commitizen cz-conventional-changelog
   ```

3. Create `tsconfig.json` with:
   - `target`: ES2022
   - `module`: Node16 / NodeNext
   - `moduleResolution`: Node16 / NodeNext
   - `outDir`: dist
   - `rootDir`: src
   - `strict`: true
   - `esModuleInterop`: true
   - `skipLibCheck`: true

4. Add scripts to `package.json`:
   ```json
   "scripts": {
     "dev": "tsx src/index.ts",
     "deploy": "tsx src/deploy-commands.ts",
     "build": "tsc",
     "start": "node dist/index.js",
     "lint": "eslint src",
     "lint:fix": "eslint src --fix",
     "commit": "cz"
   },
   "config": {
     "commitizen": {
       "path": "./node_modules/cz-conventional-changelog"
     }
   }
   ```

5. Create `eslint.config.mjs`:
   ```js
   import tseslint from "typescript-eslint";
   export default tseslint.config(...tseslint.configs.recommended, {
     ignores: ["dist/**"],
     rules: {
       "@typescript-eslint/no-explicit-any": "warn",
       "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
     },
   });
   ```

6. Create `.env` with these variables:
   - `DISCORD_TOKEN` — bot token from Developer Portal
   - `DISCORD_CLIENT_ID` — application ID from General Information
   - `DISCORD_GUILD_ID` — your test server ID (right-click server → Copy ID)
   - `ANTHROPIC_API_KEY` — from console.anthropic.com
   - `ROAST_CHANNEL_ID` — (optional) lock roasts to one channel
   - `ROAST_COOLDOWN` — seconds between roasts per user (e.g. 30)

7. Create `.gitignore`: `node_modules/`, `.env`, `dist/`

---

## Phase 2: Discord Bot Setup

1. Go to https://discord.com/developers/applications
2. **New Application** → name it → Create
3. **Bot** tab → Reset Token → save it as `DISCORD_TOKEN`
4. Enable **Privileged Gateway Intents**:
   - Server Members Intent ✅
   - Presence Intent ✅
5. **OAuth2 → URL Generator**:
   - Scopes: `bot`, `applications.commands`
   - Permissions: Send Messages, Use Slash Commands, Embed Links
6. Open the generated URL to invite the bot to your server

---

## Phase 3: Build the Bot

Work through the files in this order:

### 1. `src/config.ts`
- Load dotenv
- Export typed config object with all env vars
- Validate that required vars exist, throw early if missing

### 2. `src/utils/load-prompt.ts`
- Read `prompts/<name>.md` relative to `process.cwd()`
- Used by `languages.ts` and `roast-service.ts` at startup

### 3. `src/utils/cooldown.ts`
- Export a `Map<string, number>` to track `userId → lastUsedTimestamp`
- Export a `checkCooldown(userId)` function that returns remaining seconds or 0

### 4. `src/utils/languages.ts`
- Define `LanguageConfig` interface: `key`, `label`, `emoji`, `promptInstruction`, `fallbacks`
- Load `promptInstruction` for each language via `loadPrompt("lang-<key>")`
- Export `LANGUAGES` map and `getLanguage(key)` helper
- Supported keys: `en`, `id`, `zh`, `tolaki`, `hokkien`, `khek`

### 5. `src/services/roast-service.ts`
- Initialize Anthropic client
- Load heat prompts and critical rules via `loadPrompt()` at module init
- Build system prompt: `[heatPrompt, criticalRules, language.promptInstruction].join("\n")`
- Build user prompt with target context (display name, reason, account age, roles, status)
- Call `anthropic.messages.create()` with model `claude-sonnet-4-20250514`, max_tokens 300
- Wrap in try/catch, return a random fallback roast in the requested language on failure

### 6. `src/commands/roast.ts`
- Export `data`: SlashCommandBuilder with options:
  - `target` (User, required)
  - `reason` (String, optional)
  - `heat` (Integer 1–3, optional, default 2)
  - `lang` (String choice, optional, default "en") — choices: en, id, zh, tolaki, hokkien, khek
  - `style` (String choice, optional, default "message") — choices: message, embed
- Export `execute(interaction, client)`:
  1. Check channel lock (if `ROAST_CHANNEL_ID` is set)
  2. Check cooldown
  3. Block self-roast (if target is the bot)
  4. `deferReply()` — LLM calls take a few seconds
  5. Gather target context from guild member cache
  6. Call `generateRoast()` with context + selected language
  7. If style is `message` → `editReply({ content: roast })`
  8. If style is `embed` → build `EmbedBuilder` with color-coded heat, victim, reason, language flag, footer → `editReply({ embeds: [embed] })`

### 7. `src/deploy-commands.ts`
- Import command data and call `Routes.applicationGuildCommands()` to register
- Run once with `pnpm run deploy`, re-run when command definitions change

### 8. `src/index.ts`
- Create `Client` with intents: Guilds, GuildMembers, GuildPresences
- Attach a `commands` Collection to the client
- Handle `interactionCreate` → route to matching command's `execute()`
- `client.login()`

---

## Phase 4: Run

```bash
# Register commands (once, or after command definition changes)
pnpm run deploy

# Start in dev mode
pnpm dev
```

Test with `/roast @someone reason:being annoying heat:3 lang:id` in your server.

---

## Phase 5: Deploy (Railway)

1. Push to GitHub
2. railway.app → New Project → Deploy from GitHub
3. Add env vars in Railway dashboard (Variables tab)
4. Set **Build Command**: `pnpm build`
5. Set **Start Command**: `pnpm start`
6. Auto-deploys on every push

> **Note**: Keep build and start commands separate. Using `pnpm build && pnpm start` as the build command will hang — the bot process starts inside the build container.

**Fly.io (alternative):**
1. Add a `Dockerfile` (node:20-slim, copy, pnpm install, pnpm build, CMD node dist/index.js)
2. `fly launch` → `fly secrets set DISCORD_TOKEN=... ANTHROPIC_API_KEY=...`
3. `fly deploy`
