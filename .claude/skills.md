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

### System Prompt Template

```
HEAT 1 (Mild):
"You are a witty comedian in a Discord server.
Deliver a light, playful roast — like teasing a friend.
Clever wordplay and PG-13 humor. 2 sentences max."

HEAT 2 (Spicy):
"You are a foul-mouthed roast battle comedian in a Discord server.
Deliver a sharp, cutting roast with no mercy.
Use sarcasm, creative comparisons, and profanity for impact.
Swear naturally like a stand-up comedian would. 2-3 sentences."

HEAT 3 (Nuclear):
"You are a ruthless, unhinged roast battle comedian in a Discord server.
Deliver an absolutely devastating roast. Scorched earth.
Be foul-mouthed and creatively brutal.
Use profanity liberally and naturally. 2-3 sentences."
```

### Critical Rules (append to ALL heat levels)

```
- Use Discord markdown (**bold**, *italic*) for emphasis when it hits harder.
- NEVER add disclaimers, apologies, or "just kidding" at the end.
- NEVER self-censor swear words with asterisks or symbols — write them fully.
- Just deliver the roast. Nothing before it, nothing after it.
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

### Why This Works

| Prompt element | Purpose |
|---|---|
| "roast battle comedian" | Activates the comedy genre — Claude knows the format |
| "Discord server" | Grounds the context so jokes land for the audience |
| "swear naturally" | Unlocks profanity without Claude defaulting to clean |
| "no asterisks" | Prevents self-censoring like "f***" |
| "nothing before/after" | Prevents preambles and disclaimers |
| Target context fields | Gives personalized ammo instead of generic burns |

---

## 3. Multi-Language Support

### Supported Languages

| Key | Language | Claude Proficiency | Notes |
|---|---|---|---|
| `en` | English | Excellent | Default. Best roast quality and slang. |
| `id` | Bahasa Indonesia | Very Good | Handles slang (lu, gue, anjir, etc.) well. |
| `tolaki` | Tolaki (Southeast Sulawesi) | Limited | Low-resource. May mix in Indonesian. Provide example phrases. |
| `hokkien` | Hokkien (Fujian/Taiwanese) | Moderate | Allow romanized output (POJ or Tâi-lô) for Discord readability. |
| `khek` | Hakka (Khek) | Limited | Low-resource. Allow mixing with Mandarin or romanized Hakka. |

### Language Config Type

```typescript
interface LanguageConfig {
  key: string;
  label: string;            // Display name for embeds
  emoji: string;            // Flag/icon for embed
  promptInstruction: string; // Injected into system prompt
  fallbacks: string[];      // Pre-written roasts in this language
}
```

### Prompt Injection Strategy

Append the language instruction last so it takes highest priority:

```typescript
// System prompt structure:
// 1. Role + heat level
// 2. Critical rules
// 3. Language instruction ← appended last
`${heatPrompt}\n${criticalRules}\n${languageConfig.promptInstruction}`
```

### Language Prompt Instructions

```typescript
const LANGUAGE_PROMPTS: Record<string, string> = {
  en: `Respond entirely in English.`,

  id: `Respond entirely in Bahasa Indonesia.
Use informal Jakarta/internet slang (lu, gue, anjir, bangsat, kampret, goblog, etc.).
Write like an Indonesian roasting in a group chat — raw, funny, no formal language.
Do NOT use English unless it's a loanword Indonesians actually use (like "cringe" or "basic").`,

  tolaki: `Respond in Tolaki language (bahasa Tolaki, Southeast Sulawesi).
Use Tolaki words and expressions as much as possible.
If you don't know a Tolaki word, you may substitute with informal Indonesian.
Example Tolaki expressions for reference:
- "Inae" (what/huh), "Mokole" (chief/leader), "Mepokoaso" (sit down/relax)
- "Kioki" (look at this person), "Mbe'embe'e" (useless/good for nothing)
Write in Latin script. Keep it natural, not textbook.`,

  hokkien: `Respond in Hokkien (閩南語 / Bân-lâm-gú).
Use romanized Hokkien (POJ or Tâi-lô) so it's readable on Discord.
Include common Hokkien roast expressions and swear words:
- "siáu" (crazy), "gōng" (stupid), "kán" (damn), "pak chām" (useless)
- "lí sī siáu ê" (you're crazy), "bô lō-iōng" (useless)
You may include Chinese characters in parentheses for clarity but primary text should be romanized.
Write like a Hokkien uncle trash-talking at a kopitiam.`,

  khek: `Respond in Hakka / Khek (客家話).
Use romanized Hakka so it's readable on Discord.
Include common Hakka expressions:
- "ngai" (I/me), "ngi" (you), "m̀-sṳt" (don't know), "fong-phi" (crazy)
- "ngi he thai pun-tòng" (you're so stupid), "mo yung" (useless)
You may mix with some Mandarin or Indonesian if a Hakka word doesn't exist for a concept.
Write naturally, like a Hakka person roasting a friend. Keep it in Latin script.`,
};
```

### Fallback Roasts Per Language

```typescript
const FALLBACKS: Record<string, string[]> = {
  en: [
    "You're the human equivalent of a participation trophy.",
    "I'd explain it to you, but I left my crayons at home.",
    "You bring everyone so much joy — when you leave.",
  ],
  id: [
    "Lu tuh kayak WiFi gratisan — lemot, nggak bisa diandalin, tapi orang tetep nyambung karena nggak ada pilihan lain.",
    "Kalau goblog itu seni, lu udah jadi Picasso.",
    "Lu tuh bukti nyata bahwa evolusi bisa jalan mundur.",
  ],
  tolaki: [
    "Kioki inehe, mbe'embe'e laa mohewu.",
    "Inae mohewu ari inehe, meita'osi ari.",
    "Inehe laa topene mbe'embe'e i toono.",
  ],
  hokkien: [
    "Lí khòaⁿ lí ê bīn, kiàⁿ sí lâng ê kiàⁿ-thâu.",
    "Lí nā ū náu, hit ê náu mā sī bô lō-iōng ê.",
    "Lí sī gōng kah bô iōng, liân kha-chiah-phiaⁿ to bē pí lí khah gōng.",
  ],
  khek: [
    "Ngi he thai pun-tòng, mo yung ke ngin.",
    "Ngi ke nèu-hók pí fong-phi hân chà.",
    "Ngài m̀ voi mà ngi, yîn-vi ngi thâng m̀ tó.",
  ],
};
```

> **Note**: Tolaki, Hokkien, and Khek fallbacks are starter examples. Validate with native speakers — Claude-generated examples in low-resource languages may contain errors.

### Low-Resource Language Strategies

1. **Provide example phrases** in the prompt so Claude has vocabulary to anchor to
2. **Allow fallback mixing** — blend with Indonesian/Mandarin rather than forcing pure output
3. **Consider a glossary approach** — append common roast phrases/insults in the target language
4. **Fallback gracefully** — if output looks garbled, serve a pre-written fallback

---

## 4. Discord.js Patterns

### Slash Command Structure (TypeScript)

```typescript
import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("roast")
  .setDescription("Roast a server member")
  .addUserOption((o) => o.setName("target").setDescription("Who to roast").setRequired(true))
  .addStringOption((o) => o.setName("reason").setDescription("Why"))
  .addIntegerOption((o) => o.setName("heat").setDescription("1-3").setMinValue(1).setMaxValue(3))
  .addStringOption((o) =>
    o.setName("lang").setDescription("Roast language").addChoices(
      { name: "English", value: "en" },
      { name: "Indonesia", value: "id" },
      { name: "Tolaki", value: "tolaki" },
      { name: "Hokkien", value: "hokkien" },
      { name: "Khek (Hakka)", value: "khek" },
    )
  );

export async function execute(interaction: ChatInputCommandInteraction, client: Client) {
  // implementation
}
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

### Deferred Reply Pattern

LLM calls take 1–3 seconds. Discord requires a response within 3 seconds — always defer:

```typescript
await interaction.deferReply();
// ... async work ...
await interaction.editReply({ embeds: [embed] });
```

### Embed Builder

```typescript
import { EmbedBuilder } from "discord.js";

const HEAT_COLORS = { 1: 0xFFD700, 2: 0xFF8C00, 3: 0xFF0000 };

const embed = new EmbedBuilder()
  .setColor(HEAT_COLORS[heat])
  .setTitle("🔥 Roast Incoming")
  .setDescription(roastText)
  .addFields(
    { name: "Victim", value: `${target}`, inline: true },
    { name: "Reason", value: reason, inline: true },
    { name: "Heat", value: "🌶️🌶️🌶️ Nuclear", inline: true },
    { name: "Language", value: "🇮🇩 Indonesia", inline: true },
  )
  .setFooter({
    text: `Requested by ${interaction.user.displayName}`,
    iconURL: interaction.user.displayAvatarURL(),
  })
  .setTimestamp();
```

---

## 5. Cooldown Pattern

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

## 6. Channel Lock Pattern

```typescript
if (process.env.ROAST_CHANNEL_ID && interaction.channelId !== process.env.ROAST_CHANNEL_ID) {
  return interaction.reply({
    content: `🚫 Take it to <#${process.env.ROAST_CHANNEL_ID}>, coward.`,
    ephemeral: true,
  });
}
```

---

## 7. Self-Roast Guard

```typescript
if (target.id === client.user?.id) {
  return interaction.reply({
    content: "Nice try. I'm the one doing the roasting here. 🔥",
    ephemeral: true,
  });
}
```

---

## 8. Cost Estimate

| Item | Value |
|---|---|
| Model | claude-sonnet-4-20250514 |
| Input tokens per roast | ~200 (higher for low-resource languages) |
| Output tokens per roast | ~100 |
| Approximate cost per roast | ~$0.001 |
| 1,000 roasts | ~$1 |

`max_tokens: 300` caps output even if the model gets chatty. Typical output is 2–3 sentences (~50–80 tokens).
