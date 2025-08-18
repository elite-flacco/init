import { describe, it, expect } from 'vitest';
import { modelSupportsTemperature } from '../../../app/api/ai/config';

describe('modelSupportsTemperature', () => {
  it('should return false for GPT-5-mini models', () => {
    expect(modelSupportsTemperature('gpt-5-mini')).toBe(false);
    expect(modelSupportsTemperature('GPT-5-MINI')).toBe(false);
    expect(modelSupportsTemperature('gpt-5-mini-128k')).toBe(false);
  });

  it('should return false for o1 models', () => {
    expect(modelSupportsTemperature('o1-mini')).toBe(false);
    expect(modelSupportsTemperature('o1-preview')).toBe(false);
    expect(modelSupportsTemperature('O1-MINI')).toBe(false);
  });

  it('should return false for o3 models', () => {
    expect(modelSupportsTemperature('o3-mini')).toBe(false);
    expect(modelSupportsTemperature('O3-MINI')).toBe(false);
  });

  it('should return true for standard GPT models', () => {
    expect(modelSupportsTemperature('gpt-4')).toBe(true);
    expect(modelSupportsTemperature('gpt-4-turbo')).toBe(true);
    expect(modelSupportsTemperature('gpt-3.5-turbo')).toBe(true);
    expect(modelSupportsTemperature('gpt-4o')).toBe(true);
  });

  it('should return true for Claude models', () => {
    expect(modelSupportsTemperature('claude-3-sonnet-20240229')).toBe(true);
    expect(modelSupportsTemperature('claude-3-opus-20240229')).toBe(true);
  });

  it('should handle empty or undefined model names', () => {
    expect(modelSupportsTemperature('')).toBe(true);
    expect(modelSupportsTemperature(undefined as any)).toBe(true);
  });
});