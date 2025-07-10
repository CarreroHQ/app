const baseXp = 100;

export function xpForLevel(level: number): number {
  return baseXp * level * level;
}

export function levelForXp(totalXp: number): number {
  if (totalXp < 0) return 0;
  return Math.floor(Math.sqrt(totalXp / baseXp));
}

export function xpToLevelUp(level: number): number {
  return xpForLevel(level) - xpForLevel(level - 1);
}

export function progressionToNextLevel(totalXp: number): number {
  const currentLevel = levelForXp(totalXp);
  const xpCurrentLevel = xpForLevel(currentLevel);
  const xpNextLevel = xpForLevel(currentLevel + 1);
  return (totalXp - xpCurrentLevel) / (xpNextLevel - xpCurrentLevel);
}
