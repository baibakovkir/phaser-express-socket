import React, { useCallback, useMemo } from 'react';
import { useGameStore, selectHp, selectMana, selectCooldowns } from '../store/gameStore';
import { EventBus } from '../events/EventBus';
import { shallow } from 'zustand/shallow';

interface AbilityButtonProps {
  name: string;
  cooldown: number;
  totalCooldown: number;
  onCast: () => void;
}

const AbilityButton: React.FC<AbilityButtonProps> = React.memo(
  ({ name, cooldown, totalCooldown, onCast }) => {
    const cooldownPercent = useMemo(() => {
      if (totalCooldown === 0) return 0;
      return (cooldown / totalCooldown) * 100;
    }, [cooldown, totalCooldown]);

    const isReady = cooldown <= 0;

    return (
      <button
        onClick={isReady ? onCast : undefined}
        disabled={!isReady}
        className={`
          relative w-16 h-16 rounded-lg border-2 font-bold text-sm
          transition-all duration-150 select-none
          ${isReady
            ? 'border-cyan-400 bg-cyan-900/50 hover:bg-cyan-800/70 cursor-pointer'
            : 'border-gray-600 bg-gray-800/50 cursor-not-allowed opacity-70'}
        `}
      >
        <span className="relative z-10">{name}</span>
        {!isReady && (
          <>
            <div
              className="absolute inset-0 bg-black/70 rounded-lg overflow-hidden"
              style={{ clipPath: `inset(${100 - cooldownPercent}% 0 0 0)` }}
            />
            <span className="absolute inset-0 flex items-center justify-center z-20 text-white text-lg">
              {Math.ceil(cooldown)}
            </span>
          </>
        )}
      </button>
    );
  }
);

AbilityButton.displayName = 'AbilityButton';

const HealthBar: React.FC = React.memo(() => {
  const { hp, maxHp } = useGameStore(selectHp, shallow);
  const hpPercent = useMemo(() => Math.max(0, Math.min(100, (hp / maxHp) * 100)), [hp, maxHp]);
  const hpColor = hpPercent > 60 ? 'bg-green-500' : hpPercent > 30 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="w-64 space-y-1 pointer-events-none">
      <div className="flex justify-between text-xs text-gray-300">
        <span>Health</span>
        <span>{Math.ceil(hp)}/{maxHp}</span>
      </div>
      <div className="h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
        <div className={`h-full ${hpColor} transition-all duration-200`} style={{ width: `${hpPercent}%` }} />
      </div>
    </div>
  );
});

HealthBar.displayName = 'HealthBar';

const ManaBar: React.FC = React.memo(() => {
  const { mana, maxMana } = useGameStore(selectMana, shallow);
  const manaPercent = useMemo(() => Math.max(0, Math.min(100, (mana / maxMana) * 100)), [mana, maxMana]);

  return (
    <div className="w-64 space-y-1 pointer-events-none">
      <div className="flex justify-between text-xs text-gray-300">
        <span>Mana</span>
        <span>{Math.ceil(mana)}/{maxMana}</span>
      </div>
      <div className="h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
        <div className="h-full bg-blue-500 transition-all duration-200" style={{ width: `${manaPercent}%` }} />
      </div>
    </div>
  );
});

ManaBar.displayName = 'ManaBar';

const Minimap: React.FC = React.memo(() => (
  <div className="w-32 h-32 bg-gray-900/80 border-2 border-gray-600 rounded-lg flex items-center justify-center text-gray-500 text-xs">
    Minimap
  </div>
));

Minimap.displayName = 'Minimap';

const GameOverOverlay: React.FC = () => {
  const winner = useGameStore((state) => state.winner);
  if (!winner) return null;

  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-white">Game Over</h2>
        <p className="text-2xl text-cyan-400">{winner === 'player' ? 'Victory!' : 'Defeat'}</p>
      </div>
    </div>
  );
};

export const HUD: React.FC = () => {
  const cooldowns = useGameStore(selectCooldowns);

  const handleAbilityCast = useCallback((abilityName: string) => {
    EventBus.emit('ui:ability-cast', abilityName);
  }, []);

  const getCooldown = useCallback((abilityName: string) => {
    const cooldown = cooldowns.find((c) => c.abilityName === abilityName);
    return cooldown ? { remaining: cooldown.cooldownRemaining, total: cooldown.cooldownTotal } : { remaining: 0, total: 0 };
  }, [cooldowns]);

  return (
    <>
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start pointer-events-none">
        <div className="space-y-2">
          <HealthBar />
          <ManaBar />
        </div>
        <Minimap />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-center pointer-events-none">
        <div className="flex gap-2">
          {['Q', 'W', 'E', 'R'].map((key) => (
            <AbilityButton
              key={key}
              name={key}
              cooldown={getCooldown(key).remaining}
              totalCooldown={getCooldown(key).total}
              onCast={() => handleAbilityCast(key)}
            />
          ))}
        </div>
      </div>

      <GameOverOverlay />
    </>
  );
};

export default HUD;
