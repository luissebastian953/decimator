# Decimator — Skills Reference

## 1. Anthropic SDK (TypeScript)

### Initialization
```typescript
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
```

### Basic Call Pattern
```typescript
const response = await anthropic.messages.create({
  model: "claude-sonnet-4-20250514",
  max_tokens: 300,
  system: "system prompt here",
  messages: [{ role: "user", content: "user prompt here" }],
});

const text = response.content[0].type === "text" ? response.content[0].text : "";
```

### Error Handling
- Wrap every API call in try/catch
- On failure, fall back to a pre-written roast array
- Log the error for debugging but never expose API errors to Discord users

---

## 2. Prompt Engineering

### System Prompt Templates (stored in `prompts/`)

```
HEAT 1 (Mild):
You are a witty comedian in a Discord server.
Deliver a light, playful roast — like teasing a friend.
Clever wordplay and PG-13 humor. 1 sentence only.

HEAT 2 (Spicy):
You are a foul-mouthed roast battle comedian in a Discord server.
Deliver a sharp, cutting roast with no mercy.
Use sarcasm, creative comparisons, and profanity for impact.
Swear naturally like a stand-up comedian would. 1 sentence only.

HEAT 3 (Nuclear):
You are a ruthless, unhinged roast battle comedian in a Discord server.
Deliver an absolutely devastating roast. Scorched earth.
Be foul-mouthed and creatively brutal.
Use profanity liberally and naturally. 1 sentence only.
```

### Critical Rules — `prompts/critical-rules.md` (append to ALL heat levels)

```
- Use Discord markdown (**bold**, *italic*) for emphasis when it hits harder.
- NEVER add disclaimers, apologies, or "just kidding" at the end.
- NEVER self-censor swear words with asterisks or symbols — write them fully.
- Just deliver the roast. Nothing before it, nothing after it.
- Do NOT use emojis. The only exceptions allowed are 💀, 🗿, and 🥀 — use them sparingly, only when they genuinely land harder than words.
```

### User Prompt Template

```
Roast the user "{displayName}".
Reason: {reason}
Discord status: {status}
Account created: {accountAge}
Joined server: {joinedServer}
Number of roles: {roleCount}

Use any of these details as ammo if they're funny. Be creative.
```

### System Prompt Assembly

```typescript
const systemPrompt = [
  loadPrompt(`heat-${heat}`),
  loadPrompt("critical-rules"),
  language.promptInstruction,
].join("\n");
```

### Why This Works

| Prompt element | Purpose |
|---|---|
| "roast battle comedian" | Activates the comedy genre — Claude knows the format |
| "Discord server" | Grounds the context so jokes land for the audience |
| "swear naturally" | Unlocks profanity without Claude defaulting to clean |
| "no asterisks" | Prevents self-censoring like "f***" |
| "nothing before/after" | Prevents preambles and disclaimers |
| "1 sentence only" | Keeps roasts punchy — not a paragraph |
| Target context fields | Gives personalized ammo instead of generic burns |

---

## 3. Prompt File Loader

All prompts live in `prompts/*.md` and are loaded once at startup:

```typescript
// src/utils/load-prompt.ts
import { readFileSync } from "fs";
import { join } from "path";

export function loadPrompt(name: string): string {
  return readFileSync(join(process.cwd(), "prompts", `${name}.md`), "utf-8").trim();
}
```

Edit any `.md` file and restart the bot — no TypeScript changes needed.

---

## 4. Multi-Language Support

### Supported Languages

| Key | Language | Claude Proficiency | Notes |
|---|---|---|---|
| `en` | English | Excellent | Default. Best roast quality and slang. |
| `id` | Bahasa Indonesia | Very Good | Handles slang (lu, gue, anjir, etc.) well. |
| `zh` | Mandarin Chinese | Excellent | Simplified characters, internet slang. |
| `tolaki` | Tolaki (Southeast Sulawesi) | Limited | Low-resource. May mix in Indonesian. Provide example phrases. |
| `hokkien` | Hokkien (Fujian/Taiwanese) | Moderate | Allow romanized output (POJ or Tâi-lô) for Discord readability. |
| `khek` | Hakka (Khek) | Limited | Low-resource. Allow mixing with Mandarin or romanized Hakka. |

### Language Config Type

```typescript
interface LanguageConfig {
  key: string;
  label: string;             // Display name for embeds
  emoji: string;             // Flag/icon for embed
  promptInstruction: string; // Loaded from prompts/lang-<key>.md
  fallbacks: string[];       // Pre-written roasts in this language
}
```

### Adding a New Language

1. Create `prompts/lang-<key>.md` with the instruction
2. Add entry to `LANGUAGES` in `src/utils/languages.ts`
3. Add `{ name: "...", value: "<key>" }` to the `lang` option in `src/commands/roast.ts`
4. Run `pnpm run deploy` to register the updated command

### Low-Resource Language Strategies (Tolaki, Khek)

1. Provide example phrases in the prompt so Claude has vocabulary to anchor to
2. Allow fallback mixing — blend with Indonesian/Mandarin rather than forcing pure output
3. Fallback gracefully — serve a pre-written fallback if output looks garbled

---

## 5. Discord.js Patterns

### Slash Command Options (`/roast`)

| Option | Type | Required | Default | Notes |
|---|---|---|---|---|
| `target` | User | Yes | — | Who to roast |
| `reason` | String | No | "existing" | Why they're getting roasted |
| `heat` | Integer 1–3 | No | 2 | 1=Mild, 2=Spicy, 3=Nuclear |
| `lang` | String choice | No | "en" | en, id, zh, tolaki, hokkien, khek |
| `style` | String choice | No | "message" | message (plain text) or embed |

### Response Styles

Both styles tag the target user so they get pinged.

```typescript
// Variant 1 — plain message (default)
await interaction.editReply({ content: `${target} ${roast}` });

// Variant 2 — full embed
const embed = new EmbedBuilder()
  .setColor(HEAT_COLORS[heat])
  .setTitle("🔥 Decimator")
  .setDescription(`${target}\n${roast}`)
  .addFields(
    { name: "Victim", value: `${target}`, inline: true },
    { name: "Reason", value: reason, inline: true },
    { name: "Heat", value: HEAT_LABELS[heat], inline: true },
    { name: "Language", value: `${language.emoji} ${language.label}`, inline: true },
  )
  .setFooter({
    text: `Requested by ${interaction.user.displayName}`,
    iconURL: interaction.user.displayAvatarURL(),
  })
  .setTimestamp();

await interaction.editReply({ embeds: [embed] });
```

### Embed Colors by Heat

| Heat | Color | Hex |
|---|---|---|
| 1 (Mild) | Gold | `0xFFD700` |
| 2 (Spicy) | Dark Orange | `0xFF8C00` |
| 3 (Nuclear) | Red | `0xFF0000` |

### Deferred Reply Pattern

LLM calls take 1–3 seconds. Discord requires a response within 3 seconds — always defer:

```typescript
await interaction.deferReply();
// ... async work ...
await interaction.editReply({ content: roast });
```

### Gathering Target Context

```typescript
const target = interaction.options.getUser("target", true);
const member = interaction.guild?.members.cache.get(target.id);

const context = {
  displayName: member?.displayName ?? target.displayName,
  accountAge: target.createdAt.toDateString(),
  joinedServer: member?.joinedAt?.toDateString() ?? "unknown",
  roleCount: (member?.roles.cache.size ?? 1) - 1, // subtract @everyone
  status: member?.presence?.status ?? "offline",
};
```

---

## 6. Cooldown Pattern

```typescript
const cooldowns = new Map<string, number>();

function checkCooldown(userId: string, seconds: number): number {
  const now = Date.now();
  const lastUsed = cooldowns.get(userId) ?? 0;
  const remaining = seconds - (now - lastUsed) / 1000;

  if (remaining > 0) return Math.ceil(remaining);

  cooldowns.set(userId, now);
  return 0;
}
```

Returns 0 if clear, or seconds remaining. Set the cooldown **before** the API call so rapid clicks don't bypass it.

---

## 7. Channel Lock Pattern

```typescript
if (config.discord.roastChannelId && interaction.channelId !== config.discord.roastChannelId) {
  return interaction.reply({
    content: `🚫 Take it to <#${config.discord.roastChannelId}>, coward.`,
    ephemeral: true,
  });
}
```

---

## 8. Self-Roast Guard

```typescript
if (target.id === client.user?.id) {
  return interaction.reply({
    content: "Nice try. I'm the one doing the roasting here. 🔥",
    ephemeral: true,
  });
}
```

---

## 9. Cost Estimate

| Item | Value |
|---|---|
| Model | claude-sonnet-4-20250514 |
| Input tokens per roast | ~200 (higher for low-resource languages) |
| Output tokens per roast | ~30–50 (single sentence) |
| Approximate cost per roast | ~$0.0005 |
| 1,000 roasts | ~$0.50 |

`max_tokens: 300` caps output. Single-sentence roasts typically use ~30–50 output tokens.
