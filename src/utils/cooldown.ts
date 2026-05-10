const cooldowns = new Map<string, number>();

export function checkCooldown(userId: string, seconds: number): number {
  const now = Date.now();
  const lastUsed = cooldowns.get(userId) ?? 0;
  const remaining = seconds - (now - lastUsed) / 1000;

  if (remaining > 0) return Math.ceil(remaining);

  cooldowns.set(userId, now);
  return 0;
}
