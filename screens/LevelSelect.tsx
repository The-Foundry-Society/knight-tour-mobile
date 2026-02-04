import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdsConsent, AdsConsentPrivacyOptionsRequirementStatus } from 'react-native-google-mobile-ads';
import { GradientText } from '../components/GradientText';
import { DifficultyLevel, GameStats } from '../types';

interface LevelSelectProps {
  onSelectLevel: (level: DifficultyLevel) => void;
  stats: GameStats;
  onViewStats: () => void;
  onViewTutorial: () => void;
}

const LEVELS: DifficultyLevel[] = [
  {
    id: 'beginner',
    name: 'Beginner',
    size: 5,
    description: '5×5 board (25 squares)\nPerfect for learning',
    locked: false,
    knights: 1,
  },
  {
    id: 'easy',
    name: 'Easy',
    size: 6,
    description: '6×6 board (36 squares)\nBuild your skills',
    locked: true,
    knights: 2,
  },
  {
    id: 'medium',
    name: 'Medium',
    size: 8,
    description: '8×8 board (64 squares)\nClassic chess board',
    locked: true,
    knights: 3,
  },
  {
    id: 'hard',
    name: 'Hard',
    size: 10,
    description: '10×10 board (100 squares)\nTrue challenge',
    locked: true,
    knights: 4,
  },
  {
    id: 'expert',
    name: 'Expert',
    size: 12,
    description: '12×12 board (144 squares)\nFor masters only',
    locked: true,
    knights: 5,
  },
];

export const LevelSelect: React.FC<LevelSelectProps> = ({ onSelectLevel, stats, onViewStats, onViewTutorial }) => {
  const [showPrivacyButton, setShowPrivacyButton] = React.useState(false);

  React.useEffect(() => {
    AdsConsent.getConsentInfo().then((info) => {
      setShowPrivacyButton(
        info.privacyOptionsRequirementStatus === AdsConsentPrivacyOptionsRequirementStatus.REQUIRED
      );
    }).catch(() => {});
  }, []);

  const isLevelUnlocked = (levelId: string): boolean => {
    return stats.unlockedLevels.includes(levelId);
  };

  const getCompletionCount = (size: number): number => {
    return stats.completionsBySize[size * size] || 0;
  };

  const getWinPercentage = (): number => {
    if (stats.gamesPlayed === 0) return 0;
    return Math.round((stats.gamesWon / stats.gamesPlayed) * 100);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <GradientText style={styles.title}>♞ Knight's Tour</GradientText>
        </View>

        {/* About */}
        <View style={styles.aboutSection}>
          <Text style={styles.aboutText}>
            The game is based on a classic mathematical puzzle studied by Leonhard Euler in 1759.{'\n\n'}
            The challenge: move a chess knight to visit every square on the board exactly once.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.tutorialButton, pressed && styles.tutorialButtonPressed]}
            onPress={onViewTutorial}
          >
            <Text style={styles.tutorialButtonText}>📖 How to Play</Text>
          </Pressable>
        </View>

        {/* Stats Summary */}
        <Pressable style={styles.statsCard} onPress={onViewStats}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{getWinPercentage()}%</Text>
              <Text style={styles.statLabel}>Win Rate</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.gamesWon}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.currentStreak}</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
          </View>
          <Text style={styles.viewStatsText}>Tap to view detailed stats →</Text>
        </Pressable>

        {/* Level Cards */}
        <View style={styles.levelsContainer}>
          {LEVELS.map((level) => {
            const unlocked = isLevelUnlocked(level.id);
            const completions = getCompletionCount(level.size);

            return (
              <Pressable
                key={level.id}
                style={({ pressed }) => [
                  styles.levelCard,
                  !unlocked && styles.levelCardLocked,
                  pressed && unlocked && styles.levelCardPressed,
                ]}
                onPress={() => unlocked && onSelectLevel(level)}
                disabled={!unlocked}
              >
                <View style={styles.levelHeader}>
                  <Text style={[styles.levelName, !unlocked && styles.levelNameLocked]}>
                    {level.name}
                  </Text>
                  <View style={styles.levelHeaderRight}>
                    {/* Difficulty Indicator */}
                    <View style={styles.difficultyIndicator}>
                      {Array.from({ length: level.knights || 1 }).map((_, i) => (
                        <Text key={i} style={[styles.knightIcon, !unlocked && styles.knightIconLocked]}>
                          ♞
                        </Text>
                      ))}
                    </View>
                    {!unlocked && <Text style={styles.lockIcon}>🔒</Text>}
                  </View>
                </View>

                <Text style={[styles.levelDescription, !unlocked && styles.levelDescriptionLocked]}>
                  {level.description}
                </Text>

                {unlocked && completions > 0 && (
                  <Text style={styles.completionText}>
                    Completed {completions} time{completions !== 1 ? 's' : ''}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Privacy options entry point — required by Google when US consent form is active */}
        {showPrivacyButton && (
          <Pressable
            style={styles.privacyButton}
            onPress={() => AdsConsent.showPrivacyOptionsForm().catch(() => {})}
          >
            <Text style={styles.privacyButtonText}>Privacy Options</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1208',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    color: '#e8a838',
    fontFamily: 'Cinzel_700Bold',
    letterSpacing: 1,
  },
  statsCard: {
    backgroundColor: '#2a2010',
    borderWidth: 1,
    borderColor: '#3d3020',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontFamily: 'Cinzel_700Bold',
    color: '#e8a838',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Lora_400Regular',
    color: '#9a8a6a',
    marginTop: 4,
  },
  viewStatsText: {
    fontSize: 12,
    fontFamily: 'Lora_400Regular',
    color: '#c4a060',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  levelsContainer: {
    gap: 16,
  },
  levelCard: {
    backgroundColor: '#2a2010',
    borderWidth: 2,
    borderColor: '#5a4a30',
    borderRadius: 16,
    padding: 20,
  },
  levelCardLocked: {
    backgroundColor: '#1a1208',
    borderColor: '#3d3020',
    opacity: 0.6,
  },
  levelCardPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: '#3a3020',
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelName: {
    fontSize: 24,
    fontFamily: 'Cinzel_700Bold',
    color: '#e8a838',
  },
  levelNameLocked: {
    color: '#6a5a4a',
  },
  difficultyIndicator: {
    flexDirection: 'row',
    gap: 3,
  },
  knightIcon: {
    fontSize: 20,
    color: '#e8a838',
  },
  knightIconLocked: {
    color: '#6a5a4a',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  star: {
    fontSize: 20,
    color: '#3d3020',
  },
  starEarned: {
    color: '#f0c860',
  },
  lockIcon: {
    fontSize: 20,
  },
  levelDescription: {
    fontSize: 14,
    fontFamily: 'Lora_400Regular',
    color: '#9a8a6a',
    lineHeight: 20,
    marginBottom: 8,
  },
  levelDescriptionLocked: {
    color: '#6a5a4a',
  },
  completionText: {
    fontSize: 12,
    fontFamily: 'Lora_400Regular',
    color: '#c4a060',
    fontStyle: 'italic',
    marginTop: 4,
  },
  aboutSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#221a10',
    borderWidth: 1,
    borderColor: '#3d3020',
    borderRadius: 12,
  },
  aboutText: {
    fontSize: 14,
    fontFamily: 'Lora_400Regular',
    color: '#c4a882',
    lineHeight: 22,
    marginBottom: 12,
  },
  tutorialButton: {
    backgroundColor: '#3d3020',
    borderWidth: 1,
    borderColor: '#5a4a30',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  tutorialButtonPressed: {
    backgroundColor: '#4d4030',
    transform: [{ scale: 0.98 }],
  },
  tutorialButtonText: {
    color: '#e8a838',
    fontSize: 14,
    fontFamily: 'Lora_600SemiBold',
  },
  privacyButton: {
    marginTop: 32,
    alignItems: 'center',
  },
  privacyButtonText: {
    color: '#5a4a3a',
    fontSize: 11,
    fontFamily: 'Lora_400Regular',
  },
});
