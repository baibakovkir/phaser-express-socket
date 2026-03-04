import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CLIENT_URL = import.meta.env.VITE_CLIENT_URL || 'http://localhost:5173';

export default function PlayGamePage() {
  const { isAuthenticated, isLoading, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && token) {
        // Redirect to game client with token in URL
        window.location.href = `${CLIENT_URL}?token=${encodeURIComponent(token)}`;
      } else {
        // Not authenticated, redirect to login
        navigate('/login', { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, token, navigate]);

  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Launching game...</p>
    </div>
  );
}
