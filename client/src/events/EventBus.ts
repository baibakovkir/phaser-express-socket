import { Events } from 'phaser';

export interface GameEvents {
  'player:hp': (hp: number, maxHp: number) => void;
  'player:mana': (mana: number, maxMana: number) => void;
  'player:position': (x: number, y: number) => void;
  'player:level': (level: number, xp: number, xpToNext: number) => void;
  'combat:damage': (targetId: string, damage: number, isCritical: boolean) => void;
  'combat:skillshot': (skillshotId: string, casterId: string, position: { x: number; y: number }) => void;
  'combat:ability-used': (abilityName: string, cooldown: number) => void;
  'game:started': () => void;
  'game:paused': () => void;
  'game:resumed': () => void;
  'game:over': (winner: string | null) => void;
  'ui:ability-cast': (abilityName: string, targetPosition?: { x: number; y: number }) => void;
  'ui:move-command': (x: number, y: number) => void;
  'loader:progress': (current: number, total: number, percent: number) => void;
  'loader:filecomplete': (key: string, type: string, file: { key: string }) => void;
  'loader:complete': () => void;
  'champion:selected': (data: { matchId: string; championId: string; team: 'blue' | 'red' }) => void;
}

class EventBusSingleton {
  private static instance: EventBusSingleton;
  private emitter: Events.EventEmitter;

  private constructor() {
    this.emitter = new Events.EventEmitter();
  }

  public static getInstance(): EventBusSingleton {
    if (!EventBusSingleton.instance) {
      EventBusSingleton.instance = new EventBusSingleton();
    }
    return EventBusSingleton.instance;
  }

  public emit<K extends keyof GameEvents>(event: K, ...args: Parameters<GameEvents[K]>): void {
    this.emitter.emit(event, ...args);
  }

  public on<K extends keyof GameEvents>(event: K, listener: GameEvents[K]): void {
    this.emitter.on(event, listener);
  }

  public off<K extends keyof GameEvents>(event: K, listener?: GameEvents[K]): void {
    if (listener) {
      this.emitter.off(event, listener);
    } else {
      this.emitter.removeAllListeners(event);
    }
  }

  public removeAllListeners(): void {
    this.emitter.removeAllListeners();
  }

  public getEmitter(): Events.EventEmitter {
    return this.emitter;
  }
}

export const EventBus = EventBusSingleton.getInstance();
