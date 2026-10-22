export interface MapPoint { x: number; y: number }
export declare const MAP_WIDTH: number;
export declare const MAP_HEIGHT: number;
export declare const TICKS_PER_SECOND: number;
export declare const LANE_WAVE_TICKS: number;
export declare const JUNGLE_SPAWN_TICKS: number;
export declare const BOSS_SPAWN_TICKS: number;
export declare const BASES: Record<1 | 2, MapPoint>;
export declare const LANES: { id: 1 | 2; name: string; points: MapPoint[] }[];
export declare const CAMPS: { id: number; x: number; y: number }[];
export declare const SHRINES: MapPoint[];
export declare const BOSS: MapPoint;
export declare function nextSpawnSecond(tick: number, intervalTicks: number): number;
