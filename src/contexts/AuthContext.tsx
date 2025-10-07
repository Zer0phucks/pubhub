import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_URL } from '@/config/env';
import { createClient } from '../../lib/supabase/client';

interface User {
  id: string;
  email: string;
}

interface Session {
  access_token: string;
  refresh_token?: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const supabase = createClient();

      // Check for OAuth tokens in URL hash (Supabase implicit flow)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');

      if (accessToken) {
        try {
          // Set the session in Supabase client
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });

          // Get the user from Supabase
          const { data: { user }, error } = await supabase.auth.getUser();

          if (error) throw error;

          if (user) {
            const newSession = {
              access_token: accessToken,
              refresh_token: refreshToken,
              user: {
                id: user.id,
                email: user.email || '',
              }
            };

            localStorage.setItem('session', JSON.stringify(newSession));
            setSession(newSession);
            setUser({
              id: user.id,
              email: user.email || '',
            });

            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } catch (error) {
          console.error('OAuth callback error:', error);
        }
      } else {
        // Check for stored session if no OAuth callback
        const storedSession = localStorage.getItem('session');
        if (storedSession) {
          try {
            const parsedSession = JSON.parse(storedSession);
            setSession(parsedSession);
            setUser(parsedSession.user);
          } catch (error) {
            localStorage.removeItem('session');
          }
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    if (data.session) {
      localStorage.setItem('session', JSON.stringify(data.session));
      setSession(data.session);
      setUser(data.user);
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, displayName }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Signup failed');
    }

    if (data.session) {
      localStorage.setItem('session', JSON.stringify(data.session));
      setSession(data.session);
      setUser(data.user);
    }
  };

  const signOut = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    localStorage.removeItem('session');
    setSession(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
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
