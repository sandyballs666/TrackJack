import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface HoleScore {
  hole: number;
  score: number;
  putts?: number;
  fairwayHit?: boolean;
  greenInRegulation?: boolean;
}

interface Game {
  id: string;
  courseId: string;
  courseName: string;
  date: string;
  scores: HoleScore[];
  isComplete: boolean;
}

interface GameState {
  currentGame: Game | null;
  currentHole: number;
  course: string;
  
  // Actions
  startNewGame: (courseId: string, courseName: string) => void;
  updateHoleScore: (hole: number, score: number) => void;
  addStroke: (hole: number) => void;
  removeStroke: (hole: number) => void;
  setCurrentHole: (hole: number) => void;
  saveGame: () => Promise<void>;
  loadGame: (gameId: string) => Promise<void>;
}

export const useGameStore = create<GameState>((set, get) => ({
  currentGame: null,
  currentHole: 1,
  course: 'Pebble Beach',

  startNewGame: (courseId: string, courseName: string) => {
    const newGame: Game = {
      id: Date.now().toString(),
      courseId,
      courseName,
      date: new Date().toISOString(),
      scores: Array.from({ length: 18 }, (_, i) => ({
        hole: i + 1,
        score: [4, 4, 4, 4, 3, 5, 3, 4, 4, 4, 3, 5, 4, 5, 4, 4, 3, 5][i], // Default par scores
      })),
      isComplete: false,
    };
    
    set({ 
      currentGame: newGame, 
      currentHole: 1,
      course: courseName 
    });
  },

  updateHoleScore: (hole: number, score: number) => {
    const { currentGame } = get();
    if (!currentGame) return;

    const updatedScores = currentGame.scores.map(s =>
      s.hole === hole ? { ...s, score } : s
    );

    set({
      currentGame: { ...currentGame, scores: updatedScores }
    });
  },

  addStroke: (hole: number) => {
    const { currentGame, updateHoleScore } = get();
    if (!currentGame) return;

    const currentScore = currentGame.scores.find(s => s.hole === hole)?.score || 0;
    updateHoleScore(hole, currentScore + 1);
  },

  removeStroke: (hole: number) => {
    const { currentGame, updateHoleScore } = get();
    if (!currentGame) return;

    const currentScore = currentGame.scores.find(s => s.hole === hole)?.score || 0;
    if (currentScore > 1) {
      updateHoleScore(hole, currentScore - 1);
    }
  },

  setCurrentHole: (hole: number) => {
    set({ currentHole: hole });
  },

  saveGame: async () => {
    const { currentGame } = get();
    if (!currentGame) return;

    try {
      const gameData = JSON.stringify(currentGame);
      await AsyncStorage.setItem(`game_${currentGame.id}`, gameData);
      
      // Save to games list
      const existingGames = await AsyncStorage.getItem('games');
      const gamesList = existingGames ? JSON.parse(existingGames) : [];
      
      const gameIndex = gamesList.findIndex((g: Game) => g.id === currentGame.id);
      if (gameIndex >= 0) {
        gamesList[gameIndex] = currentGame;
      } else {
        gamesList.push(currentGame);
      }
      
      await AsyncStorage.setItem('games', JSON.stringify(gamesList));
    } catch (error) {
      console.error('Error saving game:', error);
    }
  },

  loadGame: async (gameId: string) => {
    try {
      const gameData = await AsyncStorage.getItem(`game_${gameId}`);
      if (gameData) {
        const game: Game = JSON.parse(gameData);
        set({ 
          currentGame: game,
          course: game.courseName,
          currentHole: 1 
        });
      }
    } catch (error) {
      console.error('Error loading game:', error);
    }
  },
}));

// Initialize with a default game
useGameStore.getState().startNewGame('pebble-beach', 'Pebble Beach');