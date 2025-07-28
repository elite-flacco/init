import { 
  Destination, 
  TripPreferences, 
  TravelerType, 
  Neighborhood, 
  HotelRecommendation, 
  WeatherInfo, 
  TransportationInfo, 
  CurrencyInfo, 
  TipEtiquette, 
  RecommendedActivity, 
  MustTryFood, 
  TapWaterInfo, 
  LocalEvent,
  Bar
} from '../../types/travel';
import { AITripPlanningResponse } from '../../services/aiTripPlanningService';

// Generate tap water safety information
const generateTapWaterInfo = (destination: Destination) => {
  const waterSafety: Record<string, { safe: boolean; details: string; recommendations?: string[] }> = {
    'Paris': {
      safe: true,
      details: 'Tap water in Paris is safe to drink and meets all EU and French standards for water quality.',
      recommendations: [
        'You can ask for "une carafe d\'eau" (a carafe of tap water) at restaurants for free.',
        'The water has a high mineral content, which some people might find affects the taste.'
      ]
    },
    'Tokyo': {
      safe: true,
      details: 'Tokyo has excellent tap water quality that is safe to drink.',
      recommendations: [
        'Many public places have water fountains where you can refill your water bottle.',
        'Some older buildings might have older pipes, so check with your accommodation if concerned.'
      ]
    },
    'New York': {
      safe: true,
      details: 'New York City tap water is among the cleanest in the United States and is safe to drink.',
      recommendations: [
        'The water has a unique taste due to its mineral content from the Catskill/Delaware watershed.',
        'Free water is available at any food service establishment that serves beverages.'
      ]
    },
    'default': {
      safe: false,
      details: 'It is generally recommended to drink bottled or filtered water in this destination.',
      recommendations: [
        'Use bottled water for drinking and brushing teeth.',
        'Avoid ice in drinks unless you\'re sure it\'s made from purified water.',
        'Check with your accommodation about their water safety recommendations.'
      ]
    }
  };

  return waterSafety[destination.name] || waterSafety['default'];
};

// Generate tipping etiquette based on destination
const generateTippingEtiquette = (destination: Destination): TipEtiquette => {
  const tippingEtiquette: Record<string, TipEtiquette> = {
    'Paris': {
      restaurants: 'Service charge is typically included ("service compris"), but it\'s common to leave 5-10% extra for good service.',
      bars: 'Small change or rounding up the bill is sufficient.',
      hotels: '1-2€ per bag for bellhops, 1-2€ per day for housekeeping.',
      taxis: 'Round up to the nearest euro or add 5-10% for good service.',
      tours: '5-10€ per person for full-day tours.',
      general: 'Tipping is appreciated but not obligatory in France.'
    },
    'Tokyo': {
      restaurants: 'Tipping is not customary and can even be considered rude in some places.',
      bars: 'No tipping expected.',
      hotels: 'No tipping expected, though some high-end hotels may accept tips.',
      taxis: 'No tipping expected. Drivers may even return your change to the last yen.',
      tours: 'Not expected but small gifts or thank you notes are appreciated.',
      general: 'Tipping is not part of Japanese culture and can cause confusion.'
    },
    'New York': {
      restaurants: '15-20% of the pre-tax bill is standard. 25% or more for exceptional service.',
      bars: '$1-2 per drink or 15-20% of the total tab.',
      hotels: '$2-5 per bag for bellhops, $2-5 per day for housekeeping.',
      taxis: '15-20% of the fare. Round up to the next dollar at minimum.',
      tours: '$5-10 per person for group tours, $20-40 for private guides.',
      general: 'Tipping is expected and forms a significant part of service workers\' income.'
    },
    'default': {
      restaurants: '10-15% is standard for good service.',
      bars: 'Not expected, but you can round up the bill.',
      hotels: '1-2 local currency units per bag for bellhops, 1-2 per day for housekeeping.',
      taxis: 'Round up the fare to the nearest convenient amount.',
      tours: '5-10% of tour cost for good service.',
      general: 'Check local customs as tipping practices vary significantly.'
    }
  };

  return tippingEtiquette[destination.name] || tippingEtiquette['default'];
};

// Generate local safety tips based on destination and traveler type
const generateSafetyTips = (destination: Destination, travelerType: TravelerType) => {
  const generalTips = [
    'Always keep a copy of your passport and important documents in a separate location.',
    'Be aware of your surroundings, especially in crowded tourist areas.',
    'Keep emergency contact numbers handy, including local emergency services and your country\'s embassy.',
    'Use hotel safes for valuables and only carry what you need for the day.'
  ];

  const destinationSpecificTips: Record<string, string[]> = {
    'Paris': [
      'Beware of pickpockets in crowded areas like the Eiffel Tower and the Louvre.',
      'Be cautious of common scams like the "gold ring" or "petition" scams.'
    ],
    'Tokyo': [
      'Japan is generally very safe, but still be cautious with your belongings in crowded trains.',
      'Carry cash as some smaller establishments may not accept credit cards.'
    ],
    'New York': [
      'Be cautious when using ATMs and avoid using ones in isolated areas.',
      'Stick to well-lit and populated areas when walking at night.'
    ]
  };

  const travelerTypeTips: Record<string, string[]> = {
    'solo': [
      'Let someone know your itinerary and check in regularly.',
      'Avoid sharing too much personal information with strangers.',
      'Consider joining group tours for certain activities.'
    ],
    'family': [
      'Establish a meeting point in case anyone gets separated.',
      'Carry identification with emergency contact information for children.',
      'Research family-friendly areas and activities in advance.'
    ],
    'couple': [
      'Be cautious of overly friendly strangers who might be trying to scam tourists.',
      'Keep valuables in a secure location and be discreet with expensive items.'
    ]
  };

  return [
    ...generalTips,
    ...(destinationSpecificTips[destination.name] || []),
    ...(travelerTypeTips[travelerType.id.toLowerCase()] || [])
  ];
};

// Mock data generators for different parts of the travel plan
export const generatePlacesToVisit = (destination: Destination, preferences: TripPreferences) => {
  const commonPlaces = [
    {
      name: 'Historic Downtown',
      description: 'Explore the charming streets and historic architecture of the city center.',
      category: 'Sightseeing',
      priority: 1
    },
    {
      name: 'Local Market',
      description: 'Experience local culture and cuisine at the bustling market.',
      category: 'Food & Shopping',
      priority: 2
    },
    {
      name: `${destination.name} Museum`,
      description: 'Learn about the rich history and culture of the region.',
      category: 'Cultural',
      priority: 3
    },
    {
      name: 'Scenic Viewpoint',
      description: 'Enjoy breathtaking panoramic views of the city and surroundings.',
      category: 'Nature',
      priority: 4
    }
  ];

  if (preferences.activities.includes('adventure')) {
    commonPlaces.push({
      name: 'Adventure Park',
      description: 'Experience thrilling outdoor activities and adventures.',
      category: 'Adventure',
      priority: 5
    });
  }

  if (preferences.wantBars) {
    commonPlaces.push({
      name: 'Entertainment District',
      description: 'Vibrant area with clubs, bars, and live music venues.',
      category: 'Nightlife',
      priority: 6
    });
  }

  return commonPlaces.sort((a, b) => a.priority - b.priority);
};

export const generateRestaurants = (destination: Destination, preferences: TripPreferences) => {
  const restaurants = [
    {
      name: `${destination.name} Bistro`,
      cuisine: 'Local Cuisine',
      priceRange: '$$',
      description: 'A cozy bistro serving authentic local dishes with a modern twist.'
    },
    {
      name: 'The Corner Cafe',
      cuisine: 'International',
      priceRange: '$',
      description: 'Casual dining with a variety of international dishes.'
    },
    {
      name: 'Fine Dining Experience',
      cuisine: 'Gourmet',
      priceRange: '$$$',
      description: 'An upscale restaurant offering exquisite tasting menus.'
    }
  ];

  // Add vegetarian/vegan options if preferred
  if (preferences.activities.includes('vegetarian') || preferences.activities.includes('vegan')) {
    restaurants.push({
      name: 'Green Leaf',
      cuisine: 'Vegetarian/Vegan',
      priceRange: '$$',
      description: 'Plant-based cuisine focusing on fresh, local ingredients.'
    });
  }

  return restaurants;
};

export const generateBars = (destination: Destination, preferences: TripPreferences): Bar[] => {
  const bars: Bar[] = [
    {
      name: `${destination.name} Craft Brewery`,
      type: 'beer',
      atmosphere: 'Casual and friendly',
      description: 'Local brewery with a variety of craft beers and pub food.',
      category: 'Craft Beer'
    },
    {
      name: 'Wine Cellar',
      type: 'wine',
      atmosphere: 'Sophisticated and intimate',
      description: 'Extensive wine collection with knowledgeable sommeliers.',
      category: 'Wine Bar'
    },
    {
      name: 'Mixology Lounge',
      type: 'cocktail',
      atmosphere: 'Upscale and trendy',
      description: 'Creative cocktails made with premium spirits and fresh ingredients.',
      category: 'Cocktail Lounge'
    },
    {
      name: 'The Local Dive',
      type: 'dive',
      atmosphere: 'Laid-back and authentic',
      description: 'No-frills neighborhood bar popular with locals.',
      category: 'Dive Bar'
    },
    {
      name: 'Rooftop Bar',
      type: 'cocktail',
      atmosphere: 'Scenic and upscale',
      description: 'Panoramic city views with premium cocktails and small plates.',
      category: 'Rooftop'
    }
  ];

  return bars;
};

export const generateWeatherInfo = (): WeatherInfo => ({
  season: 'Spring',
  temperature: '18-25°C',
  conditions: 'Mild with occasional rain',
  humidity: 'Moderate humidity levels (60-70%)',
  dayNightTempDifference: 'Temperature drops 8-10°C at night',
  airQuality: 'Good air quality, no special precautions needed',
  feelsLikeWarning: 'May feel cooler due to wind and humidity',
  recommendations: ['Pack an umbrella', 'Bring a light jacket', 'Stay hydrated', 'Layer your clothing']
});

export const generateNeighborhoods = (destination: Destination): Neighborhood[] => [
  {
    name: 'Historic District',
    summary: 'The heart of the old city with cobblestone streets and historic architecture',
    vibe: 'Charming, walkable, tourist-friendly',
    pros: ['Close to major attractions', 'Great restaurants', 'Beautiful architecture'],
    cons: ['Can be crowded', 'More expensive', 'Limited parking'],
    bestFor: 'Tourists'
  },
  {
    name: 'Arts Quarter',
    summary: 'Trendy area with galleries, cafes, and creative spaces',
    vibe: 'Hip, artistic, young crowd',
    pros: ['Vibrant nightlife', 'Unique shopping', 'Local art scene'],
    cons: ['Can be noisy at night', 'Further from main attractions', 'Limited family activities'],
    bestFor: 'Youth'
  },
  {
    name: 'Waterfront',
    summary: 'Scenic area along the water with parks and promenades',
    vibe: 'Relaxed, scenic, upscale',
    pros: ['Beautiful views', 'Great for walking/jogging', 'High-end dining'],
    cons: ['More expensive', 'Can be windy', 'Limited late-night options'],
    bestFor: 'Tourists'
  }
];

export const generateHotelRecommendations = (destination: Destination, preferences: TripPreferences): HotelRecommendation[] => [
  {
    name: `${destination.name} Grand Hotel`,
    neighborhood: 'Historic District',
    priceRange: '$$$',
    description: 'Luxury hotel in the heart of the city, close to major attractions.',
    amenities: ['Spa', 'Fitness Center', 'Concierge', 'Restaurant', 'Room Service']
  },
  {
    name: `${destination.name} Boutique Inn`,
    neighborhood: 'Historic District',
    priceRange: '$$',
    description: 'Charming boutique hotel with personalized service and unique decor.',
    amenities: ['Free WiFi', 'Continental Breakfast', 'Business Center', 'Pet Friendly']
  },
  {
    name: `${destination.name} Budget Lodge`,
    neighborhood: 'Historic District',
    priceRange: '$',
    description: 'Clean, comfortable accommodations at an affordable price.',
    amenities: ['Free WiFi', 'Parking', '24-hour Front Desk']
  },
  {
    name: 'Waterfront Resort',
    neighborhood: 'Waterfront',
    priceRange: '$$$',
    description: 'Stunning waterfront resort with panoramic views and luxury amenities.',
    amenities: ['Pool', 'Spa', 'Marina', 'Multiple Restaurants', 'Golf Course']
  },
  {
    name: 'Arts District Hotel',
    neighborhood: 'Arts Quarter',
    priceRange: '$$',
    description: 'Modern hotel in the trendy arts district, perfect for culture lovers.',
    amenities: ['Art Gallery', 'Rooftop Bar', 'Fitness Center', 'Free WiFi']
  },
  {
    name: 'Creative Hostel',
    neighborhood: 'Arts Quarter',
    priceRange: '$',
    description: 'Hip hostel with communal spaces and artistic atmosphere.',
    amenities: ['Shared Kitchen', 'Common Areas', 'Free WiFi', 'Laundry']
  }
];

export const generateTransportationInfo = (): TransportationInfo => ({
  publicTransport: 'Efficient metro and bus system covering the entire city with frequent service.',
  creditCardPayment: true,
  airportTransport: {
    mainAirport: 'Main International Airport',
    distanceToCity: '25 km (15 miles) from city center',
    transportOptions: [
      {
        type: 'Airport Express Train',
        cost: '$12-15',
        duration: '30 minutes',
        description: 'Fastest option, runs every 15 minutes'
      },
      {
        type: 'Airport Bus',
        cost: '$5-8',
        duration: '45-60 minutes',
        description: 'Budget-friendly, multiple stops in city'
      },
      {
        type: 'Taxi',
        cost: '$40-60',
        duration: '30-45 minutes',
        description: 'Door-to-door service, price varies with traffic'
      },
      {
        type: 'Rideshare',
        cost: '$25-40',
        duration: '30-45 minutes',
        description: 'App-based service, price varies with demand'
      }
    ]
  },
  ridesharing: 'Uber and local ridesharing services widely available throughout the city.',
  taxiInfo: {
    available: true,
    averageCost: '$15-25 for typical city rides',
    tips: [
      'Look for official taxi stands or hail from the street',
      'All taxis should have working meters',
      'Carry cash as some taxis may not accept cards',
      'Agree on fare beforehand for longer trips'
    ]
  }
});

export const generateLocalCurrency = (): CurrencyInfo => ({
  currency: 'Local Currency (LC)',
  cashNeeded: true,
  creditCardUsage: 'Widely accepted in hotels and restaurants, but carry some cash for markets and taxis.',
  tips: [
    'Exchange money at banks or authorized exchange offices for best rates',
    'ATMs are widely available and usually offer good exchange rates',
    'Notify your bank before traveling to avoid card blocks',
    'Keep receipts for major purchases for customs purposes'
  ]
});

export const generateActivities = (destination: Destination, travelerType: TravelerType): RecommendedActivity[] => {
  const baseActivities: RecommendedActivity[] = [
    {
      name: 'City Walking Tour',
      type: 'Sightseeing',
      description: 'Explore the main attractions with a local guide.',
      duration: '2-3 hours',
      localSpecific: true
    },
    {
      name: 'Cooking Class',
      type: 'Food & Drink',
      description: 'Learn to cook local dishes with a professional chef.',
      duration: '3-4 hours',
      localSpecific: true
    },
    {
      name: 'Traditional Craft Workshop',
      type: 'Cultural',
      description: 'Learn traditional local crafts from skilled artisans.',
      duration: '2-3 hours',
      localSpecific: true
    },
    {
      name: 'Local Market Tour',
      type: 'Food & Culture',
      description: 'Guided tour of local markets with tastings.',
      duration: '3-4 hours',
      localSpecific: true
    },
    {
      name: 'Cultural Performance',
      type: 'Entertainment',
      description: 'Experience traditional music and dance performances.',
      duration: '1-2 hours',
      localSpecific: true
    }
  ];

  if (travelerType.id === 'family') {
    baseActivities.push({
      name: 'Family Fun Day',
      type: 'Family',
      description: 'Activities and attractions suitable for all ages.',
      duration: 'Full day',
      localSpecific: false
    });
  }

  return baseActivities;
};

export const generateMustTryFood = (destination: Destination): MustTryFood => ({
  items: [
    {
      name: `Traditional ${destination.name} Stew`,
      description: 'A hearty local stew with regional ingredients and traditional spices',
      category: 'main' as const,
      whereToFind: 'Local restaurants and family-run establishments',
      priceRange: '$$'
    },
    {
      name: 'Local Grilled Specialties',
      description: 'Fresh grilled meats or vegetables prepared with local seasonings',
      category: 'main' as const,
      whereToFind: 'Street vendors and traditional grills',
      priceRange: '$-$$'
    },
    {
      name: 'Traditional Sweet Pastry',
      description: 'Classic local pastry with traditional fillings and preparation methods',
      category: 'dessert' as const,
      whereToFind: 'Local bakeries and cafes',
      priceRange: '$'
    },
    {
      name: 'Regional Fruit Dessert',
      description: 'Seasonal fruit prepared in traditional local style',
      category: 'dessert' as const,
      whereToFind: 'Markets and dessert shops',
      priceRange: '$'
    },
    {
      name: 'Traditional Local Spirit',
      description: 'Regional alcoholic beverage with local significance',
      category: 'drink' as const,
      whereToFind: 'Bars and specialty shops',
      priceRange: '$$'
    },
    {
      name: 'Local Liqueur',
      description: 'Traditional liqueur made with local ingredients',
      category: 'drink' as const,
      whereToFind: 'Wine bars and restaurants',
      priceRange: '$$-$$$'
    }
  ]
});

export const generateSocialEtiquette = () => [
  'Greet with a handshake and maintain eye contact',
  'Tipping is appreciated but not always expected',
  'Dress modestly when visiting religious sites',
  'Learn a few basic phrases in the local language'
];

export const generateItinerary = (destination: Destination, days: number) => {
  const itinerary = [];
  
  // Define activities with their corresponding icon names
  const dailyActivities = [
    {
      time: '09:00 AM',
      title: 'Breakfast at Hotel',
      description: 'Enjoy a delicious breakfast to start your day.',
      location: 'Hotel Restaurant',
      icon: 'coffee'
    },
    {
      time: '10:30 AM',
      title: 'Morning Activity',
      description: 'Visit local attractions and landmarks.',
      location: 'City Center',
      icon: 'map'
    },
    {
      time: '01:00 PM',
      title: 'Lunch at Local Restaurant',
      description: 'Taste authentic local cuisine.',
      location: 'Downtown',
      icon: 'utensils'
    },
    {
      time: '03:00 PM',
      title: 'Afternoon Exploration',
      description: 'Continue exploring the city.',
      location: 'Various Locations',
      icon: 'compass'
    },
    {
      time: '07:00 PM',
      title: 'Dinner',
      description: 'Enjoy dinner at a recommended restaurant.',
      location: 'Local Restaurant',
      icon: 'utensils'
    }
  ];
  
  // Create itinerary for each day
  for (let i = 1; i <= days; i++) {
    itinerary.push({
      day: i,
      title: `Day ${i}: Exploring ${destination.name}`,
      activities: [...dailyActivities] // Create a new array for each day
    });
  }
  
  return itinerary;
};

export const generateLocalEvents = (destination: Destination): LocalEvent[] => [
  {
    name: 'Annual Cultural Festival',
    type: 'Cultural',
    description: 'Celebration of local traditions with music, dance, and food.',
    dates: 'Varies by season',
    location: 'City Center'
  },
  {
    name: 'Weekly Farmers Market',
    type: 'Market',
    description: 'Local produce, crafts, and street food from regional vendors.',
    dates: 'Every Saturday',
    location: 'Main Square'
  },
  {
    name: 'Monthly Art Walk',
    type: 'Arts',
    description: 'Gallery openings and street art displays in the arts district.',
    dates: 'First Friday of each month',
    location: 'Arts Quarter'
  }
];

export const generateTravelPlan = (
  destination: Destination,
  preferences: TripPreferences,
  travelerType: TravelerType
) => {
  const days = parseInt(preferences.duration.split(' ')[0], 10) || 7; // Default to 7 days if parsing fails
  
  return {
    destination,
    placesToVisit: generatePlacesToVisit(destination, preferences),
    neighborhoods: generateNeighborhoods(destination),
    hotelRecommendations: generateHotelRecommendations(destination, preferences),
    restaurants: generateRestaurants(destination, preferences),
    bars: preferences.wantBars ? generateBars(destination, preferences) : [],
    weatherInfo: generateWeatherInfo(),
    socialEtiquette: generateSocialEtiquette(),
    safetyTips: generateSafetyTips(destination, travelerType),
    transportationInfo: generateTransportationInfo(),
    localCurrency: generateLocalCurrency(),
    tipEtiquette: generateTippingEtiquette(destination),
    activities: generateActivities(destination, travelerType),
    mustTryFood: generateMustTryFood(destination),
    tapWaterSafe: generateTapWaterInfo(destination),
    localEvents: generateLocalEvents(destination),
    history: `${destination.name} has a rich history spanning centuries, with influences from various cultures and periods. The city has evolved from its ancient origins to become a modern destination while preserving its cultural heritage and traditions.`,
    itinerary: generateItinerary(destination, days)
  };
};

// Development mock data for testing enhanced features
export const generateDevMockData = (): {
  travelerType: TravelerType;
  destination: Destination;
  response: AITripPlanningResponse;
} => {
  const mockTravelerType: TravelerType = {
    id: 'explorer',
    name: 'Explorer',
    description: 'Love spontaneous adventures',
    icon: '🎒',
    showPlaceholder: false
  };
  
  const mockDestination: Destination = {
    id: 'tokyo',
    name: 'Tokyo',
    country: 'Japan',
    description: 'A vibrant metropolis blending tradition and modernity',
    image: '/images/tokyo.jpg',
    highlights: ['Temples', 'Food scene', 'Technology'],
    bestTime: 'Spring & Fall',
    budget: '$$-$$$'
  };
  
  const mockResponse: AITripPlanningResponse = {
    plan: {
      destination: mockDestination,
      placesToVisit: [
        {
          name: 'Senso-ji Temple',
          description: 'Ancient Buddhist temple in Asakusa',
          category: 'Cultural',
          priority: 1,
        },
        {
          name: 'Tokyo Skytree',
          description: 'Iconic broadcasting tower with city views',
          category: 'Entertainment',
          priority: 2,
        },
        {
          name: 'Imperial Palace Gardens',
          description: 'Beautiful gardens surrounding the Imperial Palace',
          category: 'Natural',
          priority: 3,
        },
        {
          name: 'Meiji Shrine',
          description: 'Peaceful Shinto shrine in the heart of Tokyo',
          category: 'Cultural',
          priority: 4,
        },
        {
          name: 'Shibuya Crossing',
          description: 'Famous busy intersection with neon lights',
          category: 'Entertainment',
          priority: 5,
        }
      ],
      neighborhoods: [
        {
          name: 'Shibuya',
          summary: 'Famous for the crossing and nightlife',
          vibe: 'Energetic and bustling',
          pros: ['Great nightlife', 'Shopping', 'Central location'],
          cons: ['Very crowded', 'Can be noisy'],
          bestFor: 'Tourists'
        },
        {
          name: 'Asakusa',
          summary: 'Traditional area with temples and old-town feel',
          vibe: 'Traditional and cultural',
          pros: ['Rich history', 'Great food', 'Less crowded'],
          cons: ['Further from modern areas', 'Limited nightlife'],
          bestFor: 'Tourists'
        },
        {
          name: 'Ginza',
          summary: 'Upscale shopping and dining district',
          vibe: 'Luxury and sophistication',
          pros: ['High-end shopping', 'Fine dining', 'Beautiful architecture'],
          cons: ['Very expensive', 'Formal atmosphere', 'Less local culture'],
          bestFor: 'Tourists'
        }
      ],
      hotelRecommendations: [
        {
          name: 'Hotel Gracery Shinjuku',
          neighborhood: 'Shinjuku',
          priceRange: '$$$',
          description: 'Modern hotel with Godzilla theme',
          amenities: ['WiFi', 'Restaurant', 'Fitness Center'],
          // airbnbLink: 'https://www.airbnb.com/s/Shinjuku+Tokyo/homes'
        },
        {
          name: 'Richmond Hotel Asakusa',
          neighborhood: 'Asakusa',
          priceRange: '$$',
          description: 'Comfortable hotel near traditional sites',
          amenities: ['WiFi', 'Breakfast', 'Laundry'],
          // googleMapsLink: 'https://www.google.com/maps/search/Richmond+Hotel+Asakusa+Tokyo',
          airbnbLink: 'https://www.airbnb.com/s/Asakusa+Tokyo/homes'
        },
        {
          name: 'Park Hotel Tokyo',
          neighborhood: 'Ginza',
          priceRange: '$$$$',
          description: 'Luxury hotel with artist-designed rooms',
          amenities: ['Spa', 'Multiple Restaurants', 'Concierge', 'Art Gallery'],
          // googleMapsLink: 'https://www.google.com/maps/search/Park+Hotel+Tokyo+Ginza',
          airbnbLink: 'https://www.airbnb.com/s/Ginza+Tokyo/homes'
        },
        {
          name: 'Capsule Hotel Anshin Oyado',
          neighborhood: 'Shinjuku',
          priceRange: '$',
          description: 'Modern capsule hotel experience',
          amenities: ['Shared Bath', 'Lockers', 'WiFi'],
          // googleMapsLink: 'https://www.google.com/maps/search/Capsule+Hotel+Anshin+Oyado+Shinjuku',
          airbnbLink: 'https://www.airbnb.com/s/Shinjuku+Tokyo/homes'
        }
      ],
      restaurants: [
        {
          name: 'Sukiyabashi Jiro',
          cuisine: 'Sushi',
          priceRange: '$$$$',
          description: 'World-famous sushi restaurant',
          neighborhood: 'Ginza',
          specialDishes: ['Omakase tasting menu', 'Fresh tuna']
        },
        {
          name: 'Ramen Yashichi',
          cuisine: 'Ramen',
          priceRange: '$',
          description: 'Authentic local ramen shop',
          neighborhood: 'Shibuya',
          specialDishes: ['Tonkotsu ramen', 'Gyoza']
        },
        {
          name: 'Tempura Kondo',
          cuisine: 'Tempura',
          priceRange: '$$$',
          description: 'Michelin-starred tempura restaurant',
          neighborhood: 'Ginza',
          specialDishes: ['Vegetable tempura', 'Sweet potato tempura']
        },
        {
          name: 'Daiwa Sushi',
          cuisine: 'Sushi',
          priceRange: '$$',
          description: 'Popular sushi spot at Tsukiji Outer Market',
          neighborhood: 'Tsukiji',
          specialDishes: ['Fresh tuna sashimi', 'Chirashi bowl']
        },
        {
          name: 'Kozasa',
          cuisine: 'Traditional Japanese',
          priceRange: '$$$',
          description: 'Traditional kaiseki dining experience',
          neighborhood: 'Asakusa',
          specialDishes: ['Seasonal kaiseki course', 'Traditional sweets']
        }
      ],
      bars: [
        {
          name: 'Golden Gai',
          type: 'other',
          atmosphere: 'Intimate and traditional',
          description: 'Famous narrow alley with tiny bars',
          category: 'Traditional',
          neighborhood: 'Asakusa'
        },
        {
          name: 'New York Grill',
          type: 'cocktail',
          atmosphere: 'Upscale with city views',
          description: 'High-end bar with panoramic Tokyo views',
          category: 'Rooftop',
          neighborhood: 'Shibuya'
        }
      ],
      weatherInfo: {
        season: 'Spring',
        temperature: '15-25°C (59-77°F)',
        conditions: 'Mild and pleasant',
        humidity: 'Moderate',
        dayNightTempDifference: '10°C difference',
        airQuality: 'Good',
        feelsLikeWarning: 'Pack layers',
        recommendations: ['Light jacket', 'Comfortable shoes']
      },
      socialEtiquette: ['Bow when greeting', 'Remove shoes indoors'],
      safetyTips: ['Very safe city', 'Keep cash handy'],
      transportationInfo: {
        publicTransport: 'Excellent rail system',
        creditCardPayment: false,
        airportTransport: {
          mainAirport: 'Narita International',
          distanceToCity: '60km from city center',
          transportOptions: [
            {
              type: 'Narita Express',
              cost: '¥3,070',
              duration: '60 minutes',
              description: 'Direct train to central Tokyo'
            }
          ]
        },
        ridesharing: 'Limited Uber, use taxis',
        taxiInfo: {
          available: true,
          averageCost: '¥500-1000 for short trips',
          tips: ['Cash only', 'Doors open automatically']
        }
      },
      localCurrency: {
        currency: 'Japanese Yen (JPY)',
        cashNeeded: true,
        creditCardUsage: 'Limited acceptance',
        tips: ['Withdraw from 7-Eleven ATMs'],
        exchangeRate: {
          from: 'USD',
          to: 'JPY',
          rate: 150,
          lastUpdated: new Date().toISOString().split('T')[0]
        }
      },
      tipEtiquette: {
        restaurants: 'No tipping required',
        bars: 'No tipping required',
        taxis: 'No tipping required',
        hotels: 'No tipping required',
        tours: 'No tipping required',
        general: 'Tipping is not part of Japanese culture'
      },
      activities: [
        {
          name: 'Sushi Making Class',
          type: 'Cooking Class',
          description: 'Learn to make authentic sushi',
          duration: '3 hours',
          localSpecific: true,
          bookingLink: 'https://www.airbnb.com/s/experiences?query=sushi+making+Tokyo',
          experienceType: 'airbnb'
        },
        {
          name: 'Tsukiji Fish Market Tour',
          type: 'Cultural Tour',
          description: 'Early morning fish market experience',
          duration: '4 hours',
          localSpecific: true,
          bookingLink: 'https://www.getyourguide.com/s/?q=Tsukiji+Fish+Market+Tokyo',
          experienceType: 'getyourguide'
        },
        {
          name: 'Tea Ceremony Experience',
          type: 'Cultural Workshop',
          description: 'Traditional Japanese tea ceremony',
          duration: '2 hours',
          localSpecific: true,
          bookingLink: 'https://www.viator.com/searchResults/all?text=tea+ceremony+Tokyo',
          experienceType: 'viator'
        }
      ],
      mustTryFood: {
        items: [
          {
            name: 'Sushi',
            description: 'Fresh fish and vegetables',
            category: 'main',
            whereToFind: 'Local restaurants',
              priceRange: '$$'
          },
          {
            name: 'Ramen',
            description: 'Thick noodles in flavorful broth',
            category: 'main',
            whereToFind: 'Street vendors',
            priceRange: '$'
          },
          {
            name: 'Mochi',
            description: 'Sweet rice cake',
            category: 'dessert',
            whereToFind: 'Local bakeries',
            priceRange: '$'
          },
          {
            name: 'Sake',
            description: 'Traditional Japanese alcohol',
            category: 'drink',
            whereToFind: 'Bars',
            priceRange: '$$'
          }
        ]
      },
      tapWaterSafe: {
        safe: true,
        details: 'Tokyo tap water is safe to drink'
      },
      localEvents: [{
        name: 'Tokyo Marathon',
        type: 'Marathon',
        description: 'Annual marathon event',
        dates: 'March',
        location: 'Tokyo Marathon Course'
      }],
      history: 'Tokyo, originally named Edo, has been Japan\'s capital since 1868. The city has transformed from a feudal castle town into a modern metropolis, surviving earthquakes, wars, and rapid modernization. Today it stands as a unique blend of ancient traditions and cutting-edge technology, where centuries-old shrines coexist with futuristic skyscrapers. The city\'s evolution reflects Japan\'s journey from isolation to becoming a global economic powerhouse, while maintaining its distinct cultural identity. From the Meiji Restoration through post-war reconstruction to hosting the Olympics, Tokyo continues to reinvent itself while honoring its rich cultural heritage.',
      itinerary: [
        {
          day: 1,
          title: 'Day 1: Traditional Tokyo',
          activities: [
            {
              time: '9:00 AM',
              title: 'Senso-ji Temple',
              description: 'Visit Tokyo\'s oldest temple',
              location: 'Asakusa',
              icon: 'map'
            },
            {
              time: '12:00 PM',
              title: 'Lunch in Asakusa',
              description: 'Try traditional Japanese cuisine',
              location: 'Asakusa',
              icon: 'utensils'
            }
          ]
        }
      ]
    },
    reasoning: 'Mock data for development testing',
    confidence: 0.95,
    personalizations: [
      'Tailored for Explorer traveler type',
      'Includes authentic experiences',
      'Balanced traditional and modern activities'
    ]
  };
  
  return {
    travelerType: mockTravelerType,
    destination: mockDestination,
    response: mockResponse
  };
};

