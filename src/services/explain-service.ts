import Anthropic from "@anthropic-ai/sdk";
import { config } from "../config";
import { loadPrompt } from "../utils/load-prompt";

const anthropic = new Anthropic({ apiKey: config.anthropic.apiKey });
const EXPLAIN_PROMPT = loadPrompt("explain");

const FALLBACK = "Some things are better left unexplained. 🗿";

export interface ExplainContext {
  displayName: string;
  accountAge: string;
  joinedServer: string;
  roleCount: number;
  status: string;
}

export async function generateExplanation(
  prompt: string | null,
  context: ExplainContext | null
): Promise<string> {
  let userPrompt: string;

  if (context && prompt) {
    userPrompt = `Explain "${prompt}" about ${context.displayName}.
Context: account created ${context.accountAge}, joined server ${context.joinedServer}, ${context.roleCount} roles, currently ${context.status}.`;
  } else if (context) {
    userPrompt = `Explain ${context.displayName} as a person.
Context: account created ${context.accountAge}, joined server ${context.joinedServer}, ${context.roleCount} roles, currently ${context.status}.`;
  } else {
    userPrompt = `Explain: ${prompt}`;
  }

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 150,
      system: EXPLAIN_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    return text || FALLBACK;
  } catch (err) {
    console.error("[explain-service] API error:", err);
    return FALLBACK;
  }
}
