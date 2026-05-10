# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Decimator is a Discord roast bot backed by the Claude API. Users invoke `/roast` to generate an AI-powered roast of a target member, with configurable heat level and language.

## Commands

```bash
pnpm dev          # Run in development (tsx, no build step)
pnpm deploy       # Register slash commands with Discord (run once, or after command changes)
pnpm build        # Compile TypeScript → dist/
pnpm start        # Run compiled output
```

## Architecture

- `src/index.ts` — entry point; sets up the Discord client, loads commands into a Collection, routes `interactionCreate` events
- `src/deploy-commands.ts` — one-shot script to push command definitions to Discord via REST; re-run whenever `commands/*.ts` signatures change
- `src/config.ts` — loads and validates all env vars; throw-early on missing required vars
- `src/commands/roast.ts` — `/roast` slash command; handles channel lock, cooldown, self-roast guard, `deferReply`, context gathering, embed construction
- `src/services/roast-service.ts` — Claude API call with heat-level system prompts and per-language injection; returns fallback roast on failure
- `src/utils/cooldown.ts` — `Map<userId, timestamp>` cooldown tracker
- `src/utils/languages.ts` — language configs, labels, and per-language fallback roasts

The command flow is: `index.ts` → `roast.ts` → `roast-service.ts` → Claude API.

## Setup & Skills

- Full scaffold, Discord bot config, and deployment steps: @.claude/setup.md
- SDK patterns, prompt templates, language configs, Discord.js snippets: @.claude/skills.md

## Key env vars

| Variable | Purpose |
|---|---|
| `DISCORD_TOKEN` | Bot token |
| `DISCORD_CLIENT_ID` | Application ID |
| `DISCORD_GUILD_ID` | Test server ID |
| `ANTHROPIC_API_KEY` | Claude API key |
| `ROAST_CHANNEL_ID` | (optional) restrict to one channel |
| `ROAST_COOLDOWN` | Seconds between roasts per user |

## Model

`claude-sonnet-4-20250514`, `max_tokens: 300`
