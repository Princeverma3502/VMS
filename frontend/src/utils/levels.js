export const calculateLevel = (xp) => {
  return Math.floor(0.1 * Math.sqrt(xp)) + 1;
};

export const xpForNextLevel = (currentLevel) => {
  return Math.pow((currentLevel) / 0.1, 2);
};

export const getProgress = (xp) => {
  const currentLevel = calculateLevel(xp);
  const minXP = xpForNextLevel(currentLevel - 1);
  const maxXP = xpForNextLevel(currentLevel);
  return ((xp - minXP) / (maxXP - minXP)) * 100;
};