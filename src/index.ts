import {
  Client,
  Collection,
  GatewayIntentBits,
  Interaction,
  ChatInputCommandInteraction,
  Message,
} from "discord.js";
import { config } from "./config";
import * as roastCommand from "./commands/roast";
import * as explainCommand from "./commands/explain";
import { handleMention } from "./services/mention-service";
import { checkCooldown } from "./utils/cooldown";

interface Command {
  data: { name: string };
  execute: (interaction: ChatInputCommandInteraction, client: Client) => Promise<unknown>;
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const commands = new Collection<string, Command>();
commands.set(roastCommand.data.name, roastCommand);
commands.set(explainCommand.data.name, explainCommand);

client.once("ready", () => {
  console.log(`✅ ${client.user?.username} online as ${client.user?.tag}`);
});

client.on("interactionCreate", async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, client);
  } catch (err) {
    console.error(err);
    const msg = { content: "Something went wrong. Try again.", ephemeral: true };
    if (interaction.deferred) {
      await interaction.editReply(msg);
    } else {
      await interaction.reply(msg);
    }
  }
});

client.on("messageCreate", async (message: Message) => {
  if (message.author.bot) return;
  if (!client.user) return;
  if (!message.mentions.has(client.user.id)) return;

  const remaining = checkCooldown(message.author.id, config.roastCooldown);

  if (remaining > 0) {
    await message.reply(`⏳ Chill out. Try again in **${remaining}s**.`);

    return;
  }

  try {
    if ("sendTyping" in message.channel) {
      await message.channel.sendTyping();
    }

    const response = await handleMention(message, client.user.id, client.user.username);

    await message.reply(response);
  } catch (err) {
    console.error("[messageCreate] error:", err);
  }
});

client.login(config.discord.token);
