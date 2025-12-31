'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../../lib/supabase';

interface User {
  id: string;
  email: string | null;
  name: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, name?: string) => Promise<any>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  updateUser: (userData: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session on initial load
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser({
          id: session.user.id,
          email: String(session.user.email),
          name: session.user.user_metadata?.name || null,
        });
      }

      setLoading(false);

      // Set up real-time authentication listener
      const { data: { subscription } } = await supabase.auth.onAuthStateChange(
        (_event, session) => {
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: String(session.user.email),
              name: session.user.user_metadata?.name || null,
            });
          } else {
            setUser(null);
          }
          setLoading(false);
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    };

    checkSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        setUser({
          id: data.user.id,
          email: String(data.user.email),
          name: data.user.user_metadata?.name || null,
        });
      }

      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || null,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        setUser({
          id: data.user.id,
          email: String(data.user.email),
          name: data.user.user_metadata?.name || null,
        });
      }

      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
    setUser(null);
  };

  const forgotPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  const updateUser = (userData: User | null) => {
    setUser(userData);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    forgotPassword,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};