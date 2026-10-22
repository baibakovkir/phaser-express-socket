import React, { useRef, useState, useCallback } from 'react';
import { GameContainer, GameContainerHandle } from './components/GameContainer';
import { Menu } from './components/Menu';
import { HeroSelect } from './components/ChampionSelect';
import { MobileControls } from './components/MobileControls';
import { MatchHud } from './components/MatchHud';
import { EconomyOverlay } from './components/EconomyOverlay';
import { AbilityBar } from './components/AbilityBar';
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
  const [selectedHeroId, setSelectedHeroId] = useState('');
  const [team, setTeam] = useState<'blue' | 'red'>('blue');

  const startGame = useGameStore((state) => state.startGame);

  const handleGameStart = useCallback((match: MatchFoundData) => {
    const participant = match.participants.find(item => item.playerId === network.getPlayer()?.id);
    if (!participant) return;
    setMatchId(match.matchId);
    setMatchData(match);
    setSelectedHeroId('');
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
      
      setSelectedHeroId(selectedHero);
      startGame();
      EventBus.emit('game:started');
      setPhase('playing');
    } else throw new Error('Phaser game is unavailable');
  }, [matchId, matchData, startGame]);

  return (
    <div className={phase === 'playing' && touchDevice
      ? 'touch-match-shell bg-gray-900'
      : 'relative flex min-h-dvh w-full flex-col bg-gray-900 md:h-full'}>
      {phase === 'playing' && <MatchHud />}
      {/* Phaser Game - Hidden until playing */}
      <div className={phase === 'playing'
        ? 'absolute inset-0 z-0 h-full w-full'
        : 'absolute inset-0 -z-10'}>
        <GameContainer
          ref={gameRef}
          width={1280}
          height={720}
          scene={GAME_SCENES}
        />
      </div>
      {phase === 'playing' && touchDevice && <MobileControls />}
      {phase === 'playing' && matchData?.heroes.find(hero => hero.id === selectedHeroId) &&
        <AbilityBar hero={matchData.heroes.find(hero => hero.id === selectedHeroId)!} />}
      {phase === 'playing' && matchData && <EconomyOverlay matchId={matchId} items={matchData.items} />}

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
