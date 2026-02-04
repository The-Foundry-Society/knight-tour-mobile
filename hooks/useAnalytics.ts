import { useCallback } from 'react';
import analytics from '@react-native-firebase/analytics';

export const useAnalytics = () => {
  const logGameStarted = useCallback(async (boardSize: number) => {
    try {
      await analytics().logEvent('game_started', {
        board_size: boardSize,
        total_squares: boardSize * boardSize,
      });
    } catch (e) {
      console.log('Analytics error:', e);
    }
  }, []);

  const logGameCompleted = useCallback(async (boardSize: number, timeSeconds: number, hintsUsed: number) => {
    try {
      await analytics().logEvent('game_completed', {
        board_size: boardSize,
        total_squares: boardSize * boardSize,
        time_seconds: timeSeconds,
        hints_used: hintsUsed,
      });
    } catch (e) {
      console.log('Analytics error:', e);
    }
  }, []);

  const logGameStuck = useCallback(async (boardSize: number, movesMade: number) => {
    try {
      await analytics().logEvent('game_stuck', {
        board_size: boardSize,
        total_squares: boardSize * boardSize,
        moves_made: movesMade,
      });
    } catch (e) {
      console.log('Analytics error:', e);
    }
  }, []);

  const logGameRestarted = useCallback(async (boardSize: number) => {
    try {
      await analytics().logEvent('game_restarted', {
        board_size: boardSize,
      });
    } catch (e) {
      console.log('Analytics error:', e);
    }
  }, []);

  const logUndoUsed = useCallback(async (boardSize: number) => {
    try {
      await analytics().logEvent('undo_used', {
        board_size: boardSize,
      });
    } catch (e) {
      console.log('Analytics error:', e);
    }
  }, []);

  const logHintToggled = useCallback(async (boardSize: number, enabled: boolean) => {
    try {
      await analytics().logEvent('hint_toggled', {
        board_size: boardSize,
        enabled: enabled,
      });
    } catch (e) {
      console.log('Analytics error:', e);
    }
  }, []);

  const logLevelUnlocked = useCallback(async (levelId: string, boardSize: number) => {
    try {
      await analytics().logEvent('level_unlocked', {
        level_id: levelId,
        board_size: boardSize,
      });
    } catch (e) {
      console.log('Analytics error:', e);
    }
  }, []);

  const logAchievementEarned = useCallback(async (achievementId: string) => {
    try {
      await analytics().logEvent('achievement_earned', {
        achievement_id: achievementId,
      });
    } catch (e) {
      console.log('Analytics error:', e);
    }
  }, []);

  const logAdShown = useCallback(async (trigger: 'play_again' | 'restart') => {
    try {
      await analytics().logEvent('ad_shown', {
        trigger: trigger,
      });
    } catch (e) {
      console.log('Analytics error:', e);
    }
  }, []);

  return {
    logGameStarted,
    logGameCompleted,
    logGameStuck,
    logGameRestarted,
    logUndoUsed,
    logHintToggled,
    logLevelUnlocked,
    logAchievementEarned,
    logAdShown,
  };
};
