import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientText } from '../components/GradientText';
import { GameStats } from '../types';

interface StatsScreenProps {
  stats: GameStats;
  onClose: () => void;
}

const ACHIEVEMENTS = [
  {
    id: 'first_steps',
    title: 'First Steps',
    description: 'Complete a 5×5 board',
    icon: '🎯',
  },
  {
    id: 'easy_rider',
    title: 'Easy Rider',
    description: 'Complete a 6×6 board',
    icon: '🌟',
  },
  {
    id: 'chess_master',
    title: 'Chess Master',
    description: 'Complete an 8×8 board (classic chess board)',
    icon: '♔',
  },
  {
    id: 'grandmaster',
    title: 'Grandmaster',
    description: 'Complete a 10×10 board',
    icon: '👑',
  },
  {
    id: 'legend',
    title: 'Legend',
    description: 'Complete a 12×12 board',
    icon: '🏆',
  },
  {
    id: 'perfect_ten',
    title: 'Perfect Ten',
    description: 'Complete 10 games',
    icon: '🔟',
  },
  {
    id: 'half_century',
    title: 'Half Century',
    description: 'Complete 50 games',
    icon: '⭐',
  },
  {
    id: 'centurion',
    title: 'Centurion',
    description: 'Complete 100 games',
    icon: '💯',
  },
  {
    id: 'hot_streak',
    title: 'Hot Streak',
    description: 'Win 3 games in a row',
    icon: '🔥',
  },
  {
    id: 'unstoppable',
    title: 'Unstoppable',
    description: 'Win 7 games in a row',
    icon: '⚡',
  },
  {
    id: 'speedrunner',
    title: 'Speedrunner',
    description: 'Complete a 5×5 board in under 60 seconds',
    icon: '⏱️',
  },
  {
    id: 'explorer',
    title: 'Explorer',
    description: 'Complete at least one game on every board size',
    icon: '🗺️',
  },
];

export const StatsScreen: React.FC<StatsScreenProps> = ({ stats, onClose }) => {
  const winRate = stats.gamesPlayed > 0
    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
    : 0;

  const avgMoves = stats.gamesPlayed > 0
    ? Math.round(stats.totalMoves / stats.gamesPlayed)
    : 0;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <GradientText style={styles.title}>♞ Statistics</GradientText>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>
        </View>

        {/* Overall Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overall Performance</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statBigNumber}>{stats.gamesPlayed}</Text>
              <Text style={styles.statBoxLabel}>Games Played</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statBigNumber}>{stats.gamesWon}</Text>
              <Text style={styles.statBoxLabel}>Games Won</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statBigNumber}>{winRate}%</Text>
              <Text style={styles.statBoxLabel}>Win Rate</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statBigNumber}>{avgMoves}</Text>
              <Text style={styles.statBoxLabel}>Avg Moves</Text>
            </View>
          </View>
        </View>

        {/* Streaks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Streaks</Text>
          <View style={styles.streakRow}>
            <View style={styles.streakBox}>
              <Text style={styles.streakIcon}>🔥</Text>
              <Text style={styles.streakNumber}>{stats.currentStreak}</Text>
              <Text style={styles.streakLabel}>Current</Text>
            </View>
            <View style={styles.streakBox}>
              <Text style={styles.streakIcon}>🏆</Text>
              <Text style={styles.streakNumber}>{stats.bestStreak}</Text>
              <Text style={styles.streakLabel}>Best Ever</Text>
            </View>
          </View>
        </View>

        {/* Completions by Board Size */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Completions by Board Size</Text>
          {[25, 36, 64, 100, 144].map((size) => {
            const count = stats.completionsBySize[size] || 0;
            const bestTime = stats.bestTimesBySize[size];
            const sizeName = {
              25: '5×5 (Beginner)',
              36: '6×6 (Easy)',
              64: '8×8 (Medium)',
              100: '10×10 (Hard)',
              144: '12×12 (Expert)',
            }[size];

            return (
              <View key={size} style={styles.completionRow}>
                <View style={styles.completionInfo}>
                  <Text style={styles.completionSize}>{sizeName}</Text>
                  <Text style={styles.completionCount}>{count} completed</Text>
                </View>
                {bestTime && (
                  <Text style={styles.bestTime}>
                    Best: {formatTime(bestTime)}
                  </Text>
                )}
              </View>
            );
          })}
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          {ACHIEVEMENTS.map((achievement) => {
            const unlocked = stats.achievements.includes(achievement.id);
            return (
              <View
                key={achievement.id}
                style={[
                  styles.achievementCard,
                  !unlocked && styles.achievementLocked,
                ]}
              >
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <View style={styles.achievementInfo}>
                  <Text
                    style={[
                      styles.achievementTitle,
                      !unlocked && styles.achievementTitleLocked,
                    ]}
                  >
                    {achievement.title}
                  </Text>
                  <Text
                    style={[
                      styles.achievementDescription,
                      !unlocked && styles.achievementDescriptionLocked,
                    ]}
                  >
                    {achievement.description}
                  </Text>
                </View>
                {unlocked && <Text style={styles.checkmark}>✓</Text>}
              </View>
            );
          })}
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    color: '#e8a838',
    fontFamily: 'Cinzel_700Bold',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3d3020',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#e0d0b0',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#e8a838',
    fontFamily: 'Cinzel_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#2a2010',
    borderWidth: 1,
    borderColor: '#3d3020',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statBigNumber: {
    fontSize: 32,
    fontFamily: 'Cinzel_700Bold',
    color: '#e8a838',
  },
  statBoxLabel: {
    fontSize: 12,
    fontFamily: 'Lora_400Regular',
    color: '#9a8a6a',
    marginTop: 4,
    textAlign: 'center',
  },
  streakRow: {
    flexDirection: 'row',
    gap: 12,
  },
  streakBox: {
    flex: 1,
    backgroundColor: '#2a2010',
    borderWidth: 1,
    borderColor: '#3d3020',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  streakIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  streakNumber: {
    fontSize: 28,
    fontFamily: 'Cinzel_700Bold',
    color: '#e8a838',
  },
  streakLabel: {
    fontSize: 12,
    fontFamily: 'Lora_400Regular',
    color: '#9a8a6a',
    marginTop: 4,
  },
  completionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2a2010',
    borderWidth: 1,
    borderColor: '#3d3020',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  completionInfo: {
    flex: 1,
  },
  completionSize: {
    fontSize: 14,
    color: '#e0d0b0',
    fontFamily: 'Lora_600SemiBold',
  },
  completionCount: {
    fontSize: 12,
    fontFamily: 'Lora_400Regular',
    color: '#9a8a6a',
    marginTop: 2,
  },
  bestTime: {
    fontSize: 14,
    fontFamily: 'Lora_600SemiBold',
    color: '#c4a060',
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2010',
    borderWidth: 2,
    borderColor: '#5a4a30',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  achievementLocked: {
    backgroundColor: '#1a1208',
    borderColor: '#3d3020',
    opacity: 0.5,
  },
  achievementIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    color: '#e8a838',
    fontFamily: 'Lora_600SemiBold',
  },
  achievementTitleLocked: {
    color: '#6a5a4a',
  },
  achievementDescription: {
    fontSize: 12,
    fontFamily: 'Lora_400Regular',
    color: '#9a8a6a',
    marginTop: 2,
  },
  achievementDescriptionLocked: {
    color: '#5a4a3a',
  },
  checkmark: {
    fontSize: 24,
    color: '#6aaa44',
  },
  hintsBox: {
    backgroundColor: '#2a2010',
    borderWidth: 1,
    borderColor: '#3d3020',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  hintsNumber: {
    fontSize: 40,
    fontWeight: '700',
    color: '#b0d890',
  },
  hintsLabel: {
    fontSize: 14,
    color: '#9a8a6a',
    marginTop: 4,
  },
  hintsAvg: {
    fontSize: 12,
    color: '#7a8a6a',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
