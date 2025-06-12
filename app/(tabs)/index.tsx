import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Navigation, Ruler, Zap } from 'lucide-react-native';
import { useGameStore } from '@/stores/gameStore';
import { useBLEStore } from '@/stores/bleStore';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withRepeat,
  withSequence
} from 'react-native-reanimated';

interface BallLocation {
  id: string;
  coordinate: { latitude: number; longitude: number };
  timestamp: number;
  distance?: number;
}

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [selectedBall, setSelectedBall] = useState<string | null>(null);
  const [measureMode, setMeasureMode] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<{ latitude: number; longitude: number }[]>([]);
  const [totalDistance, setTotalDistance] = useState(0);
  
  const mapRef = useRef<MapView>(null);
  const pulseAnimation = useSharedValue(1);
  
  const { currentHole, course } = useGameStore();
  const { connectedBalls, isScanning } = useBLEStore();

  // Animation for ball markers
  useEffect(() => {
    pulseAnimation.value = withRepeat(
      withSequence(
        withSpring(1.2, { duration: 1000 }),
        withSpring(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnimation.value }],
  }));

  useEffect(() => {
    getLocationAsync();
  }, []);

  const getLocationAsync = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to track your golf balls.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });
      
      setLocation(location);
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  const handleMapPress = (event: any) => {
    if (measureMode) {
      const coordinate = event.nativeEvent.coordinate;
      const newPoints = [...measurePoints, coordinate];
      setMeasurePoints(newPoints);
      
      if (newPoints.length > 1) {
        let distance = 0;
        for (let i = 1; i < newPoints.length; i++) {
          distance += calculateDistance(
            newPoints[i-1].latitude,
            newPoints[i-1].longitude,
            newPoints[i].latitude,
            newPoints[i].longitude
          );
        }
        setTotalDistance(distance);
      }
    }
  };

  const clearMeasurements = () => {
    setMeasurePoints([]);
    setTotalDistance(0);
  };

  const toggleMeasureMode = () => {
    setMeasureMode(!measureMode);
    if (measureMode) {
      clearMeasurements();
    }
  };

  const navigateToBall = (ballId: string) => {
    const ball = connectedBalls.find(b => b.id === ballId);
    if (ball && location) {
      setSelectedBall(ballId);
      
      // Center map on the route between player and ball
      const coordinates = [
        location.coords,
        ball.location
      ];
      
      mapRef.current?.fitToCoordinates(coordinates, {
        edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
        animated: true,
      });
    }
  };

  const mockHoleLocation = location ? {
    latitude: location.coords.latitude + 0.002,
    longitude: location.coords.longitude + 0.002,
  } : null;

  if (!location) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.View style={[animatedStyle]}>
          <MapPin size={48} color="#22C55E" />
        </Animated.View>
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onPress={handleMapPress}
        showsUserLocation={true}
        showsMyLocationButton={false}
        followsUserLocation={false}
      >
        {/* Golf hole marker */}
        {mockHoleLocation && (
          <Marker
            coordinate={mockHoleLocation}
            title={`Hole ${currentHole}`}
            description="Current target hole"
          >
            <View style={styles.holeMarker}>
              <Text style={styles.holeNumber}>{currentHole}</Text>
            </View>
          </Marker>
        )}

        {/* Golf ball markers */}
        {connectedBalls.map((ball) => {
          const distance = location ? calculateDistance(
            location.coords.latitude,
            location.coords.longitude,
            ball.location.latitude,
            ball.location.longitude
          ) : 0;

          return (
            <Marker
              key={ball.id}
              coordinate={ball.location}
              title={ball.name}
              description={`Distance: ${distance.toFixed(0)}m`}
              onPress={() => navigateToBall(ball.id)}
            >
              <Animated.View style={[animatedStyle]}>
                <View style={[
                  styles.ballMarker,
                  selectedBall === ball.id && styles.selectedBallMarker
                ]}>
                  <View style={styles.ballIcon} />
                </View>
              </Animated.View>
            </Marker>
          );
        })}

        {/* Route to selected ball */}
        {selectedBall && location && (
          <Polyline
            coordinates={[
              location.coords,
              connectedBalls.find(b => b.id === selectedBall)?.location!
            ]}
            strokeColor="#3B82F6"
            strokeWidth={3}
            lineDashPattern={[5, 5]}
          />
        )}

        {/* Measurement points and lines */}
        {measurePoints.map((point, index) => (
          <Marker
            key={`measure-${index}`}
            coordinate={point}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.measurePoint}>
              <Text style={styles.measurePointText}>{index + 1}</Text>
            </View>
          </Marker>
        ))}

        {measurePoints.length > 1 && (
          <Polyline
            coordinates={measurePoints}
            strokeColor="#F59E0B"
            strokeWidth={2}
            lineDashPattern={[10, 10]}
          />
        )}
      </MapView>

      {/* Header */}
      <LinearGradient
        colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.8)']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>JackTrack</Text>
            <Text style={styles.headerSubtitle}>Hole {currentHole} • {connectedBalls.length} balls paired</Text>
          </View>
          <View style={styles.connectionStatus}>
            {isScanning && <Animated.View style={[animatedStyle]}>
              <Zap size={20} color="#F59E0B" />
            </Animated.View>}
          </View>
        </View>
      </LinearGradient>

      {/* Control buttons */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, measureMode && styles.activeControlButton]}
          onPress={toggleMeasureMode}
        >
          <Ruler size={20} color={measureMode ? "#ffffff" : "#22C55E"} />
          <Text style={[styles.controlButtonText, measureMode && styles.activeControlButtonText]}>
            Measure
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => mapRef.current?.animateToRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          })}
        >
          <Navigation size={20} color="#22C55E" />
          <Text style={styles.controlButtonText}>Center</Text>
        </TouchableOpacity>
      </View>

      {/* Measurement display */}
      {measureMode && measurePoints.length > 0 && (
        <View style={styles.measureDisplay}>
          <Text style={styles.measureTitle}>
            {measurePoints.length === 1 ? 'Tap to add another point' : `Total Distance: ${totalDistance.toFixed(0)}m`}
          </Text>
          {measurePoints.length > 1 && (
            <TouchableOpacity style={styles.clearButton} onPress={clearMeasurements}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Ball list */}
      {connectedBalls.length > 0 && (
        <View style={styles.ballList}>
          {connectedBalls.map((ball) => {
            const distance = calculateDistance(
              location.coords.latitude,
              location.coords.longitude,
              ball.location.latitude,
              ball.location.longitude
            );

            return (
              <TouchableOpacity
                key={ball.id}
                style={[
                  styles.ballItem,
                  selectedBall === ball.id && styles.selectedBallItem
                ]}
                onPress={() => navigateToBall(ball.id)}
              >
                <View style={styles.ballInfo}>
                  <Text style={styles.ballName}>{ball.name}</Text>
                  <Text style={styles.ballDistance}>{distance.toFixed(0)}m away</Text>
                </View>
                <Navigation size={16} color="#6b7280" />
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controls: {
    position: 'absolute',
    top: 140,
    right: 20,
    gap: 12,
  },
  controlButton: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 80,
  },
  activeControlButton: {
    backgroundColor: '#22C55E',
  },
  controlButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#22C55E',
    marginTop: 4,
  },
  activeControlButtonText: {
    color: '#ffffff',
  },
  holeMarker: {
    backgroundColor: '#3B82F6',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  holeNumber: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  ballMarker: {
    backgroundColor: '#22C55E',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  selectedBallMarker: {
    borderColor: '#F59E0B',
    borderWidth: 3,
  },
  ballIcon: {
    backgroundColor: '#ffffff',
    borderRadius: 6,
    width: 12,
    height: 12,
  },
  measurePoint: {
    backgroundColor: '#F59E0B',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  measurePointText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  measureDisplay: {
    position: 'absolute',
    bottom: 200,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(245,158,11,0.95)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  measureTitle: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  clearButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  ballList: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 16,
    maxHeight: 200,
  },
  ballItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
  },
  selectedBallItem: {
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  ballInfo: {
    flex: 1,
  },
  ballName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  ballDistance: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
});