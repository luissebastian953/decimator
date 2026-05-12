import { REST, Routes } from "discord.js";
import { config } from "./config";
import { data as roastCommand } from "./commands/roast";
import { data as explainCommand } from "./commands/explain";

const commands = [roastCommand.toJSON(), explainCommand.toJSON()];
const rest = new REST().setToken(config.discord.token);

(async () => {
  console.log("Registering slash commands...");
  await rest.put(
    Routes.applicationGuildCommands(
      config.discord.clientId,
      config.discord.guildId
    ),
    { body: commands }
  );
  console.log("✅ Commands registered.");
})();
