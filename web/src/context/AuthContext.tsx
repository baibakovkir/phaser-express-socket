import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Player } from '../types/auth';
import { login, register, getCurrentPlayer } from '../api/auth';

interface AuthContextType {
  player: Player | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      setToken(storedToken);
      getCurrentPlayer(storedToken)
        .then((data) => {
          setPlayer(data.player);
        })
        .catch(() => {
          localStorage.removeItem('auth_token');
          setToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleLogin = async (email: string, password: string) => {
    setError(null);
    const data = await login(email, password);
    setToken(data.token);
    setPlayer(data.player);
    localStorage.setItem('auth_token', data.token);
  };

  const handleRegister = async (username: string, email: string, password: string) => {
    setError(null);
    const data = await register(username, email, password);
    setToken(data.token);
    setPlayer(data.player);
    localStorage.setItem('auth_token', data.token);
  };

  const handleLogout = () => {
    setToken(null);
    setPlayer(null);
    localStorage.removeItem('auth_token');
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        player,
        token,
        isLoading,
        isAuthenticated: !!player,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
