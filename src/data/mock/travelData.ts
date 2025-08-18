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
  ActivityIconCategory,
  Activity,
  RecommendedActivity,
  MustTryFood,
  LocalEvent,
  Bar,
} from "../../types/travel";
import { AITripPlanningResponse } from "../../services/aiTripPlanningService";
import { destinations } from "./destinations";
import { travelerTypesLookup } from "./travelerTypes";

// Generate tap water safety information
const generateTapWaterInfo = (destination: Destination) => {
  const waterSafety: Record<
    string,
    { safe: boolean; details: string; recommendations?: string[] }
  > = {
    Paris: {
      safe: true,
      details:
        "Tap water in Paris is safe to drink and meets all EU and French standards for water quality.",
      recommendations: [
        'You can ask for "une carafe d\'eau" (a carafe of tap water) at restaurants for free.',
        "The water has a high mineral content, which some people might find affects the taste.",
      ],
    },
    Tokyo: {
      safe: true,
      details: "Tokyo has excellent tap water quality that is safe to drink.",
      recommendations: [
        "Many public places have water fountains where you can refill your water bottle.",
        "Some older buildings might have older pipes, so check with your accommodation if concerned.",
      ],
    },
    "New York": {
      safe: true,
      details:
        "New York City tap water is among the cleanest in the United States and is safe to drink.",
      recommendations: [
        "The water has a unique taste due to its mineral content from the Catskill/Delaware watershed.",
        "Free water is available at any food service establishment that serves beverages.",
      ],
    },
    default: {
      safe: false,
      details:
        "It is generally recommended to drink bottled or filtered water in this destination.",
      recommendations: [
        "Use bottled water for drinking and brushing teeth.",
        "Avoid ice in drinks unless you're sure it's made from purified water.",
        "Check with your accommodation about their water safety recommendations.",
      ],
    },
  };

  return waterSafety[destination.name] || waterSafety["default"];
};

// Generate tipping etiquette based on destination
const generateTippingEtiquette = (destination: Destination): TipEtiquette => {
  const tippingEtiquette: Record<string, TipEtiquette> = {
    Paris: {
      restaurants:
        'Service charge is typically included ("service compris"), but it\'s common to leave 5-10% extra for good service.',
      bars: "Small change or rounding up the bill is sufficient.",
      hotels: "1-2€ per bag for bellhops, 1-2€ per day for housekeeping.",
      taxis: "Round up to the nearest euro or add 5-10% for good service.",
      tours: "5-10€ per person for full-day tours.",
      general: "Tipping is appreciated but not obligatory in France.",
    },
    Tokyo: {
      restaurants:
        "Tipping is not customary and can even be considered rude in some places.",
      bars: "No tipping expected.",
      hotels:
        "No tipping expected, though some high-end hotels may accept tips.",
      taxis:
        "No tipping expected. Drivers may even return your change to the last yen.",
      tours: "Not expected but small gifts or thank you notes are appreciated.",
      general:
        "Tipping is not part of Japanese culture and can cause confusion.",
    },
    "New York": {
      restaurants:
        "15-20% of the pre-tax bill is standard. 25% or more for exceptional service.",
      bars: "$1-2 per drink or 15-20% of the total tab.",
      hotels: "$2-5 per bag for bellhops, $2-5 per day for housekeeping.",
      taxis: "15-20% of the fare. Round up to the next dollar at minimum.",
      tours: "$5-10 per person for group tours, $20-40 for private guides.",
      general:
        "Tipping is expected and forms a significant part of service workers' income.",
    },
    default: {
      restaurants: "10-15% is standard for good service.",
      bars: "Not expected, but you can round up the bill.",
      hotels:
        "1-2 local currency units per bag for bellhops, 1-2 per day for housekeeping.",
      taxis: "Round up the fare to the nearest convenient amount.",
      tours: "5-10% of tour cost for good service.",
      general: "Check local customs as tipping practices vary significantly.",
    },
  };

  return tippingEtiquette[destination.name] || tippingEtiquette["default"];
};

// Generate local safety tips based on destination and traveler type
const generateSafetyTips = (
  destination: Destination,
  travelerType: TravelerType,
) => {
  const generalTips = [
    "Always keep a copy of your passport and important documents in a separate location.",
    "Be aware of your surroundings, especially in crowded tourist areas.",
    "Keep emergency contact numbers handy, including local emergency services and your country's embassy.",
    "Use hotel safes for valuables and only carry what you need for the day.",
  ];

  const destinationSpecificTips: Record<string, string[]> = {
    Paris: [
      "Beware of pickpockets in crowded areas like the Eiffel Tower and the Louvre.",
      'Be cautious of common scams like the "gold ring" or "petition" scams.',
    ],
    Tokyo: [
      "Japan is generally very safe, but still be cautious with your belongings in crowded trains.",
      "Carry cash as some smaller establishments may not accept credit cards.",
    ],
    "New York": [
      "Be cautious when using ATMs and avoid using ones in isolated areas.",
      "Stick to well-lit and populated areas when walking at night.",
    ],
  };

  const travelerTypeTips: Record<string, string[]> = {
    solo: [
      "Let someone know your itinerary and check in regularly.",
      "Avoid sharing too much personal information with strangers.",
      "Consider joining group tours for certain activities.",
    ],
    family: [
      "Establish a meeting point in case anyone gets separated.",
      "Carry identification with emergency contact information for children.",
      "Research family-friendly areas and activities in advance.",
    ],
    couple: [
      "Be cautious of overly friendly strangers who might be trying to scam tourists.",
      "Keep valuables in a secure location and be discreet with expensive items.",
    ],
  };

  return [
    ...generalTips,
    ...(destinationSpecificTips[destination.name] || []),
    ...(travelerTypeTips[travelerType.id.toLowerCase()] || []),
  ];
};

// Mock data generators for different parts of the travel plan
export const generatePlacesToVisit = (
  destination: Destination,
  preferences: TripPreferences,
) => {
  const commonPlaces = [
    {
      name: "Historic Downtown",
      description:
        "Explore the charming streets and historic architecture of the city center.",
      category: "Sightseeing",
      priority: 1,
      ticketInfo: {
        required: false,
        recommended: false,
        bookingAdvice: "Free to explore, just walk around and enjoy the architecture",
        peakTime: [],
        averageWaitTime: "No wait time",
        bookingWindow: "No booking needed",
        alternativeOptions: "Consider guided walking tours for deeper insights",
      },
    },
    {
      name: "Local Market",
      description:
        "Experience local culture and cuisine at the bustling market.",
      category: "Food & Shopping",
      priority: 2,
      ticketInfo: {
        required: false,
        recommended: false,
        bookingAdvice: "Free entry, just bring cash for purchases",
        peakTime: ["Weekend mornings"],
        averageWaitTime: "5-10 minutes during peak hours",
        bookingWindow: "No booking needed",
        alternativeOptions: "Visit early morning or evening for fewer crowds",
      },
    },
    {
      name: `${destination.name} Museum`,
      description: "Learn about the rich history and culture of the region.",
      category: "Cultural",
      priority: 3,
      ticketInfo: {
        required: true,
        recommended: true,
        bookingAdvice: "Advance booking highly recommended, especially during peak season",
        peakTime: ["Summer", "Holiday weekends"],
        averageWaitTime: "30-60 minutes without advance tickets",
        bookingWindow: "Book 1-2 weeks in advance during peak season",
        alternativeOptions: "Early morning or late afternoon visits typically less crowded",
      },
    },
    {
      name: "Scenic Viewpoint",
      description:
        "Enjoy breathtaking panoramic views of the city and surroundings.",
      category: "Nature",
      priority: 4,
      ticketInfo: {
        required: false,
        recommended: false,
        bookingAdvice: "Free access, but check weather conditions before visiting",
        peakTime: ["Sunset hours", "Clear weather days"],
        averageWaitTime: "No wait time typically",
        bookingWindow: "No booking needed",
        alternativeOptions: "Consider sunrise visits for fewer crowds and better lighting",
      },
    },
  ];

  if (preferences.activities.includes("adventure")) {
    commonPlaces.push({
      name: "Adventure Park",
      description: "Experience thrilling outdoor activities and adventures.",
      category: "Adventure",
      priority: 5,
      ticketInfo: {
        required: true,
        recommended: true,
        bookingAdvice: "Advance booking required for most activities, especially during peak season",
        peakTime: ["Summer", "School holidays"],
        averageWaitTime: "45-90 minutes without booking",
        bookingWindow: "Book 3-7 days in advance",
        alternativeOptions: "Weekday visits typically have shorter wait times",
      },
    });
  }

  if (preferences.wantBars) {
    commonPlaces.push({
      name: "Entertainment District",
      description: "Vibrant area with clubs, bars, and live music venues.",
      category: "Nightlife",
      priority: 6,
      ticketInfo: {
        required: false,
        recommended: true,
        bookingAdvice: "No tickets needed for most venues, but VIP tables may require reservations",
        peakTime: ["Weekend nights", "Holiday weekends"],
        averageWaitTime: "15-30 minutes at popular venues",
        bookingWindow: "Same-day reservations usually sufficient",
        alternativeOptions: "Start early in the evening to avoid peak crowds",
      },
    });
  }

  return commonPlaces.sort((a, b) => a.priority - b.priority);
};

export const generateRestaurants = (
  destination: Destination,
  preferences: TripPreferences,
) => {
  const restaurants = [
    {
      name: `${destination.name} Bistro`,
      cuisine: "Local Cuisine",
      priceRange: "$$",
      description:
        "A cozy bistro serving authentic local dishes with a modern twist.",
    },
    {
      name: "The Corner Cafe",
      cuisine: "International",
      priceRange: "$",
      description: "Casual dining with a variety of international dishes.",
    },
    {
      name: "Fine Dining Experience",
      cuisine: "Gourmet",
      priceRange: "$$$",
      description: "An upscale restaurant offering exquisite tasting menus.",
    },
  ];

  // Add vegetarian/vegan options if preferred
  if (
    preferences.activities.includes("vegetarian") ||
    preferences.activities.includes("vegan")
  ) {
    restaurants.push({
      name: "Green Leaf",
      cuisine: "Vegetarian/Vegan",
      priceRange: "$$",
      description: "Plant-based cuisine focusing on fresh, local ingredients.",
    });
  }

  return restaurants;
};

export const generateBars = (destination: Destination): Bar[] => {
  const bars: Bar[] = [
    {
      name: `${destination.name} Craft Brewery`,
      type: "beer",
      atmosphere: "Casual and friendly",
      description: "Local brewery with a variety of craft beers and pub food.",
      category: "Craft Beer",
    },
    {
      name: "Wine Cellar",
      type: "wine",
      atmosphere: "Sophisticated and intimate",
      description: "Extensive wine collection with knowledgeable sommeliers.",
      category: "Wine Bar",
    },
    {
      name: "Mixology Lounge",
      type: "cocktail",
      atmosphere: "Upscale and trendy",
      description:
        "Creative cocktails made with premium spirits and fresh ingredients.",
      category: "Cocktail Lounge",
    },
    {
      name: "The Local Dive",
      type: "dive",
      atmosphere: "Laid-back and authentic",
      description: "No-frills neighborhood bar popular with locals.",
      category: "Dive Bar",
    },
    {
      name: "Rooftop Bar",
      type: "cocktail",
      atmosphere: "Scenic and upscale",
      description:
        "Panoramic city views with premium cocktails and small plates.",
      category: "Rooftop",
    },
  ];

  return bars;
};

export const generateWeatherInfo = (): WeatherInfo => ({
  season: "Spring",
  temperature: "18-25°C",
  conditions: "Mild with occasional rain",
  humidity: "Moderate humidity levels (60-70%)",
  dayNightTempDifference: "Temperature drops 8-10°C at night",
  airQuality: "Good air quality, no special precautions needed",
  feelsLikeWarning: "May feel cooler due to wind and humidity",
  recommendations: [
    "Pack an umbrella",
    "Bring a light jacket",
    "Stay hydrated",
    "Layer your clothing",
  ],
});

export const generateNeighborhoods = (): Neighborhood[] => [
  {
    name: "Historic District",
    summary:
      "The heart of the old city with cobblestone streets and historic architecture",
    vibe: "Charming, walkable, tourist-friendly",
    pros: [
      "Close to major attractions",
      "Great restaurants",
      "Beautiful architecture",
    ],
    cons: ["Can be crowded", "More expensive", "Limited parking"],
    bestFor: "Tourists",
  },
  {
    name: "Arts Quarter",
    summary: "Trendy area with galleries, cafes, and creative spaces",
    vibe: "Hip, artistic, young crowd",
    pros: ["Vibrant nightlife", "Unique shopping", "Local art scene"],
    cons: [
      "Can be noisy at night",
      "Further from main attractions",
      "Limited family activities",
    ],
    bestFor: "Youth",
  },
  {
    name: "Waterfront",
    summary: "Scenic area along the water with parks and promenades",
    vibe: "Relaxed, scenic, upscale",
    pros: ["Beautiful views", "Great for walking/jogging", "High-end dining"],
    cons: ["More expensive", "Can be windy", "Limited late-night options"],
    bestFor: "Tourists",
  },
];

export const generateHotelRecommendations = (
  destination: Destination,
): HotelRecommendation[] => [
  {
    name: `${destination.name} Grand Hotel`,
    neighborhood: "Historic District",
    priceRange: "$$$",
    description:
      "Luxury hotel in the heart of the city, close to major attractions.",
    amenities: [
      "Spa",
      "Fitness Center",
      "Concierge",
      "Restaurant",
      "Room Service",
    ],
  },
  {
    name: `${destination.name} Boutique Inn`,
    neighborhood: "Historic District",
    priceRange: "$$",
    description:
      "Charming boutique hotel with personalized service and unique decor.",
    amenities: [
      "Free WiFi",
      "Continental Breakfast",
      "Business Center",
      "Pet Friendly",
    ],
  },
  {
    name: `${destination.name} Budget Lodge`,
    neighborhood: "Historic District",
    priceRange: "$",
    description: "Clean, comfortable accommodations at an affordable price.",
    amenities: ["Free WiFi", "Parking", "24-hour Front Desk"],
  },
  {
    name: "Waterfront Resort",
    neighborhood: "Waterfront",
    priceRange: "$$$",
    description:
      "Stunning waterfront resort with panoramic views and luxury amenities.",
    amenities: ["Pool", "Spa", "Marina", "Multiple Restaurants", "Golf Course"],
  },
  {
    name: "Arts District Hotel",
    neighborhood: "Arts Quarter",
    priceRange: "$$",
    description:
      "Modern hotel in the trendy arts district, perfect for culture lovers.",
    amenities: ["Art Gallery", "Rooftop Bar", "Fitness Center", "Free WiFi"],
  },
  {
    name: "Creative Hostel",
    neighborhood: "Arts Quarter",
    priceRange: "$",
    description: "Hip hostel with communal spaces and artistic atmosphere.",
    amenities: ["Shared Kitchen", "Common Areas", "Free WiFi", "Laundry"],
  },
];

export const generateTransportationInfo = (): TransportationInfo => ({
  publicTransport:
    "Efficient metro and bus system covering the entire city with frequent service.",
  creditCardPayment: true,
  airportTransport: {
    airports: [
      {
        name: "Main International Airport",
        code: "MIA",
        distanceToCity: "25 km (15 miles) from city center",
        transportOptions: [
          {
            type: "Airport Express Train",
            cost: "$12-15",
            duration: "30 minutes",
            description: "Fastest option, runs every 15 minutes",
            notes: [
              "Purchase tickets at machines or online",
              "Connects directly to city center",
            ],
          },
          {
            type: "Airport Bus",
            cost: "$5-8",
            duration: "45-60 minutes",
            description: "Budget-friendly, multiple stops in city",
            notes: [
              "Stops at major hotels and landmarks",
              "Can be crowded during peak hours",
            ],
          },
          {
            type: "Taxi",
            cost: "$40-60",
            duration: "30-45 minutes",
            description: "Door-to-door service, price varies with traffic",
            notes: [
              "Be careful with unofficial taxis",
              "Use only licensed taxi services",
              "Price may increase significantly in traffic",
            ],
          },
          {
            type: "Rideshare",
            cost: "$25-40",
            duration: "30-45 minutes",
            description: "App-based service, price varies with demand",
            notes: [
              "Follow pickup instructions carefully",
              "Price surge during peak times",
            ],
          },
        ],
      },
      {
        name: "Secondary Regional Airport",
        code: "SRA",
        distanceToCity: "45 km (28 miles) from city center",
        transportOptions: [
          {
            type: "Airport Shuttle",
            cost: "$8-12",
            duration: "60-75 minutes",
            description: "Shared shuttle service to city center",
            notes: [
              "Book in advance for better rates",
              "Multiple pickup points in city",
            ],
          },
          {
            type: "Taxi",
            cost: "$60-80",
            duration: "45-60 minutes",
            description: "Direct service to destination",
            notes: [
              "More expensive due to distance",
              "Consider splitting cost with other passengers",
            ],
          },
          {
            type: "Car Rental",
            cost: "$25-45/day",
            duration: "45-60 minutes",
            description: "Rental car for flexibility",
            notes: [
              "International driving permit required",
              "Parking can be expensive in city center",
            ],
          },
        ],
      },
    ],
  },
  ridesharing:
    "Uber and local ridesharing services widely available throughout the city.",
  taxiInfo: {
    available: true,
    averageCost: "$15-25 for typical city rides",
    tips: [
      "Look for official taxi stands or hail from the street",
      "All taxis should have working meters",
      "Carry cash as some taxis may not accept cards",
      "Agree on fare beforehand for longer trips",
    ],
  },
});

export const generateLocalCurrency = (): CurrencyInfo => ({
  currency: "Local Currency (LC)",
  cashNeeded: true,
  creditCardUsage:
    "Widely accepted in hotels and restaurants, but carry some cash for markets and taxis.",
  tips: [
    "Exchange money at banks or authorized exchange offices for best rates",
    "ATMs are widely available and usually offer good exchange rates",
    "Notify your bank before traveling to avoid card blocks",
    "Keep receipts for major purchases for customs purposes",
  ],
});

export const generateActivities = (
  destination: Destination,
  travelerType: TravelerType,
): RecommendedActivity[] => {
  const baseActivities: RecommendedActivity[] = [
    {
      name: "City Walking Tour",
      type: "Sightseeing",
      description: "Explore the main attractions with a local guide.",
      duration: "2-3 hours",
      localSpecific: true,
    },
    {
      name: "Cooking Class",
      type: "Food & Drink",
      description: "Learn to cook local dishes with a professional chef.",
      duration: "3-4 hours",
      localSpecific: true,
    },
    {
      name: "Traditional Craft Workshop",
      type: "Cultural",
      description: "Learn traditional local crafts from skilled artisans.",
      duration: "2-3 hours",
      localSpecific: true,
    },
    {
      name: "Local Market Tour",
      type: "Food & Culture",
      description: "Guided tour of local markets with tastings.",
      duration: "3-4 hours",
      localSpecific: true,
    },
    {
      name: "Cultural Performance",
      type: "Entertainment",
      description: "Experience traditional music and dance performances.",
      duration: "1-2 hours",
      localSpecific: true,
    },
  ];

  if (travelerType.id === "family") {
    baseActivities.push({
      name: "Family Fun Day",
      type: "Family",
      description: "Activities and attractions suitable for all ages.",
      duration: "Full day",
      localSpecific: false,
    });
  }

  return baseActivities;
};

export const generateMustTryFood = (destination: Destination): MustTryFood => ({
  items: [
    {
      name: `Traditional ${destination.name} Stew`,
      description:
        "A hearty local stew with regional ingredients and traditional spices",
      category: "main" as const,
      whereToFind: "Local restaurants and family-run establishments",
      priceRange: "$$",
    },
    {
      name: "Local Grilled Specialties",
      description:
        "Fresh grilled meats or vegetables prepared with local seasonings",
      category: "main" as const,
      whereToFind: "Street vendors and traditional grills",
      priceRange: "$-$$",
    },
    {
      name: "Traditional Sweet Pastry",
      description:
        "Classic local pastry with traditional fillings and preparation methods",
      category: "dessert" as const,
      whereToFind: "Local bakeries and cafes",
      priceRange: "$",
    },
    {
      name: "Regional Fruit Dessert",
      description: "Seasonal fruit prepared in traditional local style",
      category: "dessert" as const,
      whereToFind: "Markets and dessert shops",
      priceRange: "$",
    },
    {
      name: "Traditional Local Spirit",
      description: "Regional alcoholic beverage with local significance",
      category: "drink" as const,
      whereToFind: "Bars and specialty shops",
      priceRange: "$$",
    },
    {
      name: "Local Liqueur",
      description: "Traditional liqueur made with local ingredients",
      category: "drink" as const,
      whereToFind: "Wine bars and restaurants",
      priceRange: "$$-$$$",
    },
  ],
});

export const generateSocialEtiquette = () => [
  "Greet with a handshake and maintain eye contact",
  "Tipping is appreciated but not always expected",
  "Dress modestly when visiting religious sites",
  "Learn a few basic phrases in the local language",
];

export const generateItinerary = (destination: Destination, days: number) => {
  const itinerary = [];

  // Define activities with their corresponding icon names
  const dailyActivities: Activity[] = [
    {
      time: "09:00 AM",
      title: "Breakfast at Hotel",
      description: "Enjoy a delicious breakfast to start your day.",
      location: "Hotel Restaurant",
      icon: "coffee" as ActivityIconCategory,
    },
    {
      time: "10:30 AM",
      title: "Morning Activity",
      description: "Visit local attractions and landmarks.",
      location: "City Center",
      icon: "compass" as ActivityIconCategory,
    },
    {
      time: "01:00 PM",
      title: "Lunch at Local Restaurant",
      description: "Taste authentic local cuisine.",
      location: "Downtown",
      icon: "utensils" as ActivityIconCategory,
    },
    {
      time: "03:00 PM",
      title: "Afternoon Exploration",
      description: "Continue exploring the city.",
      location: "Various Locations",
      icon: "compass" as ActivityIconCategory,
    },
    {
      time: "07:00 PM",
      title: "Dinner",
      description: "Enjoy dinner at a recommended restaurant.",
      location: "Local Restaurant",
      icon: "utensils" as ActivityIconCategory,
    },
  ];

  // Create itinerary for each day
  for (let i = 1; i <= days; i++) {
    itinerary.push({
      day: i,
      title: `Day ${i}: Exploring ${destination.name}`,
      activities: [...dailyActivities], // Create a new array for each day
    });
  }

  return itinerary;
};

export const generateLocalEvents = (): LocalEvent[] => [
  {
    name: "Annual Cultural Festival",
    type: "Cultural",
    description: "Celebration of local traditions with music, dance, and food.",
    dates: "Varies by season",
    location: "City Center",
  },
  {
    name: "Weekly Farmers Market",
    type: "Market",
    description:
      "Local produce, crafts, and street food from regional vendors.",
    dates: "Every Saturday",
    location: "Main Square",
  },
  {
    name: "Monthly Art Walk",
    type: "Arts",
    description:
      "Gallery openings and street art displays in the arts district.",
    dates: "First Friday of each month",
    location: "Arts Quarter",
  },
];

export const generateTravelPlan = (
  destination: Destination,
  preferences: TripPreferences,
  travelerType: TravelerType,
) => {
  const days = parseInt(preferences.duration.split(" ")[0], 10) || 7; // Default to 7 days if parsing fails

  return {
    destination,
    placesToVisit: generatePlacesToVisit(destination, preferences),
    neighborhoods: generateNeighborhoods(),
    hotelRecommendations: generateHotelRecommendations(destination),
    restaurants: generateRestaurants(destination, preferences),
    bars: preferences.wantBars ? generateBars(destination) : [],
    weatherInfo: generateWeatherInfo(),
    socialEtiquette: generateSocialEtiquette(),
    safetyTips: generateSafetyTips(destination, travelerType),
    transportationInfo: generateTransportationInfo(),
    localCurrency: generateLocalCurrency(),
    tipEtiquette: generateTippingEtiquette(destination),
    activities: generateActivities(destination, travelerType),
    mustTryFood: generateMustTryFood(destination),
    tapWaterSafe: generateTapWaterInfo(destination),
    localEvents: generateLocalEvents(),
    history: `${destination.name} has a rich history spanning centuries, with influences from various cultures and periods. The city has evolved from its ancient origins to become a modern destination while preserving its cultural heritage and traditions.`,
    itinerary: generateItinerary(destination, days),
  };
};

// Development mock data for testing enhanced features
export const generateDevMockData = (): {
  travelerType: TravelerType;
  destination: Destination;
  response: AITripPlanningResponse;
} => {
  // Use centralized traveler type
  const mockTravelerType = travelerTypesLookup.explorer;

  // Use existing destinations instead of hardcoded data
  const mockDestination =
    destinations.find((d) => d.id === "japan") || destinations[0];

  const mockPreferences = {
    timeOfYear: "Spring",
    duration: "7 days",
    budget: "mid-range" as const,
    specialActivities: "sightseeing, food tours",
    activities: ["sightseeing", "food"],
    accommodation: "hotel" as const,
    transportation: "public transport" as const,
    wantRestaurants: true,
    wantBars: false,
    tripType: "cultural" as const,
    activityLevel: "moderate" as const,
    priority: "culture",
    vibe: "relaxed",
  };

  // Use the main travel plan generator instead of hardcoded data
  const plan = generateTravelPlan(
    mockDestination,
    mockPreferences,
    mockTravelerType,
  );

  const mockResponse: AITripPlanningResponse = {
    plan,
    reasoning: "Mock data for development testing",
    confidence: 0.95,
    personalizations: [
      "Tailored for Explorer traveler type",
      "Includes authentic experiences",
      "Balanced traditional and modern activities",
    ],
  };

  return {
    travelerType: mockTravelerType,
    destination: mockDestination,
    response: mockResponse,
  };
};

// Generate mock destination recommendations response for dev mode
export const generateDevMockDestinationData = () => {
  // Use centralized traveler type
  const mockTravelerType = travelerTypesLookup.explorer;

  return {
    travelerType: mockTravelerType,
    destinationResponse: {
      destinations: destinations, // Already using centralized destinations
      reasoning: "Mock destinations loaded for development",
      confidence: 1.0,
    },
  };
};
