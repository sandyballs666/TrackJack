import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Trophy, TrendingUp, MapPin, Clock, Target } from 'lucide-react-native';

interface GameHistory {
  id: string;
  course: string;
  date: string;
  score: number;
  par: number;
  duration: string;
  weather: string;
  bestHole: number;
  worstHole: number;
}

interface Statistics {
  totalRounds: number;
  averageScore: number;
  bestRound: number;
  handicap: number;
  improvementTrend: number;
}

export default function HistoryScreen() {
  const [selectedTab, setSelectedTab] = useState<'recent' | 'stats'>('recent');

  // Mock data - in real app this would come from storage/database
  const gameHistory: GameHistory[] = [
    {
      id: '1',
      course: 'Pebble Beach Golf Links',
      date: '2024-01-15',
      score: 78,
      par: 72,
      duration: '4h 15m',
      weather: 'Sunny',
      bestHole: 3,
      worstHole: 12,
    },
    {
      id: '2',
      course: 'Augusta National',
      date: '2024-01-10',
      score: 82,
      par: 72,
      duration: '4h 30m',
      weather: 'Cloudy',
      bestHole: 7,
      worstHole: 15,
    },
    {
      id: '3',
      course: 'St Andrews Old Course',
      date: '2024-01-05',
      score: 85,
      par: 72,
      duration: '4h 45m',
      weather: 'Windy',
      bestHole: 1,
      worstHole: 17,
    },
    {
      id: '4',
      course: 'Torrey Pines',
      date: '2023-12-28',
      score: 79,
      par: 72,
      duration: '4h 20m',
      weather: 'Sunny',
      bestHole: 14,
      worstHole: 8,
    },
    {
      id: '5',
      course: 'Whistling Straits',
      date: '2023-12-20',
      score: 88,
      par: 72,
      duration: '5h 10m',
      weather: 'Rainy',
      bestHole: 5,
      worstHole: 11,
    },
  ];

  const statistics: Statistics = {
    totalRounds: gameHistory.length,
    averageScore: Math.round(gameHistory.reduce((sum, game) => sum + game.score, 0) / gameHistory.length),
    bestRound: Math.min(...gameHistory.map(game => game.score)),
    handicap: 12.4,
    improvementTrend: -2.3, // Negative means improvement
  };

  const getScoreColor = (score: number, par: number) => {
    const diff = score - par;
    if (diff <= 0) return '#22C55E';
    if (diff <= 5) return '#F59E0B';
    return '#EF4444';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderGameItem = ({ item }: { item: GameHistory }) => (
    <View style={styles.gameCard}>
      <LinearGradient
        colors={['#ffffff', '#f8fafc']}
        style={styles.gameCardGradient}
      >
        <View style={styles.gameHeader}>
          <View style={styles.gameInfo}>
            <Text style={styles.courseName}>{item.course}</Text>
            <View style={styles.gameDetails}>
              <Calendar size={14} color="#6b7280" />
              <Text style={styles.gameDate}>{formatDate(item.date)}</Text>
            </View>
          </View>
          
          <View style={styles.scoreContainer}>
            <Text style={[
              styles.gameScore,
              { color: getScoreColor(item.score, item.par) }
            ]}>
              {item.score}
            </Text>
            <Text style={styles.scoreDiff}>
              {item.score - item.par > 0 ? '+' : ''}{item.score - item.par}
            </Text>
          </View>
        </View>

        <View style={styles.gameStats}>
          <View style={styles.statItem}>
            <Clock size={16} color="#6b7280" />
            <Text style={styles.statText}>{item.duration}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Target size={16} color="#22C55E" />
            <Text style={styles.statText}>Best: #{item.bestHole}</Text>
          </View>
          
          <View style={styles.statItem}>
            <MapPin size={16} color="#6b7280" />
            <Text style={styles.statText}>{item.weather}</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#8B5CF6', '#7C3AED']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Game History</Text>
        <Text style={styles.headerSubtitle}>
          Track your progress and performance
        </Text>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'recent' && styles.activeTab]}
          onPress={() => setSelectedTab('recent')}
        >
          <Text style={[styles.tabText, selectedTab === 'recent' && styles.activeTabText]}>
            Recent Games
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'stats' && styles.activeTab]}
          onPress={() => setSelectedTab('stats')}
        >
          <Text style={[styles.tabText, selectedTab === 'stats' && styles.activeTabText]}>
            Statistics
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === 'recent' ? (
          <View style={styles.recentGames}>
            <FlatList
              data={gameHistory}
              renderItem={renderGameItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        ) : (
          <View style={styles.statisticsContainer}>
            {/* Overview Stats */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <LinearGradient
                  colors={['#ffffff', '#f0fdf4']}
                  style={styles.statCardGradient}
                >
                  <Trophy size={32} color="#22C55E" />
                  <Text style={styles.statValue}>{statistics.bestRound}</Text>
                  <Text style={styles.statLabel}>Best Round</Text>
                </LinearGradient>
              </View>

              <View style={styles.statCard}>
                <LinearGradient
                  colors={['#ffffff', '#eff6ff']}
                  style={styles.statCardGradient}
                >
                  <Target size={32} color="#3B82F6" />
                  <Text style={styles.statValue}>{statistics.averageScore}</Text>
                  <Text style={styles.statLabel}>Average Score</Text>
                </LinearGradient>
              </View>

              <View style={styles.statCard}>
                <LinearGradient
                  colors={['#ffffff', '#fefce8']}
                  style={styles.statCardGradient}
                >
                  <Calendar size={32} color="#F59E0B" />
                  <Text style={styles.statValue}>{statistics.totalRounds}</Text>
                  <Text style={styles.statLabel}>Total Rounds</Text>
                </LinearGradient>
              </View>

              <View style={styles.statCard}>
                <LinearGradient
                  colors={['#ffffff', '#f5f3ff']}
                  style={styles.statCardGradient}
                >
                  <TrendingUp size={32} color="#8B5CF6" />
                  <Text style={styles.statValue}>{statistics.handicap}</Text>
                  <Text style={styles.statLabel}>Handicap</Text>
                </LinearGradient>
              </View>
            </View>

            {/* Performance Trends */}
            <View style={styles.trendsSection}>
              <Text style={styles.sectionTitle}>Performance Trends</Text>
              
              <View style={styles.trendCard}>
                <View style={styles.trendHeader}>
                  <Text style={styles.trendTitle}>Score Improvement</Text>
                  <View style={[
                    styles.trendBadge,
                    { backgroundColor: statistics.improvementTrend < 0 ? '#dcfce7' : '#fef2f2' }
                  ]}>
                    <TrendingUp 
                      size={16} 
                      color={statistics.improvementTrend < 0 ? '#22C55E' : '#EF4444'} 
                    />
                    <Text style={[
                      styles.trendValue,
                      { color: statistics.improvementTrend < 0 ? '#22C55E' : '#EF4444' }
                    ]}>
                      {Math.abs(statistics.improvementTrend)} strokes
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.trendDescription}>
                  {statistics.improvementTrend < 0 
                    ? "You're improving! Keep up the great work." 
                    : "Focus on consistency to improve your average score."}
                </Text>
              </View>
            </View>

            {/* Course Performance */}
            <View style={styles.courseSection}>
              <Text style={styles.sectionTitle}>Course Performance</Text>
              
              {gameHistory.slice(0, 3).map((game) => (
                <View key={game.id} style={styles.coursePerformanceItem}>
                  <View style={styles.courseInfo}>
                    <Text style={styles.coursePerformanceName}>{game.course}</Text>
                    <Text style={styles.coursePerformanceDate}>{formatDate(game.date)}</Text>
                  </View>
                  
                  <View style={styles.coursePerformanceScore}>
                    <Text style={[
                      styles.courseScoreValue,
                      { color: getScoreColor(game.score, game.par) }
                    ]}>
                      {game.score}
                    </Text>
                    <Text style={styles.courseScorePar}>Par {game.par}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#8B5CF6',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  recentGames: {
    paddingBottom: 40,
  },
  gameCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  gameCardGradient: {
    padding: 20,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  gameInfo: {
    flex: 1,
  },
  courseName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  gameDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gameDate: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 6,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  gameScore: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  scoreDiff: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  gameStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statText: {
    fontSize: 12,
    color: '#374151',
    marginLeft: 6,
    fontWeight: '500',
  },
  statisticsContainer: {
    paddingBottom: 40,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statCardGradient: {
    padding: 20,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  trendsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  trendCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  trendTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  trendValue: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  trendDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  courseSection: {
    marginBottom: 30,
  },
  coursePerformanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  courseInfo: {
    flex: 1,
  },
  coursePerformanceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  coursePerformanceDate: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  coursePerformanceScore: {
    alignItems: 'center',
  },
  courseScoreValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  courseScorePar: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
});