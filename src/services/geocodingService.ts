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
  static async geocodePlace(
    placeName: string, 
    cityName: string, 
    countryName: string,
    placeType?: 'restaurant' | 'hotel' | 'attraction' | 'bar' | 'activity'
  ): Promise<GeocodingResult> {
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
      // Generate search queries based on place type for better accuracy
      const searchQueries = this.generateSearchQueries(placeName, cityName, countryName, placeType);

      const cityCoords = this.getCityFallbackCoordinates(cityName);
      
      for (const query of searchQueries) {
        // Add timeout to prevent hanging
        const result = await Promise.race([
          this.performGeocodingRequest(query),
          new Promise<GeocodingResult>((_, reject) => 
            setTimeout(() => reject(new Error('Geocoding timeout')), 5000)
          )
        ]);
        
        if (result.found) {
          // Validate that the result is geographically reasonable (within ~100km of city center)
          if (this.isCoordinateReasonable(result.coordinates, cityCoords, cityName)) {
            this.cache.set(cacheKey, result);
            return result;
          } else {
            console.warn(`Geocoding result for "${placeName}" is too far from ${cityName}:`, result.coordinates);
            // Continue to next query instead of using this result
          }
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

  /**
   * Generate search queries optimized for different place types
   */
  private static generateSearchQueries(
    placeName: string, 
    cityName: string, 
    countryName: string,
    placeType?: string
  ): string[] {
    const baseQueries = [
      `${placeName}, ${cityName}, ${countryName}`,
      `${placeName} ${cityName} ${countryName}`, // Try without commas
      `${placeName}, ${cityName}`,
    ];

    // Add type-specific queries for better accuracy
    if (placeType) {
      const typeKeywords = {
        restaurant: ['restaurant', 'dining', 'food'],
        hotel: ['hotel', 'accommodation', 'lodging'],
        attraction: ['attraction', 'tourist site', 'landmark'],
        bar: ['bar', 'pub', 'nightlife'],
        activity: ['activity', 'tour', 'experience']
      };

      const keywords = typeKeywords[placeType as keyof typeof typeKeywords] || [];
      
      // Add type-specific queries at the beginning (higher priority)
      keywords.forEach(keyword => {
        baseQueries.unshift(`${placeName} ${keyword}, ${cityName}, ${countryName}`);
      });
    }

    // Add fallback queries
    baseQueries.push(
      `${placeName} near ${cityName}, ${countryName}`, // Add "near" for better context
      `${placeName}, ${countryName}` // Only try country if city-specific searches fail
    );

    return baseQueries;
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
   * Check if coordinates are geographically reasonable for the given city
   */
  private static isCoordinateReasonable(
    coords: Coordinates, 
    cityCoords: Coordinates, 
    cityName: string
  ): boolean {
    // If city coordinates are not available (0,0), accept any non-zero coordinates
    if (cityCoords.latitude === 0 && cityCoords.longitude === 0) {
      return coords.latitude !== 0 || coords.longitude !== 0;
    }

    // Calculate distance between coordinates using Haversine formula
    const distance = this.calculateDistance(coords, cityCoords);
    
    // Set reasonable distance limits based on city size
    const maxDistance = this.getMaxDistanceForCity(cityName);
    
    const isReasonable = distance <= maxDistance;
    
    if (!isReasonable) {
      console.log(`Distance check: ${distance.toFixed(2)}km from ${cityName} center (max: ${maxDistance}km)`);
    }
    
    return isReasonable;
  }

  /**
   * Calculate distance between two coordinates in kilometers
   */
  private static calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (coord2.latitude - coord1.latitude) * Math.PI / 180;
    const dLon = (coord2.longitude - coord1.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(coord1.latitude * Math.PI / 180) * Math.cos(coord2.latitude * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Get maximum reasonable distance from city center based on city size
   */
  private static getMaxDistanceForCity(cityName: string): number {
    const city = cityName.toLowerCase();
    
    // Large metropolitan areas
    if (['tokyo', 'new york', 'london', 'paris', 'los angeles', 'chicago', 'houston'].includes(city)) {
      return 50; // 50km radius for major metropolitan areas
    }
    
    // Medium cities
    if (['amsterdam', 'berlin', 'barcelona', 'rome', 'sydney', 'singapore'].includes(city)) {
      return 30; // 30km radius for medium cities
    }
    
    // Default for other cities
    return 25; // 25km radius for smaller cities
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