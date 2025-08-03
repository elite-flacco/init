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

// Mock fetch for API calls
global.fetch = vi.fn();
