import React, { useState, useEffect, useCallback } from 'react';
import { network, Lobby, Player } from '../network/socket';
import { EventBus } from '../events/EventBus';

interface MenuProps {
  onGameStart?: (matchId: string) => void;
}

export const Menu: React.FC<MenuProps> = ({ onGameStart }) => {
  const [player, setPlayer] = useState<Player | null>(null);
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [status, setStatus] = useState('Connecting...');
  const [lobbyName, setLobbyName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [inQueue, setInQueue] = useState(false);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    const init = async () => {
      const authenticated = await network.connect();
      const p = network.getPlayer();
      
      if (authenticated && p) {
        setPlayer(p);
        setStatus(`Logged in as ${p.username}`);
      } else {
        setStatus('Not authenticated - Redirecting...');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    };
    init();
  }, []);

  useEffect(() => {
    network.on('lobby:updated', (data) => {
      const lobbyData = data as { lobby: Lobby };
      if (lobbyData.lobby) {
        console.log('[Menu] Lobby updated:', lobbyData.lobby);
        setLobby(lobbyData.lobby);
        setIsHost(lobbyData.lobby.hostId === player?.id);
        setStatus(`Lobby: ${lobbyData.lobby.players.length} player(s) - ${lobbyData.lobby.hostId === player?.id ? 'You can start!' : 'Waiting for host'}`);
      }
    });

    network.on('lobby:kicked', () => {
      setLobby(null);
      setIsHost(false);
      setStatus('You were kicked from the lobby');
    });

    network.on('queue:joined', () => {
      setInQueue(true);
      setStatus('Searching for match...');
    });

    network.on('queue:left', () => {
      setInQueue(false);
      setStatus('Left queue');
    });

    network.on('match:found', (data) => {
      const matchData = data as { matchId: string };
      setStatus('Match found!');
      setTimeout(() => {
        onGameStart?.(matchData.matchId);
        EventBus.emit('game:started');
      }, 1500);
    });

    return () => {
      network.off('lobby:updated');
      network.off('lobby:kicked');
      network.off('queue:joined');
      network.off('queue:left');
      network.off('match:found');
    };
  }, [onGameStart, player?.id, isHost]);

  const handleCreateLobby = useCallback(async () => {
    if (!lobbyName.trim()) return;
    const result = await network.createLobby(lobbyName, isPrivate);
    if (result.success && result.lobby) {
      setLobby(result.lobby);
      setIsHost(true);
      setStatus(`Lobby created! You are the host. Start game anytime!`);
    } else {
      setStatus(`Failed: ${result.error}`);
    }
  }, [lobbyName, isPrivate]);

  const handleJoinQueue = useCallback(async () => {
    const result = await network.joinQueue();
    if (result.success) {
      setInQueue(true);
      setStatus('Searching for match...');
    } else {
      setStatus(`Failed: ${result.error}`);
    }
  }, []);

  const handleLeaveQueue = useCallback(async () => {
    const result = await network.leaveQueue();
    if (result.success) {
      setInQueue(false);
      setStatus('Left queue');
    }
  }, []);

  const handleLeaveLobby = useCallback(async () => {
    await network.leaveLobby();
    setLobby(null);
    setIsHost(false);
    setStatus('Left lobby');
  }, []);

  const handleStartGame = useCallback(async () => {
    if (!lobby) return;
    setStatus('Starting game...');
    const matchId = `custom_${lobby.id}_${Date.now()}`;
    setTimeout(() => {
      onGameStart?.(matchId);
      EventBus.emit('game:started');
    }, 1000);
  }, [lobby, onGameStart]);

  const handleKickPlayer = useCallback(async (playerId: string) => {
    const result = await network.kickPlayer(playerId);
    if (!result.success) {
      setStatus(`Failed to kick: ${result.error}`);
    }
  }, []);

  const handleSetReady = useCallback(async () => {
    const result = await network.setReady(true);
    if (result.success) {
      setStatus('Ready! Waiting for host to start...');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8">
      {/* Title */}
      <h1 className="text-6xl font-bold text-cyan-400 mb-3 tracking-wider">NINJAS X</h1>
      
      {/* Status */}
      <div className={`text-lg mb-8 px-6 py-2 rounded ${
        status.includes('error') || status.includes('Failed') 
          ? 'bg-red-900/50 text-red-400 border border-red-700' 
          : 'bg-gray-800 text-gray-300 border border-gray-700'
      }`}>
        {status}
      </div>

      {/* Player Info */}
      {player && (
        <div className="mb-8 px-8 py-4 bg-gray-800 rounded-lg border border-gray-700 flex items-center gap-6">
          <div>
            <span className="text-gray-400">Player: </span>
            <span className="text-cyan-400 font-bold text-lg">{player.username}</span>
          </div>
          <div className="h-6 w-px bg-gray-600" />
          <div>
            <span className="text-gray-400">MMR: </span>
            <span className="text-yellow-400 font-bold">{player.mmr}</span>
          </div>
        </div>
      )}

      {/* No Lobby - Show creation options */}
      {!lobby ? (
        <div className="flex gap-6 w-full max-w-4xl justify-center">
          {/* Create Lobby */}
          <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 w-96">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-3xl">🏠</span> Create Lobby
            </h2>
            <input
              type="text"
              value={lobbyName}
              onChange={(e) => setLobbyName(e.target.value)}
              placeholder="Enter lobby name..."
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white text-lg focus:outline-none focus:border-cyan-400 mb-4"
              maxLength={20}
            />
            <label className="flex items-center text-gray-300 mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="mr-3 w-5 h-5 accent-cyan-500"
              />
              <span className="text-lg">Private lobby</span>
            </label>
            <button
              onClick={handleCreateLobby}
              disabled={!lobbyName.trim()}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold text-lg rounded-lg transition-colors"
            >
              Create Lobby
            </button>
          </div>

          {/* Quick Queue */}
          <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 w-96">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-3xl">⚡</span> Quick Play
            </h2>
            <p className="text-gray-400 mb-6 text-center">
              {!inQueue 
                ? 'Find a match with other players' 
                : 'Searching for an opponent...'}
            </p>
            {!inQueue ? (
              <button
                onClick={handleJoinQueue}
                className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold text-lg rounded-lg transition-colors"
              >
                🔍 Find Match
              </button>
            ) : (
              <button
                onClick={handleLeaveQueue}
                className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold text-lg rounded-lg transition-colors animate-pulse"
              >
                ❌ Cancel Queue
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Lobby View */
        <div className="bg-gray-800 p-8 rounded-xl border-2 border-cyan-700 w-full max-w-2xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-700">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">🏠 {lobby.name}</h2>
              <p className="text-cyan-400 font-semibold">
                {lobby.players.length} player{lobby.players.length !== 1 ? 's' : ''} in lobby
                {isHost && <span className="ml-3 text-yellow-400">👑 You are the host</span>}
              </p>
            </div>
            <button
              onClick={handleLeaveLobby}
              className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition-colors"
            >
              Leave Lobby
            </button>
          </div>

          {/* Players List */}
          <div className="mb-8">
            <h3 className="text-gray-400 font-semibold mb-4 text-lg">
              👥 Players ({lobby.players.length}/5)
            </h3>
            <div className="space-y-3">
              {lobby.players.map((p, index) => {
                const isCurrentPlayer = p.playerId === player?.id;
                const canKick = isHost && !isCurrentPlayer;
                
                return (
                  <div
                    key={`${p.playerId}-${index}`}
                    className="flex justify-between items-center px-6 py-4 bg-gray-900 rounded-lg border border-gray-700"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-4 h-4 rounded-full ${p.ready ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                      <span className="text-white font-semibold text-lg">{p.username}</span>
                      {isCurrentPlayer && (
                        <span className="text-xs bg-cyan-900 text-cyan-300 px-2 py-1 rounded">You</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      {p.isHost && (
                        <span className="text-yellow-400 font-semibold">👑 Host</span>
                      )}
                      <span className={`font-semibold ${p.ready ? 'text-green-400' : 'text-gray-500'}`}>
                        {p.ready ? '✓ Ready' : '○ Not Ready'}
                      </span>
                      {canKick && (
                        <button
                          onClick={() => handleKickPlayer(p.playerId)}
                          className="px-3 py-1 text-sm bg-red-900/50 text-red-400 hover:bg-red-900 rounded transition-colors"
                        >
                          Kick
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          {isHost ? (
            <button
              onClick={handleStartGame}
              className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold text-xl rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              🎮 START GAME ({lobby.players.length}+ player{lobby.players.length !== 1 ? 's' : ''})
            </button>
          ) : (
            <button
              onClick={handleSetReady}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xl rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              ✓ READY UP
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Menu;
