import "@testing-library/jest-dom";
import React from "react";

// Make React available globally for JSX
global.React = React;

// Mock environment variables for testing
process.env.AI_PROVIDER = "mock";
process.env.AI_MODEL = "gpt-4";
process.env.AI_MAX_TOKENS = "8000";
process.env.AI_TEMPERATURE = "0.7";
process.env.AI_ENABLE_CHUNKING = "true";
process.env.AI_CHUNK_TOKEN_LIMIT = "4000";
process.env.AI_MAX_CHUNKS = "4";

// Mock Supabase environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test_anon_key";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test_service_key";

// Mock fetch for API calls
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

// Mock Supabase
jest.mock("../lib/supabase", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
    auth: {
      getUser: jest
        .fn()
        .mockResolvedValue({ data: { user: null }, error: null }),
      signUp: jest
        .fn()
        .mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: jest
        .fn()
        .mockResolvedValue({ data: { user: null }, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
    },
  },
  supabaseAdmin: null,
}));

// Mock AuthContext
jest.mock("../contexts/AuthContext", () => ({
  useAuth: jest.fn(() => ({
    user: null,
    loading: false,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    resetPassword: jest.fn(),
    updatePassword: jest.fn(),
    updateProfile: jest.fn(),
  })),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));
