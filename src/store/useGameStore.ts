import { create } from 'zustand';
import type { GameSessionMeta } from '@shared/types';
import { PLAYER_INITIAL_HP } from '@shared/constants';

interface GameStore extends GameSessionMeta {
  playerHealth: number;
  playerMaxHealth: number;
  setPlayerHealth: (hp: number) => void;
  setPaused: (paused: boolean) => void;
  incrementKill: (reward: number) => void;
  incrementWave: () => void;
  reset: () => void;
}

const initialState: Omit<
  GameStore,
  'setPlayerHealth' | 'setPaused' | 'incrementKill' | 'incrementWave' | 'reset'
> = {
  playerHealth: PLAYER_INITIAL_HP,
  playerMaxHealth: PLAYER_INITIAL_HP,
  waveNumber: 1,
  score: 0,
  killCount: 0,
  isPaused: false,
};

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,

  setPlayerHealth: (hp) => set({ playerHealth: hp }),

  setPaused: (paused) => set({ isPaused: paused }),

  incrementKill: (reward) =>
    set((state) => ({
      killCount: state.killCount + 1,
      score: state.score + reward,
    })),

  incrementWave: () => set((state) => ({ waveNumber: state.waveNumber + 1 })),

  reset: () => set(initialState),
}));
