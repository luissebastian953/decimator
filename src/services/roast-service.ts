import Anthropic from "@anthropic-ai/sdk";
import { config } from "../config";
import { getLanguage } from "../utils/languages";
import { loadPrompt } from "../utils/load-prompt";

const anthropic = new Anthropic({ apiKey: config.anthropic.apiKey });

const HEAT_PROMPTS: Record<number, string> = {
  1: loadPrompt("heat-1"),
  2: loadPrompt("heat-2"),
  3: loadPrompt("heat-3"),
};

const CRITICAL_RULES = loadPrompt("critical-rules");

export interface RoastContext {
  displayName: string;
  reason: string;
  status: string;
  accountAge: string;
  joinedServer: string;
  roleCount: number;
}

export async function generateRoast(
  context: RoastContext,
  heat: number,
  lang: string
): Promise<string> {
  const language = getLanguage(lang);
  const systemPrompt = [
    HEAT_PROMPTS[heat] ?? HEAT_PROMPTS[2],
    CRITICAL_RULES,
    language.promptInstruction,
  ].join("\n");

  const userPrompt = `Roast the user "${context.displayName}".
Reason: ${context.reason}
Discord status: ${context.status}
Account created: ${context.accountAge}
Joined server: ${context.joinedServer}
Number of roles: ${context.roleCount}

Use any of these details as ammo if they're funny. Be creative.`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    return text || getRandomFallback(lang);
  } catch (err) {
    console.error("[roast-service] API error:", err);

    return getRandomFallback(lang);
  }
}

function getRandomFallback(lang: string): string {
  const { fallbacks } = getLanguage(lang);

  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}
