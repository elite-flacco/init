import "@testing-library/jest-dom";
import { vi } from "vitest";
import React from "react";

// Make React available globally for JSX
global.React = React;

// Mock environment variables for testing
import.meta.env.VITE_AI_PROVIDER = "mock";
import.meta.env.VITE_AI_MODEL = "gpt-4";
import.meta.env.VITE_AI_MAX_TOKENS = "1000";
import.meta.env.VITE_AI_TEMPERATURE = "0.7";

// Mock Supabase environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test_anon_key";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test_service_key";

// Mock fetch for API calls
global.fetch = vi.fn();

// Mock Supabase
vi.mock("../lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signUp: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  },
  supabaseAdmin: null,
}));

// Mock AuthContext
vi.mock("../contexts/AuthContext", () => ({
  useAuth: vi.fn(() => ({
    user: null,
    loading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    resetPassword: vi.fn(),
    updatePassword: vi.fn(),
    updateProfile: vi.fn(),
  })),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));
