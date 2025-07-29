import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeocodingService } from '../geocodingService';

// Mock fetch globally
global.fetch = vi.fn() as unknown as typeof fetch;

describe('GeocodingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    GeocodingService.clearCache();
  });

  it('should geocode a place successfully', async () => {
    const mockResponse = [{
      lat: '35.7148',
      lon: '139.7967',
      display_name: 'Senso-ji Temple, Asakusa, Tokyo, Japan'
    }];

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const result = await GeocodingService.geocodePlace('Senso-ji Temple', 'Tokyo', 'Japan', 'attraction');

    expect(result.found).toBe(true);
    expect(result.coordinates.latitude).toBe(35.7148);
    expect(result.coordinates.longitude).toBe(139.7967);
    expect(result.displayName).toBe('Senso-ji Temple, Asakusa, Tokyo, Japan');
  });

  it('should return fallback coordinates when geocoding fails', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => []
    });

    const result = await GeocodingService.geocodePlace('Unknown Place', 'Tokyo', 'Japan');

    expect(result.found).toBe(false);
    expect(result.coordinates.latitude).toBe(35.6895); // Tokyo fallback
    expect(result.coordinates.longitude).toBe(139.6917);
    expect(result.displayName).toBe('Unknown Place (approximate location)');
  });

  it('should use cached results for repeated queries', async () => {
    const mockResponse = [{
      lat: '35.7148',
      lon: '139.7967',
      display_name: 'Senso-ji Temple, Asakusa, Tokyo, Japan'
    }];

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    // First call
    const result1 = await GeocodingService.geocodePlace('Senso-ji Temple', 'Tokyo', 'Japan');
    
    // Second call (should use cache)
    const result2 = await GeocodingService.geocodePlace('Senso-ji Temple', 'Tokyo', 'Japan');

    expect(fetch).toHaveBeenCalledTimes(1); // Only called once due to caching
    expect(result1).toEqual(result2);
  });

  it('should handle network errors gracefully', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));

    const result = await GeocodingService.geocodePlace('Test Place', 'Tokyo', 'Japan');

    expect(result.found).toBe(false);
    expect(result.coordinates.latitude).toBe(35.6895); // Tokyo fallback
    expect(result.coordinates.longitude).toBe(139.6917);
  });

  it('should batch geocode multiple places', async () => {
    const mockResponse1 = [{
      lat: '35.7148',
      lon: '139.7967',
      display_name: 'Senso-ji Temple, Asakusa, Tokyo, Japan'
    }];

    const mockResponse2 = [{
      lat: '35.7101',
      lon: '139.8107',
      display_name: 'Tokyo Skytree, Sumida, Tokyo, Japan'
    }];

    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse1
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse2
      });

    const places = [
      { name: 'Senso-ji Temple', type: 'temple' },
      { name: 'Tokyo Skytree', type: 'landmark' }
    ];

    const results = await GeocodingService.geocodePlaces(places, 'Tokyo', 'Japan');

    expect(results.size).toBe(2);
    expect(results.get('Senso-ji Temple')?.found).toBe(true);
    expect(results.get('Tokyo Skytree')?.found).toBe(true);
  });

  it('should clear cache when requested', async () => {
    const mockResponse = [{
      lat: '35.7148',
      lon: '139.7967',
      display_name: 'Senso-ji Temple, Asakusa, Tokyo, Japan'
    }];

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    });

    // First call
    await GeocodingService.geocodePlace('Senso-ji Temple', 'Tokyo', 'Japan');
    
    // Clear cache
    GeocodingService.clearCache();
    
    // Second call (should make new request)
    await GeocodingService.geocodePlace('Senso-ji Temple', 'Tokyo', 'Japan');

    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('should reject coordinates too far from city center', async () => {
    // Mock response with coordinates in New York (far from Tokyo)
    const mockResponse = [{
      lat: '40.7128',
      lon: '-74.0060',
      display_name: 'Some Place, New York, USA'
    }];

    // Mock multiple responses: first with bad coordinates, then empty results
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })
      .mockResolvedValue({
        ok: true,
        json: async () => []
      });

    const result = await GeocodingService.geocodePlace('Test Place', 'Tokyo', 'Japan');

    // Should fallback to Tokyo coordinates since NYC is too far
    expect(result.found).toBe(false);
    expect(result.coordinates.latitude).toBe(35.6895); // Tokyo fallback
    expect(result.coordinates.longitude).toBe(139.6917);
  });

  it('should use place type for better search queries', async () => {
    const mockResponse = [{
      lat: '35.7148',
      lon: '139.7967',
      display_name: 'Restaurant Name, Tokyo, Japan'
    }];

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    await GeocodingService.geocodePlace('Restaurant Name', 'Tokyo', 'Japan', 'restaurant');

    // Should have been called with a type-specific query first
    const firstCall = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const url = new URL(firstCall[0]);
    const query = url.searchParams.get('q');
    
    // Should include either 'restaurant', 'dining', or 'food' (from the type keywords)
    expect(query && (query.includes('restaurant') || query.includes('dining') || query.includes('food'))).toBe(true);
  });
});