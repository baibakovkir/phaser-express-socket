import React, { useRef, useState, useCallback } from 'react';
import { GameContainer, GameContainerHandle } from './components/GameContainer';
import { HUD } from './components/HUD';
import { Menu } from './components/Menu';
import { HeroSelect } from './components/ChampionSelect';
import { useGameStore } from './store/gameStore';
import { EventBus } from './events/EventBus';

import { BootScene } from './scenes/BootScene';
import { GameScenePhase3 } from './scenes/GameScenePhase3';

type GamePhase = 'menu' | 'heroSelect' | 'playing';

const App: React.FC = () => {
  const gameRef = useRef<GameContainerHandle>(null);
  const [phase, setPhase] = useState<GamePhase>('menu');
  const [matchId, setMatchId] = useState<string>('');
  const [team, setTeam] = useState<'blue' | 'red'>('blue');
  const [selectedHero, setSelectedHero] = useState<string>('');

  const startGame = useGameStore((state) => state.startGame);

  const handleGameStart = useCallback((matchId: string) => {
    console.log('[App] Game started from lobby, matchId:', matchId);
    setMatchId(matchId);
    setTeam(Math.random() > 0.5 ? 'blue' : 'red');
    setPhase('heroSelect');
  }, []);

  const handleHeroComplete = useCallback(() => {
    console.log('[App] Hero locked, starting game scene...');
    
    const game = gameRef.current?.getGame();
    if (game) {
      console.log('[App] Phaser game instance found');
      
      // Stop BootScene if running
      if (game.scene.getScene('BootScene')) {
        game.scene.stop('BootScene');
      }
      
      // Start GameScenePhase3
      console.log('[App] Starting GameScenePhase3...');
      game.scene.start('GameScenePhase3', {
        matchId,
        championId: selectedHero,
        team: team === 'blue' ? 0 : 1,
      });
      
      startGame();
      EventBus.emit('game:started');
      setPhase('playing');
    } else {
      console.error('[App] ERROR: No Phaser game instance!');
    }
  }, [matchId, selectedHero, team, startGame]);

  // Listen for hero selection
  EventBus.on('champion:selected', (data) => {
    setSelectedHero(data.championId);
  });

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-900">
      {/* Phaser Game - Hidden until playing */}
      <div className={`absolute inset-0 ${phase === 'playing' ? 'z-0' : '-z-10'}`}>
        <GameContainer
          ref={gameRef}
          width={1280}
          height={720}
          scene={[BootScene, GameScenePhase3]}
        />
      </div>

      {/* Menu - Full screen overlay */}
      {phase === 'menu' && (
        <div className="absolute inset-0 z-10">
          <Menu onGameStart={handleGameStart} />
        </div>
      )}

      {/* Hero Select - Full screen overlay */}
      {phase === 'heroSelect' && (
        <div className="absolute inset-0 z-10">
          <HeroSelect matchId={matchId} team={team} onComplete={handleHeroComplete} />
        </div>
      )}

      {/* HUD - Only when playing */}
      {phase === 'playing' && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          <HUD />
        </div>
      )}
    </div>
  );
};

export default App;
