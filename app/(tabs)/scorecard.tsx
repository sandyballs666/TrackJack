import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Minus, Trophy, Target, TrendingUp, Save } from 'lucide-react-native';
import { useGameStore } from '@/stores/gameStore';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  runOnJS
} from 'react-native-reanimated';

interface HoleScore {
  hole: number;
  par: number;
  score: number;
  putts?: number;
  fairwayHit?: boolean;
  greenInRegulation?: boolean;
}

export default function ScorecardScreen() {
  const { currentGame, updateHoleScore, addStroke, removeStroke } = useGameStore();
  const [selectedHole, setSelectedHole] = useState(1);
  const [showStats, setShowStats] = useState(false);
  
  const animationScale = useSharedValue(1);

  // Mock course data - in real app this would come from course database
  const courseData = {
    name: "Pebble Beach",
    holes: Array.from({ length: 18 }, (_, i) => ({
      hole: i + 1,
      par: [4, 4, 4, 4, 3, 5, 3, 4, 4, 4, 3, 5, 4, 5, 4, 4, 3, 5][i],
      yardage: [380, 502, 390, 331, 188, 525, 106, 431, 464, 446, 242, 202, 405, 573, 397, 403, 178, 548][i],
    }))
  };

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: animationScale.value }],
  }));

  const handleScorePress = (adjustment: number) => {
    animationScale.value = withSpring(0.95, { duration: 100 }, () => {
      animationScale.value = withSpring(1, { duration: 100 });
    });
    
    if (adjustment > 0) {
      addStroke(selectedHole);
    } else {
      removeStroke(selectedHole);
    }
  };

  const getCurrentScore = (hole: number) => {
    return currentGame?.scores.find(s => s.hole === hole)?.score || courseData.holes[hole - 1].par;
  };

  const getScoreColor = (score: number, par: number) => {
    const diff = score - par;
    if (diff <= -2) return '#16A34A'; // Eagle or better
    if (diff === -1) return '#22C55E'; // Birdie
    if (diff === 0) return '#3B82F6';  // Par
    if (diff === 1) return '#F59E0B';  // Bogey
    return '#EF4444'; // Double bogey or worse
  };

  const getScoreText = (score: number, par: number) => {
    const diff = score - par;
    if (diff <= -2) return 'Eagle';
    if (diff === -1) return 'Birdie';
    if (diff === 0) return 'Par';
    if (diff === 1) return 'Bogey';
    if (diff === 2) return 'Double';
    return '+' + diff;
  };

  const getTotalScore = () => {
    if (!currentGame) return 0;
    return currentGame.scores.reduce((total, score) => total + score.score, 0);
  };

  const getTotalPar = () => {
    return courseData.holes.reduce((total, hole) => total + hole.par, 0);
  };

  const saveRound = () => {
    Alert.alert(
      'Save Round',
      'Are you sure you want to save this round?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Save', 
          onPress: () => Alert.alert('Success', 'Round saved successfully!')
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#3B82F6', '#1D4ED8']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>{courseData.name}</Text>
            <Text style={styles.headerSubtitle}>
              Round in Progress • Hole {selectedHole}/18
            </Text>
          </View>
          <TouchableOpacity style={styles.saveButton} onPress={saveRound}>
            <Save size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Score Summary */}
        <View style={styles.summaryCard}>
          <LinearGradient
            colors={['#ffffff', '#f8fafc']}
            style={styles.summaryGradient}
          >
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Trophy size={24} color="#F59E0B" />
                <Text style={styles.summaryLabel}>Total Score</Text>
                <Text style={styles.summaryValue}>{getTotalScore()}</Text>
              </View>
              
              <View style={styles.summaryDivider} />
              
              <View style={styles.summaryItem}>
                <Target size={24} color="#22C55E" />
                <Text style={styles.summaryLabel}>To Par</Text>
                <Text style={[
                  styles.summaryValue,
                  { color: getTotalScore() <= getTotalPar() ? '#22C55E' : '#EF4444' }
                ]}>
                  {getTotalScore() - getTotalPar() > 0 ? '+' : ''}{getTotalScore() - getTotalPar()}
                </Text>
              </View>
              
              <View style={styles.summaryDivider} />
              
              <View style={styles.summaryItem}>
                <TrendingUp size={24} color="#3B82F6" />
                <Text style={styles.summaryLabel}>Holes Left</Text>
                <Text style={styles.summaryValue}>{18 - selectedHole + 1}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Current Hole */}
        <View style={styles.currentHoleCard}>
          <View style={styles.currentHoleHeader}>
            <Text style={styles.currentHoleTitle}>Hole {selectedHole}</Text>
            <View style={styles.holeInfo}>
              <Text style={styles.holeInfoText}>
                Par {courseData.holes[selectedHole - 1].par} • {courseData.holes[selectedHole - 1].yardage} yards
              </Text>
            </View>
          </View>

          <View style={styles.scoreControls}>
            <Animated.View style={animatedButtonStyle}>
              <TouchableOpacity
                style={styles.scoreButton}
                onPress={() => handleScorePress(-1)}
                disabled={getCurrentScore(selectedHole) <= 1}
              >
                <Minus size={24} color="#ffffff" />
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.scoreDisplay}>
              <Text style={[
                styles.scoreNumber,
                { color: getScoreColor(getCurrentScore(selectedHole), courseData.holes[selectedHole - 1].par) }
              ]}>
                {getCurrentScore(selectedHole)}
              </Text>
              <Text style={styles.scoreLabel}>
                {getScoreText(getCurrentScore(selectedHole), courseData.holes[selectedHole - 1].par)}
              </Text>
            </View>

            <Animated.View style={animatedButtonStyle}>
              <TouchableOpacity
                style={styles.scoreButton}
                onPress={() => handleScorePress(1)}
              >
                <Plus size={24} color="#ffffff" />
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>

        {/* Hole Navigation */}
        <View style={styles.holeNavigation}>
          <Text style={styles.sectionTitle}>Select Hole</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.holeButtons}>
              {courseData.holes.map((hole) => {
                const score = getCurrentScore(hole.hole);
                const isSelected = selectedHole === hole.hole;
                
                return (
                  <TouchableOpacity
                    key={hole.hole}
                    style={[
                      styles.holeButton,
                      isSelected && styles.selectedHoleButton,
                      { borderColor: getScoreColor(score, hole.par) }
                    ]}
                    onPress={() => setSelectedHole(hole.hole)}
                  >
                    <Text style={[
                      styles.holeButtonText,
                      isSelected && styles.selectedHoleButtonText
                    ]}>
                      {hole.hole}
                    </Text>
                    <Text style={[
                      styles.holeButtonScore,
                      { color: getScoreColor(score, hole.par) }
                    ]}>
                      {score}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Full Scorecard */}
        <View style={styles.fullScorecard}>
          <Text style={styles.sectionTitle}>Full Scorecard</Text>
          
          {/* Front Nine */}
          <View style={styles.nineSection}>
            <Text style={styles.nineSectionTitle}>Front Nine</Text>
            <View style={styles.scoreTable}>
              <View style={styles.scoreRow}>
                <Text style={styles.scoreHeaderCell}>Hole</Text>
                {courseData.holes.slice(0, 9).map(hole => (
                  <Text key={hole.hole} style={styles.scoreCell}>{hole.hole}</Text>
                ))}
                <Text style={styles.scoreHeaderCell}>OUT</Text>
              </View>
              
              <View style={styles.scoreRow}>
                <Text style={styles.scoreHeaderCell}>Par</Text>
                {courseData.holes.slice(0, 9).map(hole => (
                  <Text key={hole.hole} style={styles.scoreCell}>{hole.par}</Text>
                ))}
                <Text style={styles.scoreHeaderCell}>
                  {courseData.holes.slice(0, 9).reduce((sum, hole) => sum + hole.par, 0)}
                </Text>
              </View>
              
              <View style={styles.scoreRow}>
                <Text style={styles.scoreHeaderCell}>Score</Text>
                {courseData.holes.slice(0, 9).map(hole => (
                  <Text key={hole.hole} style={[
                    styles.scoreCell,
                    { color: getScoreColor(getCurrentScore(hole.hole), hole.par) }
                  ]}>
                    {getCurrentScore(hole.hole)}
                  </Text>
                ))}
                <Text style={styles.scoreHeaderCell}>
                  {courseData.holes.slice(0, 9).reduce((sum, hole) => sum + getCurrentScore(hole.hole), 0)}
                </Text>
              </View>
            </View>
          </View>

          {/* Back Nine */}
          <View style={styles.nineSection}>
            <Text style={styles.nineSectionTitle}>Back Nine</Text>
            <View style={styles.scoreTable}>
              <View style={styles.scoreRow}>
                <Text style={styles.scoreHeaderCell}>Hole</Text>
                {courseData.holes.slice(9, 18).map(hole => (
                  <Text key={hole.hole} style={styles.scoreCell}>{hole.hole}</Text>
                ))}
                <Text style={styles.scoreHeaderCell}>IN</Text>
              </View>
              
              <View style={styles.scoreRow}>
                <Text style={styles.scoreHeaderCell}>Par</Text>
                {courseData.holes.slice(9, 18).map(hole => (
                  <Text key={hole.hole} style={styles.scoreCell}>{hole.par}</Text>
                ))}
                <Text style={styles.scoreHeaderCell}>
                  {courseData.holes.slice(9, 18).reduce((sum, hole) => sum + hole.par, 0)}
                </Text>
              </View>
              
              <View style={styles.scoreRow}>
                <Text style={styles.scoreHeaderCell}>Score</Text>
                {courseData.holes.slice(9, 18).map(hole => (
                  <Text key={hole.hole} style={[
                    styles.scoreCell,
                    { color: getScoreColor(getCurrentScore(hole.hole), hole.par) }
                  ]}>
                    {getCurrentScore(hole.hole)}
                  </Text>
                ))}
                <Text style={styles.scoreHeaderCell}>
                  {courseData.holes.slice(9, 18).reduce((sum, hole) => sum + getCurrentScore(hole.hole), 0)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 12,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  summaryCard: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  summaryGradient: {
    padding: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 16,
  },
  currentHoleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  currentHoleHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  currentHoleTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  holeInfo: {
    marginTop: 8,
  },
  holeInfoText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  scoreControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreButton: {
    backgroundColor: '#22C55E',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  scoreDisplay: {
    alignItems: 'center',
    marginHorizontal: 40,
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
    fontWeight: '600',
  },
  holeNavigation: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  holeButtons: {
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  holeButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    minWidth: 60,
  },
  selectedHoleButton: {
    backgroundColor: '#f0fdf4',
    borderColor: '#22C55E',
  },
  holeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  selectedHoleButtonText: {
    color: '#111827',
  },
  holeButtonScore: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },
  fullScorecard: {
    marginBottom: 40,
  },
  nineSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  nineSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  scoreTable: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  scoreRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  scoreHeaderCell: {
    flex: 1,
    padding: 8,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
    backgroundColor: '#f9fafb',
    minWidth: 30,
  },
  scoreCell: {
    flex: 1,
    padding: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    minWidth: 30,
  },
});