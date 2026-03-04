import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import '../styles/Profile.css';

export default function ProfilePage() {
  const { player, logout } = useAuth();

  if (!player) {
    return <div className="profile-container">Loading...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {player.username.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <h1>{player.username}</h1>
            <p className="profile-email">{player.email}</p>
            <span className="profile-mmr">MMR: {player.mmr}</span>
          </div>
        </div>

        <div className="profile-stats">
          <h2>Player Stats</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Matches Played</span>
              <span className="stat-value">0</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Wins</span>
              <span className="stat-value">0</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Losses</span>
              <span className="stat-value">0</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Win Rate</span>
              <span className="stat-value">0%</span>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <Link to="/play" className="btn-secondary">
            Launch Game
          </Link>
          <button onClick={logout} className="btn-danger">
            Logout
          </button>
        </div>

        <div className="profile-footer">
          <p>Member since: {new Date(player.createdAt).toLocaleDateString()}</p>
          <p className="profile-id">Player ID: {player.id}</p>
        </div>
      </div>
    </div>
  );
}
