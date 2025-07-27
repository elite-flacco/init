import { Destination, TripPreferences, TravelerType } from '../../types/travel';

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
const generateTippingEtiquette = (destination: Destination) => {
  const tippingEtiquette: Record<string, { [key: string]: string }> = {
    'Paris': {
      'Restaurants': 'Service charge is typically included ("service compris"), but it\'s common to leave 5-10% extra for good service.',
      'Bars/Cafés': 'Small change or rounding up the bill is sufficient.',
      'Hotels': '1-2€ per bag for bellhops, 1-2€ per day for housekeeping.',
      'Taxis': 'Round up to the nearest euro or add 5-10% for good service.'
    },
    'Tokyo': {
      'Restaurants': 'Tipping is not customary and can even be considered rude in some places.',
      'Bars': 'No tipping expected.',
      'Hotels': 'No tipping expected, though some high-end hotels may accept tips.',
      'Taxis': 'No tipping expected. Drivers may even return your change to the last yen.'
    },
    'New York': {
      'Restaurants': '15-20% of the pre-tax bill is standard. 25% or more for exceptional service.',
      'Bars': '$1-2 per drink or 15-20% of the total tab.',
      'Hotels': '$2-5 per bag for bellhops, $2-5 per day for housekeeping.',
      'Taxis': '15-20% of the fare. Round up to the next dollar at minimum.'
    },
    'default': {
      'Restaurants': '10-15% is standard for good service.',
      'Bars': 'Not expected, but you can round up the bill.',
      'Hotels': '1-2 local currency units per bag for bellhops, 1-2 per day for housekeeping.',
      'Taxis': 'Round up the fare to the nearest convenient amount.'
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

export const generateBars = (destination: Destination, preferences: TripPreferences) => {
  const bars = [
    {
      name: `${destination.name} Pub`,
      type: 'Pub',
      atmosphere: 'Cozy and traditional',
      description: 'A traditional pub with local beers and spirits.'
    },
    {
      name: 'Rooftop Lounge',
      type: 'Lounge',
      atmosphere: 'Upscale and modern',
      description: 'Enjoy craft cocktails with a stunning view of the city.'
    }
  ];

  return bars;
};

export const generateWeatherInfo = () => ({
  season: 'Spring',
  temperature: '18-25°C',
  conditions: 'Mild with occasional rain',
  recommendations: ['Pack an umbrella', 'Bring a light jacket']
});

export const generateHotelRecommendation = (destination: Destination, preferences: TripPreferences) => ({
  name: `${destination.name} Grand Hotel`,
  area: 'Downtown',
  priceRange: '$$$',
  description: 'Luxury hotel in the heart of the city, close to major attractions.'
});

export const generateTransportationInfo = () => ({
  publicTransport: 'Efficient metro and bus system covering the entire city.',
  airportTransport: 'Airport express train available, takes 30 minutes to city center.',
  ridesharing: 'Uber and local ridesharing services available.',
  taxiInfo: 'Metered taxis are safe and reliable. Look for official taxi stands.'
});

export const generateLocalCurrency = () => ({
  currency: 'Local Currency (LC)',
  cashNeeded: true,
  creditCardUsage: 'Widely accepted in hotels and restaurants, but carry some cash for markets and taxis.',
  tips: [
    'Tipping 10-15% is customary in restaurants',
    'Round up taxi fares',
    'Hotel staff appreciate 1-2 LC per bag'
  ]
});

export const generateActivities = (destination: Destination, travelerType: TravelerType) => {
  const baseActivities = [
    {
      name: 'City Walking Tour',
      type: 'Sightseeing',
      description: 'Explore the main attractions with a local guide.',
      duration: '2-3 hours'
    },
    {
      name: 'Cooking Class',
      type: 'Food & Drink',
      description: 'Learn to cook local dishes with a professional chef.',
      duration: '3-4 hours'
    }
  ];

  if (travelerType.id === 'family') {
    baseActivities.push({
      name: 'Family Fun Day',
      type: 'Family',
      description: 'Activities and attractions suitable for all ages.',
      duration: 'Full day'
    });
  }

  return baseActivities;
};

export const generateMustTryFood = (destination: Destination) => [
  `Traditional ${destination.name} Dish`,
  'Local Street Food Specialties',
  'Regional Desserts',
  'Signature Local Beverage'
];

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

export const generateTravelPlan = (
  destination: Destination,
  preferences: TripPreferences,
  travelerType: TravelerType
) => {
  const days = parseInt(preferences.duration.split(' ')[0], 10) || 7; // Default to 7 days if parsing fails
  
  return {
    placesToVisit: generatePlacesToVisit(destination, preferences),
    restaurants: generateRestaurants(destination, preferences),
    bars: preferences.wantBars ? generateBars(destination, preferences) : [],
    weatherInfo: generateWeatherInfo(),
    socialEtiquette: generateSocialEtiquette(),
    hotelRecommendation: generateHotelRecommendation(destination, preferences),
    transportationInfo: generateTransportationInfo(),
    localCurrency: generateLocalCurrency(),
    activities: generateActivities(destination, travelerType),
    itinerary: generateItinerary(destination, days),
    mustTryFood: generateMustTryFood(destination),
    safetyTips: generateSafetyTips(destination, travelerType),
    tippingEtiquette: generateTippingEtiquette(destination),
    tapWater: generateTapWaterInfo(destination),
  };
};

