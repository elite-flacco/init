export interface TravelerType {
  id: string;
  name: string;
  description: string;
  icon: string;
  showPlaceholder: boolean;
  placeholderMessage?: string;
  greeting?: string;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  description: string;
  keyActivities: string[];
  matchReason: string;
  estimatedCost: string;
  image: string;
  highlights: { name: string; description: string }[];
  bestTimeToVisit: string;
  details?: string;
}

export interface DestinationKnowledge {
  type: "yes" | "country" | "no-clue";
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
  vibe: string;
}

export interface TripPreferences {
  timeOfYear: string;
  duration: string;
  budget: string;
  specialActivities: string;
  activities: string[];
  accommodation: string;
  transportation: string;
  wantRestaurants: boolean;
  wantBars: boolean;
  tripType: string;
  priority: string;
  vibe: string;
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

// Place categories for structured classification
export const PLACE_CATEGORIES = [
  "cultural",
  "historical",
  "nature",
  "entertainment",
  "museum",
  "landmark",
  "culinary",
] as const;

export type PlaceCategory = (typeof PLACE_CATEGORIES)[number];

export interface PlaceToVisit {
  name: string;
  description: string;
  category: PlaceCategory;
  priority: number;
  ticketInfo?: TicketBookingInfo;
}

export interface TicketBookingInfo {
  required: boolean;
  recommended: boolean;
  bookingAdvice: string;
  peakTime?: string[];
  averageWaitTime?: string;
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
  type: "beer" | "wine" | "cocktail" | "dive" | "other";
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
  experienceType?: "airbnb" | "getyourguide" | "viator" | "other";
}

export interface FoodItem {
  name: string;
  description: string;
  category: "main" | "dessert" | "drink" | "snack";
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

// Define fixed icon categories that map to our icon system
export const ACTIVITY_ICON_CATEGORIES = [
  "coffee", // Coffee/drinks/beverages
  "hotel", // Hotels/accommodation/lodging
  "utensils", // Food/restaurants/dining/meals
  "compass", // Exploration/discovery/wandering
  "camera", // Sightseeing/photography/attractions/monuments
  "travel", // Transportation/flights/journeys
  "adventure", // Activities/outdoor/excursions/tours
] as const;

export type ActivityIconCategory = (typeof ACTIVITY_ICON_CATEGORIES)[number];

export interface Activity {
  time: string;
  title: string;
  description: string;
  location: string;
  icon: ActivityIconCategory;
}

export interface DestinationRecommendation {
  id: string;
  name: string;
  country: string;
  summary: string;
  images: string[];
  moreInfoLink: string;
  highlights: { name: string; description: string }[];
  bestFor: string[];
}

// Streaming types for trip planning

export interface ChunkInfo {
  chunkId: number;
  totalChunks: number;
  section: string;
  description: string;
}

export interface ChunkedResponse {
  chunk: ChunkInfo;
  data: Record<string, unknown>;
  isComplete: boolean;
  sessionId: string;
}

export interface ParallelChunkingState {
  isLoading: boolean;
  completedChunks: number;
  totalChunks: number;
  chunks: Record<number, Record<string, unknown>>;
  chunkStatuses: Record<number, "pending" | "loading" | "completed" | "error">;
  combinedData: EnhancedTravelPlan | null;
  error: string | null;
}

export interface StreamingPlanSection {
  id: string;
  title: string;
  data: Record<string, unknown> | null;
  isLoading: boolean;
  error: string | null;
  preview: string[];
}
