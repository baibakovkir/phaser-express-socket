import { useEffect, useState } from 'react';
import './ChampionsSection.css';

interface Hero {
  id: string;
  name: string;
  role: string;
  hp: number;
  mana: number;
  attack: number;
  armor: number;
  speed: number;
  color: number;
}

export default function ChampionsSection() {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeroes = async () => {
      try {
        const response = await fetch('http://localhost:3000/heroes');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setHeroes(data.heroes);
      } catch (error) {
        console.error('Error fetching heroes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroes();
  }, []);

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      tank: '#4488ff',
      assassin: '#00ff88',
      mage: '#aa44ff',
      support: '#00ffaa',
      marksman: '#ff8800',
      fighter: '#ff4444',
    };
    return colors[role] || '#ffffff';
  };

  const getRoleIcon = (role: string) => {
    const icons: Record<string, string> = {
      tank: '🛡️',
      assassin: '🗡️',
      mage: '🔮',
      support: '💚',
      marksman: '🏹',
      fighter: '⚔️',
    };
    return icons[role] || '⭐';
  };

  if (loading) {
    return (
      <section className="champions-section">
        <h2 className="section-title">
          <span className="title-icon">🎭</span>
          Choose Your Fighter
        </h2>
        <div className="loading-heroes">
          <div className="loading-spinner"></div>
          <p>Loading champions...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="champions-section">
      <h2 className="section-title">
        <span className="title-icon">🎭</span>
        Choose Your Fighter
      </h2>
      
      <div className="champions-grid">
        {heroes.map((hero) => (
          <div 
            key={hero.id} 
            className="champion-card"
            style={{ '--role-color': getRoleColor(hero.role) } as React.CSSProperties}
          >
            <div className="champion-avatar">
              <div 
                className="avatar-shape"
                style={{ 
                  background: `linear-gradient(135deg, ${getRoleColor(hero.role)}, #000)`,
                  boxShadow: `0 0 30px ${getRoleColor(hero.role)}`
                }}
              ></div>
            </div>
            
            <div className="champion-header">
              <span className="role-icon">{getRoleIcon(hero.role)}</span>
              <h3>{hero.name}</h3>
              <p className="champion-role">{hero.role.toUpperCase()}</p>
            </div>
            
            <div className="champion-stats">
              <div className="stat">
                <span className="stat-label">HP</span>
                <span className="stat-value">{hero.hp}</span>
              </div>
              <div className="stat">
                <span className="stat-label">ATK</span>
                <span className="stat-value">{hero.attack}</span>
              </div>
              <div className="stat">
                <span className="stat-label">SPD</span>
                <span className="stat-value">{hero.speed}</span>
              </div>
            </div>
            
            <div className="champion-details">
              <div className="detail">
                <span className="detail-label">Armor</span>
                <span className="detail-value">{hero.armor}</span>
              </div>
              <div className="detail">
                <span className="detail-label">Mana</span>
                <span className="detail-value">{hero.mana}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
