import { useState, useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Pressable, Dimensions, ScrollView, Modal } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { LevelSelect } from './screens/LevelSelect';
import { StatsScreen } from './screens/StatsScreen';
import { TutorialScreen } from './screens/TutorialScreen';
import { Confetti } from './components/Confetti';
import { GradientText } from './components/GradientText';
import { useGameStats } from './hooks/useGameStats';
import { useSounds } from './hooks/useSounds';
import { useInterstitialAd } from './hooks/useInterstitialAd';
import { useAnalytics } from './hooks/useAnalytics';
import { useFonts } from './hooks/useFonts';
import { DifficultyLevel } from './types';

// ─── Knight move deltas ─────────────────────────────────────────────
const KNIGHT_MOVES = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2],
  [1, -2], [1, 2], [2, -1], [2, 1],
];

function isValid(r: number, c: number, size: number): boolean {
  return r >= 0 && r < size && c >= 0 && c < size;
}

function getKnightNeighbors(r: number, c: number, size: number): [number, number][] {
  return KNIGHT_MOVES.map(([dr, dc]) => [r + dr, c + dc])
    .filter(([nr, nc]) => isValid(nr, nc, size)) as [number, number][];
}

function warnsdorfDegree(r: number, c: number, board: number[][], size: number): number {
  return getKnightNeighbors(r, c, size).filter(([nr, nc]) => board[nr][nc] === 0).length;
}

function solveKnightsTour(startR: number, startC: number, size: number): [number, number][] | null {
  const total = size * size;
  const board = Array.from({ length: size }, () => Array(size).fill(0));
  board[startR][startC] = 1;
  const path: [number, number][] = [[startR, startC]];

  function bt(move: number): boolean {
    if (move > total) return true;
    const [r, c] = path[path.length - 1];
    let neighbors = getKnightNeighbors(r, c, size)
      .filter(([nr, nc]) => board[nr][nc] === 0)
      .map(([nr, nc]) => ({ nr, nc, deg: warnsdorfDegree(nr, nc, board, size) }))
      .sort((a, b) => a.deg - b.deg);

    for (const { nr, nc } of neighbors) {
      board[nr][nc] = move;
      path.push([nr, nc]);
      if (bt(move + 1)) return true;
      board[nr][nc] = 0;
      path.pop();
    }
    return false;
  }

  if (bt(2)) return path;
  return null;
}

// ─── Main App Component ──────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<'levelSelect' | 'game' | 'stats' | 'tutorial'>('levelSelect');
  const [currentLevel, setCurrentLevel] = useState<DifficultyLevel | null>(null);
  const { stats, loading, recordGameComplete, recordGameLost } = useGameStats();
  const { playSound, soundsEnabled, toggleSounds } = useSounds();
  const fontsLoaded = useFonts();

  return (
    <SafeAreaProvider>
      {loading || !fontsLoaded ? (
        <SafeAreaView style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </SafeAreaView>
      ) : screen === 'stats' ? (
        <StatsScreen stats={stats} onClose={() => setScreen('levelSelect')} />
      ) : screen === 'tutorial' ? (
        <TutorialScreen onClose={() => setScreen('levelSelect')} />
      ) : screen === 'levelSelect' ? (
        <LevelSelect
          stats={stats}
          onSelectLevel={(level) => {
            setCurrentLevel(level);
            setScreen('game');
          }}
          onViewStats={() => setScreen('stats')}
          onViewTutorial={() => setScreen('tutorial')}
        />
      ) : screen === 'game' && currentLevel ? (
        <GameScreen
          level={currentLevel}
          onExit={() => {
            setCurrentLevel(null);
            setScreen('levelSelect');
          }}
          onGameComplete={async (hintsUsed, timeSeconds) => {
            return await recordGameComplete(
              currentLevel.id,
              currentLevel.size * currentLevel.size,
              currentLevel.size * currentLevel.size,
              hintsUsed,
              timeSeconds
            );
          }}
          onGameLost={async (moves, hintsUsed) => {
            await recordGameLost(moves, hintsUsed);
          }}
          playSound={playSound}
          soundsEnabled={soundsEnabled}
          toggleSounds={toggleSounds}
        />
      ) : null}
    </SafeAreaProvider>
  );
}

// ─── Game Screen Component ──────────────────────────────────────────────────────
interface GameScreenProps {
  level: DifficultyLevel;
  onExit: () => void;
  onGameComplete: (hintsUsed: number, timeSeconds: number) => Promise<any>;
  onGameLost: (moves: number, hintsUsed: number) => Promise<void>;
  playSound: (type: 'move' | 'invalid' | 'win' | 'stuck' | 'undo') => void;
  soundsEnabled: boolean;
  toggleSounds: () => void;
}

function GameScreen({ level, onExit, onGameComplete, onGameLost, playSound, soundsEnabled, toggleSounds }: GameScreenProps) {
  const SIZE = level.size;
  const TOTAL = SIZE * SIZE;

  const [board, setBoard] = useState<number[][]>(() =>
    Array.from({ length: SIZE }, () => Array(SIZE).fill(0))
  );
  const [history, setHistory] = useState<[number, number][]>([]);
  const [lastPos, setLastPos] = useState<[number, number] | null>(null);
  const [validMoves, setValidMoves] = useState<Set<string>>(new Set());
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [animating, setAnimating] = useState<string | null>(null);
  const [startTime] = useState(Date.now());
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [hintsUsedCount, setHintsUsedCount] = useState(0);
  const [earnedStars, setEarnedStars] = useState(0);

  // Ad management
  const { showAd } = useInterstitialAd();

  // Analytics
  const { logGameStarted, logGameCompleted, logGameStuck, logGameRestarted, logUndoUsed, logHintToggled, logAdShown } = useAnalytics();

  // Compute valid moves
  useEffect(() => {
    if (gameOver) { setValidMoves(new Set()); return; }
    if (!lastPos) {
      const s = new Set<string>();
      for (let r = 0; r < SIZE; r++)
        for (let c = 0; c < SIZE; c++) s.add(`${r},${c}`);
      setValidMoves(s);
    } else {
      const [lr, lc] = lastPos;
      const s = new Set<string>();
      getKnightNeighbors(lr, lc, SIZE).forEach(([nr, nc]) => {
        if (board[nr][nc] === 0) s.add(`${nr},${nc}`);
      });
      setValidMoves(s);
      if (s.size === 0 && history.length < TOTAL) {
        setGameOver(true);
        playSound('stuck');
        logGameStuck(SIZE, history.length);
        onGameLost(history.length, hintsUsedCount);
      }
    }
  }, [lastPos, board, gameOver, history.length, SIZE, TOTAL]);

  const handleClick = useCallback((r: number, c: number) => {
    if (gameOver || won) return;
    const key = `${r},${c}`;
    if (!validMoves.has(key)) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    playSound('move');

    const move = history.length + 1;
    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = move;
    setBoard(newBoard);
    setHistory(prev => [...prev, [r, c]]);
    setLastPos([r, c]);
    setAnimating(key);
    setTimeout(() => setAnimating(null), 300);

    // Log game started on first move
    if (move === 1) {
      logGameStarted(SIZE);
    }

    if (move === TOTAL) {
      setWon(true);
      setGameOver(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      playSound('win');

      const timeSeconds = Math.floor((Date.now() - startTime) / 1000);
      logGameCompleted(SIZE, timeSeconds, hintsUsedCount);

      // Show victory modal immediately - ad will show when user taps "Play Again"
      onGameComplete(hintsUsedCount, timeSeconds).then((result) => {
        if (result?.stars) {
          setEarnedStars(result.stars);
          setShowVictoryModal(true);
        }
      });
    }
  }, [board, gameOver, won, validMoves, history.length, TOTAL, hintsUsedCount, startTime, onGameComplete]);

  const undo = useCallback(() => {
    if (history.length === 0 || won) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    playSound('undo');
    logUndoUsed(SIZE);
    const newHistory = [...history];
    const [r, c] = newHistory.pop()!;
    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = 0;
    setBoard(newBoard);
    setHistory(newHistory);
    setLastPos(newHistory.length > 0 ? newHistory[newHistory.length - 1] : null);
    setGameOver(false);
  }, [board, history, won]);

  const restart = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    logGameRestarted(SIZE);
    setBoard(Array.from({ length: SIZE }, () => Array(SIZE).fill(0)));
    setHistory([]);
    setLastPos(null);
    setGameOver(false);
    setWon(false);
    setShowHint(false);
    setHintsUsedCount(0);
    setEarnedStars(0);
    setShowVictoryModal(false);
  }, [SIZE]);

  const toggleHint = useCallback(() => {
    if (history.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowHint(prev => {
      const newVal = !prev;
      if (newVal) {
        // Count as a hint when enabling
        setHintsUsedCount(count => count + 1);
      }
      logHintToggled(SIZE, newVal);
      return newVal;
    });
  }, [history.length]);

  function getCellStyle(r: number, c: number) {
    const val = board[r][c];
    const key = `${r},${c}`;
    const isLast = lastPos && lastPos[0] === r && lastPos[1] === c;
    const isValid = validMoves.has(key);
    return { val, isLast, isValid, key };
  }

  const progress = history.length;
  const progressPct = (progress / TOTAL) * 100;
  const screenWidth = Dimensions.get('window').width;
  const boardSize = Math.min(screenWidth * 0.92, 540);
  // Account for board padding (6 * 2 = 12) and cell margins (2 * SIZE)
  const cellSize = Math.floor((boardSize - 12 - (SIZE * 2 + 2)) / SIZE);

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.gameHeader}>
          <Pressable style={styles.backButton} onPress={onExit}>
            <Text style={styles.backButtonText}>← Back</Text>
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.levelTitle}>{level.name}</Text>
            <Text style={styles.levelSubtitle}>{SIZE}×{SIZE} Board</Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.soundButton,
              pressed && { opacity: 0.6, transform: [{ scale: 0.9 }] }
            ]}
            onPress={toggleSounds}
          >
            <Text style={styles.soundButtonText}>{soundsEnabled ? '🔊' : '🔇'}</Text>
          </Pressable>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
          <Text style={styles.progressLabel}>{progress} / {TOTAL}</Text>
        </View>

        {/* Board */}
        <View style={styles.boardWrapper}>
          <View style={[styles.board, { width: boardSize, height: boardSize }]}>
            {Array.from({ length: SIZE }, (_, r) => (
              <View key={`row-${r}`} style={styles.boardRow}>
                {Array.from({ length: SIZE }, (_, c) => {
                  const { val, isLast, isValid: isV, key } = getCellStyle(r, c);
                  const isDark = (r + c) % 2 === 1;
                  const isAnim = animating === key;

                  let bg = isDark ? "#3b2f1e" : "#c4a882";
                  let color = isDark ? "#f0e6d3" : "#2a1f0e";
                  let borderColor: string | undefined = undefined;
                  let borderWidth = 0;
                  let borderStyle: 'solid' | 'dashed' | undefined = undefined;

                  if (val > 0) {
                    if (isLast) {
                      bg = "#e8a838";
                      color = "#1a1208";
                    } else {
                      bg = isDark ? "#4a3c2a" : "#d4b892";
                      color = isDark ? "#c4a060" : "#5a4020";
                    }
                  } else if (isV && !gameOver && showHint) {
                    // Only show borders when hint is enabled
                    bg = isDark ? "#4d3f2d" : "#d9c49a";
                    borderColor = "#00ff00"; // Bright green - very visible
                    borderWidth = 3;
                    borderStyle = 'solid';
                  }

                  return (
                    <Pressable
                      key={key}
                      onPress={() => handleClick(r, c)}
                      style={({ pressed }) => [
                        styles.cell,
                        {
                          width: cellSize,
                          height: cellSize,
                          backgroundColor: bg,
                          borderColor,
                          borderWidth,
                          borderStyle,
                          transform: [{ scale: isAnim || pressed ? 1.08 : 1 }],
                          zIndex: isAnim ? 5 : isLast ? 3 : 1,
                        }
                      ]}
                      disabled={!isV || gameOver || val > 0}
                    >
                      {val > 0 && <Text style={[styles.cellNum, { color, fontSize: Math.max(12, cellSize * 0.45) }]}>{val}</Text>}
                      {isLast && val > 0 && <Text style={[styles.knightIcon, { fontSize: Math.max(8, cellSize * 0.25) }]}>♞</Text>}
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <Pressable
            style={({ pressed }) => [
              styles.btn,
              (history.length === 0 || won) && styles.btnDisabled,
              pressed && styles.btnPressed
            ]}
            onPress={undo}
            disabled={history.length === 0 || won}
          >
            <Text style={styles.btnText}>↩ Undo</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.btn,
              styles.btnHint,
              history.length === 0 && styles.btnDisabled,
              pressed && styles.btnPressed
            ]}
            onPress={toggleHint}
            disabled={history.length === 0}
          >
            <Text style={styles.btnTextHint}>
              {showHint ? "💡 Hide Moves" : "💡 Show Moves"}
            </Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.btn,
              styles.btnRestart,
              pressed && styles.btnPressed
            ]}
            onPress={() => {
              logAdShown('restart');
              showAd(restart);
            }}
          >
            <Text style={styles.btnTextRestart}>↺ Restart</Text>
          </Pressable>
        </View>

        {/* Victory Modal */}
        <Modal visible={showVictoryModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            {showVictoryModal && <Confetti />}
            <View style={styles.victoryCard}>
              <Text style={styles.victoryIcon}>🏆</Text>
              <GradientText style={styles.victoryTitle}>Level Complete!</GradientText>
              <Text style={styles.victoryStats}>
                Moves: {TOTAL} • Hints: {hintsUsedCount}
              </Text>
              <View style={styles.victoryButtons}>
                <Pressable
                  style={({ pressed }) => [styles.victoryButtonSecondary, pressed && styles.btnPressed]}
                  onPress={() => {
                    logAdShown('play_again');
                    showAd(() => {
                      setShowVictoryModal(false);
                      restart();
                    });
                  }}
                >
                  <Text style={styles.victoryButtonSecondaryText}>Play Again</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.victoryButton, pressed && styles.btnPressed]}
                  onPress={() => {
                    setShowVictoryModal(false);
                    onExit();
                  }}
                >
                  <Text style={styles.victoryButtonText}>New Level</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Game Over Banner */}
        {gameOver && !won && (
          <View style={styles.stuckBanner}>
            <Text style={styles.stuckIcon}>⚠️</Text>
            <Text style={styles.stuckText}>
              Stuck at move {progress}! The knight has no valid moves left.
            </Text>
            <View style={styles.stuckActions}>
              <Pressable style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]} onPress={undo}>
                <Text style={styles.btnText}>↩ Undo</Text>
              </Pressable>
              <Pressable style={({ pressed }) => [styles.btn, styles.btnRestart, pressed && styles.btnPressed]} onPress={() => {
                logAdShown('restart');
                showAd(restart);
              }}>
                <Text style={styles.btnTextRestart}>↺ Restart</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Rules */}
        <View style={styles.rules}>
          <Text style={styles.rulesTitle}>How to Play</Text>
          <Text style={styles.rulesText}>
            Tap any square to place <Text style={{ fontWeight: 'bold' }}>1</Text>. Each subsequent tap must be a knight's L-shaped move (2+1 squares). Fill all squares to win!{'\n\n'}
            <Text style={{ fontWeight: 'bold' }}>💡 Show Moves</Text> highlights all valid next moves with bright green borders.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1a1208',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#e8a838',
    fontSize: 18,
    fontFamily: 'Cinzel_600SemiBold',
  },
  root: {
    flex: 1,
    backgroundColor: '#1a1208',
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingBottom: 40,
  },
  gameHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backButtonText: {
    color: '#e8a838',
    fontSize: 16,
    fontFamily: 'Lora_600SemiBold',
  },
  headerCenter: {
    alignItems: 'center',
  },
  levelTitle: {
    fontSize: 20,
    color: '#e8a838',
    fontFamily: 'Cinzel_700Bold',
  },
  levelSubtitle: {
    fontSize: 12,
    fontFamily: 'Lora_400Regular',
    color: '#9a8a6a',
  },
  soundButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  soundButtonText: {
    fontSize: 20,
  },
  progressBg: {
    width: '92%',
    maxWidth: 560,
    height: 22,
    backgroundColor: '#2a2010',
    borderRadius: 11,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#3d3020',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#e8a838',
    borderRadius: 11,
  },
  progressLabel: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -7 }],
    fontSize: 11,
    fontFamily: 'Lora_600SemiBold',
    color: '#9a8a6a',
    letterSpacing: 1,
  },
  boardWrapper: {
    marginBottom: 20,
  },
  board: {
    padding: 6,
    backgroundColor: '#2a1f0e',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#3d3020',
  },
  boardRow: {
    flexDirection: 'row',
  },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 3,
    margin: 1,
    position: 'relative',
  },
  cellNum: {
    fontFamily: 'Cinzel_700Bold',
    letterSpacing: 0.2,
  },
  hintNum: {
    opacity: 0.45,
    fontStyle: 'italic',
  },
  knightIcon: {
    position: 'absolute',
    bottom: 1,
    right: 2,
    opacity: 0.7,
  },
  controls: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  btn: {
    backgroundColor: '#3d3020',
    borderWidth: 1,
    borderColor: '#5a4a30',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPressed: {
    opacity: 0.7,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  btnText: {
    color: '#e0d0b0',
    fontSize: 13,
    fontFamily: 'Lora_600SemiBold',
    letterSpacing: 0.5,
  },
  btnHint: {
    backgroundColor: '#2a3a20',
    borderColor: '#4a6a30',
  },
  btnTextHint: {
    color: '#b0d890',
    fontSize: 13,
    fontFamily: 'Lora_600SemiBold',
    letterSpacing: 0.5,
  },
  btnRestart: {
    backgroundColor: '#5a2a1a',
    borderColor: '#8a4a30',
  },
  btnTextRestart: {
    color: '#f0c0a0',
    fontSize: 13,
    fontFamily: 'Lora_600SemiBold',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  victoryCard: {
    backgroundColor: '#2a2010',
    borderWidth: 2,
    borderColor: '#e8a838',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '85%',
    maxWidth: 350,
  },
  victoryIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  victoryTitle: {
    fontSize: 28,
    color: '#e8a838',
    fontFamily: 'Cinzel_700Bold',
    marginBottom: 16,
  },
  victoryStars: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  victoryStar: {
    fontSize: 40,
    color: '#3d3020',
  },
  victoryStarEarned: {
    color: '#f0c860',
  },
  victoryStats: {
    fontSize: 14,
    fontFamily: 'Lora_400Regular',
    color: '#9a8a6a',
    marginBottom: 8,
  },
  victoryStarsExplain: {
    fontSize: 13,
    fontFamily: 'Lora_400Regular',
    color: '#c4a060',
    fontStyle: 'italic',
    marginBottom: 24,
  },
  victoryButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  victoryButton: {
    flex: 1,
    backgroundColor: '#e8a838',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  victoryButtonText: {
    color: '#1a1208',
    fontSize: 16,
    fontFamily: 'Cinzel_700Bold',
    textAlign: 'center',
  },
  victoryButtonSecondary: {
    flex: 1,
    backgroundColor: '#e8a838',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  victoryButtonSecondaryText: {
    color: '#1a1208',
    fontSize: 16,
    fontFamily: 'Cinzel_700Bold',
    textAlign: 'center',
  },
  stuckBanner: {
    backgroundColor: '#2a1a14',
    borderWidth: 1,
    borderColor: '#8a4a30',
    borderRadius: 14,
    padding: 20,
    paddingHorizontal: 28,
    alignItems: 'center',
    maxWidth: 400,
    width: '90%',
  },
  stuckIcon: {
    fontSize: 29,
    marginBottom: 6
  },
  stuckText: {
    color: '#d0a080',
    fontSize: 14,
    fontFamily: 'Lora_400Regular',
    lineHeight: 21,
    marginBottom: 12,
    textAlign: 'center',
  },
  stuckActions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  rules: {
    maxWidth: 520,
    width: '90%',
    backgroundColor: '#221a10',
    borderWidth: 1,
    borderColor: '#3d3020',
    borderRadius: 10,
    padding: 14,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  rulesTitle: {
    marginBottom: 6,
    color: '#e8a838',
    fontSize: 13,
    fontFamily: 'Cinzel_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  rulesText: {
    color: '#9a8a6a',
    fontSize: 12,
    fontFamily: 'Lora_400Regular',
    lineHeight: 19,
  },
});
