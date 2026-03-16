import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { network } from '../network/socket';
import { EventBus } from '../events/EventBus';

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
  onComplete?: () => void;
}

const ROLES = ['tank', 'assassin', 'mage', 'support', 'marksman', 'fighter'] as const;
const ROLE_COLORS: Record<string, string> = {
  tank: 'border-blue-500 bg-blue-900/30',
  assassin: 'border-red-500 bg-red-900/30',
  mage: 'border-purple-500 bg-purple-900/30',
  support: 'border-green-500 bg-green-900/30',
  marksman: 'border-yellow-500 bg-yellow-900/30',
  fighter: 'border-orange-500 bg-orange-900/30',
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
        const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
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

  const handleLockHero = useCallback(() => {
    if (!selectedHero) return;

    setIsLocked(true);
    setStatus(`Locked ${selectedHero.name}!`);
    console.log('[HeroSelect] Locking hero:', selectedHero.name, 'Team:', team);

    EventBus.emit('champion:selected', {
      matchId,
      championId: selectedHero.id,
      team,
    });

    setTimeout(() => {
      console.log('[HeroSelect] Calling onComplete');
      onComplete?.();
    }, 1500);
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
    <div className="h-screen bg-gray-900 flex flex-col overflow-hidden">
      {/* Header - Fixed */}
      <div className="bg-gray-800 border-b border-gray-700 px-8 py-4 flex-shrink-0">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-cyan-400">Hero Select</h1>
            <p className="text-gray-400 text-sm mt-1">{status}</p>
          </div>
          <div className={`px-6 py-2 rounded-lg font-bold ${team === 'blue' ? 'bg-blue-600' : 'bg-red-600'} text-white`}>
            {team === 'blue' ? '🔵 Blue Team' : '🔴 Red Team'}
          </div>
        </div>
      </div>

      {/* Filters - Fixed */}
      <div className="bg-gray-900 px-8 py-4 border-b border-gray-700 flex-shrink-0">
        <div className="max-w-[1600px] mx-auto flex gap-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search heroes..."
            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
          />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
          >
            <option value="all">All Roles</option>
            {ROLES.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto p-8">
          {/* Heroes Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
            {filteredHeroes.map((hero) => (
              <button
                key={hero.id}
                onClick={() => setSelectedHero(hero)}
                className={`
                  p-4 rounded-xl border-2 transition-all text-left
                  ${selectedHero?.id === hero.id 
                    ? 'border-cyan-400 bg-cyan-900/30 scale-105 shadow-lg shadow-cyan-500/20' 
                    : `border-gray-700 bg-gray-800 hover:border-gray-500`}
                  ${ROLE_COLORS[hero.role]}
                `}
              >
                <div 
                  className="w-full aspect-square rounded-lg mb-3 flex items-center justify-center"
                  style={{ backgroundColor: `#${hero.color.toString(16).padStart(6, '0')}` }}
                >
                  <span className="text-white text-4xl font-bold">{hero.name[0]}</span>
                </div>
                <h3 className="text-white font-bold mb-1">{hero.name}</h3>
                <p className="text-gray-400 text-sm capitalize">{hero.role}</p>
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
        <div className="bg-gray-800 border-t border-gray-700 p-6 flex-shrink-0">
          <div className="max-w-[1600px] mx-auto flex gap-6 items-center">
            {/* Hero Portrait */}
            <div 
              className="w-24 h-24 rounded-xl flex items-center justify-center text-white text-5xl font-bold flex-shrink-0"
              style={{ backgroundColor: `#${selectedHero.color.toString(16).padStart(6, '0')}` }}
            >
              {selectedHero.name[0]}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">{selectedHero.name}</h2>
              <p className="text-gray-400 capitalize">{selectedHero.role}</p>
              
              {/* Quick Stats */}
              <div className="flex gap-6 mt-2 text-sm">
                <span className="text-green-400">HP: {selectedHero.hp}</span>
                <span className="text-blue-400">Mana: {selectedHero.mana}</span>
                <span className="text-red-400">ATK: {selectedHero.attack}</span>
                <span className="text-yellow-400">ARM: {selectedHero.armor}</span>
              </div>
            </div>

            {/* Lock Button */}
            <button
              onClick={handleLockHero}
              disabled={isLocked}
              className={`
                px-8 py-4 rounded-xl font-bold text-xl transition-all flex-shrink-0
                ${isLocked 
                  ? 'bg-green-700 cursor-default' 
                  : 'bg-green-600 hover:bg-green-500 hover:scale-105'}
                text-white shadow-lg
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
