import React, { useState } from 'react';
import { Sparkles, MapPin, Utensils, Compass, Download, Share2, RefreshCw, Lightbulb } from 'lucide-react';
import { Destination, TravelerType } from '../types/travel';
import { AITripPlanningResponse, Activity, ItineraryDay } from '../services/aiTripPlanningService';

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
  const [showPersonalizations, setShowPersonalizations] = useState(true);

  const { plan, reasoning, confidence, personalizations } = aiResponse;

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
              <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                AI-Generated Plan
              </span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Your Personalized Travel Plan</h1>
            <p className="text-muted-foreground">
              AI-crafted itinerary for {destination.name} • {Math.round(confidence * 100)}% match confidence
            </p>
          </div>
          <div className="flex space-x-3 mt-4 md:mt-0">
            <button
              onClick={onRegeneratePlan}
              className="flex items-center px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate Plan
            </button>
            <button
              className="flex items-center px-4 py-2 bg-background-muted hover:bg-background-muted/80 rounded-lg transition-colors"
              onClick={() => console.log('Download clicked')}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
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

        {/* AI Insights Section */}
        {showPersonalizations && (
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-3">
                  <Lightbulb className="w-5 h-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-blue-900">AI Personalizations</h3>
                </div>
                <div className="space-y-2 mb-4">
                  {personalizations.map((personalization, index) => (
                    <div key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2">✓</span>
                      <span className="text-blue-800 text-sm">{personalization}</span>
                    </div>
                  ))}
                </div>
                {reasoning && (
                  <div className="border-t border-blue-200 pt-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">AI Reasoning:</h4>
                    <p className="text-sm text-blue-800">{reasoning}</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowPersonalizations(false)}
                className="text-blue-600 hover:text-blue-800 ml-4"
              >
                ✕
              </button>
            </div>
          </div>
        )}

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
                📅 AI Itinerary
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
            </div>
          </div>
        )}

        {activeTab === 'info' && (
          <div className="space-y-8">
            {/* Places to Visit */}
            <div className="bg-card rounded-lg shadow p-6">
              <h4 className="mb-6">AI-Recommended Places to Visit</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {plan.placesToVisit.map((place, index) => (
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
                <h4 className="mb-6">AI-Selected Restaurants</h4>
                <div className="space-y-4">
                  {plan.restaurants.map((restaurant, index) => (
                    <div key={index} className="border-b border-border pb-4 last:border-0 last:pb-0">
                      <h6 className="font-medium text-foreground">{restaurant.name}</h6>
                      <p className="text-sm text-muted-foreground">{restaurant.cuisine} • {restaurant.priceRange}</p>
                      <p className="text-foreground/90 mt-1 text-sm">{restaurant.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bars */}
              {plan.bars && plan.bars.length > 0 && (
                <div className="bg-card rounded-lg shadow p-6">
                  <h4 className="mb-6">Nightlife Recommendations</h4>
                  <div className="space-y-4">
                    {plan.bars.map((bar, index) => (
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

            {/* Additional Info - Same as original but with AI context */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Local Currency */}
              <div className="bg-card rounded-lg shadow p-6">
                <h4 className="mb-6">Local Currency & Payment</h4>
                <p className="text-foreground">
                  The local currency is <span className="font-medium">{plan.localCurrency.currency}</span>.
                  {plan.localCurrency.cashNeeded ? ' It\'s recommended to carry some cash.' : ' Credit cards are widely accepted.'}
                </p>
                {plan.localCurrency.tips && plan.localCurrency.tips.length > 0 && (
                  <div className="mt-4">
                    <h6 className="mb-2">AI Money Tips:</h6>
                    <ul className="space-y-2">
                      {plan.localCurrency.tips.map((tip, index) => (
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
                <h4 className="mb-6">Cultural Etiquette</h4>
                <ul className="space-y-3">
                  {plan.socialEtiquette.map((tip, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span className="text-foreground">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Rest of the sections remain the same but with AI context in headers */}
            <div className="bg-card rounded-lg shadow p-6">
              <h4 className="mb-6">Getting Around</h4>
              <div className="space-y-6">
                <div>
                  <h6 className="mb-2">Public Transportation</h6>
                  <p className="text-muted-foreground">{plan.transportationInfo.publicTransport}</p>
                </div>
                <div>
                  <h6 className="mb-2">From the Airport</h6>
                  <p className="text-muted-foreground">{plan.transportationInfo.airportTransport}</p>
                </div>
                <div>
                  <h6 className="mb-2">Taxis & Rideshares</h6>
                  <p className="text-muted-foreground">{plan.transportationInfo.taxiInfo}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}