import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientText } from '../components/GradientText';

interface TutorialScreenProps {
  onClose: () => void;
}

export const TutorialScreen: React.FC<TutorialScreenProps> = ({ onClose }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <GradientText style={styles.title}>♞ How to Play</GradientText>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>
        </View>

        {/* Objective */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Objective</Text>
          <Text style={styles.text}>
            Visit every square on the board exactly once using only knight moves from chess.
          </Text>
        </View>

        {/* Knight Movement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>♞ Knight Movement</Text>
          <Text style={styles.text}>
            The knight moves in an <Text style={styles.bold}>L-shape</Text>:{'\n\n'}
            • Move <Text style={styles.bold}>2 squares</Text> in one direction (up, down, left, or right){'\n'}
            • Then <Text style={styles.bold}>1 square</Text> perpendicular to that direction{'\n\n'}
            This creates 8 possible moves from any position (if space allows).
          </Text>

          {/* Knight Movement Diagram */}
          <View style={styles.diagramContainer}>
            <Text style={styles.diagramTitle}>Visual Example:</Text>
            <View style={styles.boardWrapper}>
              <View style={styles.board}>
                {/* Row 0 */}
                <View style={styles.row}>
                  <View style={[styles.cell, styles.lightCell]} />
                  <View style={[styles.cell, styles.darkCell, styles.validMove]} />
                  <View style={[styles.cell, styles.lightCell]} />
                  <View style={[styles.cell, styles.darkCell, styles.validMove]} />
                  <View style={[styles.cell, styles.lightCell]} />
                </View>

                {/* Row 1 */}
                <View style={styles.row}>
                  <View style={[styles.cell, styles.darkCell, styles.validMove]} />
                  <View style={[styles.cell, styles.lightCell]} />
                  <View style={[styles.cell, styles.darkCell]} />
                  <View style={[styles.cell, styles.lightCell]} />
                  <View style={[styles.cell, styles.darkCell, styles.validMove]} />
                </View>

                {/* Row 2 - Knight in center */}
                <View style={styles.row}>
                  <View style={[styles.cell, styles.lightCell]} />
                  <View style={[styles.cell, styles.darkCell]} />
                  <View style={[styles.cell, styles.lightCell, styles.knightCell]}>
                    <Text style={styles.knight}>♞</Text>
                  </View>
                  <View style={[styles.cell, styles.darkCell]} />
                  <View style={[styles.cell, styles.lightCell]} />
                </View>

                {/* Row 3 */}
                <View style={styles.row}>
                  <View style={[styles.cell, styles.darkCell, styles.validMove]} />
                  <View style={[styles.cell, styles.lightCell]} />
                  <View style={[styles.cell, styles.darkCell]} />
                  <View style={[styles.cell, styles.lightCell]} />
                  <View style={[styles.cell, styles.darkCell, styles.validMove]} />
                </View>

                {/* Row 4 */}
                <View style={styles.row}>
                  <View style={[styles.cell, styles.lightCell]} />
                  <View style={[styles.cell, styles.darkCell, styles.validMove]} />
                  <View style={[styles.cell, styles.lightCell]} />
                  <View style={[styles.cell, styles.darkCell, styles.validMove]} />
                  <View style={[styles.cell, styles.lightCell]} />
                </View>
              </View>
            </View>
            <Text style={styles.diagramCaption}>
              The knight (♞) can move to any of the 8 green-bordered squares in an L-shaped pattern.
            </Text>
          </View>
        </View>

        {/* How to Play */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎮 How to Play</Text>
          <Text style={styles.text}>
            <Text style={styles.bold}>1. Start anywhere</Text>{'\n'}
            Tap any square on the board to place your first move (numbered "1").{'\n\n'}

            <Text style={styles.bold}>2. Continue the tour</Text>{'\n'}
            Each subsequent tap must be a valid knight's move from your last position. Valid moves are shown when you enable "Show Moves".{'\n\n'}

            <Text style={styles.bold}>3. Complete the board</Text>{'\n'}
            Keep moving until you've visited all squares. The number in each square shows the order of your moves.{'\n\n'}

            <Text style={styles.bold}>4. If you get stuck</Text>{'\n'}
            Use the Undo button to go back, or Restart to begin again.
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎛️ Controls</Text>
          <Text style={styles.text}>
            <Text style={styles.bold}>💡 Show Moves</Text>{'\n'}
            Highlights all valid next moves with bright green borders. Toggle on/off as needed.{'\n\n'}

            <Text style={styles.bold}>↩ Undo</Text>{'\n'}
            Go back one move. Use this if you realize you've made a mistake.{'\n\n'}

            <Text style={styles.bold}>↺ Restart</Text>{'\n'}
            Clear the board and start over from scratch.{'\n\n'}

            <Text style={styles.bold}>🔊 Sound</Text>{'\n'}
            Toggle game sounds on/off.
          </Text>
        </View>

        {/* Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Tips for Success</Text>
          <Text style={styles.text}>
            • Start from the edges or corners - these positions have fewer possible moves{'\n\n'}
            • Try to avoid isolating parts of the board early on{'\n\n'}
            • If you get stuck frequently, try starting from a different position{'\n\n'}
            • Use Show Moves to see your options, but challenge yourself to play without it!{'\n\n'}
            • Smaller boards (5×5, 6×6) are great for learning the patterns
          </Text>
        </View>

        {/* Close Button */}
        <Pressable
          style={({ pressed }) => [styles.closeButtonBottom, pressed && styles.btnPressed]}
          onPress={onClose}
        >
          <Text style={styles.closeButtonBottomText}>Got it! Let's Play</Text>
        </Pressable>
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
    backgroundColor: '#2a2010',
    borderWidth: 1,
    borderColor: '#3d3020',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#e8a838',
    fontFamily: 'Cinzel_700Bold',
    marginBottom: 12,
  },
  text: {
    fontSize: 15,
    fontFamily: 'Lora_400Regular',
    color: '#c4a882',
    lineHeight: 24,
  },
  bold: {
    fontFamily: 'Lora_700Bold',
    color: '#e0d0b0',
  },
  diagramContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#1a1208',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3d3020',
  },
  diagramTitle: {
    fontSize: 14,
    color: '#e8a838',
    fontFamily: 'Cinzel_600SemiBold',
    marginBottom: 12,
    textAlign: 'center',
  },
  boardWrapper: {
    position: 'relative',
  },
  board: {
    alignSelf: 'center',
    backgroundColor: '#2a1f0e',
    padding: 6,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#3d3020',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: 50,
    height: 50,
    margin: 1,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightCell: {
    backgroundColor: '#c4a882',
  },
  darkCell: {
    backgroundColor: '#3b2f1e',
  },
  knightCell: {
    backgroundColor: '#e8a838',
  },
  validMove: {
    borderWidth: 3,
    borderColor: '#00ff00',
    borderStyle: 'solid',
  },
  knight: {
    fontSize: 32,
    color: '#1a1208',
  },
  diagramCaption: {
    fontSize: 12,
    fontFamily: 'Lora_400Regular',
    color: '#9a8a6a',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  closeButtonBottom: {
    backgroundColor: '#e8a838',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  closeButtonBottomText: {
    color: '#1a1208',
    fontSize: 18,
    fontFamily: 'Cinzel_700Bold',
  },
  btnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
