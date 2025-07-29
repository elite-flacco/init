import React, { useState } from 'react';
import { Sparkles, MapPin, Utensils, Compass, Download, Share2, RefreshCw, Home, Shield, CreditCard, Droplets, Calendar, BookOpen, BeerIcon, FileText, Loader2 } from 'lucide-react';
import { Destination, TravelerType, ItineraryDay, Activity } from '../types/travel';
import { AITripPlanningResponse } from '../services/aiTripPlanningService';
import { PdfExportService } from '../services/pdfExportService';
import { KMLExportService } from '../services/kmlExportService';
import { TravelPlanSection } from './ui/TravelPlanSection';
import { SectionHeader } from './ui/SectionHeader';
import { ItemCard, BookingLink } from './ui/ItemCard';
import { ItemGrid } from './ui/ItemGrid';
import { CategoryGroup } from './ui/CategoryGroup';

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
  const [isExportingKML, setIsExportingKML] = useState(false);

  const { plan } = aiResponse;

  const handleExportToPdf = async () => {
    try {
      await PdfExportService.exportTravelPlanToPdf({
        destination,
        travelerType,
        plan,
        includeItinerary: true,
        includeInfo: true
      });
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleExportToGoogleMaps = async () => {
    setIsExportingKML(true);
    
    try {
      console.log('Starting KML export...');
      
      // First try with real coordinates, but with a shorter timeout
      try {
        await KMLExportService.downloadKML(plan, undefined, { 
          useRealCoordinates: true 
        });
        console.log('KML export with real coordinates completed successfully');
      } catch (geocodingError) {
        console.warn('Real coordinates failed, falling back to approximate locations:', geocodingError);
        // Fallback to approximate coordinates if geocoding fails
        await KMLExportService.downloadKML(plan, undefined, { 
          useRealCoordinates: false 
        });
        console.log('KML export with approximate coordinates completed successfully');
      }
      
    } catch (error) {
      console.error('Error exporting to KML:', error);
      alert('Failed to generate KML file. Please try again.');
    } finally {
      setIsExportingKML(false);
    }
  };

  // Helper functions to generate search links dynamically
  const generateGoogleSearchLink = (itemName: string, type = '') => {
    const query = encodeURIComponent(`${itemName} ${type} ${destination.name}`);
    return `https://www.google.com/search?q=${query}`;
  };

  const generateBookingLinks = (activityName: string): BookingLink[] => {
    const query = encodeURIComponent(`${activityName} ${destination.name}`);
    return [
      // {
      //   platform: 'airbnb' as const,
      //   url: `https://www.airbnb.com/s/experiences?query=${query}`
      // },
      {
        platform: 'getyourguide' as const,
        url: `https://www.getyourguide.com/s/?q=${query}`
      },
      {
        platform: 'viator' as const,
        url: `https://www.viator.com/searchResults/all?text=${query}`
      }
    ];
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
        Day {day.day}: {day.title}
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
              className="flex items-center p-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              className="flex items-center p-2 bg-background-muted hover:bg-background-muted/80 rounded-lg transition-colors"
              onClick={handleExportToPdf}
              title="Export to PDF"
            >
              <FileText className="w-4 h-4 " />
            </button>
            <button
              className="flex items-center p-2 bg-background-muted hover:bg-background-muted/80 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleExportToGoogleMaps}
              disabled={isExportingKML}
              title="Export to Google Maps (KML)"
            >
              {isExportingKML ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </button>
            <button
              className="flex items-center p-2 bg-background-muted hover:bg-background-muted/80 rounded-lg transition-colors"
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
              <h4 className="mb-6">Just some food for thought</h4>
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
            {/* Places to Visit */}
            <TravelPlanSection>
              <SectionHeader icon={MapPin} title="Top Attractions" />
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
                  <CategoryGroup key={category} title={category.charAt(0).toUpperCase() + category.slice(1)}>
                    <ItemGrid columns={2}>
                      {places?.map((place, index) => (
                        <ItemCard
                          key={index}
                          title={place.name}
                          description={place.description}
                          searchLink={generateGoogleSearchLink(place.name)}
                        />
                      ))}
                    </ItemGrid>
                  </CategoryGroup>
                ));
              })()}
            </TravelPlanSection>

            {/* Neighborhoods */}
            {plan.neighborhoods && (
              <TravelPlanSection>
                <SectionHeader icon={Home} title="Good Neighborhoods to Stay" />
                <ItemGrid columns={3}>
                  {plan.neighborhoods.map((neighborhood, index) => (
                    <ItemCard
                      key={index}
                      title={neighborhood.name}
                      subtitle={neighborhood.vibe}
                      description={neighborhood.summary}
                    >
                      <div className="mt-4">
                        <p className="italic mb-2">Best for: {neighborhood.bestFor.slice(9)}</p>
                        <p className="font-bold text-success mt-4">Pros:</p>
                        <ul className="text-foreground/80">
                          {neighborhood.pros.map((pro, idx) => (
                            <li key={idx}>• {pro}</li>
                          ))}
                        </ul>
                        <p className="font-bold text-error mt-4">Cons:</p>
                        <ul className="text-foreground/80">
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
                <SectionHeader icon={Home} title="Roll with One of These Accomodations" />
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
                    <CategoryGroup key={neighborhood} title={neighborhood} icon={MapPin}>
                      <ItemGrid columns={3}>
                        {hotels?.map((hotel, index) => (
                          <ItemCard
                            key={index}
                            title={hotel.name}
                            subtitle={hotel.priceRange}
                            description={hotel.description}
                            searchLink={generateGoogleSearchLink(hotel.name)}
                            tags={hotel.amenities}
                          />
                        ))}
                      </ItemGrid>
                    </CategoryGroup>
                  ));
                })()}
              </TravelPlanSection>
            )}

            {/* Dining & Nightlife */}
            <TravelPlanSection>
              <SectionHeader icon={Utensils} title="Where to Eat & Drink" />
              {(() => {
                // Separate restaurants and bars with type indicators
                const restaurants = plan.restaurants.map(restaurant => ({
                  ...restaurant,
                  type: 'restaurant' as const,
                  searchType: 'restaurant'
                }));

                const bars = (plan.bars || []).map(bar => ({
                  name: bar.name,
                  cuisine: bar.category,
                  priceRange: bar.atmosphere,
                  neighborhood: bar.neighborhood || 'Other Areas',
                  description: bar.description,
                  type: 'bar' as const,
                  searchType: 'bar'
                }));

                // Group restaurants by neighborhood
                const restaurantsByNeighborhood = restaurants.reduce((acc, restaurant) => {
                  const neighborhood = restaurant.neighborhood || 'Other Areas';
                  if (!acc[neighborhood]) {
                    acc[neighborhood] = [];
                  }
                  acc[neighborhood].push(restaurant);
                  return acc;
                }, {} as Record<string, typeof restaurants>);

                // Group bars by neighborhood
                const barsByNeighborhood = bars.reduce((acc, bar) => {
                  const neighborhood = bar.neighborhood || 'Other Areas';
                  if (!acc[neighborhood]) {
                    acc[neighborhood] = [];
                  }
                  acc[neighborhood].push(bar);
                  return acc;
                }, {} as Record<string, typeof bars>);

                // Get all unique neighborhoods
                const allNeighborhoods = Array.from(new Set([
                  ...Object.keys(restaurantsByNeighborhood),
                  ...Object.keys(barsByNeighborhood)
                ]));

                return allNeighborhoods.map(neighborhood => (
                  <CategoryGroup key={neighborhood} title={neighborhood} icon={MapPin}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Restaurants column */}
                      {restaurantsByNeighborhood[neighborhood] && restaurantsByNeighborhood[neighborhood].length > 0 && (
                        <div>
                          <h4 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                            <Utensils className="w-5 h-5 mr-2 text-primary" />
                            Restaurants
                          </h4>
                          <div className="space-y-4">
                            {restaurantsByNeighborhood[neighborhood].map((restaurant, index) => (
                              <ItemCard
                                key={`restaurant-${index}`}
                                title={restaurant.name}
                                subtitle={`${restaurant.cuisine} • ${restaurant.priceRange}`}
                                description={restaurant.description}
                                searchLink={generateGoogleSearchLink(restaurant.name, 'restaurant')}
                                tags={restaurant.specialDishes}
                              >
                                {restaurant.reservationsRecommended === "Yes" && (
                                  <div className="mt-3 text-sm text-amber-600 font-medium">
                                    💡 Reservations recommended
                                  </div>
                                )}
                              </ItemCard>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Bars column */}
                      {barsByNeighborhood[neighborhood] && barsByNeighborhood[neighborhood].length > 0 && (
                        <div>
                          <h4 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                            <BeerIcon className="w-5 h-5 mr-2 text-secondary" />
                            Bars & Nightlife
                          </h4>
                          <div className="space-y-4">
                            {barsByNeighborhood[neighborhood].map((bar, index) => (
                              <ItemCard
                                key={`bar-${index}`}
                                title={bar.name}
                                subtitle={`${bar.cuisine} • ${bar.priceRange}`}
                                description={bar.description}
                                searchLink={generateGoogleSearchLink(bar.name, 'bar')}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CategoryGroup>
                ));
              })()}
            </TravelPlanSection>

            {/* Must-Try Local Food */}
            {plan.mustTryFood && plan.mustTryFood.items && (
              <TravelPlanSection>
                <SectionHeader icon={Utensils} title="Don't Miss These Local Treats" />
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

                  // Separate main dishes from other categories
                  const mainDishes = foodByCategory['main'] || [];
                  const otherCategories = Object.entries(foodByCategory).filter(([category]) => category !== 'main');

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Main Dishes Column */}
                      <div>
                        {mainDishes.length > 0 && (
                          <CategoryGroup title="Main Dishes">
                            <div className="space-y-4">
                              {mainDishes.map((item, index) => (
                                <ItemCard
                                  key={index}
                                  title={item.name}
                                  description={item.description}
                                  searchLink={generateGoogleSearchLink(item.name, 'food')}
                                  metadata={item.whereToFind ? `📍 ${item.whereToFind}` : undefined}
                                />
                              ))}
                            </div>
                          </CategoryGroup>
                        )}
                      </div>

                      {/* Other Categories Column */}
                      <div className="space-y-6">
                        {otherCategories.map(([category, items]) => (
                          <CategoryGroup key={category} title={categoryTitles[category] || category}>
                            <div className="space-y-4">
                              {items.map((item, index) => (
                                <ItemCard
                                  key={index}
                                  title={item.name}
                                  description={item.description}
                                  searchLink={generateGoogleSearchLink(item.name, 'food')}
                                  metadata={item.whereToFind ? `📍 ${item.whereToFind}` : undefined}
                                />
                              ))}
                            </div>
                          </CategoryGroup>
                        ))}
                      </div>
                    </div>
                  );
                })()}
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

            {/* Local Activities */}
            {plan.activities && (
              <TravelPlanSection>
                <SectionHeader icon={Compass} title="Unique Local Experiences" />
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
                        bookingLinks={generateBookingLinks(activity.name)}
                        tags={tags}
                      />
                    );
                  })}
                </ItemGrid>
              </TravelPlanSection>
            )}

            {/* Transportation */}
            <TravelPlanSection>
              <SectionHeader icon={Compass} title="Transportation Guide" />
              
              {/* City Transportation - Balanced 2-column layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h6 className="mb-3">Public Transportation</h6>
                  <p className="mb-2">{plan.transportationInfo.publicTransport}</p>
                  <p className="text-sm">
                    Credit card payments: <span className="font-medium">{plan.transportationInfo.creditCardPayment ? 'Accepted' : 'Not accepted'}</span>
                  </p>
                </div>
                
                <div>
                  <h6 className="mb-3">Taxis & Rideshares</h6>
                  <p className="mb-2">{plan.transportationInfo.ridesharing}</p>
                  <p className="mb-2 text-sm">
                    Average cost: <span className="font-medium">{plan.transportationInfo.taxiInfo?.averageCost}</span>
                  </p>
                  {plan.transportationInfo.taxiInfo?.tips && (
                    <ul className="space-y-1">
                      {plan.transportationInfo.taxiInfo.tips.map((tip, index) => (
                        <li key={index} className="flex items-start text-sm">
                          <span className="text-primary mr-2 mt-0.5">•</span>
                          <span className="text-foreground/80">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Airport Transportation - Full width dedicated section */}
              <div className="border-t border-border pt-6">
                <h6 className="mb-4">Airport Transportation</h6>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {plan.transportationInfo.airportTransport?.airports?.map((airport, airportIndex) => (
                    <div key={airportIndex} className="border border-border rounded-lg p-5">
                      <div className="mb-4">
                        <h6>{airport.name}</h6>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="bg-primary/10 text-primary text-2xs p-1 rounded">{airport.code}</span>
                          <span>{airport.distanceToCity}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {airport.transportOptions?.map((option, optionIndex) => (
                          <div key={optionIndex} className="bg-background-muted rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <p className="font-semibold">{option.type}</p>
                              <div className="text-right text-sm">
                                <div className="font-medium">{option.cost}</div>
                                <div className="text-text-muted">{option.duration}</div>
                              </div>
                            </div>
                            
                            <span className="mb-3">{option.description}</span>
                            
                            {option.notes && option.notes.length > 0 && (
                              <div className="bg-foreground/5 border rounded p-3 mt-4">
                                <p className="font-medium mb-2">💡 Important Notes:</p>
                                <ul className="space-y-1">
                                  {option.notes.map((note, noteIndex) => (
                                    <li key={noteIndex} className="flex items-start">
                                      <span className="mr-2">•</span>
                                      <span>{note}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TravelPlanSection>

            {/* Weather Information */}
            {plan.weatherInfo && (
              <TravelPlanSection>
                <SectionHeader icon={Compass} title="Be Prepared for the Weather" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h6 className="mb-2">Conditions</h6>
                    <p>{plan.weatherInfo.temperature} • {plan.weatherInfo.conditions}</p>
                    <p className="mt-1">Humidity level: {plan.weatherInfo.humidity}</p>
                    <p className="mt-1">Day/Night temperature difference: {plan.weatherInfo.dayNightTempDifference}</p>
                  </div>
                  <div>
                    {/* <h6 className="mb-2">Important Notes</h6>
                    <p className="mt-1">Air quality: {plan.weatherInfo.airQuality}</p>
                    <p className="mt-1">Feels like warning: {plan.weatherInfo.feelsLikeWarning}</p> */}
                    <div>
                      <h6>Recommendations:</h6>
                      <ul className="space-y-1 mt-1">
                        {plan.weatherInfo.recommendations?.map((rec, index) => (
                          <li key={index} className="flex items-start text-sm">
                            <p className="mr-2">•</p>
                            <p className="text-foreground/90">{rec}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </TravelPlanSection>
            )}

            {/* Safety & Etiquette */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Safety Tips */}
              {plan.safetyTips && (
                <TravelPlanSection>
                  <SectionHeader icon={Shield} title="Safety Tips" />
                  <ul className="space-y-1">
                    {plan.safetyTips.map((tip, index) => (
                      <li key={index} className="flex items-start">
                        <p className="mr-2">•</p>
                        <p>{tip}</p>
                      </li>
                    ))}
                  </ul>
                </TravelPlanSection>
              )}

              {/* Social Etiquette */}
              <TravelPlanSection>
                <SectionHeader icon={BookOpen} title="Cultural Insights" />
                <ul className="space-y-1">
                  {plan.socialEtiquette.map((tip, index) => (
                    <li key={index} className="flex items-start">
                      <p className="mr-2">•</p>
                      <p>{tip}</p>
                    </li>
                  ))}
                </ul>
              </TravelPlanSection>
            </div>



            {/* Currency & Payments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Local Currency */}
              <TravelPlanSection>
                <SectionHeader icon={CreditCard} title="Payment Guide" />
                <p>
                  The local currency is <span className="font-medium">{plan.localCurrency.currency}</span>.
                  {plan.localCurrency.cashNeeded ? ' Cash is recommended for some purchases.' : ' Credit cards are widely accepted.'}
                </p>
                {plan.localCurrency.exchangeRate && (
                  <div className="mt-3 mb-2rounded-lg">
                    <h6 className="mb-2">Current Exchange Rate</h6>
                    <p>
                      1 {plan.localCurrency.exchangeRate.from} = {plan.localCurrency.exchangeRate.rate} {plan.localCurrency.exchangeRate.to}
                    </p>
                  </div>
                )}
                {plan.localCurrency.tips && plan.localCurrency.tips.length > 0 && (
                  <div className="mt-4">
                    <h6 className="mb-2">Money Tips:</h6>
                    <ul className="space-y-1">
                      <li className="flex items-start">
                        <p className="mr-2">•</p>
                        <p>Credit card usage</p>

                      </li>
                      <span className="text-sm ml-4">{plan.localCurrency.creditCardUsage}</span>
                      {plan.localCurrency.tips.map((tip, index) => (
                        <li key={index} className="flex items-start">
                          <p className="mr-2">•</p>
                          <p>{tip}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </TravelPlanSection>

              {/* Tipping Etiquette */}
              {plan.tipEtiquette && (
                <TravelPlanSection>
                  <SectionHeader icon={CreditCard} title="Tipping Etiquette" />
                  <div className="space-y-1">
                    {Object.entries(plan.tipEtiquette).map(([category, tip], index) => (
                      <div key={index} className="mb-2">
                        <p className="font-semibold">{category.charAt(0).toUpperCase() + category.slice(1)}:</p>
                        <p>{tip}</p>
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
                  <div>
                    <p>
                      {plan.tapWaterSafe.safe ? 'Tap water is safe to drink.' : 'Tap water is not recommended for drinking.'}
                    </p>
                  </div>
                </div>
              </TravelPlanSection>
            )}


            {/* Historical Context */}
            {plan.history && (
              <TravelPlanSection>
                <SectionHeader icon={BookOpen} title="Historical Context" />
                <p>{plan.history}</p>
              </TravelPlanSection>
            )}


          </div>
        )}
      </div>
    </div>
  );
}