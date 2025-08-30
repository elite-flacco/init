import { EnhancedTravelPlan } from "../types/travel";
import { GeocodingService } from "./geocodingService";

export interface KMLExportOptions {
  includeItinerary?: boolean;
  includePlaces?: boolean;
  includeRestaurants?: boolean;
  includeBars?: boolean;
  includeHotels?: boolean;
  useRealCoordinates?: boolean;
}

export interface Coordinates {
  longitude: number;
  latitude: number;
}

export class KMLExportService {
  // Cache for destination coordinates to avoid repeated geocoding
  private static destinationCache = new Map<string, Coordinates>();

  private static escapeXML(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /**
   * Generate Google Maps search link for a place
   */
  private static generateGoogleMapsLink(
    placeName: string,
    cityName: string,
    countryName: string,
  ): string {
    const query = encodeURIComponent(
      `${placeName}, ${cityName}, ${countryName}`,
    );
    return `https://www.google.com/maps/search/${query}`;
  }

  // Default coordinates for major cities (longitude, latitude)
  private static cityCoordinates: Record<string, Coordinates> = {
    tokyo: { longitude: 139.6917, latitude: 35.6895 },
    london: { longitude: -0.1276, latitude: 51.5074 },
    paris: { longitude: 2.3522, latitude: 48.8566 },
    "new york": { longitude: -74.006, latitude: 40.7128 },
    rome: { longitude: 12.4964, latitude: 41.9028 },
    barcelona: { longitude: 2.1734, latitude: 41.3851 },
    amsterdam: { longitude: 4.9041, latitude: 52.3676 },
    berlin: { longitude: 13.405, latitude: 52.52 },
    sydney: { longitude: 151.2093, latitude: -33.8688 },
    bangkok: { longitude: 100.5018, latitude: 13.7563 },
    singapore: { longitude: 103.8198, latitude: 1.3521 },
    dubai: { longitude: 55.2708, latitude: 25.2048 },
    istanbul: { longitude: 28.9784, latitude: 41.0082 },
    mumbai: { longitude: 72.8777, latitude: 19.076 },
    "buenos aires": { longitude: -58.3816, latitude: -34.6037 },
  };

  private static getDestinationCoordinates(
    destinationName: string,
  ): Coordinates {
    const key = destinationName.toLowerCase();
    return this.cityCoordinates[key] || { longitude: 0, latitude: 0 };
  }

  /**
   * Get destination coordinates using geocoding service with caching
   */
  private static async getDestinationCoordinatesAsync(
    destinationName: string,
    countryName: string,
  ): Promise<Coordinates> {
    const cacheKey = `${destinationName}, ${countryName}`.toLowerCase();

    // Check cache first
    if (this.destinationCache.has(cacheKey)) {
      return this.destinationCache.get(cacheKey)!;
    }

    try {
      const geocodingResult = await GeocodingService.geocodePlace(
        destinationName,
        destinationName,
        countryName,
        "city",
      );

      // Cache the result
      this.destinationCache.set(cacheKey, geocodingResult.coordinates);
      return geocodingResult.coordinates;
    } catch {
      // Fall back to hardcoded coordinates if available
      const fallback = this.getDestinationCoordinates(destinationName);
      this.destinationCache.set(cacheKey, fallback);
      return fallback;
    }
  }

  /**
   * Add delay to avoid rate limiting
   */
  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private static calculateDistance(
    coord1: Coordinates,
    coord2: Coordinates,
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
    const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((coord1.latitude * Math.PI) / 180) *
        Math.cos((coord2.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Fast bounds checking - much quicker than distance calculation
   */
  private static isWithinBounds(
    coords: Coordinates,
    baseCoords: Coordinates,
    degreesRadius: number = 1,
  ): boolean {
    const latDiff = Math.abs(coords.latitude - baseCoords.latitude);
    const lonDiff = Math.abs(coords.longitude - baseCoords.longitude);
    return latDiff <= degreesRadius && lonDiff <= degreesRadius;
  }

  /**
   * Check if coordinates are valid (not 0,0 and within reasonable distance from base)
   * Uses fast bounds checking first, then precise distance calculation only if needed
   */
  private static isValidCoordinates(
    coords: Coordinates,
    baseCoords: Coordinates,
    maxDistanceKm: number = 200,
  ): boolean {
    // Check for 0,0 coordinates (invalid geocoding result)
    if (coords.latitude === 0 && coords.longitude === 0) {
      return false;
    }

    // If base coordinates are 0,0 (geocoding failed for destination), accept any non-zero coordinates
    if (baseCoords.latitude === 0 && baseCoords.longitude === 0) {
      return true;
    }

    // More generous distance check (200km default to allow for day trips)
    const distance = this.calculateDistance(coords, baseCoords);
    return distance <= maxDistanceKm;
  }

  private static generateRandomNearbyCoordinates(
    baseCoords: Coordinates,
    radiusKm: number = 10,
  ): Coordinates {
    // Generate random coordinates within a radius around the base coordinates
    const earthRadius = 6371; // Earth's radius in kilometers
    const randomDistance = Math.random() * radiusKm;
    const randomBearing = Math.random() * 2 * Math.PI;

    const lat1 = (baseCoords.latitude * Math.PI) / 180;
    const lon1 = (baseCoords.longitude * Math.PI) / 180;

    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(randomDistance / earthRadius) +
        Math.cos(lat1) *
          Math.sin(randomDistance / earthRadius) *
          Math.cos(randomBearing),
    );

    const lon2 =
      lon1 +
      Math.atan2(
        Math.sin(randomBearing) *
          Math.sin(randomDistance / earthRadius) *
          Math.cos(lat1),
        Math.cos(randomDistance / earthRadius) -
          Math.sin(lat1) * Math.sin(lat2),
      );

    return {
      latitude: (lat2 * 180) / Math.PI,
      longitude: (lon2 * 180) / Math.PI,
    };
  }

  private static generatePlacemark(
    name: string,
    description: string,
    coordinates: Coordinates,
    styleId?: string,
  ): string {
    return `    <Placemark>
      <name>${this.escapeXML(name)}</name>
      <description><![CDATA[${description}]]></description>
      ${styleId ? `<styleUrl>#${styleId}</styleUrl>` : ""}
      <Point>
        <coordinates>${coordinates.longitude},${coordinates.latitude},0</coordinates>
      </Point>
    </Placemark>`;
  }

  private static async generateItineraryPlacemarks(
    plan: EnhancedTravelPlan,
    useRealCoordinates: boolean = false,
  ): Promise<string> {
    if (!plan.itinerary || plan.itinerary.length === 0) {
      return "";
    }

    const baseCoords = await this.getDestinationCoordinatesAsync(
      plan.destination.name,
      plan.destination.country,
    );
    const activities = plan.itinerary.flatMap((day) =>
      day.activities.map((activity) => ({ ...activity, day: day.day })),
    );

    let placemarks = "";
    for (const activity of activities) {
      let coordinates: Coordinates;

      if (useRealCoordinates && activity.location) {
        try {
          const geocodingResult = await GeocodingService.geocodePlace(
            activity.location,
            plan.destination.name,
            plan.destination.country,
            "attraction",
          );

          // Simple filtering: exclude 0,0 coordinates and places too far away
          if (
            this.isValidCoordinates(geocodingResult.coordinates, baseCoords)
          ) {
            coordinates = geocodingResult.coordinates;
          } else {
            coordinates = this.generateRandomNearbyCoordinates(baseCoords, 15);
          }

          // Add delay between requests to avoid rate limiting
          await this.delay(200);
        } catch {
          // Fall back to random coordinates on geocoding error
          coordinates = this.generateRandomNearbyCoordinates(baseCoords, 15);
        }
      } else {
        coordinates = this.generateRandomNearbyCoordinates(baseCoords, 15);
      }

      const name = `Day ${activity.day}: ${activity.title}`;
      const searchQuery = activity.location || activity.title;
      const mapsLink = this.generateGoogleMapsLink(
        searchQuery,
        plan.destination.name,
        plan.destination.country,
      );

      const description = `<div>
<h3>${this.escapeXML(activity.title)}</h3>
<p><b>Time:</b> ${this.escapeXML(activity.time)}</p>
${activity.location ? `<p><b>Location:</b> ${this.escapeXML(activity.location)}</p>` : ""}
${activity.description ? `<p>${this.escapeXML(activity.description)}</p>` : ""}
<p><a href="${mapsLink}" target="_blank">🗺️ Search on Google Maps</a></p>
</div>`;

      placemarks += this.generatePlacemark(
        name,
        description,
        coordinates,
        "itinerary-style",
      );
    }

    return `  <Folder>
    <name>Daily Itinerary</name>
    <description>Your day-by-day travel itinerary</description>
${placemarks}
  </Folder>`;
  }

  private static async generatePlacesToVisitPlacemarks(
    plan: EnhancedTravelPlan,
    useRealCoordinates: boolean = false,
  ): Promise<string> {
    if (!plan.placesToVisit || plan.placesToVisit.length === 0) {
      return "";
    }

    const baseCoords = await this.getDestinationCoordinatesAsync(
      plan.destination.name,
      plan.destination.country,
    );
    console.log("Base coordinates:", baseCoords);

    let placemarks = "";
    for (const place of plan.placesToVisit) {
      let coordinates: Coordinates;

      if (useRealCoordinates) {
        try {
          const geocodingResult = await GeocodingService.geocodePlace(
            place.name,
            plan.destination.name,
            plan.destination.country,
            "attraction",
          );

          // Simple filtering: exclude 0,0 coordinates and places too far away
          if (
            this.isValidCoordinates(geocodingResult.coordinates, baseCoords)
          ) {
            coordinates = geocodingResult.coordinates;
          } else {
            coordinates = this.generateRandomNearbyCoordinates(baseCoords, 20);
          }
        } catch {
          // Fall back to random coordinates on geocoding error
          coordinates = this.generateRandomNearbyCoordinates(baseCoords, 20);
        }
      } else {
        coordinates = this.generateRandomNearbyCoordinates(baseCoords, 20);
      }

      const mapsLink = this.generateGoogleMapsLink(
        place.name,
        plan.destination.name,
        plan.destination.country,
      );

      const description = `<div>
<h3>${this.escapeXML(place.name)}</h3>
<p><b>Category:</b> ${this.escapeXML(place.category)}</p>
<p>${this.escapeXML(place.description)}</p>
<p><a href="${mapsLink}" target="_blank">🗺️ Search on Google Maps</a></p>
</div>`;

      placemarks += this.generatePlacemark(
        place.name,
        description,
        coordinates,
        "attraction-style",
      );
    }

    return `  <Folder>
    <name>Places to Visit</name>
    <description>Top attractions and places of interest</description>
${placemarks}
  </Folder>`;
  }

  private static async generateRestaurantPlacemarks(
    plan: EnhancedTravelPlan,
    useRealCoordinates: boolean = false,
  ): Promise<string> {
    if (!plan.restaurants || plan.restaurants.length === 0) {
      return "";
    }

    const baseCoords = await this.getDestinationCoordinatesAsync(
      plan.destination.name,
      plan.destination.country,
    );

    let placemarks = "";
    for (const restaurant of plan.restaurants) {
      let coordinates: Coordinates;

      if (useRealCoordinates) {
        try {
          const geocodingResult = await GeocodingService.geocodePlace(
            restaurant.name,
            plan.destination.name,
            plan.destination.country,
            "restaurant",
          );

          // Simple filtering: exclude 0,0 coordinates and places too far away
          if (
            this.isValidCoordinates(geocodingResult.coordinates, baseCoords)
          ) {
            coordinates = geocodingResult.coordinates;
          } else {
            coordinates = this.generateRandomNearbyCoordinates(baseCoords, 18);
          }
        } catch {
          // Fall back to random coordinates on geocoding error
          coordinates = this.generateRandomNearbyCoordinates(baseCoords, 18);
        }
      } else {
        coordinates = this.generateRandomNearbyCoordinates(baseCoords, 18);
      }

      const mapsLink = this.generateGoogleMapsLink(
        restaurant.name,
        plan.destination.name,
        plan.destination.country,
      );

      const description = `<div>
<h3>${this.escapeXML(restaurant.name)}</h3>
<p><b>Cuisine:</b> ${this.escapeXML(restaurant.cuisine)}</p>
<p><b>Price Range:</b> ${this.escapeXML(restaurant.priceRange)}</p>
${restaurant.neighborhood ? `<p><b>Neighborhood:</b> ${this.escapeXML(restaurant.neighborhood)}</p>` : ""}
<p>${this.escapeXML(restaurant.description)}</p>
${restaurant.specialDishes ? `<p><b>Must Try:</b> ${this.escapeXML(restaurant.specialDishes.join(", "))}</p>` : ""}
${restaurant.reservationsRecommended === "Yes" ? "<p><b>Reservations recommended</b></p>" : ""}
<p><a href="${mapsLink}" target="_blank">🗺️ Search on Google Maps</a></p>
</div>`;

      placemarks += this.generatePlacemark(
        restaurant.name,
        description,
        coordinates,
        "restaurant-style",
      );
    }

    return `  <Folder>
    <name>Restaurants</name>
    <description>Recommended restaurants and dining spots</description>
${placemarks}
  </Folder>`;
  }

  private static async generateBarPlacemarks(
    plan: EnhancedTravelPlan,
    useRealCoordinates: boolean = false,
  ): Promise<string> {
    if (!plan.bars || plan.bars.length === 0) {
      return "";
    }

    const baseCoords = await this.getDestinationCoordinatesAsync(
      plan.destination.name,
      plan.destination.country,
    );

    let placemarks = "";
    for (const bar of plan.bars) {
      let coordinates: Coordinates;

      if (useRealCoordinates) {
        try {
          const geocodingResult = await GeocodingService.geocodePlace(
            bar.name,
            plan.destination.name,
            plan.destination.country,
            "bar",
          );

          // Simple filtering: exclude 0,0 coordinates and places too far away
          if (
            this.isValidCoordinates(geocodingResult.coordinates, baseCoords)
          ) {
            coordinates = geocodingResult.coordinates;
          } else {
            coordinates = this.generateRandomNearbyCoordinates(baseCoords, 16);
          }
        } catch {
          // Fall back to random coordinates on geocoding error
          coordinates = this.generateRandomNearbyCoordinates(baseCoords, 16);
        }
      } else {
        coordinates = this.generateRandomNearbyCoordinates(baseCoords, 16);
      }

      const mapsLink = this.generateGoogleMapsLink(
        bar.name,
        plan.destination.name,
        plan.destination.country,
      );

      const description = `<div>
<h3>${this.escapeXML(bar.name)}</h3>
<p><b>Type:</b> ${this.escapeXML(bar.type)}</p>
<p><b>Category:</b> ${this.escapeXML(bar.category)}</p>
<p><b>Atmosphere:</b> ${this.escapeXML(bar.atmosphere)}</p>
${bar.neighborhood ? `<p><b>Neighborhood:</b> ${this.escapeXML(bar.neighborhood)}</p>` : ""}
<p>${this.escapeXML(bar.description)}</p>
<p><a href="${mapsLink}" target="_blank">🗺️ Search on Google Maps</a></p>
</div>`;

      placemarks += this.generatePlacemark(
        bar.name,
        description,
        coordinates,
        "bar-style",
      );
    }

    return `  <Folder>
    <name>Bars and Nightlife</name>
    <description>Recommended bars and nightlife spots</description>
${placemarks}
  </Folder>`;
  }

  private static async generateHotelPlacemarks(
    plan: EnhancedTravelPlan,
    useRealCoordinates: boolean = false,
  ): Promise<string> {
    if (!plan.hotelRecommendations || plan.hotelRecommendations.length === 0) {
      return "";
    }

    const baseCoords = await this.getDestinationCoordinatesAsync(
      plan.destination.name,
      plan.destination.country,
    );

    let placemarks = "";
    for (const hotel of plan.hotelRecommendations) {
      let coordinates: Coordinates;

      if (useRealCoordinates) {
        try {
          const geocodingResult = await GeocodingService.geocodePlace(
            hotel.name,
            plan.destination.name,
            plan.destination.country,
            "hotel",
          );

          // Simple filtering: exclude 0,0 coordinates and places too far away
          if (
            this.isValidCoordinates(geocodingResult.coordinates, baseCoords)
          ) {
            coordinates = geocodingResult.coordinates;
          } else {
            coordinates = this.generateRandomNearbyCoordinates(baseCoords, 12);
          }

          // Add delay between requests to avoid rate limiting
          await this.delay(200);
        } catch {
          // Fall back to random coordinates on geocoding error
          coordinates = this.generateRandomNearbyCoordinates(baseCoords, 12);
        }
      } else {
        coordinates = this.generateRandomNearbyCoordinates(baseCoords, 12);
      }

      const mapsLink = this.generateGoogleMapsLink(
        hotel.name,
        plan.destination.name,
        plan.destination.country,
      );

      const description = `<div>
<h3>${this.escapeXML(hotel.name)}</h3>
<p><b>Neighborhood:</b> ${this.escapeXML(hotel.neighborhood)}</p>
<p><b>Price Range:</b> ${this.escapeXML(hotel.priceRange)}</p>
<p>${this.escapeXML(hotel.description)}</p>
${hotel.amenities ? `<p><b>Amenities:</b> ${this.escapeXML(hotel.amenities.join(", "))}</p>` : ""}
<p><a href="${mapsLink}" target="_blank">🗺️ Search on Google Maps</a></p>
</div>`;

      placemarks += this.generatePlacemark(
        hotel.name,
        description,
        coordinates,
        "hotel-style",
      );
    }

    return `  <Folder>
    <name>Accommodation</name>
    <description>Recommended hotels and accommodations</description>
${placemarks}
  </Folder>`;
  }

  static async generateKML(
    plan: EnhancedTravelPlan,
    options: KMLExportOptions = {},
  ): Promise<string> {
    const defaultOptions: KMLExportOptions = {
      includeItinerary: true,
      includePlaces: true,
      includeRestaurants: true,
      includeBars: true,
      includeHotels: true,
      useRealCoordinates: true,
      ...options,
    };

    const folders = [];

    if (defaultOptions.includePlaces) {
      folders.push(
        await this.generatePlacesToVisitPlacemarks(
          plan,
          defaultOptions.useRealCoordinates,
        ),
      );
    }

    if (defaultOptions.includeRestaurants) {
      folders.push(
        await this.generateRestaurantPlacemarks(
          plan,
          defaultOptions.useRealCoordinates,
        ),
      );
    }

    if (defaultOptions.includeBars) {
      folders.push(
        await this.generateBarPlacemarks(
          plan,
          defaultOptions.useRealCoordinates,
        ),
      );
    }

    const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${this.escapeXML(plan.destination.name)} Travel Plan</name>
    <description>Your personalized travel plan for ${this.escapeXML(plan.destination.name)}, ${this.escapeXML(plan.destination.country)}</description>
    
    <Style id="itinerary-style">
      <IconStyle>
        <Icon>
          <href>https://maps.google.com/mapfiles/kml/paddle/red-circle.png</href>
        </Icon>
      </IconStyle>
    </Style>
    
    <Style id="attraction-style">
      <IconStyle>
        <Icon>
          <href>https://maps.google.com/mapfiles/kml/paddle/blu-circle.png</href>
        </Icon>
      </IconStyle>
    </Style>
    
    <Style id="restaurant-style">
      <IconStyle>
        <Icon>
          <href>https://maps.google.com/mapfiles/kml/paddle/grn-circle.png</href>
        </Icon>
      </IconStyle>
    </Style>
    
    <Style id="bar-style">
      <IconStyle>
        <Icon>
          <href>https://maps.google.com/mapfiles/kml/paddle/orange-circle.png</href>
        </Icon>
      </IconStyle>
    </Style>
    
    <Style id="hotel-style">
      <IconStyle>
        <Icon>
          <href>https://maps.google.com/mapfiles/kml/paddle/purple-circle.png</href>
        </Icon>
      </IconStyle>
    </Style>

${folders.filter((folder) => folder.trim()).join("\n")}
  </Document>
</kml>`;

    return kml;
  }

  static async downloadKML(
    plan: EnhancedTravelPlan,
    filename?: string,
    options?: KMLExportOptions,
  ): Promise<void> {
    // console.log('Generating KML content...');
    const kmlContent = await this.generateKML(plan, options);
    // console.log('KML content generated, size:', kmlContent.length);

    const blob = new Blob([kmlContent], {
      type: "application/vnd.google-earth.kml+xml",
    });
    const url = URL.createObjectURL(blob);

    const defaultFilename = `${plan.destination.name.replace(/[^a-zA-Z0-9]/g, "_")}_travel_plan.kml`;
    // console.log('Creating download link for:', defaultFilename);

    // Try multiple download methods to ensure compatibility
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || defaultFilename;
    link.style.display = "none";

    // Add to DOM temporarily to ensure it works in all browsers
    document.body.appendChild(link);

    // Force click event
    const clickEvent = new MouseEvent("click", {
      view: window,
      bubbles: true,
      cancelable: true,
    });

    link.dispatchEvent(clickEvent);

    // Clean up after a short delay
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      // console.log('Download cleanup completed');
    }, 100);
  }
}
