export function isArcadeLevelUnlocked(levelId: number, completedLevelIds: readonly number[]): boolean {
  if (!Number.isInteger(levelId) || levelId < 1) return false;
  return levelId === 1 || completedLevelIds.includes(levelId - 1);
}
