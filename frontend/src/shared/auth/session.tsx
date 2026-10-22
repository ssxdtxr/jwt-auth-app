import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { login as apiLogin, logout as apiLogout, refresh as apiRefresh } from '@/shared/api';
import { clearToken, onSessionExpire, setToken } from './token';

type User = { id: string; email: string };

type Session = {
  user: User | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

type AuthProviderProps = {
  children: React.ReactNode;
};

const SessionContext = createContext<Session | null>(null);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    onSessionExpire(() => setUser(null));

    apiRefresh()
      .then(({ data }) => {
        setToken(data.accessToken);
        setUser(data.user);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    const { data } = await apiLogin(email, password);
    setToken(data.accessToken);
    setUser(data.user);
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    await apiLogout().catch(() => {});
    clearToken();
    setUser(null);
  }, []);

  return (
    <SessionContext.Provider value={{ user, ready, login, logout }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = (): Session => {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within AuthProvider');
  return ctx;
};
