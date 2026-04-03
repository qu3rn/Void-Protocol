import { create } from 'zustand';
import type { GameSessionMeta, GamePhase, WeaponConfig, SkillSlotState } from '@shared/types';
import { PLAYER_INITIAL_HP } from '@shared/constants';

interface GameStore extends GameSessionMeta {
  // ── Game phase ───────────────────────────────────────────────────────────
  phase           : GamePhase;
  setPhase        : (phase: GamePhase) => void;

  // ── Player ───────────────────────────────────────────────────────────────
  playerHealth    : number;
  playerMaxHealth : number;
  setPlayerHealth : (hp: number) => void;

  // ── Run data ─────────────────────────────────────────────────────────────
  runTimeMs       : number;
  setRunTimeMs    : (ms: number) => void;
  difficulty      : number;
  setDifficulty   : (d: number) => void;

  // ── Weapon / skills ──────────────────────────────────────────────────────
  equippedWeapon  : WeaponConfig | null;
  setEquippedWeapon: (w: WeaponConfig | null) => void;
  skillSlots      : Array<SkillSlotState | null>;
  setSkillSlots   : (slots: Array<SkillSlotState | null>) => void;

  // ── Misc ─────────────────────────────────────────────────────────────────
  setPaused       : (paused: boolean) => void;
  incrementKill   : (reward: number) => void;
  incrementWave   : () => void;
  resetRun        : () => void;
}

const baseState = {
  phase           : 'menu'  as GamePhase,
  playerHealth    : PLAYER_INITIAL_HP,
  playerMaxHealth : PLAYER_INITIAL_HP,
  waveNumber      : 1,
  score           : 0,
  killCount       : 0,
  isPaused        : false,
  runTimeMs       : 0,
  difficulty      : 1.0,
  equippedWeapon  : null as WeaponConfig | null,
  skillSlots      : [null, null, null] as Array<SkillSlotState | null>,
};

export const useGameStore = create<GameStore>((set) => ({
  ...baseState,

  setPhase       : (phase) => set({ phase, isPaused: phase === 'paused' }),
  setPlayerHealth: (hp) => set({ playerHealth: hp }),
  setRunTimeMs   : (ms) => set({ runTimeMs: ms }),
  setDifficulty  : (d) => set({ difficulty: d }),

  setEquippedWeapon: (w) => set({ equippedWeapon: w }),
  setSkillSlots    : (slots) => set({ skillSlots: slots }),

  setPaused: (paused) => set({ isPaused: paused }),

  incrementKill: (reward) =>
    set((state) => ({
      killCount: state.killCount + 1,
      score    : state.score + reward,
    })),

  incrementWave: () => set((state) => ({ waveNumber: state.waveNumber + 1 })),

  /** Reset all in-run state (does NOT touch phase – caller sets that). */
  resetRun: () => set({
    playerHealth  : PLAYER_INITIAL_HP,
    playerMaxHealth: PLAYER_INITIAL_HP,
    waveNumber    : 1,
    score         : 0,
    killCount     : 0,
    isPaused      : false,
    runTimeMs     : 0,
    difficulty    : 1.0,
    equippedWeapon: null,
    skillSlots    : [null, null, null],
  }),
}));
