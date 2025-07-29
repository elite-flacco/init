export interface AIConfig {
  apiKey?: string
  provider: 'openai' | 'anthropic' | 'mock'
  baseUrl?: string
  model?: string
  maxTokens?: number
  temperature?: number
}

export const defaultAIConfig: AIConfig = {
  provider: 'mock', // Start with mock for development
  model: 'gpt-4',
  maxTokens: 4000, // Increased for comprehensive travel plans
  temperature: 0.7
}

export const getAIConfig = (): AIConfig => {
  return {
    ...defaultAIConfig,
    apiKey: process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY,
    provider: (process.env.AI_PROVIDER as AIConfig['provider']) || defaultAIConfig.provider,
    baseUrl: process.env.AI_BASE_URL,
    model: process.env.AI_MODEL || defaultAIConfig.model,
    maxTokens: process.env.AI_MAX_TOKENS ? parseInt(process.env.AI_MAX_TOKENS) : defaultAIConfig.maxTokens,
    temperature: process.env.AI_TEMPERATURE ? parseFloat(process.env.AI_TEMPERATURE) : defaultAIConfig.temperature
  }
}