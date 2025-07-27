export interface AIConfig {
  apiKey?: string;
  provider: 'openai' | 'anthropic' | 'mock';
  baseUrl?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export const defaultAIConfig: AIConfig = {
  provider: 'mock', // Start with mock for development
  model: 'gpt-4',
  maxTokens: 1000,
  temperature: 0.7
};

export const getAIConfig = (): AIConfig => {
  return {
    ...defaultAIConfig,
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.VITE_ANTHROPIC_API_KEY,
    provider: import.meta.env.VITE_AI_PROVIDER as AIConfig['provider'] || defaultAIConfig.provider,
    baseUrl: import.meta.env.VITE_AI_BASE_URL,
    model: import.meta.env.VITE_AI_MODEL || defaultAIConfig.model,
    maxTokens: import.meta.env.VITE_AI_MAX_TOKENS ? parseInt(import.meta.env.VITE_AI_MAX_TOKENS) : defaultAIConfig.maxTokens,
    temperature: import.meta.env.VITE_AI_TEMPERATURE ? parseFloat(import.meta.env.VITE_AI_TEMPERATURE) : defaultAIConfig.temperature
  };
};