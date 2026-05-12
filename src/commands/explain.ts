import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
} from "discord.js";
import { generateExplanation } from "../services/explain-service";

export const data = new SlashCommandBuilder()
  .setName("explain")
  .setDescription("Get a cold, honest explanation")
  .addStringOption((o) =>
    o.setName("prompt").setDescription("What to explain")
  )
  .addUserOption((o) =>
    o.setName("target").setDescription("User to explain")
  );

export async function execute(
  interaction: ChatInputCommandInteraction,
  _client: Client
) {
  const prompt = interaction.options.getString("prompt");
  const target = interaction.options.getUser("target");

  if (!prompt && !target) {
    return interaction.reply({
      content: "Give me something to work with — a topic, a user, or both.",
      ephemeral: true,
    });
  }

  await interaction.deferReply();

  const member = target
    ? interaction.guild?.members.cache.get(target.id)
    : null;

  const context = target
    ? {
        displayName: member?.displayName ?? target.displayName,
        accountAge: target.createdAt.toDateString(),
        joinedServer: member?.joinedAt?.toDateString() ?? "unknown",
        roleCount: (member?.roles.cache.size ?? 1) - 1,
        status: member?.presence?.status ?? "offline",
      }
    : null;

  const explanation = await generateExplanation(prompt, context);

  const content = target ? `${target} ${explanation}` : explanation;
  await interaction.editReply({ content });
}
