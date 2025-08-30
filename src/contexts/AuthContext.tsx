"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { AuthState, AuthUser, authService, mapSupabaseUser } from "../lib/auth";

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (
    email: string,
    password: string,
    fullName?: string,
  ) => Promise<{ error?: string }>;
  signOut: () => Promise<{ error?: string }>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  updateProfile: (updates: {
    full_name?: string;
    avatar_url?: string;
  }) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { session } = await authService.getSession();

        if (mounted) {
          setState({
            user: session?.user ? mapSupabaseUser(session.user) : null,
            session,
            loading: false,
          });
        }
      } catch (error) {
        if (mounted) {
          setState({
            user: null,
            session: null,
            loading: false,
          });
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = authService.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      setState({
        user: session?.user ? mapSupabaseUser(session.user) : null,
        session,
        loading: false,
      });
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true }));

    const result = await authService.signIn({ email, password });

    setState((prev) => ({
      ...prev,
      loading: false,
      user: result.user || prev.user,
    }));

    return { error: result.error };
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    setState((prev) => ({ ...prev, loading: true }));

    const result = await authService.signUp({ email, password, fullName });

    setState((prev) => ({
      ...prev,
      loading: false,
      user: result.user || prev.user,
    }));

    return { error: result.error };
  };

  const signOut = async () => {
    setState((prev) => ({ ...prev, loading: true }));

    const result = await authService.signOut();

    setState({
      user: null,
      session: null,
      loading: false,
    });

    return result;
  };

  const resetPassword = async (email: string) => {
    return authService.resetPassword(email);
  };

  const updateProfile = async (updates: {
    full_name?: string;
    avatar_url?: string;
  }) => {
    setState((prev) => ({ ...prev, loading: true }));

    const result = await authService.updateProfile(updates);

    setState((prev) => ({
      ...prev,
      loading: false,
      user: result.user || prev.user,
    }));

    return { error: result.error };
  };

  const value: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Additional hooks for common auth patterns
export function useRequireAuth() {
  const auth = useAuth();

  useEffect(() => {
    if (!auth.loading && !auth.user) {
      // Redirect to sign in or show modal
      console.warn("User must be authenticated to access this feature");
    }
  }, [auth.loading, auth.user]);

  return auth;
}

export function useOptionalAuth() {
  const auth = useAuth();

  return {
    ...auth,
    isAuthenticated: !!auth.user,
  };
}
