import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bluetooth, Plus, Trash2, Battery, Signal, MapPin } from 'lucide-react-native';
import { useBLEStore } from '@/stores/bleStore';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated';

interface GolfBall {
  id: string;
  name: string;
  batteryLevel: number;
  signalStrength: number;
  distance: number;
  isConnected: boolean;
  location?: { latitude: number; longitude: number };
}

export default function TrackingScreen() {
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<GolfBall[]>([]);
  
  const scanAnimation = useSharedValue(0);
  const { connectedBalls, addBall, removeBall } = useBLEStore();

  // Animation for scanning indicator
  useEffect(() => {
    if (isScanning) {
      scanAnimation.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000 }),
          withTiming(0, { duration: 1000 })
        ),
        -1,
        true
      );
    } else {
      scanAnimation.value = withTiming(0, { duration: 300 });
    }
  }, [isScanning]);

  const animatedScanStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + scanAnimation.value * 0.7,
    transform: [{ scale: 0.8 + scanAnimation.value * 0.4 }],
  }));

  // Mock BLE scanning function
  const startScanning = async () => {
    if (Platform.OS === 'web') {
      // Mock scanning for web platform
      setIsScanning(true);
      
      setTimeout(() => {
        const mockDevices: GolfBall[] = [
          {
            id: '1',
            name: 'Golf Ball #1',
            batteryLevel: 85,
            signalStrength: -45,
            distance: 12,
            isConnected: false,
          },
          {
            id: '2',
            name: 'Golf Ball #2',
            batteryLevel: 65,
            signalStrength: -60,
            distance: 25,
            isConnected: false,
          },
          {
            id: '3',
            name: 'Pro Golf Ball',
            batteryLevel: 92,
            signalStrength: -35,
            distance: 8,
            isConnected: false,
          },
        ];
        
        setDiscoveredDevices(mockDevices);
        setIsScanning(false);
      }, 3000);
    } else {
      // Real BLE scanning would be implemented here
      Alert.alert('BLE Scanning', 'Scanning for golf ball trackers...');
    }
  };

  const connectToBall = async (ball: GolfBall) => {
    try {
      // Mock connection for web platform
      if (Platform.OS === 'web') {
        const connectedBall = {
          ...ball,
          isConnected: true,
          location: {
            latitude: 37.7749 + (Math.random() - 0.5) * 0.01,
            longitude: -122.4194 + (Math.random() - 0.5) * 0.01,
          },
        };
        
        addBall(connectedBall);
        setDiscoveredDevices(prev => prev.filter(d => d.id !== ball.id));
        Alert.alert('Success', `Connected to ${ball.name}`);
      } else {
        // Real BLE connection would be implemented here
        Alert.alert('Connecting', `Attempting to connect to ${ball.name}...`);
      }
    } catch (error) {
      Alert.alert('Connection Failed', 'Could not connect to the golf ball tracker.');
    }
  };

  const disconnectBall = (ballId: string) => {
    Alert.alert(
      'Disconnect Ball',
      'Are you sure you want to disconnect this golf ball tracker?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Disconnect', 
          style: 'destructive',
          onPress: () => removeBall(ballId)
        },
      ]
    );
  };

  const getSignalStrengthColor = (strength: number) => {
    if (strength > -40) return '#22C55E'; // Strong
    if (strength > -60) return '#F59E0B'; // Medium  
    return '#EF4444'; // Weak
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return '#22C55E';
    if (level > 20) return '#F59E0B';
    return '#EF4444';
  };

  const renderConnectedBall = ({ item }: { item: GolfBall }) => (
    <View style={styles.ballCard}>
      <LinearGradient
        colors={['#ffffff', '#f9fafb']}
        style={styles.ballCardGradient}
      >
        <View style={styles.ballHeader}>
          <View style={styles.ballInfo}>
            <Text style={styles.ballName}>{item.name}</Text>
            <Text style={styles.ballStatus}>Connected • {item.distance}m away</Text>
          </View>
          <TouchableOpacity
            style={styles.disconnectButton}
            onPress={() => disconnectBall(item.id)}
          >
            <Trash2 size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.ballMetrics}>
          <View style={styles.metric}>
            <Battery size={16} color={getBatteryColor(item.batteryLevel)} />
            <Text style={styles.metricText}>{item.batteryLevel}%</Text>
          </View>
          
          <View style={styles.metric}>
            <Signal size={16} color={getSignalStrengthColor(item.signalStrength)} />
            <Text style={styles.metricText}>{item.signalStrength} dBm</Text>
          </View>
          
          <View style={styles.metric}>
            <MapPin size={16} color="#6b7280" />
            <Text style={styles.metricText}>GPS Active</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const renderDiscoveredDevice = ({ item }: { item: GolfBall }) => (
    <View style={styles.deviceCard}>
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName}>{item.name}</Text>
        <Text style={styles.deviceDistance}>{item.distance}m • {item.signalStrength} dBm</Text>
      </View>
      
      <TouchableOpacity
        style={styles.connectButton}
        onPress={() => connectToBall(item)}
      >
        <Plus size={18} color="#ffffff" />
        <Text style={styles.connectButtonText}>Connect</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#22C55E', '#16A34A']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Ball Tracking</Text>
        <Text style={styles.headerSubtitle}>
          {connectedBalls.length} balls connected
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* Connected Balls Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connected Golf Balls</Text>
          
          {connectedBalls.length === 0 ? (
            <View style={styles.emptyState}>
              <Bluetooth size={48} color="#d1d5db" />
              <Text style={styles.emptyStateText}>No golf balls connected</Text>
              <Text style={styles.emptyStateSubtext}>
                Scan for nearby golf ball trackers to get started
              </Text>
            </View>
          ) : (
            <FlatList
              data={connectedBalls}
              renderItem={renderConnectedBall}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {/* Scan Button */}
        <View style={styles.scanSection}>
          <TouchableOpacity
            style={[styles.scanButton, isScanning && styles.scanningButton]}
            onPress={startScanning}
            disabled={isScanning}
          >
            <Animated.View style={[styles.scanButtonContent, animatedScanStyle]}>
              <Bluetooth size={24} color="#ffffff" />
              <Text style={styles.scanButtonText}>
                {isScanning ? 'Scanning...' : 'Scan for Golf Balls'}
              </Text>
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Discovered Devices */}
        {discoveredDevices.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Discovered Devices</Text>
            <FlatList
              data={discoveredDevices}
              renderItem={renderDiscoveredDevice}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}
      </View>
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
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  ballCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  ballCardGradient: {
    padding: 20,
  },
  ballHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  ballInfo: {
    flex: 1,
  },
  ballName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  ballStatus: {
    fontSize: 14,
    color: '#22C55E',
    marginTop: 4,
    fontWeight: '500',
  },
  disconnectButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
  },
  ballMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  metricText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 6,
  },
  scanSection: {
    marginBottom: 30,
  },
  scanButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  scanningButton: {
    backgroundColor: '#6B7280',
  },
  scanButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 12,
  },
  deviceCard: {
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
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  deviceDistance: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22C55E',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  connectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 6,
  },
});