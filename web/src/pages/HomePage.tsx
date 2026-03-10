import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChampionsSection from '../components/ChampionsSection';
import './HomePage.css';

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="logo-container">
            <div className="logo-symbol">
              <div className="ninja-star">
                <div className="star-blade blade-1"></div>
                <div className="star-blade blade-2"></div>
                <div className="star-blade blade-3"></div>
                <div className="star-blade blade-4"></div>
                <div className="star-center"></div>
              </div>
            </div>
          </div>
          
          <h1 className="game-title">
            <span className="title-ninja">NINJAS</span>
            <span className="title-x">X</span>
          </h1>
          
          <p className="tagline">Competitive 3v3 MOBA — Forge Your Legacy</p>
          
          <div className="hero-cta">
            <Link to="/register" className="btn-primary">
              <span className="btn-icon">⚔️</span>
              Play Free Now
            </Link>
            {isAuthenticated && (
              <Link to="/play" className="btn-secondary">
                <span className="btn-icon">🎮</span>
                Launch Game
              </Link>
            )}
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="hero-decorations">
          <div className="decorative-line line-left"></div>
          <div className="decorative-line line-right"></div>
          <div className="glowing-orb orb-1"></div>
          <div className="glowing-orb orb-2"></div>
        </div>
      </section>

      {/* How to Start Section */}
      <section className="how-to-start">
        <h2 className="section-title">
          <span className="title-icon">📜</span>
          How to Start
        </h2>
        
        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">01</div>
            <div className="step-icon">🥷</div>
            <h3>Create Account</h3>
            <p>Register with your email and choose your ninja name</p>
            <Link to="/register" className="step-link">Register →</Link>
          </div>
          
          <div className="step-card">
            <div className="step-number">02</div>
            <div className="step-icon">🎯</div>
            <h3>Choose Your Hero</h3>
            <p>Select from assassins, tanks, mages, and supports</p>
            <div className="step-preview">3 Unique Champions</div>
          </div>
          
          <div className="step-card">
            <div className="step-number">03</div>
            <div className="step-icon">⚔️</div>
            <h3>Enter Battle</h3>
            <p>Join matchmaking and dominate the 3v3 arena</p>
            <div className="step-preview">3 Lanes • 5v5 • Victory</div>
          </div>
          
          <div className="step-card highlight">
            <div className="step-number">04</div>
            <div className="step-icon">🔥</div>
            <h3>Test Mode</h3>
            <p>Practice alone against AI bots before ranked matches</p>
            <Link to="/register" className="step-link">Try Now →</Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">
          <span className="title-icon">⚡</span>
          Game Features
        </h2>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🗺️</div>
            <h3>Strategic Map</h3>
            <p>3-lane battlefield with jungle, towers, and bases</p>
            <div className="feature-stats">
              <span>2400x2400</span>
              <span>3 Lanes</span>
              <span>Jungle</span>
            </div>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🦸</div>
            <h3>Unique Champions</h3>
            <p>Each hero has distinct abilities and playstyle</p>
            <div className="feature-stats">
              <span>Assassin</span>
              <span>Tank</span>
              <span>Mage</span>
            </div>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Team Battles</h3>
            <p>5v5 real-time multiplayer combat</p>
            <div className="feature-stats">
              <span>3v3</span>
              <span>Ranked</span>
              <span>Unranked</span>
            </div>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>AI Training</h3>
            <p>Practice against bots to master your champion</p>
            <div className="feature-stats">
              <span>Test Mode</span>
              <span>Bot AI</span>
              <span>Practice</span>
            </div>
          </div>
        </div>
      </section>

      {/* Champions Preview */}
      <ChampionsSection />

      {/* Controls Section */}
      <section className="controls-section">
        <h2 className="section-title">
          <span className="title-icon">🎮</span>
          Controls
        </h2>
        
        <div className="controls-grid">
          <div className="control-item">
            <div className="key-group">
              <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>
            </div>
            <p>Move Champion</p>
          </div>
          
          <div className="control-item">
            <div className="key-group">
              <kbd>Mouse</kbd>
            </div>
            <p>Click to Move</p>
          </div>
          
          <div className="control-item">
            <div className="key-group">
              <kbd>Space</kbd>
            </div>
            <p>Basic Attack</p>
          </div>
          
          <div className="control-item">
            <div className="key-group">
              <kbd>1</kbd><kbd>2</kbd><kbd>3</kbd><kbd>4</kbd>
            </div>
            <p>Abilities</p>
          </div>
          
          <div className="control-item">
            <div className="key-group">
              <kbd>ESC</kbd>
            </div>
            <p>Exit to Menu</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Battle?</h2>
          <p>Join thousands of players in the ultimate MOBA experience</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn-cta-large">
              Start Fighting Free
            </Link>
            {isAuthenticated && (
              <Link to="/play" className="btn-cta-outline">
                Enter Arena
              </Link>
            )}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">NINJAS X</div>
          <p className="footer-text">© ACTUAL YEAR NINJAS X. All rights reserved.</p>
          <div className="footer-links">
            <a href="#" className="footer-link">Privacy</a>
            <a href="#" className="footer-link">Terms</a>
            <a href="#" className="footer-link">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
