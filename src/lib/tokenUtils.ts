/**
 * Token counting utilities for AI API requests
 * Provides rough estimation of token counts for managing API limits
 */

export interface TokenEstimate {
  tokens: number;
  characters: number;
  isApproximate: boolean;
}

/**
 * Rough token estimation based on character count
 * OpenAI GPT models: ~4 characters per token on average
 * Anthropic Claude: ~3.5 characters per token on average
 */
export function estimateTokens(text: string, provider: 'openai' | 'anthropic' = 'openai'): TokenEstimate {
  const characters = text.length;
  const charPerToken = provider === 'openai' ? 4 : 3.5;
  const tokens = Math.ceil(characters / charPerToken);
  
  return {
    tokens,
    characters,
    isApproximate: true
  };
}

/**
 * Check if a prompt would exceed token limits
 */
export function wouldExceedTokenLimit(
  prompt: string, 
  maxTokens: number, 
  provider: 'openai' | 'anthropic' = 'openai',
  reserveForResponse: number = 2000
): boolean {
  const estimate = estimateTokens(prompt, provider);
  return estimate.tokens + reserveForResponse > maxTokens;
}

/**
 * Calculate recommended max_tokens for API request
 */
export function calculateMaxTokensForRequest(
  prompt: string,
  modelTokenLimit: number,
  provider: 'openai' | 'anthropic' = 'openai'
): number {
  const promptTokens = estimateTokens(prompt, provider).tokens;
  const safetyBuffer = 100; // Small buffer for estimation errors
  const availableForResponse = modelTokenLimit - promptTokens - safetyBuffer;
  
  // Ensure we have at least 500 tokens for response
  return Math.max(500, availableForResponse);
}

/**
 * Model token limits for different AI providers
 */
export const MODEL_TOKEN_LIMITS = {
  // OpenAI Models
  'gpt-4': 8192,
  'gpt-4-32k': 32768,
  'gpt-4-turbo': 128000,
  'gpt-4o': 128000,
  'gpt-3.5-turbo': 4096,
  'gpt-3.5-turbo-16k': 16384,
  
  // Anthropic Models
  'claude-3-haiku': 200000,
  'claude-3-sonnet': 200000,
  'claude-3-opus': 200000,
  'claude-3-sonnet-20240229': 200000,
  'claude-3.5-sonnet': 200000,
} as const;

/**
 * Get token limit for a specific model
 */
export function getModelTokenLimit(model: string): number {
  return MODEL_TOKEN_LIMITS[model as keyof typeof MODEL_TOKEN_LIMITS] || 4096;
}

/**
 * Chunk text into smaller pieces that fit within token limits
 */
export function chunkTextByTokens(
  text: string,
  maxTokensPerChunk: number,
  provider: 'openai' | 'anthropic' = 'openai'
): string[] {
  const totalTokens = estimateTokens(text, provider).tokens;
  
  if (totalTokens <= maxTokensPerChunk) {
    return [text];
  }
  
  const chunks: string[] = [];
  const lines = text.split('\n');
  let currentChunk = '';
  
  for (const line of lines) {
    const testChunk = currentChunk + (currentChunk ? '\n' : '') + line;
    const tokenCount = estimateTokens(testChunk, provider).tokens;
    
    if (tokenCount > maxTokensPerChunk && currentChunk) {
      // Current chunk is full, start a new one
      chunks.push(currentChunk);
      currentChunk = line;
    } else {
      currentChunk = testChunk;
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  
  return chunks;
}

/**
 * Token budget calculator for multi-part responses
 */
export interface TokenBudget {
  totalTokens: number;
  promptTokens: number;
  responseTokens: number;
  chunksNeeded: number;
  tokensPerChunk: number;
}

export function calculateTokenBudget(
  prompt: string,
  modelTokenLimit: number,
  targetResponseTokens: number,
  provider: 'openai' | 'anthropic' = 'openai'
): TokenBudget {
  const promptTokens = estimateTokens(prompt, provider).tokens;
  const safetyBuffer = 200;
  const availableTokens = modelTokenLimit - safetyBuffer;
  
  if (promptTokens + targetResponseTokens <= availableTokens) {
    // Single request is sufficient
    return {
      totalTokens: availableTokens,
      promptTokens,
      responseTokens: targetResponseTokens,
      chunksNeeded: 1,
      tokensPerChunk: targetResponseTokens
    };
  }
  
  // Calculate chunks needed
  const maxResponsePerRequest = Math.max(500, availableTokens - promptTokens);
  const chunksNeeded = Math.max(1, Math.ceil(targetResponseTokens / maxResponsePerRequest));
  const tokensPerChunk = Math.floor(targetResponseTokens / chunksNeeded);
  
  return {
    totalTokens: availableTokens,
    promptTokens,
    responseTokens: targetResponseTokens,
    chunksNeeded,
    tokensPerChunk
  };
}