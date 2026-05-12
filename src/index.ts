import {
  Client,
  Collection,
  GatewayIntentBits,
  Interaction,
  ChatInputCommandInteraction,
} from "discord.js";
import { config } from "./config";
import * as roastCommand from "./commands/roast";
import * as explainCommand from "./commands/explain";

interface Command {
  data: { name: string };
  execute: (interaction: ChatInputCommandInteraction, client: Client) => Promise<unknown>;
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
  ],
});

const commands = new Collection<string, Command>();
commands.set(roastCommand.data.name, roastCommand);
commands.set(explainCommand.data.name, explainCommand);

client.once("ready", () => {
  console.log(`✅ Decimator online as ${client.user?.tag}`);
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

client.login(config.discord.token);
