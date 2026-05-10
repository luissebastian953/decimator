import dotenv from "dotenv";
dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
}

export const config = {
  discord: {
    token: requireEnv("DISCORD_TOKEN"),
    clientId: requireEnv("DISCORD_CLIENT_ID"),
    guildId: requireEnv("DISCORD_GUILD_ID"),
    roastChannelId: process.env.ROAST_CHANNEL_ID,
  },
  anthropic: {
    apiKey: requireEnv("ANTHROPIC_API_KEY"),
  },
  roastCooldown: parseInt(process.env.ROAST_COOLDOWN ?? "30", 10),
};
