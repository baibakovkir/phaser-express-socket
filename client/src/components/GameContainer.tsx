import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Game, Types } from 'phaser';
import { EventBus } from '../events/EventBus';

export interface PhaserConfig extends Omit<Types.Core.GameConfig, 'width' | 'height' | 'parent'> {
  width?: number | string;
  height?: number | string;
  config?: Types.Core.GameConfig;
  onReady?: () => void;
}

export interface GameContainerHandle {
  getGame: () => Game | null;
  pause: () => void;
  resume: () => void;
  restart: () => void;
  emitToPhaser: <K extends keyof import('../events/EventBus').GameEvents>(
    event: K,
    ...args: Parameters<import('../events/EventBus').GameEvents[K]>
  ) => void;
}

const DEFAULT_WIDTH = 1920;
const DEFAULT_HEIGHT = 1080;

export const GameContainer = forwardRef<GameContainerHandle, PhaserConfig>(
  function GameContainer({ width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT, config, onReady, ...restConfig }, ref) {
    const gameRef = useRef<Game | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const gameWidth = typeof width === 'string' ? parseInt(width, 10) : width;
    const gameHeight = typeof height === 'string' ? parseInt(height, 10) : height;
    // Phaser configuration is fixed for the lifetime of this mounted container.
    const initialSettings = useRef({ gameWidth, gameHeight, config, onReady, restConfig });

    useEffect(() => {
      if (!containerRef.current) return;
      const settings = initialSettings.current;

      const gameConfig: Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: settings.gameWidth,
        height: settings.gameHeight,
        parent: containerRef.current,
        backgroundColor: '#1a1a2e',
        physics: {
          default: 'arcade',
          arcade: { debug: false },
        },
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        ...settings.restConfig,
        ...settings.config,
      };

      gameRef.current = new Game(gameConfig);

      // Call onReady callback
      settings.onReady?.();

      return () => {
        if (gameRef.current) {
          gameRef.current.destroy(true);
          gameRef.current = null;
        }
      };
    }, []);

    useImperativeHandle(ref, () => ({
      getGame: () => gameRef.current,
      pause: () => {
        gameRef.current?.scene.scenes.forEach((scene) => scene.scene.pause());
        EventBus.emit('game:paused');
      },
      resume: () => {
        gameRef.current?.scene.scenes.forEach((scene) => scene.scene.resume());
        EventBus.emit('game:resumed');
      },
      restart: () => {
        gameRef.current?.scene.scenes.forEach((scene) => scene.scene.restart());
      },
      emitToPhaser: (event, ...args) => EventBus.emit(event, ...args),
    }), []);

    return <div ref={containerRef} className="w-full h-full flex items-center justify-center" />;
  }
);

GameContainer.displayName = 'GameContainer';
export default GameContainer;
