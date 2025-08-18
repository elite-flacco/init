export interface AIConfig {
  apiKey?: string;
  provider: "openai" | "anthropic" | "mock";
  baseUrl?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  // Chunking options
  enableChunking?: boolean;
  chunkTokenLimit?: number;
  maxChunks?: number;
}

export const defaultAIConfig: AIConfig = {
  provider: "mock", // Start with mock for development
  model: "gpt-4",
  maxTokens: 8000, // Increased for comprehensive travel plans
  temperature: 0.7,
  // Chunking defaults
  enableChunking: true,
  chunkTokenLimit: 4000, // Max tokens per chunk
  maxChunks: 4, // Maximum number of chunks for a single request
};

// Models that don't support temperature parameter
const MODELS_WITHOUT_TEMPERATURE = [
  'gpt-5-mini',
  'gpt-5-nano',
  'o1-mini',
  'o1-preview',
  'o3-mini',
];

// Helper function to check if a model supports temperature
export const modelSupportsTemperature = (model?: string): boolean => {
  if (!model) return true; // Default to supporting temperature if model is not specified
  return !MODELS_WITHOUT_TEMPERATURE.some(noTempModel => 
    model.toLowerCase().includes(noTempModel.toLowerCase())
  );
};

export const getAIConfig = (): AIConfig => {
  return {
    ...defaultAIConfig,
    apiKey: process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY,
    provider:
      (process.env.AI_PROVIDER as AIConfig["provider"]) ||
      defaultAIConfig.provider,
    baseUrl: process.env.AI_BASE_URL,
    model: process.env.AI_MODEL || defaultAIConfig.model,
    maxTokens: process.env.AI_MAX_TOKENS
      ? parseInt(process.env.AI_MAX_TOKENS)
      : defaultAIConfig.maxTokens,
    temperature: process.env.AI_TEMPERATURE
      ? parseFloat(process.env.AI_TEMPERATURE)
      : defaultAIConfig.temperature,
    // Chunking configuration
    enableChunking: process.env.AI_ENABLE_CHUNKING 
      ? process.env.AI_ENABLE_CHUNKING.toLowerCase() === 'true'
      : defaultAIConfig.enableChunking,
    chunkTokenLimit: process.env.AI_CHUNK_TOKEN_LIMIT
      ? parseInt(process.env.AI_CHUNK_TOKEN_LIMIT)
      : defaultAIConfig.chunkTokenLimit,
    maxChunks: process.env.AI_MAX_CHUNKS
      ? parseInt(process.env.AI_MAX_CHUNKS)
      : defaultAIConfig.maxChunks,
  };
};
