import { create } from 'zustand';

interface GolfBall {
  id: string;
  name: string;
  batteryLevel: number;
  signalStrength: number;
  distance: number;
  isConnected: boolean;
  location: { latitude: number; longitude: number };
  lastUpdated: number;
}

interface BLEState {
  connectedBalls: GolfBall[];
  isScanning: boolean;
  isBluetoothEnabled: boolean;
  
  // Actions
  addBall: (ball: GolfBall) => void;
  removeBall: (ballId: string) => void;
  updateBallLocation: (ballId: string, location: { latitude: number; longitude: number }) => void;
  updateBallBattery: (ballId: string, batteryLevel: number) => void;
  setScanning: (isScanning: boolean) => void;
  setBluetoothEnabled: (enabled: boolean) => void;
}

export const useBLEStore = create<BLEState>((set, get) => ({
  connectedBalls: [
    // Mock connected balls for demonstration
    {
      id: 'ball_1',
      name: 'Pro Golf Ball #1',
      batteryLevel: 85,
      signalStrength: -45,
      distance: 15,
      isConnected: true,
      location: { latitude: 37.7749 + 0.001, longitude: -122.4194 + 0.001 },
      lastUpdated: Date.now(),
    },
    {
      id: 'ball_2',
      name: 'Golf Ball #2',
      batteryLevel: 72,
      signalStrength: -55,
      distance: 28,
      isConnected: true,
      location: { latitude: 37.7749 - 0.0015, longitude: -122.4194 + 0.002 },
      lastUpdated: Date.now(),
    },
  ],
  isScanning: false,
  isBluetoothEnabled: true,

  addBall: (ball: GolfBall) => {
    set((state) => ({
      connectedBalls: [...state.connectedBalls, ball]
    }));
  },

  removeBall: (ballId: string) => {
    set((state) => ({
      connectedBalls: state.connectedBalls.filter(ball => ball.id !== ballId)
    }));
  },

  updateBallLocation: (ballId: string, location: { latitude: number; longitude: number }) => {
    set((state) => ({
      connectedBalls: state.connectedBalls.map(ball =>
        ball.id === ballId 
          ? { ...ball, location, lastUpdated: Date.now() }
          : ball
      )
    }));
  },

  updateBallBattery: (ballId: string, batteryLevel: number) => {
    set((state) => ({
      connectedBalls: state.connectedBalls.map(ball =>
        ball.id === ballId 
          ? { ...ball, batteryLevel, lastUpdated: Date.now() }
          : ball
      )
    }));
  },

  setScanning: (isScanning: boolean) => {
    set({ isScanning });
  },

  setBluetoothEnabled: (enabled: boolean) => {
    set({ isBluetoothEnabled: enabled });
  },
}));