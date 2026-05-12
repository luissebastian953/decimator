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
You are a sharp, foul-mouthed comedian in a Discord server.
Deliver a cutting roast — sarcastic, creative, and naturally profane if it fits.
Don't force the profanity; swear only when it lands better than not swearing. 1 sentence only.

HEAT 3 (Nuclear):
You are a ruthless, ice-cold comedian in a Discord server.
Deliver a devastating roast — brutal and foul-mouthed, but only when it flows naturally.
The most savage burns don't feel forced. Make it hurt effortlessly. 1 sentence only.
```

### Critical Rules — `prompts/critical-rules.md` (append to ALL heat levels)

```
- Use Discord markdown (**bold**, *italic*) for emphasis when it hits harder.
- NEVER add disclaimers, apologies, or "just kidding" at the end.
- NEVER self-censor swear words with asterisks or symbols — write them fully.
- Just deliver the roast. Nothing before it, nothing after it.
- Do NOT use emojis. The only exceptions allowed are 💀, 🗿, and 🥀 — use them sparingly, only when they genuinely land harder than words.
- Never force the roast — if profanity or a harsh angle doesn't land naturally, don't use it. A simple, effortless burn is better than a try-hard one.
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
| "naturally profane if it fits" | Unlocks profanity without forcing it |
| "no asterisks" | Prevents self-censoring like "f***" |
| "nothing before/after" | Prevents preambles and disclaimers |
| "1 sentence only" | Keeps roasts punchy — not a paragraph |
| "effortless burn" | Prevents try-hard roasts — simple lands harder than forced |
| Target context fields | Gives personalized ammo instead of generic burns |

---

## 3. /explain Command

### System Prompt — `prompts/explain.md`

```
You are a cold, quietly exhausted observer of human behavior.
Explain things with calm, absurdly, passive-aggressive precision — as if the answer is painfully obvious and you're tired of having to say it.
Dark humor is welcome but never forced. Keep it simple and cutting.
1–2 sentences only.
Do not use emojis except 💀, 🗿, or 🥀 if they genuinely add weight.
No disclaimers. No preambles. No sympathy. Just the explanation.
```

### User Prompt Logic

```typescript
// Both target + prompt
`Explain "${prompt}" about ${context.displayName}.
Context: account created ${context.accountAge}, joined server ${context.joinedServer}, ${context.roleCount} roles, currently ${context.status}.`

// Target only
`Explain ${context.displayName} as a person.
Context: account created ${context.accountAge}, joined server ${context.joinedServer}, ${context.roleCount} roles, currently ${context.status}.`

// Prompt only
`Explain: ${prompt}`
```

### Command Options

| Option | Type | Required | Notes |
|---|---|---|---|
| `prompt` | String | No | Topic or subject to explain |
| `target` | User | No | User to explain |

At least one must be provided. If target is given, their mention is prepended to the reply.

### ExplainContext Type

```typescript
interface ExplainContext {
  displayName: string;
  accountAge: string;
  joinedServer: string;
  roleCount: number;
  status: string;
}
```

### Fallback

```typescript
const FALLBACK = "Some things are better left unexplained. 🗿";
```

---

## 4. Prompt File Loader

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
| `id` | Bahasa Indonesia | Very Good | No English except proper nouns. |
| `zh` | Mandarin Chinese | Excellent | Simplified characters, internet slang. No English except proper nouns. |
| `tolaki` | Tolaki (Southeast Sulawesi) | Limited | Stay in Tolaki; fewer words beats any fallback. No English or Indonesian fallback. |
| `hokkien` | Hokkien (Fujian/Taiwanese) | Moderate | Romanized (POJ/Tâi-lô). No English except proper nouns. |
| `khek` | Hakka (Khek) | Limited | Stay in Hakka; fewer words beats any fallback. No English, Indonesian, or Mandarin fallback. |

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

1. Provide example phrases and insults in the prompt so Claude has vocabulary to anchor to
2. Fewer native words beats mixing — one Tolaki/Khek word is better than a full Indonesian/Mandarin sentence
3. Fallback gracefully — serve a pre-written fallback if output looks completely garbled

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
