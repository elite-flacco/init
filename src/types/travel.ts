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
  details?: string;
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
  destinationType: string;
}

export interface TripPreferences {
  timeOfYear: string;
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
  neighborhoods: Neighborhood[];
  hotelRecommendations: HotelRecommendation[];
  restaurants: Restaurant[];
  bars: Bar[];
  weatherInfo: WeatherInfo;
  socialEtiquette: string[];
  safetyTips: string[];
  transportationInfo: TransportationInfo;
  localCurrency: CurrencyInfo;
  tipEtiquette: TipEtiquette;
  activities: RecommendedActivity[];
  mustTryFood: MustTryFood;
  tapWaterSafe: TapWaterInfo;
  localEvents: LocalEvent[];
  history: string;
  itinerary: ItineraryDay[];
}

export interface PlaceToVisit {
  name: string;
  description: string;
  category: string;
  priority: number;
}

export interface Neighborhood {
  name: string;
  summary: string;
  vibe: string;
  pros: string[];
  cons: string[];
  bestFor: string;
}

export interface Restaurant {
  name: string;
  cuisine: string;
  priceRange: string;
  description: string;
  neighborhood?: string;
  specialDishes?: string[];
  reservationsRecommended?: string;
}

export interface Bar {
  name: string;
  type: 'beer' | 'wine' | 'cocktail' | 'dive' | 'other';
  atmosphere: string;
  description: string;
  category: string;
  neighborhood?: string;
}

export interface WeatherInfo {
  season: string;
  temperature: string;
  conditions: string;
  humidity: string;
  dayNightTempDifference: string;
  airQuality: string;
  feelsLikeWarning: string;
  recommendations: string[];
}

export interface HotelRecommendation {
  name: string;
  neighborhood: string;
  priceRange: string;
  description: string;
  amenities: string[];
  airbnbLink?: string;
}

export interface TransportationInfo {
  publicTransport: string;
  creditCardPayment: boolean;
  airportTransport: AirportTransportInfo;
  ridesharing: string;
  taxiInfo: TaxiInfo;
}

export interface AirportTransportInfo {
  airports: Airport[];
}

export interface Airport {
  name: string;
  code: string;
  distanceToCity: string;
  transportOptions: TransportOption[];
}

export interface TransportOption {
  type: string;
  cost: string;
  duration: string;
  description: string;
  notes?: string[];
}

export interface TaxiInfo {
  available: boolean;
  averageCost: string;
  tips: string[];
}

export interface CurrencyInfo {
  currency: string;
  cashNeeded: boolean;
  creditCardUsage: string;
  tips: string[];
  exchangeRate?: {
    from: string;
    to: string;
    rate: number;
    lastUpdated: string;
  };
}

export interface TipEtiquette {
  restaurants: string;
  bars: string;
  taxis: string;
  hotels: string;
  tours: string;
  general: string;
}

export interface RecommendedActivity {
  name: string;
  type: string;
  description: string;
  duration: string;
  localSpecific: boolean;
  bookingLink?: string;
  experienceType?: 'airbnb' | 'getyourguide' | 'viator' | 'other';
}

export interface FoodItem {
  name: string;
  description: string;
  category: 'main' | 'dessert' | 'drink' | 'snack';
  whereToFind?: string;
  priceRange?: string;
}

export interface MustTryFood {
  items: FoodItem[];
}

export interface TapWaterInfo {
  safe: boolean;
  details: string;
}

export interface LocalEvent {
  name: string;
  type: string;
  description: string;
  dates: string;
  location: string;
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
  icon: string;
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