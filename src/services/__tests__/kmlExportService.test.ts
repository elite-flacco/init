import { describe, it, expect } from 'vitest';
import { KMLExportService } from '../kmlExportService';
import { EnhancedTravelPlan } from '../../types/travel';

describe('KMLExportService', () => {
  const mockTravelPlan: EnhancedTravelPlan = {
    destination: {
      id: 'tokyo',
      name: 'Tokyo',
      country: 'Japan',
      description: 'Capital of Japan',
      image: 'tokyo.jpg',
      highlights: ['Shibuya', 'Harajuku'],
      bestTime: 'Spring',
      budget: '$$',
    },
    placesToVisit: [
      {
        name: 'Senso-ji Temple',
        description: 'Ancient Buddhist temple',
        category: 'Religious Site',
        priority: 5,
      },
      {
        name: 'Tokyo Skytree',
        description: 'Tallest tower in Japan',
        category: 'Landmark',
        priority: 4,
      },
    ],
    neighborhoods: [
      {
        name: 'Shibuya',
        summary: 'Bustling commercial district',
        vibe: 'Energetic',
        pros: ['Great shopping', 'Nightlife'],
        cons: ['Crowded'],
        bestFor: 'Young travelers',
      },
    ],
    hotelRecommendations: [
      {
        name: 'Park Hyatt Tokyo',
        neighborhood: 'Shinjuku',
        priceRange: '$$$',
        description: 'Luxury hotel with city views',
        amenities: ['Spa', 'Pool', 'Restaurant'],
      },
    ],
    restaurants: [
      {
        name: 'Sukiyabashi Jiro',
        cuisine: 'Sushi',
        priceRange: '$$$$',
        description: 'World-famous sushi restaurant',
        neighborhood: 'Ginza',
        specialDishes: ['Tuna', 'Sea urchin'],
        reservationsRecommended: 'Yes',
      },
    ],
    bars: [
      {
        name: 'New York Bar',
        type: 'cocktail' as const,
        atmosphere: 'Upscale',
        description: 'High-end cocktail bar with city views',
        category: 'Cocktail Bar',
        neighborhood: 'Shinjuku',
      },
    ],
    weatherInfo: {
      season: 'Spring',
      temperature: '15-20°C',
      conditions: 'Mild and pleasant',
      humidity: 'Moderate',
      dayNightTempDifference: '5°C',
      airQuality: 'Good',
      feelsLikeWarning: 'None',
      recommendations: ['Bring light jacket'],
    },
    socialEtiquette: ['Bow when greeting', 'Remove shoes indoors'],
    safetyTips: ['Keep cash handy', 'Learn basic Japanese phrases'],
    transportationInfo: {
      publicTransport: 'Excellent subway system',
      creditCardPayment: false,
      airportTransport: {
        airports: [
          {
            name: 'Haneda Airport',
            code: 'HND',
            distanceToCity: '30 minutes',
            transportOptions: [
              {
                type: 'Train',
                cost: '¥500',
                duration: '30 minutes',
                description: 'Direct train to city center',
              },
            ],
          },
        ],
      },
      ridesharing: 'Limited Uber availability',
      taxiInfo: {
        available: true,
        averageCost: '¥2000 for short trips',
        tips: ['Cash only', 'Doors open automatically'],
      },
    },
    localCurrency: {
      currency: 'Japanese Yen (¥)',
      cashNeeded: true,
      creditCardUsage: 'Limited acceptance',
      tips: ['Use cash for small purchases'],
    },
    tipEtiquette: {
      restaurants: 'No tipping required',
      bars: 'No tipping required',
      taxis: 'No tipping required',
      hotels: 'Not expected',
      tours: 'Not expected',
      general: 'Tipping is not part of Japanese culture',
    },
    activities: [
      {
        name: 'Traditional Tea Ceremony',
        type: 'Cultural Experience',
        description: 'Learn the art of Japanese tea ceremony',
        duration: '2 hours',
        localSpecific: true,
        experienceType: 'getyourguide' as const,
      },
    ],
    mustTryFood: {
      items: [
        {
          name: 'Ramen',
          description: 'Japanese noodle soup',
          category: 'main' as const,
          whereToFind: 'Ramen shops throughout the city',
        },
        {
          name: 'Mochi',
          description: 'Sweet rice cake',
          category: 'dessert' as const,
          whereToFind: 'Traditional sweet shops',
        },
      ],
    },
    tapWaterSafe: {
      safe: true,
      details: 'Tap water is safe to drink throughout Japan',
    },
    localEvents: [
      {
        name: 'Cherry Blossom Festival',
        type: 'Cultural Festival',
        description: 'Celebrate spring cherry blossoms',
        dates: 'March-April',
        location: 'Various parks',
      },
    ],
    history: 'Tokyo became the capital of Japan in 1868',
    itinerary: [
      {
        day: 1,
        title: 'Traditional Tokyo',
        activities: [
          {
            time: '9:00 AM',
            title: 'Visit Senso-ji Temple',
            description: 'Explore the ancient Buddhist temple',
            location: 'Asakusa',
            icon: 'compass',
          },
          {
            time: '2:00 PM',
            title: 'Tokyo National Museum',
            description: 'Learn about Japanese history and culture',
            location: 'Ueno',
            icon: 'map',
          },
        ],
      },
    ],
  };

  it('should generate valid KML content', async () => {
    const kml = await KMLExportService.generateKML(mockTravelPlan, { useRealCoordinates: false });
    
    expect(kml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(kml).toContain('<kml xmlns="http://www.opengis.net/kml/2.2">');
    expect(kml).toContain('<name>Tokyo Travel Plan</name>');
    expect(kml).toContain('<description>Your personalized travel plan for Tokyo, Japan</description>');
    expect(kml).toContain('<Point>');
    expect(kml).toContain('<coordinates>');
    expect(kml).toContain('</kml>');
  });

  it('should include itinerary placemarks', async () => {
    const kml = await KMLExportService.generateKML(mockTravelPlan, { includeItinerary: true, useRealCoordinates: false });
    
    expect(kml).toContain('<name>Daily Itinerary</name>');
    expect(kml).toContain('Day 1: Visit Senso-ji Temple');
    expect(kml).toContain('Day 1: Tokyo National Museum');
    expect(kml).toContain('<Point>');
    expect(kml).toContain('<coordinates>');
  });

  it('should include places to visit placemarks', async () => {
    const kml = await KMLExportService.generateKML(mockTravelPlan, { includePlaces: true, useRealCoordinates: false });
    
    expect(kml).toContain('<name>Places to Visit</name>');
    expect(kml).toContain('Senso-ji Temple');
    expect(kml).toContain('Tokyo Skytree');
    expect(kml).toContain('Ancient Buddhist temple');
    expect(kml).toContain('<Point>');
    expect(kml).toContain('<coordinates>');
  });

  it('should include restaurant placemarks', async () => {
    const kml = await KMLExportService.generateKML(mockTravelPlan, { includeRestaurants: true, useRealCoordinates: false });
    
    expect(kml).toContain('<name>Restaurants</name>');
    expect(kml).toContain('Sukiyabashi Jiro');
    expect(kml).toContain('World-famous sushi restaurant');
    expect(kml).toContain('Reservations recommended');
    expect(kml).toContain('<Point>');
    expect(kml).toContain('<coordinates>');
  });

  it('should include bar placemarks', async () => {
    const kml = await KMLExportService.generateKML(mockTravelPlan, { includeBars: true, useRealCoordinates: false });
    
    expect(kml).toContain('<name>Bars and Nightlife</name>');
    expect(kml).toContain('New York Bar');
    expect(kml).toContain('High-end cocktail bar with city views');
    expect(kml).toContain('<Point>');
    expect(kml).toContain('<coordinates>');
  });

  it('should include hotel placemarks', async () => {
    const kml = await KMLExportService.generateKML(mockTravelPlan, { includeHotels: true, useRealCoordinates: false });
    
    expect(kml).toContain('<name>Accommodation</name>');
    expect(kml).toContain('Park Hyatt Tokyo');
    expect(kml).toContain('Luxury hotel with city views');
    expect(kml).toContain('<Point>');
    expect(kml).toContain('<coordinates>');
  });

  it('should properly escape XML characters', async () => {
    const mockPlanWithSpecialChars: EnhancedTravelPlan = {
      ...mockTravelPlan,
      placesToVisit: [
        {
          name: 'Place with <special> & "characters"',
          description: 'Description with <tags> & "quotes"',
          category: 'Test',
          priority: 1,
        },
      ],
    };

    const kml = await KMLExportService.generateKML(mockPlanWithSpecialChars, { useRealCoordinates: false });
    
    expect(kml).toContain('Place with &lt;special&gt; &amp; &quot;characters&quot;');
    expect(kml).toContain('<![CDATA[');
    expect(kml).toContain('Description with &lt;tags&gt; &amp; &quot;quotes&quot;');
  });

  it('should respect export options', async () => {
    const kml = await KMLExportService.generateKML(mockTravelPlan, {
      includeItinerary: false,
      includePlaces: false,
      includeRestaurants: true,
      includeBars: false,
      includeHotels: false,
      useRealCoordinates: false,
    });
    
    expect(kml).not.toContain('<name>Daily Itinerary</name>');
    expect(kml).not.toContain('<name>Places to Visit</name>');
    expect(kml).toContain('<name>Restaurants</name>');
    expect(kml).not.toContain('<name>Bars and Nightlife</name>');
    expect(kml).not.toContain('<name>Accommodation</name>');
  });
});