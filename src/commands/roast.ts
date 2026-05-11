import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
} from "discord.js";
import { config } from "../config";
import { checkCooldown } from "../utils/cooldown";
import { getLanguage } from "../utils/languages";
import { generateRoast } from "../services/roast-service";

const HEAT_COLORS: Record<number, number> = {
  1: 0xffd700,
  2: 0xff8c00,
  3: 0xff0000,
};

const HEAT_LABELS: Record<number, string> = {
  1: "🌶️ Mild",
  2: "🌶️🌶️ Spicy",
  3: "🌶️🌶️🌶️ Nuclear",
};

export const data = new SlashCommandBuilder()
  .setName("roast")
  .setDescription("Roast a server member")
  .addUserOption((o) =>
    o.setName("target").setDescription("Who to roast").setRequired(true)
  )
  .addStringOption((o) =>
    o.setName("reason").setDescription("Why are they getting roasted?")
  )
  .addIntegerOption((o) =>
    o
      .setName("heat")
      .setDescription("Heat level (1=mild, 2=spicy, 3=nuclear)")
      .setMinValue(1)
      .setMaxValue(3)
  )
  .addStringOption((o) =>
    o
      .setName("lang")
      .setDescription("Roast language")
      .addChoices(
        { name: "English", value: "en" },
        { name: "Indonesia", value: "id" },
        { name: "Tolaki", value: "tolaki" },
        { name: "Hokkien", value: "hokkien" },
        { name: "Khek (Hakka)", value: "khek" },
        { name: "中文 (Chinese)", value: "zh" }
      )
  )
  .addStringOption((o) =>
    o
      .setName("style")
      .setDescription("Response style")
      .addChoices(
        { name: "Embed", value: "embed" },
        { name: "Message", value: "message" }
      )
  );

export async function execute(
  interaction: ChatInputCommandInteraction,
  client: Client
) {
  if (
    config.discord.roastChannelId &&
    interaction.channelId !== config.discord.roastChannelId
  ) {
    return interaction.reply({
      content: `🚫 Take it to <#${config.discord.roastChannelId}>, coward.`,
      ephemeral: true,
    });
  }

  const remaining = checkCooldown(interaction.user.id, config.roastCooldown);
  if (remaining > 0) {
    return interaction.reply({
      content: `⏳ Chill out. Try again in **${remaining}s**.`,
      ephemeral: true,
    });
  }

  const target = interaction.options.getUser("target", true);

  if (target.id === client.user?.id) {
    return interaction.reply({
      content: "Nice try. I'm the one doing the roasting here. 🔥",
      ephemeral: true,
    });
  }

  const reason = interaction.options.getString("reason") ?? "existing";
  const heat = interaction.options.getInteger("heat") ?? 2;
  const lang = interaction.options.getString("lang") ?? "en";
  const style = interaction.options.getString("style") ?? "message";

  await interaction.deferReply();

  const member = interaction.guild?.members.cache.get(target.id);
  const context = {
    displayName: member?.displayName ?? target.displayName,
    reason,
    status: member?.presence?.status ?? "offline",
    accountAge: target.createdAt.toDateString(),
    joinedServer: member?.joinedAt?.toDateString() ?? "unknown",
    roleCount: (member?.roles.cache.size ?? 1) - 1,
  };

  const roast = await generateRoast(context, heat, lang);

  if (style === "message") {
    return interaction.editReply({ content: `${target} ${roast}` });
  }

  const language = getLanguage(lang);

  const embed = new EmbedBuilder()
    .setColor(HEAT_COLORS[heat])
    .setTitle("🔥 Decimator")
    .setDescription(`${target}\n${roast}`)
    .addFields(
      { name: "Victim", value: `${target}`, inline: true },
      { name: "Reason", value: reason, inline: true },
      { name: "Heat", value: HEAT_LABELS[heat], inline: true },
      {
        name: "Language",
        value: `${language.emoji} ${language.label}`,
        inline: true,
      }
    )
    .setFooter({
      text: `Requested by ${interaction.user.displayName}`,
      iconURL: interaction.user.displayAvatarURL(),
    })
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}
