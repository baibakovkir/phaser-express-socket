import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { network } from '../network/socket';
import { EventBus } from '../events/EventBus';
import { HERO_SPRITES, portraitUrl } from '../assets/heroSprites';

export interface Hero {
  id: string;
  name: string;
  role: 'tank' | 'assassin' | 'mage' | 'support' | 'marksman' | 'fighter';
  hp: number;
  mana: number;
  attack: number;
  armor: number;
  speed: number;
  color: number;
  attackRange: number;
  attackSpeed: number;
  maxHp: number;
  maxMana: number;
  hpRegen: number;
  manaRegen: number;
  abilities?: Ability[];
}

export interface Ability {
  key: string;
  name: string;
  description: string;
  cooldown: number;
  manaCost: number;
  damage: number;
  range: number;
}

interface HeroSelectProps {
  matchId: string;
  team: 'blue' | 'red';
  onComplete?: (heroId: string) => Promise<void>;
}

const ROLES = ['tank', 'assassin', 'mage', 'support', 'marksman', 'fighter'] as const;
const ROLE_COLORS: Record<string, string> = {
  tank: 'text-sky-200', assassin: 'text-violet-200', mage: 'text-blue-200',
  support: 'text-emerald-200', marksman: 'text-amber-200', fighter: 'text-red-200',
};

export const HeroSelect: React.FC<HeroSelectProps> = ({ matchId, team, onComplete }) => {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [status, setStatus] = useState('Loading heroes...');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHeroes = async () => {
      try {
        const serverUrl = import.meta.env.VITE_SERVER_URL || (import.meta.env.PROD ? window.location.origin : 'http://localhost:3000');
        const response = await fetch(`${serverUrl}/heroes`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log('[HeroSelect] Loaded heroes from API:', data.heroes?.length || 0);
        
        if (!data.heroes || data.heroes.length === 0) {
          setStatus('No heroes available - contact admin');
        } else {
          setHeroes(data.heroes);
          setStatus('Select your hero...');
        }
      } catch (err) {
        console.error('[HeroSelect] Failed to load heroes:', err);
        setStatus('Failed to load heroes - check server connection');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadHeroes();
  }, []);

  const filteredHeroes = useMemo(() => {
    return heroes.filter((h) => {
      const matchesRole = filterRole === 'all' || h.role === filterRole;
      const matchesSearch = h.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesRole && matchesSearch;
    });
  }, [heroes, filterRole, searchTerm]);

  const handleLockHero = useCallback(async () => {
    if (!selectedHero) return;

    setIsLocked(true);
    setStatus(`Locked ${selectedHero.name}!`);
    console.log('[HeroSelect] Locking hero:', selectedHero.name, 'Team:', team);

    EventBus.emit('champion:selected', {
      matchId,
      championId: selectedHero.id,
      team,
    });

    try {
      await onComplete?.(selectedHero.id);
    } catch (error) {
      setIsLocked(false);
      setStatus(error instanceof Error ? error.message : 'Could not select hero');
    }
  }, [selectedHero, matchId, team, onComplete]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl text-cyan-400 mb-4">Loading heroes...</div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto" />
        </div>
      </div>
    );
  }

  if (heroes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-red-400">
          <div className="text-2xl mb-2">⚠️ No heroes available</div>
          <p className="text-gray-400">Please contact the server administrator</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sengoku-select min-h-full flex flex-col md:h-full md:overflow-hidden">
      {/* Header - Fixed */}
      <div className="sengoku-panel border-b border-amber-800 px-4 sm:px-8 py-4 flex-shrink-0">
        <div className="max-w-[1600px] mx-auto flex flex-wrap gap-3 justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-wide text-amber-100">Choose your champion</h1>
            <p className="text-amber-200/70 text-sm mt-1">{status}</p>
          </div>
          <div className={`px-6 py-2 rounded-lg font-bold ${team === 'blue' ? 'bg-blue-600' : 'bg-red-600'} text-white`}>
            {team === 'blue' ? '🔵 Blue Team' : '🔴 Red Team'}
          </div>
        </div>
      </div>

      {/* Filters - Fixed */}
      <div className="bg-[#17252a]/90 px-4 sm:px-8 py-4 border-b border-amber-900 flex-shrink-0">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row gap-3 sm:gap-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search heroes..."
            className="min-w-0 flex-1 px-4 py-2 bg-[#24333a] border border-amber-900 rounded-lg text-white focus:outline-none focus:border-amber-400"
          />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 bg-[#24333a] border border-amber-900 rounded-lg text-white focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Roles</option>
            {ROLES.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="md:min-h-0 md:flex-1 md:overflow-y-auto">
        <div className="max-w-[1600px] mx-auto p-4 sm:p-8">
          {/* Heroes Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-8">
            {filteredHeroes.map((hero) => (
              <button
                key={hero.id}
                onClick={() => setSelectedHero(hero)}
                className={`
                  sengoku-card p-2 sm:p-4 rounded-xl border-2 transition-all text-left
                  ${selectedHero?.id === hero.id 
                    ? 'border-amber-300 bg-amber-900/30 scale-[1.02] shadow-lg shadow-amber-500/20'
                    : 'border-amber-900 bg-[#1b2d31]/95 hover:border-amber-600'}
                `}
              >
                <div 
                  className="w-full aspect-square rounded-lg mb-3 flex items-center justify-center overflow-hidden border border-amber-200/25 bg-[#15242a]"
                >
                  {HERO_SPRITES[hero.id]
                    ? <img src={portraitUrl(hero.id)} alt="" loading="lazy" className="h-full w-full rounded-lg object-cover" />
                    : <span className="text-white text-4xl font-bold">{hero.name[0]}</span>}
                </div>
                <h3 className="text-white font-bold mb-1">{hero.name}</h3>
                <p className={`text-sm capitalize ${ROLE_COLORS[hero.role]}`}>{hero.role}</p>
              </button>
            ))}
          </div>

          {filteredHeroes.length === 0 && (
            <div className="text-center text-gray-500 py-20">
              No heroes found. Try a different search.
            </div>
          )}
        </div>
      </div>

      {/* Hero Details Panel - Fixed at bottom */}
      {selectedHero && (
        <div className="sengoku-panel border-t border-amber-700 p-4 sm:p-6 flex-shrink-0">
          <div className="max-w-[1600px] mx-auto flex flex-wrap gap-4 sm:gap-6 items-center">
            {/* Hero Portrait */}
            <div 
              className="hidden sm:flex w-24 h-24 rounded-xl items-center justify-center border border-amber-400 bg-[#15242a] text-white text-5xl font-bold flex-shrink-0"
            >
              {HERO_SPRITES[selectedHero.id]
                ? <img src={portraitUrl(selectedHero.id)} alt="" className="h-20 w-20 rounded-lg object-cover" />
                : selectedHero.name[0]}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-bold text-white">{selectedHero.name}</h2>
              <p className="text-gray-400 capitalize">{selectedHero.role}</p>
              
              {/* Quick Stats */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 sm:gap-6 mt-2 text-sm">
                <span className="text-green-400">HP: {selectedHero.hp}</span>
                <span className="text-blue-400">Mana: {selectedHero.mana}</span>
                <span className="text-red-400">ATK: {selectedHero.attack}</span>
                <span className="text-yellow-400">ARM: {selectedHero.armor}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-3 text-xs">
                {selectedHero.abilities?.map(ability => (
                  <span key={ability.key} className="px-2 py-1 rounded bg-gray-900 text-gray-200" title={ability.description}>
                    {ability.key} · {ability.name} · {ability.manaCost} mana · {Math.round(ability.cooldown / 1000)}s
                  </span>
                ))}
              </div>
            </div>

            {/* Lock Button */}
            <button
              onClick={handleLockHero}
              disabled={isLocked}
              className={`
                w-full sm:w-auto px-8 py-3 sm:py-4 rounded-xl font-bold text-lg sm:text-xl transition-all flex-shrink-0
                ${isLocked 
                  ? 'bg-emerald-700 cursor-default'
                  : 'bg-amber-600 hover:bg-amber-500 hover:scale-105'}
                text-slate-950 shadow-lg
              `}
            >
              {isLocked ? '✓ Locked In!' : '🔒 LOCK HERO'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroSelect;
