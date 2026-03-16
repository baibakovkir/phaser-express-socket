import Phaser from 'phaser';
import { EventBus } from '../events/EventBus';

/**
 * BootScene - Initial loading scene with progress reporting
 *
 * Emits loading progress events to EventBus for React LoadingScreen
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(w / 2 - 160, h / 2 - 15, 320, 30);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x00ff88, 1);
      progressBar.fillRect(w / 2 - 155, h / 2 - 10, 310 * value, 20);
      EventBus.emit('loader:progress', value * 100, 100, value * 100);
    });

    this.load.on('filecomplete', (key: string, type: string, data: unknown) => {
      EventBus.emit('loader:filecomplete', key, type, { key });
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      EventBus.emit('loader:complete');
    });

    this.createPlaceholderTextures();
  }

  create() {
    // Don't start any scene - React controls the flow
    console.log('[BootScene] Assets loaded, waiting for React to start game...');
  }

  private createPlaceholderTextures() {
    const heroGraphics = this.make.graphics({ x: 0, y: 0 });
    heroGraphics.fillStyle(0x00ff88);
    heroGraphics.fillCircle(16, 16, 16);
    heroGraphics.generateTexture('hero', 32, 32);
    heroGraphics.destroy();

    const enemyGraphics = this.make.graphics({ x: 0, y: 0 });
    enemyGraphics.fillStyle(0xff4444);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    const minionGraphics = this.make.graphics({ x: 0, y: 0 });
    minionGraphics.fillStyle(0xffaa00);
    minionGraphics.fillCircle(8, 8, 8);
    minionGraphics.generateTexture('minion', 16, 16);
    minionGraphics.destroy();

    const towerGraphics = this.make.graphics({ x: 0, y: 0 });
    towerGraphics.fillStyle(0x8888ff);
    towerGraphics.fillRect(0, 0, 32, 32);
    towerGraphics.generateTexture('tower', 32, 32);
    towerGraphics.destroy();

    const projectileGraphics = this.make.graphics({ x: 0, y: 0 });
    projectileGraphics.fillStyle(0x00ffff);
    projectileGraphics.fillCircle(10, 10, 10);
    projectileGraphics.generateTexture('skillshot', 20, 20);
    projectileGraphics.destroy();
  }
}
