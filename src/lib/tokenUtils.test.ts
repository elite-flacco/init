import { describe, test, expect } from 'vitest';
import {
  estimateTokens,
  wouldExceedTokenLimit,
  calculateMaxTokensForRequest,
  getModelTokenLimit,
  calculateTokenBudget
} from './tokenUtils';

describe('Token Utils', () => {
  test('estimateTokens should provide reasonable estimates', () => {
    const text = 'This is a test sentence with approximately ten words.';
    const estimate = estimateTokens(text, 'openai');
    
    expect(estimate.tokens).toBeGreaterThan(0);
    expect(estimate.characters).toBe(text.length);
    expect(estimate.isApproximate).toBe(true);
  });

  test('wouldExceedTokenLimit should correctly identify large prompts', () => {
    const shortText = 'Short text';
    const longText = 'This is a very long text '.repeat(1000);
    
    expect(wouldExceedTokenLimit(shortText, 10000, 'openai')).toBe(false);
    expect(wouldExceedTokenLimit(longText, 1000, 'openai')).toBe(true);
  });

  test('calculateMaxTokensForRequest should leave room for response', () => {
    const prompt = 'Test prompt';
    const modelLimit = 4000;
    
    const maxTokens = calculateMaxTokensForRequest(prompt, modelLimit, 'openai');
    const promptTokens = estimateTokens(prompt, 'openai').tokens;
    
    expect(maxTokens).toBeLessThan(modelLimit - promptTokens);
    expect(maxTokens).toBeGreaterThan(500); // Minimum threshold
  });

  test('getModelTokenLimit should return correct limits', () => {
    expect(getModelTokenLimit('gpt-4')).toBe(8192);
    expect(getModelTokenLimit('gpt-4-turbo')).toBe(128000);
    expect(getModelTokenLimit('claude-3-sonnet')).toBe(200000);
    expect(getModelTokenLimit('unknown-model')).toBe(4096); // Default
  });

  test('calculateTokenBudget should determine chunking needs', () => {
    const shortPrompt = 'Short prompt';
    const longPrompt = 'Very long prompt that should require chunking because it is extremely long and verbose and contains many words '.repeat(200);
    
    const shortBudget = calculateTokenBudget(shortPrompt, 4000, 1000, 'openai');
    expect(shortBudget.chunksNeeded).toBe(1);
    
    const longBudget = calculateTokenBudget(longPrompt, 4000, 8000, 'openai');
    expect(longBudget.chunksNeeded).toBeGreaterThan(1);
  });

  test('different providers should have different token estimates', () => {
    const text = 'Same text for both providers';
    
    const openaiEstimate = estimateTokens(text, 'openai');
    const anthropicEstimate = estimateTokens(text, 'anthropic');
    
    // Anthropic should have slightly higher token count (3.5 chars/token vs 4)
    expect(anthropicEstimate.tokens).toBeGreaterThanOrEqual(openaiEstimate.tokens);
  });
});