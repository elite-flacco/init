import { useState, useEffect } from 'react';
import { Sparkles, MapPin, Utensils, Compass, Download, Share2, Home, Shield, CreditCard, Droplets, Calendar, BookOpen } from 'lucide-react';
import { Destination, TripPreferences, TravelerType, EnhancedTravelPlan } from '../types/travel';
import { generateTravelPlan as generateMockTravelPlan } from '../data/mock/travelData';

// Type Definitions - using Activity interface for backward compatibility  
interface Activity {
  time: string;
  title: string;
  description: string;
  location: string;
  icon: string;
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
): EnhancedTravelPlan {
  return generateMockTravelPlan(destination, preferences, travelerType);
}

export function TravelPlan({ destination, preferences, travelerType }: TravelPlanProps) {
  const [isGenerating, setIsGenerating] = useState(true);
  const [travelPlan, setTravelPlan] = useState<EnhancedTravelPlan | null>(null);
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
  const renderDayItinerary = (day: any) => (
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
            {/* Neighborhoods */}
            <div className="bg-card rounded-lg shadow p-6">
              <h4 className="mb-6 flex items-center">
                <Home className="mr-2" /> Neighborhoods
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {travelPlan.neighborhoods?.map((neighborhood, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-semibold text-foreground">{neighborhood.name}</h3>
                    <p className="text-muted-foreground text-sm mt-1">{neighborhood.vibe}</p>
                    <p className="text-foreground/90 mt-2">{neighborhood.summary}</p>
                    <div className="mt-4">
                      <h6 className="text-sm font-medium text-green-600">Pros:</h6>
                      <ul className="text-sm text-foreground/80">
                        {neighborhood.pros.map((pro, idx) => (
                          <li key={idx}>• {pro}</li>
                        ))}
                      </ul>
                      <h6 className="text-sm font-medium text-amber-600 mt-2">Cons:</h6>
                      <ul className="text-sm text-foreground/80">
                        {neighborhood.cons.map((con, idx) => (
                          <li key={idx}>• {con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hotel Recommendations */}
            <div className="bg-card rounded-lg shadow p-6">
              <h4 className="mb-6 flex items-center">
                <Home className="mr-2" /> Hotel Recommendations
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {travelPlan.hotelRecommendations?.map((hotel, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-semibold text-foreground">{hotel.name}</h3>
                    <p className="text-muted-foreground text-sm mt-1">{hotel.neighborhood} • {hotel.priceRange}</p>
                    <p className="text-foreground/90 mt-2">{hotel.description}</p>
                    <div className="mt-3">
                      <h6 className="text-sm font-medium">Amenities:</h6>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {hotel.amenities.map((amenity, idx) => (
                          <span key={idx} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Places to Visit */}
            <div className="bg-card rounded-lg shadow p-6">
              <h4 className="mb-6 flex items-center">
                <MapPin className="mr-2" /> Places to Visit
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {travelPlan.placesToVisit?.map((place, index) => (
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
                <h4 className="mb-6 flex items-center">
                  <Utensils className="mr-2" /> Restaurants
                </h4>
                <div className="space-y-4">
                  {travelPlan?.restaurants?.map((restaurant, index) => (
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
                  <h4 className="mb-6 flex items-center">
                    <Utensils className="mr-2" /> Bars & Nightlife
                  </h4>
                  <div className="space-y-4">
                    {travelPlan?.bars.map((bar, index) => (
                      <div key={index} className="border-b border-border pb-4 last:border-0 last:pb-0">
                        <h6 className="font-medium text-foreground">{bar.name}</h6>
                        <p className="text-sm text-muted-foreground">{bar.category} • {bar.atmosphere}</p>
                        <p className="text-foreground/90 mt-1 text-sm">{bar.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Weather Information */}
            <div className="bg-card rounded-lg shadow p-6">
              <h4 className="mb-6 flex items-center">
                <Compass className="mr-2" /> Weather Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h6 className="mb-2 font-medium">Conditions</h6>
                  <p className="text-foreground/90">{travelPlan?.weatherInfo.temperature} • {travelPlan?.weatherInfo.conditions}</p>
                  <p className="text-sm text-muted-foreground mt-1">{travelPlan?.weatherInfo.humidity}</p>
                  <p className="text-sm text-muted-foreground">{travelPlan?.weatherInfo.dayNightTempDifference}</p>
                </div>
                <div>
                  <h6 className="mb-2 font-medium">Important Notes</h6>
                  <p className="text-sm text-foreground/90">{travelPlan?.weatherInfo.airQuality}</p>
                  <p className="text-sm text-foreground/90">{travelPlan?.weatherInfo.feelsLikeWarning}</p>
                  <div className="mt-3">
                    <h6 className="text-sm font-medium">Recommendations:</h6>
                    <ul className="space-y-1 mt-1">
                      {travelPlan?.weatherInfo.recommendations?.map((rec, index) => (
                        <li key={index} className="flex items-start text-sm">
                          <span className="text-primary mr-2">•</span>
                          <span className="text-foreground/90">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Must-Try Local Food */}
            <div className="bg-card rounded-lg shadow p-6">
              <h4 className="mb-6 flex items-center">
                <Utensils className="mr-2" /> Must-Try Local Food
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h6 className="mb-3 font-medium">Main Dishes</h6>
                  <ul className="space-y-2">
                    {travelPlan.mustTryFood?.mainDishes?.map((dish, index) => (
                      <li key={index} className="bg-background-muted rounded p-3 text-sm">
                        {dish}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h6 className="mb-3 font-medium">Desserts</h6>
                  <ul className="space-y-2">
                    {travelPlan.mustTryFood?.desserts?.map((dessert, index) => (
                      <li key={index} className="bg-background-muted rounded p-3 text-sm">
                        {dessert}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h6 className="mb-3 font-medium">Local Drinks</h6>
                  <ul className="space-y-2">
                    {travelPlan.mustTryFood?.localAlcohol?.map((drink, index) => (
                      <li key={index} className="bg-background-muted rounded p-3 text-sm">
                        {drink}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Safety & Etiquette */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Safety Tips */}
              <div className="bg-card rounded-lg shadow p-6">
                <h4 className="mb-6 flex items-center">
                  <Shield className="mr-2" /> Safety Tips
                </h4>
                <ul className="space-y-3">
                  {travelPlan?.safetyTips?.map((tip, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span className="text-foreground text-sm">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Social Etiquette */}
              <div className="bg-card rounded-lg shadow p-6">
                <h4 className="mb-6 flex items-center">
                  <BookOpen className="mr-2" /> Social Etiquette
                </h4>
                <ul className="space-y-3">
                  {travelPlan?.socialEtiquette?.map((tip, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span className="text-foreground text-sm">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Transportation */}
            <div className="bg-card rounded-lg shadow p-6">
              <h4 className="mb-6 flex items-center">
                <Compass className="mr-2" /> Transportation
              </h4>
              <div className="space-y-6">
                <div>
                  <h6 className="mb-2 font-medium">Public Transportation</h6>
                  <p className="text-foreground/90 text-sm">{travelPlan?.transportationInfo.publicTransport}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Credit card payments: {travelPlan?.transportationInfo.creditCardPayment ? 'Accepted' : 'Not accepted'}
                  </p>
                </div>
                <div>
                  <h6 className="mb-2 font-medium">Airport Transportation</h6>
                  <p className="text-sm text-muted-foreground mb-2">{travelPlan?.transportationInfo.airportTransport?.mainAirport} - {travelPlan?.transportationInfo.airportTransport?.distanceToCity}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {travelPlan?.transportationInfo.airportTransport?.transportOptions?.map((option, index) => (
                      <div key={index} className="bg-background-muted rounded p-3">
                        <h6 className="font-medium text-sm">{option.type}</h6>
                        <p className="text-xs text-muted-foreground">{option.cost} • {option.duration}</p>
                        <p className="text-xs text-foreground/80 mt-1">{option.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h6 className="mb-2 font-medium">Taxis & Rideshares</h6>
                  <p className="text-foreground/90 text-sm">{travelPlan?.transportationInfo.ridesharing}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Average cost: {travelPlan?.transportationInfo.taxiInfo?.averageCost}
                  </p>
                  {travelPlan?.transportationInfo.taxiInfo?.tips && (
                    <ul className="mt-2 space-y-1">
                      {travelPlan.transportationInfo.taxiInfo.tips.map((tip, index) => (
                        <li key={index} className="flex items-start text-xs">
                          <span className="text-primary mr-1">•</span>
                          <span className="text-foreground/80">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Currency & Payments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Local Currency */}
              <div className="bg-card rounded-lg shadow p-6">
                <h4 className="mb-6 flex items-center">
                  <CreditCard className="mr-2" /> Currency & Payments
                </h4>
                <p className="text-foreground">
                  The local currency is <span className="font-medium">{travelPlan?.localCurrency.currency}</span>.
                  {travelPlan?.localCurrency.cashNeeded ? ' Cash is recommended for some purchases.' : ' Credit cards are widely accepted.'}
                </p>
                <p className="text-sm text-foreground/80 mt-2">{travelPlan?.localCurrency.creditCardUsage}</p>
                {travelPlan?.localCurrency?.tips && travelPlan.localCurrency.tips.length > 0 && (
                  <div className="mt-4">
                    <h6 className="mb-2 font-medium">Money Tips:</h6>
                    <ul className="space-y-2">
                      {travelPlan?.localCurrency.tips.map((tip, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-primary mr-2">•</span>
                          <span className="text-foreground text-sm">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Tipping Etiquette */}
              <div className="bg-card rounded-lg shadow p-6">
                <h4 className="mb-6 flex items-center">
                  <CreditCard className="mr-2" /> Tipping Etiquette
                </h4>
                <div className="space-y-3">
                  {travelPlan?.tipEtiquette && Object.entries(travelPlan.tipEtiquette).map(([category, tip], index) => (
                    <div key={index}>
                      <h6 className="font-medium text-sm capitalize">{category}:</h6>
                      <p className="text-foreground/80 text-sm">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tap Water Safety */}
            <div className="bg-card rounded-lg shadow p-6">
              <h4 className="mb-6 flex items-center">
                <Droplets className="mr-2" /> Tap Water Safety
              </h4>
              <div className="flex items-start">
                <div className={`flex-shrink-0 h-6 w-6 ${travelPlan?.tapWaterSafe?.safe ? 'text-green-500' : 'text-yellow-500'}`}>
                  {travelPlan?.tapWaterSafe?.safe ? (
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
                  <h3 className="text-lg font-medium text-foreground">
                    {travelPlan?.tapWaterSafe?.safe ? 'Tap water is safe to drink' : 'Tap water is not recommended for drinking'}
                  </h3>
                  <p className="mt-1 text-foreground/80">{travelPlan?.tapWaterSafe?.details}</p>
                  
                  {travelPlan?.tapWaterSafe?.recommendations && travelPlan.tapWaterSafe.recommendations.length > 0 && (
                    <div className="mt-4">
                      <h6 className="mb-2 font-medium">Recommendations:</h6>
                      <ul className="list-disc pl-5 space-y-1 text-foreground/80">
                        {travelPlan.tapWaterSafe.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm">{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Local Events */}
            {travelPlan?.localEvents && travelPlan.localEvents.length > 0 && (
              <div className="bg-card rounded-lg shadow p-6">
                <h4 className="mb-6 flex items-center">
                  <Calendar className="mr-2" /> Local Events
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {travelPlan.localEvents.map((event, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <h3 className="text-lg font-semibold text-foreground">{event.name}</h3>
                      <p className="text-muted-foreground text-sm mt-1">{event.type} • {event.dates}</p>
                      <p className="text-foreground/90 mt-2 text-sm">{event.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">📍 {event.location}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Historical Context */}
            {travelPlan?.history && (
              <div className="bg-card rounded-lg shadow p-6">
                <h4 className="mb-6 flex items-center">
                  <BookOpen className="mr-2" /> Historical Context
                </h4>
                <p className="text-foreground/90">{travelPlan.history}</p>
              </div>
            )}

            {/* Local Activities */}
            <div className="bg-card rounded-lg shadow p-6">
              <h4 className="mb-6 flex items-center">
                <Compass className="mr-2" /> Local Activities & Experiences
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {travelPlan?.activities?.map((activity, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-semibold text-foreground">{activity.name}</h3>
                    <p className="text-muted-foreground text-sm mt-1">{activity.type} • {activity.duration}</p>
                    <p className="text-foreground/90 mt-2 text-sm">{activity.description}</p>
                    {activity.localSpecific && (
                      <span className="inline-block mt-2 px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                        Local Specialty
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TravelPlan;
