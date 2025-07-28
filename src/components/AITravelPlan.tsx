import React, { useState } from 'react';
import { Sparkles, MapPin, Utensils, Compass, Download, Share2, RefreshCw, Lightbulb, Home, Shield, CreditCard, Droplets, Calendar, BookOpen, ExternalLink } from 'lucide-react';
import { Destination, TravelerType, ItineraryDay, Activity } from '../types/travel';
import { AITripPlanningResponse } from '../services/aiTripPlanningService';
import { TravelPlanSection } from './ui/TravelPlanSection';
import { SectionHeader } from './ui/SectionHeader';
import { ItemCard } from './ui/ItemCard';
import { ItemGrid } from './ui/ItemGrid';
import { CategoryGroup } from './ui/CategoryGroup';
import { RestaurantItem } from './ui/RestaurantItem';

interface AITravelPlanProps {
  destination: Destination;
  travelerType: TravelerType;
  aiResponse: AITripPlanningResponse;
  onRegeneratePlan: () => void;
}

export function AITravelPlan({
  destination,
  travelerType,
  aiResponse,
  onRegeneratePlan
}: AITravelPlanProps) {
  const [activeTab, setActiveTab] = useState<'itinerary' | 'info'>('itinerary');

  const { plan, reasoning, confidence, personalizations } = aiResponse;

  // Helper functions to generate search links dynamically
  const generateGoogleMapsLink = (placeName: string) => {
    const query = encodeURIComponent(`${placeName} ${destination.name}`);
    return `https://www.google.com/maps/search/${query}`;
  };

  const generateGoogleSearchLink = (itemName: string, type = '') => {
    const query = encodeURIComponent(`${itemName} ${type} ${destination.name}`);
    return `https://www.google.com/search?q=${query}`;
  };

  const generateAirbnbLink = (neighborhood: string) => {
    const query = encodeURIComponent(`${neighborhood} ${destination.name}`);
    return `https://www.airbnb.com/s/${query}/homes`;
  };

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
  const renderDayItinerary = (day: ItineraryDay) => (
    <div key={day.day} className="mb-12">
      <h2 className="text-2xl font-bold text-foreground mb-6 pb-2 border-b border-border">
        {day.title}
      </h2>
      <div className="space-y-6">
        {day.activities.map((activity, index) => renderActivity(activity, index))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <div className="flex items-center mb-2">
              <Sparkles className="w-6 h-6 text-primary mr-2" />
              <h1 className="text-3xl font-bold text-foreground">Your Personalized Travel Plan</h1>
            </div>
          </div>
          <div className="flex space-x-3 mt-4 md:mt-0">
            <button
              onClick={onRegeneratePlan}
              className="flex items-center px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              className="flex items-center px-4 py-2 bg-background-muted hover:bg-background-muted/80 rounded-lg transition-colors"
              onClick={() => console.log('Download clicked')}
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              className="flex items-center px-4 py-2 bg-background-muted hover:bg-background-muted/80 rounded-lg transition-colors"
              onClick={() => console.log('Share clicked')}
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="bg-card rounded-lg p-2 shadow-sm">
            <nav className="flex space-x-2">
              <button
                onClick={() => setActiveTab('itinerary')}
                className={`flex-1 py-3 px-6 font-medium text-sm rounded-md transition-all duration-200 ${activeTab === 'itinerary'
                  ? 'bg-primary/25 text-primary-foreground shadow-sm'
                  : 'bg-background-muted text-muted-foreground hover:text-foreground hover:bg-background-muted'
                  }`}
              >
                📅 Sample Itinerary
              </button>
              <button
                onClick={() => setActiveTab('info')}
                className={`flex-1 py-3 px-6 font-medium text-sm rounded-md transition-all duration-200 ${activeTab === 'info'
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
            <TravelPlanSection>
              <h2 className="text-2xl font-bold text-foreground mb-6">Your AI-Generated Itinerary</h2>
              {plan.itinerary.length > 0 ? (
                <div className="space-y-6">
                  {plan.itinerary.map((day) => (
                    renderDayItinerary(day)
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No itinerary available for this destination.
                </div>
              )}
            </TravelPlanSection>
          </div>
        )}

        {activeTab === 'info' && (
          <div className="space-y-8">
            {/* Neighborhoods */}
            {plan.neighborhoods && (
              <TravelPlanSection>
                <SectionHeader icon={Home} title="Recommended Neighborhoods" />
                <ItemGrid columns={3}>
                  {plan.neighborhoods.map((neighborhood, index) => (
                    <ItemCard 
                      key={index}
                      title={neighborhood.name}
                      subtitle={neighborhood.vibe}
                      description={neighborhood.summary}
                    >
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
                    </ItemCard>
                  ))}
                </ItemGrid>
              </TravelPlanSection>
            )}

            {/* Hotel Recommendations */}
            {plan.hotelRecommendations && (
              <TravelPlanSection>
                <SectionHeader icon={Home} title="Recommended Hotels" />
                {(() => {
                  // Group hotels by neighborhood
                  const hotelsByNeighborhood = plan.hotelRecommendations?.reduce((acc, hotel) => {
                    const neighborhood = hotel.neighborhood || 'Other Areas';
                    if (!acc[neighborhood]) {
                      acc[neighborhood] = [];
                    }
                    acc[neighborhood].push(hotel);
                    return acc;
                  }, {} as Record<string, typeof plan.hotelRecommendations>);

                  return Object.entries(hotelsByNeighborhood || {}).map(([neighborhood, hotels]) => (
                    <CategoryGroup key={neighborhood} title={neighborhood}>
                      <ItemGrid columns={3}>
                        {hotels?.map((hotel, index) => (
                          <ItemCard
                            key={index}
                            title={hotel.name}
                            subtitle={hotel.priceRange}
                            description={hotel.description}
                            searchLink={generateGoogleMapsLink(hotel.name)}
                            tags={hotel.amenities}
                          />
                        ))}
                      </ItemGrid>
                    </CategoryGroup>
                  ));
                })()}
              </TravelPlanSection>
            )}

            {/* Places to Visit */}
            <TravelPlanSection>
              <SectionHeader icon={MapPin} title="Recommended Places" />
              {(() => {
                // Group places by category
                const placesByCategory = plan.placesToVisit?.reduce((acc, place) => {
                  const category = place.category || 'Other';
                  if (!acc[category]) {
                    acc[category] = [];
                  }
                  acc[category].push(place);
                  return acc;
                }, {} as Record<string, typeof plan.placesToVisit>);

                return Object.entries(placesByCategory || {}).map(([category, places]) => (
                  <CategoryGroup key={category} title={category}>
                    <ItemGrid columns={2}>
                      {places?.map((place, index) => (
                        <ItemCard
                          key={index}
                          title={place.name}
                          description={place.description}
                          searchLink={generateGoogleMapsLink(place.name)}
                        />
                      ))}
                    </ItemGrid>
                  </CategoryGroup>
                ));
              })()}
            </TravelPlanSection>

            {/* Restaurants */}
            <TravelPlanSection>
              <SectionHeader icon={Utensils} title="Recommended Restaurants" />
              <div className="space-y-4">
                {plan.restaurants.map((restaurant, index) => (
                  <RestaurantItem
                    key={index}
                    name={restaurant.name}
                    cuisine={restaurant.cuisine}
                    priceRange={restaurant.priceRange}
                    neighborhood={restaurant.neighborhood}
                    description={restaurant.description}
                    specialDishes={restaurant.specialDishes}
                    searchLink={generateGoogleSearchLink(restaurant.name, 'restaurant')}
                  />
                ))}
              </div>
            </TravelPlanSection>

            {/* Bars & Nightlife */}
            {plan.bars && plan.bars.length > 0 && (
              <TravelPlanSection>
                <SectionHeader icon={Utensils} title="Recommended Nightlife" />
                <div className="space-y-4">
                  {plan.bars.map((bar, index) => (
                    <RestaurantItem
                      key={index}
                      name={bar.name}
                      cuisine={bar.category}
                      priceRange={bar.atmosphere}
                      description={bar.description}
                      searchLink={generateGoogleSearchLink(bar.name, 'bar')}
                    />
                  ))}
                </div>
              </TravelPlanSection>
            )}

            {/* Weather Information */}
            {plan.weatherInfo && (
              <TravelPlanSection>
                <SectionHeader icon={Compass} title="Weather Analysis" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h6 className="mb-2 font-medium">Conditions</h6>
                    <p className="text-foreground/90">{plan.weatherInfo.temperature} • {plan.weatherInfo.conditions}</p>
                    <p className="text-sm text-muted-foreground mt-1">{plan.weatherInfo.humidity}</p>
                    <p className="text-sm text-muted-foreground">{plan.weatherInfo.dayNightTempDifference}</p>
                  </div>
                  <div>
                    <h6 className="mb-2 font-medium">Important Notes</h6>
                    <p className="text-sm text-foreground/90">{plan.weatherInfo.airQuality}</p>
                    <p className="text-sm text-foreground/90">{plan.weatherInfo.feelsLikeWarning}</p>
                    <div className="mt-3">
                      <h6 className="text-sm font-medium">Recommendations:</h6>
                      <ul className="space-y-1 mt-1">
                        {plan.weatherInfo.recommendations?.map((rec, index) => (
                          <li key={index} className="flex items-start text-sm">
                            <span className="text-primary mr-2">•</span>
                            <span className="text-foreground/90">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </TravelPlanSection>
            )}

            {/* Must-Try Local Food */}
            {plan.mustTryFood && plan.mustTryFood.items && (
              <TravelPlanSection>
                <SectionHeader icon={Utensils} title="Food Recommendations" />
                {(() => {
                  // Group food items by category
                  const foodByCategory = plan.mustTryFood.items.reduce((acc, item) => {
                    const category = item.category;
                    if (!acc[category]) {
                      acc[category] = [];
                    }
                    acc[category].push(item);
                    return acc;
                  }, {} as Record<string, typeof plan.mustTryFood.items>);

                  const categoryTitles: Record<string, string> = {
                    main: 'Main Dishes',
                    dessert: 'Desserts',
                    drink: 'Local Drinks',
                    snack: 'Snacks'
                  };

                  return Object.entries(foodByCategory).map(([category, items]) => (
                    <CategoryGroup key={category} title={categoryTitles[category] || category}>
                      <div className="space-y-4">
                        {items.map((item, index) => (
                          <RestaurantItem
                            key={index}
                            name={item.name}
                            cuisine={item.priceRange || ''}
                            priceRange={item.whereToFind || ''}
                            description={item.description}
                            searchLink={generateGoogleSearchLink(item.name, 'food')}
                          />
                        ))}
                      </div>
                    </CategoryGroup>
                  ));
                })()}
              </TravelPlanSection>
            )}

            {/* Safety & Etiquette */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Safety Tips */}
              {plan.safetyTips && (
                <TravelPlanSection>
                  <SectionHeader icon={Shield} title="Safety Analysis" />
                  <ul className="space-y-3">
                    {plan.safetyTips.map((tip, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-primary mr-2">•</span>
                        <span className="text-foreground text-sm">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </TravelPlanSection>
              )}

              {/* Social Etiquette */}
              <TravelPlanSection>
                <SectionHeader icon={BookOpen} title="Cultural Insights" />
                <ul className="space-y-3">
                  {plan.socialEtiquette.map((tip, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span className="text-foreground text-sm">{tip}</span>
                    </li>
                  ))}
                </ul>
              </TravelPlanSection>
            </div>

            {/* Transportation */}
            <TravelPlanSection>
              <SectionHeader icon={Compass} title="Transportation Guide" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <h6 className="mb-2 font-medium">Public Transportation</h6>
                    <p className="text-foreground/90 text-sm">{plan.transportationInfo.publicTransport}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Credit card payments: {plan.transportationInfo.creditCardPayment ? 'Accepted' : 'Not accepted'}
                    </p>
                  </div>
                  <div>
                    <h6 className="mb-2 font-medium">Taxis & Rideshares</h6>
                    <p className="text-foreground/90 text-sm">{plan.transportationInfo.ridesharing}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Average cost: {plan.transportationInfo.taxiInfo?.averageCost}
                    </p>
                    {plan.transportationInfo.taxiInfo?.tips && (
                      <ul className="mt-2 space-y-1">
                        {plan.transportationInfo.taxiInfo.tips.map((tip, index) => (
                          <li key={index} className="flex items-start text-xs">
                            <span className="text-primary mr-1">•</span>
                            <span className="text-foreground/80">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                
                {/* Right Column */}
                <div>
                  <div>
                    <h6 className="mb-2 font-medium">Airport Transportation</h6>
                    <p className="text-sm text-muted-foreground mb-2">{plan.transportationInfo.airportTransport?.mainAirport} - {plan.transportationInfo.airportTransport?.distanceToCity}</p>
                    <div className="grid grid-cols-1 gap-3">
                      {plan.transportationInfo.airportTransport?.transportOptions?.map((option, index) => (
                        <div key={index} className="bg-background-muted rounded p-3">
                          <h6 className="font-medium text-sm">{option.type}</h6>
                          <p className="text-xs text-muted-foreground">{option.cost} • {option.duration}</p>
                          <p className="text-xs text-foreground/80 mt-1">{option.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TravelPlanSection>

            {/* Currency & Payments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Local Currency */}
              <TravelPlanSection>
                <SectionHeader icon={CreditCard} title="Payment Guide" />
                <p className="text-foreground">
                  The local currency is <span className="font-medium">{plan.localCurrency.currency}</span>.
                  {plan.localCurrency.cashNeeded ? ' Cash is recommended for some purchases.' : ' Credit cards are widely accepted.'}
                </p>
                {plan.localCurrency.exchangeRate && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <h6 className="text-sm font-medium text-blue-800">Current Exchange Rate</h6>
                    <p className="text-sm text-blue-700">
                      1 {plan.localCurrency.exchangeRate.from} = {plan.localCurrency.exchangeRate.rate} {plan.localCurrency.exchangeRate.to}
                    </p>
                  </div>
                )}
                {plan.localCurrency.tips && plan.localCurrency.tips.length > 0 && (
                  <div className="mt-4">
                    <h6 className="mb-2 font-medium">Money Tips:</h6>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="text-sm mr-2">•</span>
                        <span className="text-sm mr-2">Credit card widely accepted?</span>

                      </li>
                      <span className="text-sm ml-4">{plan.localCurrency.creditCardUsage}</span>
                      {plan.localCurrency.tips.map((tip, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-sm mr-2">•</span>
                          <span className="text-sm">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </TravelPlanSection>

              {/* Tipping Etiquette */}
              {plan.tipEtiquette && (
                <TravelPlanSection>
                  <SectionHeader icon={CreditCard} title="Tipping Guide" />
                  <div className="space-y-3">
                    {Object.entries(plan.tipEtiquette).map(([category, tip], index) => (
                      <div key={index}>
                        <h6 className="font-medium text-sm capitalize">{category}:</h6>
                        <p className="text-foreground/80 text-sm">{tip}</p>
                      </div>
                    ))}
                  </div>
                </TravelPlanSection>
              )}
            </div>

            {/* Tap Water Safety */}
            {plan.tapWaterSafe && (
              <TravelPlanSection>
                <SectionHeader icon={Droplets} title="Water Safety" />
                <div className="flex items-start">
                  <div className={`flex-shrink-0 h-6 w-6 ${plan.tapWaterSafe.safe ? 'text-green-500' : 'text-yellow-500'}`}>
                    {plan.tapWaterSafe.safe ? (
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
                    <p>
                      {plan.tapWaterSafe.safe ? 'Tap water is safe to drink' : 'Tap water is not recommended for drinking'}
                    </p>
                  </div>
                </div>
              </TravelPlanSection>
            )}

            {/* Local Events */}
            {plan.localEvents && plan.localEvents.length > 0 && (
              <TravelPlanSection>
                <SectionHeader icon={Calendar} title="Local Events During Your Visit" />
                <ItemGrid columns={3}>
                  {plan.localEvents.map((event, index) => (
                    <ItemCard
                      key={index}
                      title={event.name}
                      subtitle={`${event.type} • ${event.dates}`}
                      description={event.description}
                      metadata={`📍 ${event.location}`}
                    />
                  ))}
                </ItemGrid>
              </TravelPlanSection>
            )}

            {/* Historical Context */}
            {plan.history && (
              <TravelPlanSection>
                <SectionHeader icon={BookOpen} title="Historical Context" />
                <p className="text-foreground/90">{plan.history}</p>
              </TravelPlanSection>
            )}

            {/* Local Activities */}
            {plan.activities && (
              <TravelPlanSection>
                <SectionHeader icon={Compass} title="Curated Local Experiences" />
                <ItemGrid columns={2}>
                  {plan.activities.map((activity, index) => {
                    const tags = [];
                    if (activity.localSpecific) tags.push('Local Specialty');
                    if (activity.experienceType && activity.experienceType !== 'other') {
                      tags.push(activity.experienceType.charAt(0).toUpperCase() + activity.experienceType.slice(1));
                    }
                    
                    return (
                      <ItemCard
                        key={index}
                        title={activity.name}
                        subtitle={`${activity.type} • ${activity.duration}`}
                        description={activity.description}
                        searchLink={activity.bookingLink}
                        tags={tags}
                      />
                    );
                  })}
                </ItemGrid>
              </TravelPlanSection>
            )}
          </div>
        )}
      </div>
    </div>
  );
}