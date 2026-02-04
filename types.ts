export type DifficultyLevel = {
  id: string;
  name: string;
  size: number;
  description: string;
  locked: boolean;
  knights?: number;
};

export type GameStats = {
  gamesPlayed: number;
  gamesWon: number;
  totalMoves: number;
  hintsUsed: number;
  currentStreak: number;
  bestStreak: number;
  completionsBySize: Record<number, number>;
  bestTimesBySize: Record<number, number>;
  starsEarned: Record<string, number>; // level id -> stars (1-3)
  unlockedLevels: string[];
  achievements: string[];
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
};
