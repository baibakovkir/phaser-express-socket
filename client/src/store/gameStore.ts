import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface PlayerState {
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  level: number;
  xp: number;
  xpToNext: number;
  position: { x: number; y: number };
}

export interface CooldownState {
  abilityName: string;
  cooldownRemaining: number;
  cooldownTotal: number;
}

export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  winner: string | null;
  abilities: Record<string, { level: number; unlocked: boolean }>;
  cooldowns: CooldownState[];
}

interface GameStore extends PlayerState, GameState {
  setHp: (hp: number) => void;
  setMaxHp: (maxHp: number) => void;
  setMana: (mana: number) => void;
  setMaxMana: (maxMana: number) => void;
  setLevel: (level: number, xp: number, xpToNext: number) => void;
  setPosition: (x: number, y: number) => void;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: (winner: string | null) => void;
  setAbilityLevel: (abilityName: string, level: number) => void;
  unlockAbility: (abilityName: string) => void;
  setCooldown: (abilityName: string, cooldown: number, total: number) => void;
  updateCooldowns: (delta: number) => void;
  reset: () => void;
}

const initialPlayerState: PlayerState = {
  hp: 100, maxHp: 100, mana: 50, maxMana: 50, level: 1, xp: 0, xpToNext: 100, position: { x: 0, y: 0 },
};

const initialGameState: GameState = {
  isPlaying: false, isPaused: false, winner: null, abilities: {}, cooldowns: [],
};

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set) => ({
    ...initialPlayerState,
    ...initialGameState,
    setHp: (hp) => set({ hp }),
    setMaxHp: (maxHp) => set({ maxHp }),
    setMana: (mana) => set({ mana }),
    setMaxMana: (maxMana) => set({ maxMana }),
    setLevel: (level, xp, xpToNext) => set({ level, xp, xpToNext }),
    setPosition: (x, y) => set({ position: { x, y } }),
    startGame: () => set({ isPlaying: true, isPaused: false, winner: null }),
    pauseGame: () => set({ isPaused: true }),
    resumeGame: () => set({ isPaused: false }),
    endGame: (winner) => set({ isPlaying: false, winner }),
    setAbilityLevel: (abilityName, level) =>
      set((state) => ({
        abilities: { ...state.abilities, [abilityName]: { ...state.abilities[abilityName], level } },
      })),
    unlockAbility: (abilityName) =>
      set((state) => ({
        abilities: { ...state.abilities, [abilityName]: { level: 1, unlocked: true } },
      })),
    setCooldown: (abilityName, cooldown, total) =>
      set((state) => {
        const exists = state.cooldowns.find((c) => c.abilityName === abilityName);
        if (exists) {
          return { cooldowns: state.cooldowns.map((c) => c.abilityName === abilityName ? { ...c, cooldownRemaining: cooldown } : c) };
        }
        return { cooldowns: [...state.cooldowns, { abilityName, cooldownRemaining: cooldown, cooldownTotal: total }] };
      }),
    updateCooldowns: (delta) =>
      set((state) => ({
        cooldowns: state.cooldowns
          .map((c) => ({ ...c, cooldownRemaining: Math.max(0, c.cooldownRemaining - delta) }))
          .filter((c) => c.cooldownRemaining > 0),
      })),
    reset: () => set({ ...initialPlayerState, ...initialGameState }),
  }))
);

export const selectHp = (state: GameStore) => ({ hp: state.hp, maxHp: state.maxHp });
export const selectMana = (state: GameStore) => ({ mana: state.mana, maxMana: state.maxMana });
export const selectCooldowns = (state: GameStore) => state.cooldowns;
