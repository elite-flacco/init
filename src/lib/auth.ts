import { User, AuthError, Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

export interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
}

export interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  fullName?: string;
}

export interface AuthResponse {
  user?: AuthUser;
  error?: string;
}

// Convert Supabase User to our AuthUser type
export function mapSupabaseUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email!,
    full_name: user.user_metadata?.full_name || user.user_metadata?.name,
    avatar_url: user.user_metadata?.avatar_url,
    created_at: user.created_at,
  };
}

// Authentication service functions
export const authService = {
  // Sign up with email and password
  async signUp(credentials: SignupCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.fullName,
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        return { user: mapSupabaseUser(data.user) };
      }

      return { error: 'Failed to create account' };
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  },

  // Sign in with email and password
  async signIn(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        return { user: mapSupabaseUser(data.user) };
      }

      return { error: 'Failed to sign in' };
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  },

  // Sign out
  async signOut(): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { error: error.message };
      }
      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  },

  // Get current session
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      return { session: data.session, error };
    } catch (error) {
      return { session: null, error };
    }
  },

  // Get current user
  async getUser() {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        return { user: null, error };
      }
      return { user: mapSupabaseUser(data.user), error: null };
    } catch (error) {
      return { user: null, error };
    }
  },

  // Send password reset email
  async resetPassword(email: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        return { error: error.message };
      }
      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  },

  // Update password
  async updatePassword(password: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });
      if (error) {
        return { error: error.message };
      }
      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  },

  // Update user profile
  async updateProfile(updates: {
    full_name?: string;
    avatar_url?: string;
  }): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        return { user: mapSupabaseUser(data.user) };
      }

      return { error: 'Failed to update profile' };
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  },

  // Subscribe to auth state changes
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// Helper function to make authenticated API requests
export const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('No authentication token available');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
};

// Helper functions for validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/(?=.*\d)/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  return { valid: true };
};