import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-container">
      <div className="home-content">
        <h1>NINJAS X</h1>
        <p className="home-subtitle">Competitive Real-Time Strategy Game</p>

        <div className="home-features">
          <div className="feature-card">
            <h3>⚔️ 3v3 Battles</h3>
            <p>Fast-paced team-based gameplay with strategic depth</p>
          </div>
          <div className="feature-card">
            <h3>🦸 Unique Heroes</h3>
            <p>Choose from a roster of heroes with distinct abilities</p>
          </div>
          <div className="feature-card">
            <h3>🏆 Ranked Matches</h3>
            <p>Climb the ladder and prove your skills</p>
          </div>
        </div>

        <div className="home-cta">
          <Link to="/register" className="btn-cta-primary">
            Play Now - It's Free
          </Link>
          {isAuthenticated && (
            <Link to="/play" className="btn-cta-secondary">
              Launch Game
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
