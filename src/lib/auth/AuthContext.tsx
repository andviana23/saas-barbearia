'use client';

import React, { createContext, useContext } from 'react';
import { useAuth, AuthUser } from '@/hooks/use-auth';
import { SupabaseSession, SignInResponse } from '@/types/supabase-auth';

interface AuthContextType {
  session: SupabaseSession | null;
  user: AuthUser | null;
  status: 'INIT' | 'SIGNED_OUT' | 'SIGNED_IN';
  authLoading: boolean;
  signInWithPassword: (email: string, password: string) => Promise<SignInResponse>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<SignInResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
