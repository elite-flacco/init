import { Coordinates } from './kmlExportService';

export interface GeocodingResult {
  coordinates: Coordinates;
  displayName: string;
  found: boolean;
}

export class GeocodingService {
  private static readonly NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
  private static readonly REQUEST_DELAY = 1100; // Nominatim requires 1 request per second
  private static cache = new Map<string, GeocodingResult>();
  private static lastRequestTime = 0;

  /**
   * Geocode a place name to get real coordinates
   */
  static async geocodePlace(placeName: string, cityName: string, countryName: string): Promise<GeocodingResult> {
    const cacheKey = `${placeName}-${cityName}-${countryName}`.toLowerCase();
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Rate limiting for Nominatim API
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.REQUEST_DELAY) {
      await new Promise(resolve => setTimeout(resolve, this.REQUEST_DELAY - timeSinceLastRequest));
    }

    try {
      // Try multiple search queries with decreasing specificity
      const searchQueries = [
        `${placeName}, ${cityName}, ${countryName}`,
        `${placeName}, ${cityName}`,
        `${placeName}, ${countryName}`,
        placeName
      ];

      for (const query of searchQueries) {
        // Add timeout to prevent hanging
        const result = await Promise.race([
          this.performGeocodingRequest(query),
          new Promise<GeocodingResult>((_, reject) => 
            setTimeout(() => reject(new Error('Geocoding timeout')), 5000)
          )
        ]);
        
        if (result.found) {
          this.cache.set(cacheKey, result);
          return result;
        }
      }

      // If no results found, return fallback
      const fallbackResult: GeocodingResult = {
        coordinates: this.getCityFallbackCoordinates(cityName),
        displayName: `${placeName} (approximate location)`,
        found: false
      };
      
      this.cache.set(cacheKey, fallbackResult);
      return fallbackResult;

    } catch (error) {
      console.warn(`Geocoding failed for ${placeName}:`, error);
      
      const fallbackResult: GeocodingResult = {
        coordinates: this.getCityFallbackCoordinates(cityName),
        displayName: `${placeName} (approximate location)`,
        found: false
      };
      
      this.cache.set(cacheKey, fallbackResult);
      return fallbackResult;
    }
  }

  private static async performGeocodingRequest(query: string): Promise<GeocodingResult> {
    this.lastRequestTime = Date.now();
    
    const url = new URL(this.NOMINATIM_URL);
    url.searchParams.set('q', query);
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', '1');
    url.searchParams.set('addressdetails', '1');

    // console.log('Geocoding request for:', query);

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'TravelPlanningApp/1.0'
      }
    });

    if (!response.ok) {
      console.warn(`Geocoding request failed: ${response.status}`);
      throw new Error(`Geocoding request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = data[0];
      // console.log('Geocoding success for:', query, 'coords:', result.lat, result.lon);
      return {
        coordinates: {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon)
        },
        displayName: result.display_name,
        found: true
      };
    }

    // console.log('No geocoding results for:', query);
    return {
      coordinates: { latitude: 0, longitude: 0 },
      displayName: query,
      found: false
    };
  }

  /**
   * Get fallback coordinates for major cities
   */
  private static getCityFallbackCoordinates(cityName: string): Coordinates {
    const cityCoordinates: Record<string, Coordinates> = {
      'tokyo': { longitude: 139.6917, latitude: 35.6895 },
      'london': { longitude: -0.1276, latitude: 51.5074 },
      'paris': { longitude: 2.3522, latitude: 48.8566 },
      'new york': { longitude: -74.0060, latitude: 40.7128 },
      'rome': { longitude: 12.4964, latitude: 41.9028 },
      'barcelona': { longitude: 2.1734, latitude: 41.3851 },
      'amsterdam': { longitude: 4.9041, latitude: 52.3676 },
      'berlin': { longitude: 13.4050, latitude: 52.5200 },
      'sydney': { longitude: 151.2093, latitude: -33.8688 },
      'bangkok': { longitude: 100.5018, latitude: 13.7563 },
      'singapore': { longitude: 103.8198, latitude: 1.3521 },
      'dubai': { longitude: 55.2708, latitude: 25.2048 },
      'istanbul': { longitude: 28.9784, latitude: 41.0082 },
      'mumbai': { longitude: 72.8777, latitude: 19.0760 },
      'buenos aires': { longitude: -58.3816, latitude: -34.6037 },
    };

    const key = cityName.toLowerCase();
    return cityCoordinates[key] || { longitude: 0, latitude: 0 };
  }

  /**
   * Batch geocode multiple places with proper rate limiting
   */
  static async geocodePlaces(
    places: Array<{ name: string; type: string }>, 
    cityName: string, 
    countryName: string
  ): Promise<Map<string, GeocodingResult>> {
    const results = new Map<string, GeocodingResult>();
    
    for (const place of places) {
      const result = await this.geocodePlace(place.name, cityName, countryName);
      results.set(place.name, result);
    }
    
    return results;
  }

  /**
   * Clear the geocoding cache
   */
  static clearCache(): void {
    this.cache.clear();
  }
}