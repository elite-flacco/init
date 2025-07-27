import { useState, useEffect } from 'react';
import { Sparkles, MapPin, Utensils, Compass, Download, Share2 } from 'lucide-react';
import { Destination, TripPreferences, TravelerType } from '../types/travel';
import { generateTravelPlan as generateMockTravelPlan } from '../data/mock/travelData';

// Type Definitions
interface Activity {
  time: string;
  title: string;
  description: string;
  location: string;
  icon: string;
}

interface DayItinerary {
  day: number;
  title: string;
  activities: Activity[];
}

interface PlaceToVisit {
  name: string;
  description: string;
  category: string;
  priority: number;
}

interface Restaurant {
  name: string;
  cuisine: string;
  priceRange: string;
  description: string;
}

interface Bar {
  name: string;
  type: string;
  atmosphere: string;
  description: string;
}

interface WeatherInfo {
  season: string;
  temperature: string;
  conditions: string;
  recommendations: string[];
}

interface HotelRecommendation {
  name: string;
  area: string;
  priceRange: string;
  description: string;
}

interface TransportationInfo {
  publicTransport: string;
  airportTransport: string;
  ridesharing: string;
  taxiInfo: string;
}

interface LocalCurrency {
  currency: string;
  cashNeeded: boolean;
  creditCardUsage: string;
  tips: string[];
}

interface ActivityItem {
  name: string;
  type: string;
  description: string;
  duration: string;
}

interface TippingEtiquette {
  [key: string]: string;
}

interface TapWaterInfo {
  safe: boolean;
  details: string;
  recommendations?: string[];
}

interface TravelPlanData {
  placesToVisit: PlaceToVisit[];
  restaurants: Restaurant[];
  bars: Bar[];
  weatherInfo: WeatherInfo;
  socialEtiquette: string[];
  hotelRecommendation: HotelRecommendation;
  transportationInfo: TransportationInfo;
  localCurrency: LocalCurrency;
  activities: ActivityItem[];
  itinerary: DayItinerary[];
  mustTryFood: string[];
  safetyTips: string[];
  tippingEtiquette: TippingEtiquette;
  tapWater: TapWaterInfo;
}

interface TravelPlanProps {
  destination: Destination;
  preferences: TripPreferences;
  travelerType: TravelerType;
}

// This function can be replaced with a real API call in the future
function generateTravelPlan(
  destination: Destination,
  preferences: TripPreferences,
  travelerType: TravelerType
): TravelPlanData {
  return generateMockTravelPlan(destination, preferences, travelerType);
}

export function TravelPlan({ destination, preferences, travelerType }: TravelPlanProps) {
  const [isGenerating, setIsGenerating] = useState(true);
  const [travelPlan, setTravelPlan] = useState<TravelPlanData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'info'>('itinerary');

  useEffect(() => {
    const generatePlan = async () => {
      try {
        console.log('Starting to generate travel plan...', {
          destination: destination?.name,
          hasPreferences: !!preferences,
          hasTravelerType: !!travelerType?.id,
          preferences,
          travelerType: travelerType?.id
        });

        if (!destination || !preferences || !travelerType) {
          throw new Error('Missing required data for generating travel plan');
        }

        const plan = generateTravelPlan(destination, preferences, travelerType);

        if (!plan) {
          throw new Error('generateTravelPlan returned null/undefined');
        }

        setTravelPlan(plan);
        setIsGenerating(false);

        // Small delay for animation
        await new Promise(resolve => setTimeout(resolve, 100));
        setIsLoaded(true);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setIsGenerating(false);
      }
    };

    generatePlan();
  }, [destination, preferences, travelerType]);

  // Helper function to get icon component based on icon name
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'coffee':
        return <Sparkles className="w-5 h-5 text-amber-500" />;
      case 'map':
        return <MapPin className="w-5 h-5 text-blue-500" />;
      case 'utensils':
        return <Utensils className="w-5 h-5 text-green-500" />;
      case 'compass':
        return <Compass className="w-5 h-5 text-purple-500" />;
      default:
        return <MapPin className="w-5 h-5 text-gray-500" />;
    }
  };

  // Render a single activity item
  const renderActivity = (activity: Activity, index: number) => (
    <div key={index} className="relative pl-6">
      <div className="absolute left-0 top-2 w-2 h-2 rounded-full bg-primary"></div>
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-1 mr-3">
          {activity.icon ? getIconComponent(activity.icon) : <MapPin className="w-5 h-5 text-gray-500" />}
        </div>
        <div>
          <div className="text-sm font-medium text-muted-foreground">{activity.time}</div>
          <h3 className="text-lg font-semibold text-foreground">{activity.title}</h3>
          {activity.location && (
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <MapPin className="w-4 h-4 mr-1" />
              {activity.location}
            </div>
          )}
          {activity.description && (
            <p className="text-foreground/90 mt-1">{activity.description}</p>
          )}
        </div>
      </div>
    </div>
  );

  // Render a single day's itinerary
  const renderDayItinerary = (day: DayItinerary) => (
    <div key={day.day} className="mb-12">
      <h2 className="text-2xl font-bold text-foreground mb-6 pb-2 border-b border-border">
        {day.title}
      </h2>
      <div className="space-y-6">
        {day.activities.map((activity, index) => renderActivity(activity, index))}
      </div>
    </div>
  );

  // Loading state
  if (isGenerating || !travelPlan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">Creating Your Travel Plan</h2>
            <p className="text-muted-foreground mb-6">
              Gathering the best recommendations for your trip to {destination?.name || 'your destination'}...
            </p>
            <div className="w-64 h-2 bg-background-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full animate-pulse"
                style={{
                  width: '70%',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Your Travel Plan</h1>
            <p className="text-muted-foreground">
              Here's your personalized travel plan for {destination.name}
            </p>
          </div>
          <div className="flex space-x-3 mt-4 md:mt-0">
            <button
              className="flex items-center px-4 py-2 bg-background-muted hover:bg-background-muted/80 rounded-lg transition-colors"
              onClick={() => console.log('Download clicked')}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Itinerary
            </button>
            <button
              className="flex items-center px-4 py-2 bg-background-muted hover:bg-background-muted/80 rounded-lg transition-colors"
              onClick={() => console.log('Share clicked')}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="bg-card rounded-lg p-2 shadow-sm">
            <nav className="flex space-x-2">
              <button
                onClick={() => setActiveTab('itinerary')}
                className={`flex-1 py-3 px-6 font-medium text-sm rounded-md transition-all duration-200 ${
                  activeTab === 'itinerary'
                    ? 'bg-primary/25 text-primary-foreground shadow-sm'
                    : 'bg-background-muted text-muted-foreground hover:text-foreground hover:bg-background-muted'
                }`}
              >
                📅 Itinerary
              </button>
              <button
                onClick={() => setActiveTab('info')}
                className={`flex-1 py-3 px-6 font-medium text-sm rounded-md transition-all duration-200 ${
                  activeTab === 'info'
                    ? 'bg-primary/25 text-primary-foreground shadow-sm'
                    : 'bg-background-muted text-muted-foreground hover:text-foreground hover:bg-background-muted'
                }`}
              >
                ℹ️ Travel Info
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'itinerary' && (
          <div className="space-y-8">
            {/* Itinerary */}
            <div className="bg-card rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">Your Itinerary</h2>
              {travelPlan.itinerary.length > 0 ? (
                <div className="space-y-6">
                  {travelPlan.itinerary.map((day) => (
                    renderDayItinerary(day)
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No itinerary available for this destination.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'info' && (
          <div className="space-y-8">

          {/* Places to Visit */}
          <div className="bg-card rounded-lg shadow p-6">
            <h4 className="mb-6">Places to Visit</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {travelPlan.placesToVisit.map((place, index) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold text-foreground">{place.name}</h3>
                  <p className="text-muted-foreground text-sm mt-1">{place.category}</p>
                  <p className="text-foreground/90 mt-2">{place.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Food & Drinks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Restaurants */}
            <div className="bg-card rounded-lg shadow p-6">
              <h4 className="mb-6">Recommended Restaurants</h4>
              <div className="space-y-4">
                {travelPlan?.restaurants.map((restaurant, index) => (
                  <div key={index} className="border-b border-border pb-4 last:border-0 last:pb-0">
                    <h6 className="font-medium text-foreground">{restaurant.name}</h6>
                    <p className="text-sm text-muted-foreground">{restaurant.cuisine} • {restaurant.priceRange}</p>
                    <p className="text-foreground/90 mt-1 text-sm">{restaurant.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bars */}
            {travelPlan?.bars && travelPlan.bars.length > 0 && (
              <div className="bg-card rounded-lg shadow p-6">
                <h4 className="mb-6">Nightlife</h4>
                <div className="space-y-4">
                  {travelPlan?.bars.map((bar, index) => (
                    <div key={index} className="border-b border-border pb-4 last:border-0 last:pb-0">
                      <h6 className="font-medium text-foreground">{bar.name}</h6>
                      <p className="text-sm text-muted-foreground">{bar.type} • {bar.atmosphere}</p>
                      <p className="text-foreground/90 mt-1 text-sm">{bar.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Local Currency */}
            <div className="bg-card rounded-lg shadow p-6">
              <h4 className="mb-6">Local Currency</h4>
              <p className="text-foreground">
                The local currency is <span className="font-medium">{travelPlan?.localCurrency.currency}</span>.
                {travelPlan?.localCurrency.cashNeeded ? ' It\'s recommended to carry some cash.' : ' Credit cards are widely accepted.'}
              </p>
              {travelPlan?.localCurrency?.tips && travelPlan.localCurrency.tips.length > 0 && (
                <div className="mt-4">
                  <h6 className="mb-2">Money Tips:</h6>
                  <ul className="space-y-2">
                    {travelPlan?.localCurrency.tips.map((tip, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-primary mr-2">•</span>
                        <span className="text-foreground">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Social Etiquette */}
            <div className="bg-card rounded-lg shadow p-6">
              <h4 className="mb-6">Social Etiquette</h4>
              <ul className="space-y-3">
                {travelPlan?.socialEtiquette.map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span className="text-foreground">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Must-Try Local Food Section */}
          <section className="mb-12">
            <h4 className="mb-6 flex items-center">
              <Utensils className="mr-2" /> Must-Try Local Food
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {travelPlan.mustTryFood.map((food, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
                  <p className="font-medium">{food}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Safety Tips Section */}
          <section className="mb-12">
            <h4 className="mb-6 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Local Safety Tips
            </h4>
            <div className="space-y-4">
              {travelPlan.safetyTips && travelPlan.safetyTips.length > 0 ? (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <ul className="divide-y divide-gray-100">
                    {travelPlan.safetyTips.map((tip, index) => (
                      <li key={index} className="p-4 hover:bg-gray-50">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 h-6 w-6 text-blue-500">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <p className="ml-3 text-gray-700">{tip}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-gray-500 italic">No specific safety tips available for this destination.</p>
              )}
            </div>
          </section>

          {/* Tipping Etiquette Section */}
          <section className="mb-12">
            <h4 className="mb-6 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Tipping Etiquette
            </h4>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <ul className="divide-y divide-gray-100">
                {Object.entries(travelPlan.tippingEtiquette || {}).map(([category, tip], index) => (
                  <li key={index} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 text-blue-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-medium text-gray-900">{category}</h3>
                        <p className="mt-1 text-gray-600">{tip}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Tap Water Safety Section */}
          <section className="mb-12">
            <h4 className="mb-6 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              Tap Water Safety
            </h4>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex items-start">
                  <div className={`flex-shrink-0 h-6 w-6 ${travelPlan.tapWater.safe ? 'text-green-500' : 'text-yellow-500'}`}>
                    {travelPlan.tapWater.safe ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      {travelPlan.tapWater.safe ? 'Tap water is safe to drink' : 'Tap water is not recommended for drinking'}
                    </h3>
                    <p className="mt-1 text-gray-600">{travelPlan.tapWater.details}</p>
                    
                    {travelPlan.tapWater.recommendations && travelPlan.tapWater.recommendations.length > 0 && (
                      <div className="mt-4">
                        <h6 className="mb-2">Recommendations:</h6>
                        <ul className="list-disc pl-5 space-y-1 text-gray-600">
                          {travelPlan.tapWater.recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

            {/* Transportation */}
            <div className="bg-card rounded-lg shadow p-6">
              <h4 className="mb-6">Getting Around</h4>
              <div className="space-y-6">
                <div>
                  <h6 className="mb-2">Public Transportation</h6>
                  <p className="text-muted-foreground">{travelPlan?.transportationInfo.publicTransport}</p>
                </div>
                <div>
                  <h6 className="mb-2">From the Airport</h6>
                  <p className="text-muted-foreground">{travelPlan?.transportationInfo.airportTransport}</p>
                </div>
                <div>
                  <h6 className="mb-2">Taxis & Rideshares</h6>
                  <p className="text-muted-foreground">{travelPlan?.transportationInfo.taxiInfo}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TravelPlan;
