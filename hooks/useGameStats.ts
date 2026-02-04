import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameStats } from '../types';

const STATS_KEY = '@knight_tour_stats';

const DEFAULT_STATS: GameStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  totalMoves: 0,
  hintsUsed: 0,
  currentStreak: 0,
  bestStreak: 0,
  completionsBySize: {},
  bestTimesBySize: {},
  starsEarned: {},
  unlockedLevels: ['beginner', 'easy', 'medium', 'hard', 'expert'], // All levels unlocked
  achievements: [],
};

export const useGameStats = () => {
  const [stats, setStats] = useState<GameStats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);

  // Load stats from storage
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const stored = await AsyncStorage.getItem(STATS_KEY);
      if (stored) {
        setStats(JSON.parse(stored));
      }
    } catch (error) {
      console.log('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveStats = async (newStats: GameStats) => {
    try {
      await AsyncStorage.setItem(STATS_KEY, JSON.stringify(newStats));
      setStats(newStats);
    } catch (error) {
      console.log('Error saving stats:', error);
    }
  };

  const recordGameComplete = async (
    levelId: string,
    boardSize: number,
    moves: number,
    hintsUsed: number,
    timeSeconds: number
  ) => {
    const stars = calculateStars(hintsUsed, timeSeconds, boardSize);

    const newStats: GameStats = {
      ...stats,
      gamesPlayed: stats.gamesPlayed + 1,
      gamesWon: stats.gamesWon + 1,
      totalMoves: stats.totalMoves + moves,
      hintsUsed: stats.hintsUsed + hintsUsed,
      currentStreak: stats.currentStreak + 1,
      bestStreak: Math.max(stats.currentStreak + 1, stats.bestStreak),
      completionsBySize: {
        ...stats.completionsBySize,
        [boardSize]: (stats.completionsBySize[boardSize] || 0) + 1,
      },
      bestTimesBySize: {
        ...stats.bestTimesBySize,
        [boardSize]: Math.min(
          stats.bestTimesBySize[boardSize] || Infinity,
          timeSeconds
        ),
      },
      starsEarned: {
        ...stats.starsEarned,
        [levelId]: Math.max(stats.starsEarned[levelId] || 0, stars),
      },
    };

    // Check for unlocks and achievements
    const updatedStats = checkUnlocksAndAchievements(newStats, levelId, boardSize, hintsUsed, timeSeconds);

    await saveStats(updatedStats);
    return { stars, newStats: updatedStats };
  };

  const recordGameLost = async (moves: number, hintsUsed: number) => {
    const newStats: GameStats = {
      ...stats,
      gamesPlayed: stats.gamesPlayed + 1,
      totalMoves: stats.totalMoves + moves,
      hintsUsed: stats.hintsUsed + hintsUsed,
      currentStreak: 0, // Reset streak on loss
    };

    await saveStats(newStats);
  };

  const calculateStars = (hintsUsed: number, timeSeconds: number, boardSize: number): number => {
    // 3 stars: no hints, under time threshold
    // 2 stars: 1-2 hints OR over time but completed
    // 1 star: 3+ hints OR way over time

    const timeThresholds: Record<number, number> = {
      25: 120,   // 5x5: 2 minutes
      36: 180,   // 6x6: 3 minutes
      64: 300,   // 8x8: 5 minutes
      100: 600,  // 10x10: 10 minutes
      144: 900,  // 12x12: 15 minutes
    };

    const threshold = timeThresholds[boardSize] || 600;

    if (hintsUsed === 0 && timeSeconds < threshold) return 3;
    if (hintsUsed <= 2 || timeSeconds < threshold * 1.5) return 2;
    return 1;
  };

  const checkUnlocksAndAchievements = (
    newStats: GameStats,
    completedLevelId: string,
    boardSize: number,
    hintsUsed: number,
    timeSeconds: number
  ): GameStats => {
    const levelOrder = ['beginner', 'easy', 'medium', 'hard', 'expert'];
    const currentIndex = levelOrder.indexOf(completedLevelId);

    // Unlock next level
    const unlockedLevels = [...newStats.unlockedLevels];
    if (currentIndex >= 0 && currentIndex < levelOrder.length - 1) {
      const nextLevel = levelOrder[currentIndex + 1];
      if (!unlockedLevels.includes(nextLevel)) {
        unlockedLevels.push(nextLevel);
      }
    }

    // Check achievements
    const achievements = [...newStats.achievements];

    // Board Size Achievements
    if (boardSize === 25 && !achievements.includes('first_steps')) {
      achievements.push('first_steps');
    }
    if (boardSize === 36 && !achievements.includes('easy_rider')) {
      achievements.push('easy_rider');
    }
    if (boardSize === 64 && !achievements.includes('chess_master')) {
      achievements.push('chess_master');
    }
    if (boardSize === 100 && !achievements.includes('grandmaster')) {
      achievements.push('grandmaster');
    }
    if (boardSize === 144 && !achievements.includes('legend')) {
      achievements.push('legend');
    }

    // Games Completed Achievements
    if (newStats.gamesWon >= 10 && !achievements.includes('perfect_ten')) {
      achievements.push('perfect_ten');
    }
    if (newStats.gamesWon >= 50 && !achievements.includes('half_century')) {
      achievements.push('half_century');
    }
    if (newStats.gamesWon >= 100 && !achievements.includes('centurion')) {
      achievements.push('centurion');
    }

    // Streak Achievements
    if (newStats.currentStreak >= 3 && !achievements.includes('hot_streak')) {
      achievements.push('hot_streak');
    }
    if (newStats.currentStreak >= 7 && !achievements.includes('unstoppable')) {
      achievements.push('unstoppable');
    }

    // Speedrunner: Complete 5×5 in under 60 seconds
    if (boardSize === 25 && timeSeconds < 60 && !achievements.includes('speedrunner')) {
      achievements.push('speedrunner');
    }

    // Explorer: Complete at least one game on every board size
    const allSizes = [25, 36, 64, 100, 144];
    const completedAllSizes = allSizes.every(size => newStats.completionsBySize[size] > 0);
    if (completedAllSizes && !achievements.includes('explorer')) {
      achievements.push('explorer');
    }

    return {
      ...newStats,
      unlockedLevels,
      achievements,
    };
  };

  const resetStats = async () => {
    await saveStats(DEFAULT_STATS);
  };

  return {
    stats,
    loading,
    recordGameComplete,
    recordGameLost,
    resetStats,
  };
};
