import React, { useRef, useState, useCallback } from 'react';
import { GameContainer, GameContainerHandle } from './components/GameContainer';
import { Menu } from './components/Menu';
import { HeroSelect } from './components/ChampionSelect';
import { MobileControls } from './components/MobileControls';
import { MatchHud } from './components/MatchHud';
import { useGameStore } from './store/gameStore';
import { EventBus } from './events/EventBus';

import { BootScene } from './scenes/BootScene';
import { NetworkGameScene } from './scenes/NetworkGameScene';
import type { MatchFoundData } from './network/socket';
import { network } from './network/socket';

const GAME_SCENES = [BootScene, NetworkGameScene];

type GamePhase = 'menu' | 'heroSelect' | 'playing';

const App: React.FC = () => {
  const touchDevice = typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0;
  const gameRef = useRef<GameContainerHandle>(null);
  const [phase, setPhase] = useState<GamePhase>('menu');
  const [matchId, setMatchId] = useState<string>('');
  const [matchData, setMatchData] = useState<MatchFoundData | null>(null);
  const [team, setTeam] = useState<'blue' | 'red'>('blue');

  const startGame = useGameStore((state) => state.startGame);

  const handleGameStart = useCallback((match: MatchFoundData) => {
    const participant = match.participants.find(item => item.playerId === network.getPlayer()?.id);
    if (!participant) return;
    setMatchId(match.matchId);
    setMatchData(match);
    setTeam(participant.team === 1 ? 'blue' : 'red');
    setPhase('heroSelect');
  }, []);

  const handleHeroComplete = useCallback(async (selectedHero: string) => {
    const result = await network.selectHero(matchId, selectedHero);
    if (!result.success) throw new Error(result.error || 'Hero selection failed');
    console.log('[App] Hero locked, starting game scene...');
    
    const game = gameRef.current?.getGame();
    if (game) {
      console.log('[App] Phaser game instance found');
      
      // Stop BootScene if running
      if (game.scene.getScene('BootScene')) {
        game.scene.stop('BootScene');
      }
      
      game.scene.start('NetworkGameScene', {
        matchId,
        participants: matchData?.participants,
        heroes: matchData?.heroes,
      });
      
      startGame();
      EventBus.emit('game:started');
      setPhase('playing');
    } else throw new Error('Phaser game is unavailable');
  }, [matchId, matchData, startGame]);

  return (
    <div className="relative flex min-h-dvh w-full flex-col bg-gray-900 md:h-full">
      {phase === 'playing' && <MatchHud />}
      {/* Phaser Game - Hidden until playing */}
      <div className={phase === 'playing'
        ? touchDevice
          ? 'game-frame-touch relative z-0 aspect-video w-full shrink-0'
          : 'relative z-0 aspect-video w-full shrink-0 md:absolute md:inset-0 md:h-full md:aspect-auto'
        : 'absolute inset-0 -z-10'}>
        <GameContainer
          ref={gameRef}
          width={1280}
          height={720}
          scene={GAME_SCENES}
        />
      </div>
      {phase === 'playing' && <MobileControls touchDevice={touchDevice} />}

      {/* Menu - Full screen overlay */}
      {phase === 'menu' && (
        <div className="fixed inset-0 z-10 overflow-y-auto overscroll-contain">
          <Menu onGameStart={handleGameStart} />
        </div>
      )}

      {/* Hero Select - Full screen overlay */}
      {phase === 'heroSelect' && (
        <div className="fixed inset-0 z-10 overflow-y-auto overscroll-contain">
          <HeroSelect matchId={matchId} team={team} onComplete={handleHeroComplete} />
        </div>
      )}

    </div>
  );
};

export default App;
