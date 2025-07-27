export interface TravelerType {
  id: string;
  name: string;
  description: string;
  icon: string;
  showPlaceholder: boolean;
  placeholderMessage?: string;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  description: string;
  image: string;
  highlights: string[];
  bestTime: string;
  budget: string;
}

export interface DestinationKnowledge {
  type: 'yes' | 'country' | 'no-clue';
  label: string;
  description: string;
}

export interface PickDestinationPreferences {
  region?: string;
  timeOfYear: string;
  duration: string;
  budget: string;
  tripType: string;
  specialActivities: string;
  weather: string;
  priority: string;
}

export interface TripPreferences {
  duration: string;
  budget: string;
  activities: string[];
  accommodation: string;
  transportation: string;
  wantRestaurants: boolean;
  wantBars: boolean;
  tripType: string;
  // Explorer specific
  activityLevel?: string;
  riskTolerance?: string;
  spontaneity?: string;
  // Type A specific
  scheduleDetail?: string;
  bookingPreference?: string;
  backupPlans?: string;
  // Bougie specific
  luxuryLevel?: string;
  serviceLevel?: string;
  exclusivity?: string;
  // Chill specific
  relaxationStyle?: string;
  pacePreference?: string;
  stressLevel?: string;
}

export interface EnhancedTravelPlan {
  destination: Destination;
  placesToVisit: PlaceToVisit[];
  restaurants: Restaurant[];
  bars: Bar[];
  weatherInfo: WeatherInfo;
  socialEtiquette: string[];
  hotelRecommendation: HotelRecommendation;
  transportationInfo: TransportationInfo;
  localCurrency: CurrencyInfo;
  activities: RecommendedActivity[];
  itinerary: ItineraryDay[];
  mustTryFood: string[];
}

export interface PlaceToVisit {
  name: string;
  description: string;
  category: string;
  priority: number;
}

export interface Restaurant {
  name: string;
  cuisine: string;
  priceRange: string;
  description: string;
}

export interface Bar {
  name: string;
  type: string;
  atmosphere: string;
  description: string;
}

export interface WeatherInfo {
  season: string;
  temperature: string;
  conditions: string;
  recommendations: string[];
}

export interface HotelRecommendation {
  name: string;
  area: string;
  priceRange: string;
  description: string;
}

export interface TransportationInfo {
  publicTransport: string;
  airportTransport: string;
  ridesharing: string;
  taxiInfo: string;
}

export interface CurrencyInfo {
  currency: string;
  cashNeeded: boolean;
  creditCardUsage: string;
  tips: string[];
}

export interface RecommendedActivity {
  name: string;
  type: string;
  description: string;
  duration: string;
}

export interface TravelPlan {
  destination: Destination;
  itinerary: ItineraryDay[];
  totalBudget: string;
  recommendations: string[];
}

export interface ItineraryDay {
  day: number;
  title: string;
  activities: Activity[];
}

export interface Activity {
  time: string;
  title: string;
  description: string;
  location: string;
}

export interface DestinationRecommendation {
  id: string;
  name: string;
  country: string;
  summary: string;
  images: string[];
  moreInfoLink: string;
  highlights: string[];
  bestFor: string[];
}