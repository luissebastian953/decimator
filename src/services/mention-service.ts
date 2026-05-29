import Anthropic from "@anthropic-ai/sdk";
import { Message, GuildMember } from "discord.js";
import { config } from "../config";
import { loadPrompt } from "../utils/load-prompt";

const anthropic = new Anthropic({ apiKey: config.anthropic.apiKey });
const MENTION_PROMPT = loadPrompt("mention");
const FALLBACK = "…🗿";

function memberContext(member: GuildMember | null | undefined, fallbackName: string): string {
  if (!member) return `${fallbackName} (no server info available)`;
  return `${member.displayName} — joined ${member.joinedAt?.toDateString() ?? "unknown"}, ${(member.roles.cache.size ?? 1) - 1} roles, status: ${member.presence?.status ?? "offline"}`;
}

export async function handleMention(message: Message, botId: string, botName: string): Promise<string> {
  const systemPrompt = MENTION_PROMPT.replace("{botName}", botName);
  const content = message.content
    .replace(new RegExp(`<@!?${botId}>`, "g"), "")
    .trim();

  const author = message.member;
  const authorContext = memberContext(author, message.author.displayName);

  const targets = message.mentions.users.filter((u) => u.id !== botId);

  let repliedContent = "";
  if (message.reference?.messageId) {
    try {
      const ref = await message.fetchReference();
      repliedContent = `\nReplied-to message from ${ref.author.displayName}: "${ref.content}"`;
    } catch {
      // reference no longer available
    }
  }

  const targetLines = targets.map((user) => {
    const member = message.guild?.members.cache.get(user.id);
    return `Target — ${memberContext(member, user.displayName)}`;
  });

  const userPrompt = [
    `Mentioned by: ${authorContext}`,
    `Their message: "${content || "(no text)"}"`,
    repliedContent,
    ...targetLines,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 200,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    return text || FALLBACK;
  } catch (err) {
    console.error("[mention-service] API error:", err);
    return FALLBACK;
  }
}
