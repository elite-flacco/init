import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  MapPin,
  Utensils,
  Compass,
  Download,
  Share2,
  RefreshCw,
  Home,
  Shield,
  CreditCard,
  Droplets,
  Calendar,
  BookOpen,
  BeerIcon,
  FileText,
  Loader2,
  Globe,
  ChevronDown,
} from "lucide-react";
import {
  Destination,
  TravelerType,
  ItineraryDay,
  Activity,
} from "../types/travel";
import { AITripPlanningResponse } from "../services/aiTripPlanningService";
import { PdfExportService } from "../services/pdfExportService";
import { KMLExportService } from "../services/kmlExportService";
import { TravelPlanSection } from "./ui/TravelPlanSection";
import { SectionHeader } from "./ui/SectionHeader";
import { ItemCard, BookingLink } from "./ui/ItemCard";
import { ItemGrid } from "./ui/ItemGrid";
import { CategoryGroup } from "./ui/CategoryGroup";
import { KMLExportLoading } from "./ui/KMLExportLoading";
import { ContentGrid, ContentCard } from "./ui/ContentGrid";

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
  onRegeneratePlan,
}: AITravelPlanProps) {
  const [activeTab, setActiveTab] = useState<"itinerary" | "info">("itinerary");
  const [isExportingKML, setIsExportingKML] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [, setShareUrl] = useState<string | null>(null);
  const [showMobileActions, setShowMobileActions] = useState(false);
  const mobileActionsRef = useRef<HTMLDivElement>(null);

  const { plan } = aiResponse;

  // Close mobile actions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileActionsRef.current &&
        !mobileActionsRef.current.contains(event.target as Node)
      ) {
        setShowMobileActions(false);
      }
    };

    if (showMobileActions) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showMobileActions]);

  const handleExportToPdf = async () => {
    try {
      await PdfExportService.exportTravelPlanToPdf({
        destination,
        travelerType,
        plan,
        includeItinerary: true,
        includeInfo: true,
      });
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const handleExportToGoogleMaps = async () => {
    setIsExportingKML(true);

    try {
      // First try with real coordinates, but with a shorter timeout
      try {
        await KMLExportService.downloadKML(plan, undefined, {
          useRealCoordinates: true,
        });
      } catch {
        // Fallback to approximate coordinates if geocoding fails
        await KMLExportService.downloadKML(plan, undefined, {
          useRealCoordinates: false,
        });
      }
    } catch (error) {
      console.error("Error exporting to KML:", error);
      alert("Failed to generate KML file. Please try again.");
    } finally {
      setIsExportingKML(false);
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const response = await fetch("/api/shared-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          destination,
          travelerType,
          aiResponse,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create shared plan");
      }

      const { shareUrl: newShareUrl } = await response.json();
      setShareUrl(newShareUrl);

      // Copy to clipboard
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(newShareUrl);
        alert("Share link copied to clipboard!");
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = newShareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        alert(`Share link created: ${newShareUrl}`);
      }
    } catch (error) {
      console.error("Error creating share link:", error);
      alert("Failed to create share link. Please try again.");
    } finally {
      setIsSharing(false);
    }
  };

  // Helper functions to generate search links dynamically
  const generateGoogleSearchLink = (itemName: string, type = "") => {
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
        platform: "getyourguide" as const,
        url: `https://www.getyourguide.com/s/?q=${query}`,
      },
      {
        platform: "viator" as const,
        url: `https://www.viator.com/searchResults/all?text=${query}`,
      },
    ];
  };

  // Helper function to get adventure icon component based on icon name
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "coffee":
        return (
          <Sparkles className="w-6 h-6 text-amber-500 animate-pulse-slow" />
        );
      case "map":
        return (
          <MapPin className="w-6 h-6 text-blue-500 animate-bounce-subtle" />
        );
      case "utensils":
        return (
          <Utensils className="w-6 h-6 text-green-500 animate-pulse-slow" />
        );
      case "compass":
        return (
          <Compass className="w-6 h-6 text-purple-500 animate-spin-slow" />
        );
      default:
        return (
          <Compass className="w-6 h-6 text-primary animate-bounce-subtle" />
        );
    }
  };

  // Render a single adventure activity
  const renderActivity = (activity: Activity, index: number) => (
    <div key={index} className="relative group">
      <div className="transform hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300">
        <div className="bg-gradient-to-br from-background/80 to-background-card/70 backdrop-blur-sm border-2 border-border/30 hover:border-primary/40 rounded-2xl p-6 shadow-card hover:shadow-adventure-float transition-all duration-300 relative overflow-hidden">
          {/* Activity Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-2xl"></div>

          <div className="flex items-start relative z-10">
            {/* Adventure Time Badge */}
            <div className="flex-shrink-0 mr-4">
              <div className="inline-flex items-center bg-primary/20 text-primary px-3 py-2 rounded-full font-bold text-sm transform -rotate-1 group-hover:rotate-0 transition-transform duration-300">
                {activity.time}
              </div>
            </div>

            {/* Adventure Content */}
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <div className="flex-shrink-0 mr-3">
                  {activity.icon ? (
                    getIconComponent(activity.icon)
                  ) : (
                    <Compass className="w-6 h-6 text-primary" />
                  )}
                </div>
                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                  {activity.title}
                </h3>
              </div>

              {activity.location && (
                <div className="flex items-center text-sm text-foreground-secondary mb-3 ml-9">
                  <MapPin className="w-4 h-4 mr-2 text-secondary" />
                  <span className="font-medium">{activity.location}</span>
                </div>
              )}

              {activity.description && (
                <div className="ml-9">
                  <p className="text-foreground-secondary group-hover:text-foreground transition-colors duration-300 leading-relaxed">
                    {activity.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render a single day's adventure expedition
  const renderDayItinerary = (day: ItineraryDay) => (
    <div key={day.day} className="mb-12 relative">
      {/* Adventure Day Card */}
      <div className="transform hover:-rotate-1 transition-transform duration-500">
        <div className="bg-gradient-to-br from-background/95 to-background-card/90 backdrop-blur-xl border-2 border-border/40 hover:border-primary/50 rounded-3xl p-8 lg:p-10 shadow-card hover:shadow-adventure-float transition-all duration-500 relative overflow-hidden">
          {/* Adventure Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 rounded-3xl blur-xl opacity-0 hover:opacity-100 transition-all duration-700 -z-10"></div>

          {/* Day Pattern */}
          <div className="absolute top-6 right-6 text-3xl opacity-20 hover:opacity-40 transition-opacity duration-500 animate-bounce-subtle">
            📍
          </div>

          {/* Adventure Day Header */}
          <div className="flex items-center mb-8">
            <div className="inline-flex items-center bg-primary/20 text-primary px-6 py-3 rounded-full font-bold text-xl mr-4 transform -rotate-2 hover:rotate-0 transition-transform duration-300">
              <Calendar className="w-5 h-5 mr-3" />
              Quest Day {day.day}
            </div>
            <div className="text-2xl animate-pulse-slow">🗓️</div>
          </div>

          <h2 className="text-3xl font-display font-bold text-foreground mb-8 ml-4 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            {day.title}
          </h2>

          {/* Adventure Activities */}
          <div className="space-y-6 ml-8 mr-4">
            {day.activities.map((activity, index) =>
              renderActivity(activity, index),
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        {/* Header - Compact */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="mb-3 sm:mb-0">
            <div className="flex items-center">
              <Sparkles className="w-5 h-5 text-primary mr-2" />
              <h1 className="text-2xl font-bold text-foreground">
                Your Travel Plan
              </h1>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center space-x-2">
            <button
              onClick={onRegeneratePlan}
              className="flex items-center p-2 btn-secondary"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              className="flex items-center p-2 btn-secondary"
              onClick={handleExportToPdf}
              title="Export to PDF"
            >
              <FileText className="w-4 h-4 " />
            </button>
            <button
              className="flex items-center p-2 btn-secondary"
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
              className="flex items-center p-2 btn-secondary"
              onClick={handleShare}
              disabled={isSharing}
              title="Share this travel plan"
            >
              {isSharing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-foreground border-t-transparent"></div>
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Mobile Actions Dropdown */}
          <div className="relative sm:hidden" ref={mobileActionsRef}>
            <button
              onClick={() => setShowMobileActions(!showMobileActions)}
              className="flex items-center px-4 py-2 text-sm btn-secondary w-full justify-between"
            >
              <span>Actions</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showMobileActions ? "rotate-180" : ""}`}
              />
            </button>

            {showMobileActions && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-border/50 py-1 z-50">
                <button
                  onClick={() => {
                    onRegeneratePlan();
                    setShowMobileActions(false);
                  }}
                  className="flex items-center justify-start w-full px-4 py-2 text-sm text-left hover:bg-background-soft"
                >
                  <RefreshCw className="w-4 h-4 mr-3" />
                  Regenerate Plan
                </button>
                <button
                  onClick={() => {
                    handleExportToPdf();
                    setShowMobileActions(false);
                  }}
                  className="flex items-center justify-start w-full px-4 py-2 text-sm text-left hover:bg-background-soft"
                >
                  <FileText className="w-4 h-4 mr-3" />
                  Export to PDF
                </button>
                <button
                  onClick={() => {
                    handleExportToGoogleMaps();
                    setShowMobileActions(false);
                  }}
                  disabled={isExportingKML}
                  className="flex items-center justify-start w-full px-4 py-2 text-sm text-left hover:bg-background-soft disabled:opacity-50"
                >
                  {isExportingKML ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-3" />
                  ) : (
                    <Download className="w-4 h-4 mr-3" />
                  )}
                  Export to Maps
                </button>
                <button
                  onClick={() => {
                    handleShare();
                    setShowMobileActions(false);
                  }}
                  disabled={isSharing}
                  className="flex items-center justify-start w-full px-4 py-2 text-sm text-left hover:bg-background-soft disabled:opacity-50"
                >
                  {isSharing ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-foreground border-t-transparent mr-3"></div>
                  ) : (
                    <Share2 className="w-4 h-4 mr-3" />
                  )}
                  Share Plan
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Adventure Navigation Tabs */}
        <div className="mb-8 relative">
          {/* Floating background elements */}
          <div className="absolute -top-4 -left-8 text-4xl opacity-10 animate-float-slow">
            🗺️
          </div>
          <div
            className="absolute -top-2 -right-6 text-3xl opacity-15 animate-bounce-subtle"
            style={{ animationDelay: "1s" }}
          >
            🧭
          </div>

          <div className="bg-gradient-to-br from-background-card/80 to-background/70 backdrop-blur-xl border-2 border-border/30 rounded-2xl p-3 shadow-adventure-float relative">
            {/* Adventure glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 rounded-2xl blur-lg opacity-50"></div>

            <nav className="flex space-x-3 relative z-10">
              <button
                onClick={() => setActiveTab("itinerary")}
                className={`group flex-1 py-4 px-6 font-bold text-sm rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 relative overflow-hidden ${activeTab === "itinerary"
                  ? "bg-gradient-to-r from-primary to-secondary text-white shadow-glow"
                  : "bg-background/80 text-foreground hover:bg-background border border-border/50 hover:border-primary/30"
                  }`}
              >
                <span className="relative z-10 flex items-center justify-center">
                  📅 Daily Expedition Log
                </span>
                {activeTab === "itinerary" && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab("info")}
                className={`group flex-1 py-4 px-6 font-bold text-sm rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 relative overflow-hidden ${activeTab === "info"
                  ? "bg-gradient-to-r from-secondary to-accent text-white shadow-glow"
                  : "bg-background/80 text-foreground hover:bg-background border border-border/50 hover:border-secondary/30"
                  }`}
              >
                <span className="relative z-10 flex items-center justify-center">
                  🎯 Adventure Intel
                </span>
                {activeTab === "info" && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                )}
              </button>
            </nav>
          </div>
        </div>

        {/* Adventure Tab Content */}
        {activeTab === "itinerary" && (
          <div className="space-y-8 relative">
            {/* Floating background elements */}
            <div className="absolute inset-0 pointer-events-none">
              <div
                className="absolute top-20 left-12 text-5xl opacity-5 animate-float"
                style={{ animationDelay: "2s" }}
              >
                🏔️
              </div>
              <div
                className="absolute top-80 right-16 text-4xl opacity-8 animate-pulse-slow"
                style={{ animationDelay: "3s" }}
              >
                🎒
              </div>
              <div
                className="absolute bottom-40 left-20 text-6xl opacity-5 animate-bounce-subtle"
                style={{ animationDelay: "1s" }}
              >
                ⛰️
              </div>
            </div>

            {/* Adventure Expedition Itinerary */}
            <div className="relative z-10">
              <div className="text-center mb-12">
                <div className="inline-flex items-center bg-primary/20 text-primary px-6 py-3 rounded-full font-bold text-xl mb-4 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                  <BookOpen className="w-5 h-5 mr-3" />
                  Adventure Blueprint
                </div>
                <p className="text-lg text-foreground-secondary ml-8 max-w-2xl mx-auto leading-relaxed">
                  Your personalized expedition roadmap - crafted to match your
                  explorer spirit! 🗺️
                </p>
              </div>

              {plan.itinerary && plan.itinerary.length > 0 ? (
                <div className="space-y-8">
                  {plan.itinerary.map((day) => renderDayItinerary(day))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="bg-gradient-to-br from-background/95 to-background-card/90 backdrop-blur-xl border-2 border-border/40 rounded-3xl p-12 shadow-card transform -rotate-1">
                    <div className="text-6xl mb-4 animate-bounce-subtle">
                      🗺️
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      Adventure Map Loading...
                    </h3>
                    <p className="text-foreground-secondary">
                      No expedition details available for this destination yet.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "info" && (
          <div className="space-y-12">
            {/* Adventure Intel Header */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-6">
                <div className="inline-flex items-center bg-secondary/20 text-secondary px-6 py-3 rounded-full font-bold text-lg mr-4 transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                  <Globe className="w-5 h-5 mr-3" />
                  Adventure Intelligence Briefing
                </div>
                <div className="text-3xl animate-bounce-subtle">🕵️‍♂️</div>
              </div>
              <p className="text-lg text-foreground-secondary max-w-3xl mx-auto leading-relaxed">
                Everything you need to know for a successful expedition \u2014
                from must-see landmarks to local secrets that'll make your
                adventure legendary!
              </p>
            </div>

            {/* Epic Discoveries */}
            <TravelPlanSection rotation="right" glowColor="primary">
              <SectionHeader
                icon={MapPin}
                title="Epic Discoveries"
                emoji="🏛️"
                badgeColor="primary"
              />
              {(() => {
                // Group places by category
                const placesByCategory = plan.placesToVisit?.reduce(
                  (acc, place) => {
                    const category = place.category || "Other";
                    if (!acc[category]) {
                      acc[category] = [];
                    }
                    acc[category].push(place);
                    return acc;
                  },
                  {} as Record<string, typeof plan.placesToVisit>,
                );

                return Object.entries(placesByCategory || {}).map(
                  ([category, places]) => (
                    <CategoryGroup
                      key={category}
                      title={
                        category.charAt(0).toUpperCase() + category.slice(1)
                      }
                    >
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
                  ),
                );
              })()}
            </TravelPlanSection>

            {/* Base Camp Neighborhoods */}
            {plan.neighborhoods && (
              <TravelPlanSection rotation="left" glowColor="accent">
                <SectionHeader
                  icon={Home}
                  title="Perfect Base Camps"
                  emoji="🏡"
                  badgeColor="accent"
                />
                <ItemGrid columns={3}>
                  {plan.neighborhoods.map((neighborhood, index) => (
                    <ItemCard
                      key={index}
                      title={neighborhood.name}
                      subtitle={neighborhood.vibe}
                      description={neighborhood.summary}
                    >
                      <div className="mt-4">
                        <p className="italic mb-2">
                          Best for: {neighborhood.bestFor.slice(9)}
                        </p>
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

            {/* Adventure Lodgings */}
            {plan.hotelRecommendations && (
              <TravelPlanSection rotation="right" glowColor="secondary">
                <SectionHeader
                  icon={Home}
                  title="Epic Adventure Lodgings"
                  emoji="🛏️"
                  badgeColor="secondary"
                />
                {(() => {
                  // Group hotels by neighborhood
                  const hotelsByNeighborhood =
                    plan.hotelRecommendations?.reduce(
                      (acc, hotel) => {
                        const neighborhood =
                          hotel.neighborhood || "Other Areas";
                        if (!acc[neighborhood]) {
                          acc[neighborhood] = [];
                        }
                        acc[neighborhood].push(hotel);
                        return acc;
                      },
                      {} as Record<string, typeof plan.hotelRecommendations>,
                    );

                  return Object.entries(hotelsByNeighborhood || {}).map(
                    ([neighborhood, hotels]) => (
                      <CategoryGroup
                        key={neighborhood}
                        title={neighborhood}
                        icon={MapPin}
                      >
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
                    ),
                  );
                })()}
              </TravelPlanSection>
            )}

            {/* Culinary Adventures */}
            <TravelPlanSection rotation="left" glowColor="primary">
              <SectionHeader
                icon={Utensils}
                title="Epic Culinary Adventures"
                emoji="🍴"
                badgeColor="primary"
              />
              {(() => {
                // Separate restaurants and bars with type indicators
                const restaurants = plan.restaurants.map((restaurant) => ({
                  ...restaurant,
                  type: "restaurant" as const,
                  searchType: "restaurant",
                }));

                const bars = (plan.bars || []).map((bar) => ({
                  name: bar.name,
                  cuisine: bar.category,
                  priceRange: bar.atmosphere,
                  neighborhood: bar.neighborhood || "Other Areas",
                  description: bar.description,
                  type: "bar" as const,
                  searchType: "bar",
                }));

                // Group restaurants by neighborhood
                const restaurantsByNeighborhood = restaurants.reduce(
                  (acc, restaurant) => {
                    const neighborhood =
                      restaurant.neighborhood || "Other Areas";
                    if (!acc[neighborhood]) {
                      acc[neighborhood] = [];
                    }
                    acc[neighborhood].push(restaurant);
                    return acc;
                  },
                  {} as Record<string, typeof restaurants>,
                );

                // Group bars by neighborhood
                const barsByNeighborhood = bars.reduce(
                  (acc, bar) => {
                    const neighborhood = bar.neighborhood || "Other Areas";
                    if (!acc[neighborhood]) {
                      acc[neighborhood] = [];
                    }
                    acc[neighborhood].push(bar);
                    return acc;
                  },
                  {} as Record<string, typeof bars>,
                );

                // Get all unique neighborhoods
                const allNeighborhoods = Array.from(
                  new Set([
                    ...Object.keys(restaurantsByNeighborhood),
                    ...Object.keys(barsByNeighborhood),
                  ]),
                );

                return allNeighborhoods.map((neighborhood) => (
                  <CategoryGroup
                    key={neighborhood}
                    title={neighborhood}
                    icon={MapPin}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Restaurants column */}
                      {restaurantsByNeighborhood[neighborhood] &&
                        restaurantsByNeighborhood[neighborhood].length > 0 && (
                          <div>
                            <h4 className="mb-3 flex items-center">
                              <Utensils className="w-5 h-5 mr-2 text-primary" />
                              Restaurants
                            </h4>
                            <div className="space-y-4">
                              {restaurantsByNeighborhood[neighborhood].map(
                                (restaurant, index) => (
                                  <ItemCard
                                    key={`restaurant-${index}`}
                                    title={restaurant.name}
                                    subtitle={`${restaurant.cuisine} • ${restaurant.priceRange}`}
                                    description={restaurant.description}
                                    searchLink={generateGoogleSearchLink(
                                      restaurant.name,
                                      "restaurant",
                                    )}
                                    tags={restaurant.specialDishes}
                                  >
                                    {restaurant.reservationsRecommended ===
                                      "Yes" && (
                                        <div className="mt-3 text-sm text-amber font-medium">
                                          💡 Reservations recommended
                                        </div>
                                      )}
                                  </ItemCard>
                                ),
                              )}
                            </div>
                          </div>
                        )}

                      {/* Bars column */}
                      {barsByNeighborhood[neighborhood] &&
                        barsByNeighborhood[neighborhood].length > 0 && (
                          <div>
                            <h4 className="mb-3 flex items-center">
                              <BeerIcon className="w-5 h-5 mr-2 text-secondary" />
                              Bars & Nightlife
                            </h4>
                            <div className="space-y-4">
                              {barsByNeighborhood[neighborhood].map(
                                (bar, index) => (
                                  <ItemCard
                                    key={`bar-${index}`}
                                    title={bar.name}
                                    subtitle={`${bar.cuisine} • ${bar.priceRange}`}
                                    description={bar.description}
                                    searchLink={generateGoogleSearchLink(
                                      bar.name,
                                      "bar",
                                    )}
                                  />
                                ),
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  </CategoryGroup>
                ));
              })()}
            </TravelPlanSection>

            {/* Legendary Local Flavors */}
            {plan.mustTryFood && plan.mustTryFood.items && (
              <TravelPlanSection rotation="right" glowColor="accent">
                <SectionHeader
                  icon={Utensils}
                  title="Legendary Local Flavors"
                  emoji="🤤"
                  badgeColor="accent"
                />
                {(() => {
                  // Group food items by category
                  const foodByCategory = plan.mustTryFood.items.reduce(
                    (acc, item) => {
                      const category = item.category;
                      if (!acc[category]) {
                        acc[category] = [];
                      }
                      acc[category].push(item);
                      return acc;
                    },
                    {} as Record<string, typeof plan.mustTryFood.items>,
                  );

                  const categoryTitles: Record<string, string> = {
                    main: "Main Dishes",
                    dessert: "Desserts",
                    drink: "Local Drinks",
                    snack: "Snacks",
                  };

                  // Separate main dishes from other categories
                  const mainDishes = foodByCategory["main"] || [];
                  const otherCategories = Object.entries(foodByCategory).filter(
                    ([category]) => category !== "main",
                  );

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
                                  searchLink={generateGoogleSearchLink(
                                    item.name,
                                    "food",
                                  )}
                                  metadata={
                                    item.whereToFind
                                      ? `📍 ${item.whereToFind}`
                                      : undefined
                                  }
                                />
                              ))}
                            </div>
                          </CategoryGroup>
                        )}
                      </div>

                      {/* Other Categories Column */}
                      <div className="space-y-6">
                        {otherCategories.map(([category, items]) => (
                          <CategoryGroup
                            key={category}
                            title={categoryTitles[category] || category}
                          >
                            <div className="space-y-4">
                              {items.map((item, index) => (
                                <ItemCard
                                  key={index}
                                  title={item.name}
                                  description={item.description}
                                  searchLink={generateGoogleSearchLink(
                                    item.name,
                                    "food",
                                  )}
                                  metadata={
                                    item.whereToFind
                                      ? `📍 ${item.whereToFind}`
                                      : undefined
                                  }
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

            {/* Adventure Events */}
            {plan.localEvents && plan.localEvents.length > 0 && (
              <TravelPlanSection rotation="left" glowColor="primary">
                <SectionHeader
                  icon={Calendar}
                  title="Epic Local Festivities"
                  emoji="🎪"
                  badgeColor="primary"
                />
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

            {/* Adventure Experiences */}
            {plan.activities && (
              <TravelPlanSection rotation="right" glowColor="accent">
                <SectionHeader
                  icon={Compass}
                  title="Legendary Local Quests"
                  emoji="⚡"
                  badgeColor="accent"
                />
                <ItemGrid columns={2}>
                  {plan.activities.map((activity, index) => {
                    const tags = [];
                    if (activity.localSpecific)
                      tags.push("Local Specialty");
                    if (
                      activity.experienceType &&
                      activity.experienceType !== "other"
                    ) {
                      tags.push(
                        activity.experienceType.charAt(0).toUpperCase() +
                        activity.experienceType.slice(1),
                      );
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

            {/* Adventure Transport Command */}
            <TravelPlanSection rotation="left" glowColor="primary">
              <SectionHeader
                icon={Compass}
                title="Adventure Transport HQ"
                emoji="🚌"
                badgeColor="primary"
              />

              {/* City Transportation - Adventure styled 2-column layout */}
              <ContentGrid columns={2} className="mb-8">
                <ContentCard title="Public Transport Quest" icon="🚇">
                  <p className="text-foreground-secondary mb-3">
                    {plan.transportationInfo.publicTransport}
                  </p>
                  <div className="flex items-center">
                    <span className="text-sm text-foreground-muted mr-2">
                      💳 Credit cards:
                    </span>
                    <span
                      className={`text-sm font-medium px-2 py-1 rounded-full ${plan.transportationInfo.creditCardPayment
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                        }`}
                    >
                      {plan.transportationInfo.creditCardPayment
                        ? "Accepted"
                        : "Not accepted"}
                    </span>
                  </div>
                </ContentCard>

                <ContentCard title="Taxi & Rideshare Command" icon="🚕">
                  <p className="text-foreground-secondary mb-3">
                    {plan.transportationInfo.ridesharing}
                  </p>
                  <div className="flex items-center mb-3">
                    <span className="text-sm text-foreground-muted mr-2">
                      💰 Average cost:
                    </span>
                    <span className="text-sm font-bold text-primary">
                      {plan.transportationInfo.taxiInfo?.averageCost}
                    </span>
                  </div>
                  {plan.transportationInfo.taxiInfo?.tips && (
                    <div>
                      <div className="flex items-center mb-2">
                        <span className="text-sm mr-2">💡</span>
                        <span className="text-sm font-medium text-foreground">
                          Pro Tips:
                        </span>
                      </div>
                      <ul className="space-y-1">
                        {plan.transportationInfo.taxiInfo.tips.map(
                          (tip, index) => (
                            <li
                              key={index}
                              className="flex items-start text-sm"
                            >
                              <span className="text-primary mr-2 mt-0.5">
                                •
                              </span>
                              <span className="text-foreground-secondary">
                                {tip}
                              </span>
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}
                </ContentCard>
              </ContentGrid>

              {/* Airport Adventure Hub - Full width dedicated section */}
              <div className="border-t border-border/30 pt-8">
                <div className="flex items-center mb-6">
                  <span className="text-2xl mr-3">✈️</span>
                  <h6 className="font-bold text-foreground text-xl">
                    Airport Adventure Hub
                  </h6>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {plan.transportationInfo.airportTransport?.airports?.map(
                    (airport, airportIndex) => (
                      <div
                        key={airportIndex}
                        className="bg-gradient-to-br from-background/80 to-background-card/70 backdrop-blur-sm border-2 border-border/30 hover:border-primary/40 rounded-2xl p-6 shadow-card hover:shadow-adventure-float transition-all duration-300"
                      >
                        <div className="mb-6">
                          <div className="flex items-center mb-2">
                            <span className="text-xl mr-2">🏢</span>
                            <h6 className="font-bold text-foreground">
                              {airport.name}
                            </h6>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="bg-primary/20 text-primary text-sm font-bold px-3 py-1 rounded-full">
                              {airport.code}
                            </span>
                            <span className="text-foreground-secondary">
                              📍 {airport.distanceToCity}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {airport.transportOptions?.map(
                            (option, optionIndex) => (
                              <div
                                key={optionIndex}
                                className="bg-gradient-to-r from-background/60 to-background-card/50 backdrop-blur-sm border border-border/20 rounded-xl p-4"
                              >
                                <div className="flex justify-between items-start mb-3">
                                  <p className="font-bold text-foreground">
                                    {option.type}
                                  </p>
                                  <div className="text-right">
                                    <div className="font-bold text-primary">
                                      {option.cost}
                                    </div>
                                    <div className="text-sm text-foreground-muted">
                                      ⏱️ {option.duration}
                                    </div>
                                  </div>
                                </div>

                                <p className="text-foreground-secondary mb-3">
                                  {option.description}
                                </p>

                                {option.notes &&
                                  option.notes.length > 0 && (
                                    <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
                                      <div className="flex items-center mb-2">
                                        <span className="text-lg mr-2">
                                          💡
                                        </span>
                                        <p className="font-bold text-foreground">
                                          Adventure Notes:
                                        </p>
                                      </div>
                                      <ul className="space-y-1">
                                        {option.notes.map(
                                          (note, noteIndex) => (
                                            <li
                                              key={noteIndex}
                                              className="flex items-start"
                                            >
                                              <span className="text-accent mr-2 mt-1">
                                                •
                                              </span>
                                              <span className="text-foreground-secondary">
                                                {note}
                                              </span>
                                            </li>
                                          ),
                                        )}
                                      </ul>
                                    </div>
                                  )}
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>

            </TravelPlanSection>


            {/* Adventure Weather Intel */}
            {plan.weatherInfo && (
              <TravelPlanSection rotation="left" glowColor="primary">
                <SectionHeader
                  icon={Calendar}
                  title="Adventure Weather Intel"
                  emoji="☀️"
                  badgeColor="primary"
                />

                <ContentGrid columns={2}>
                  <ContentCard
                    title="Current Conditions"
                    icon="🌡️"
                    className="bg-gradient-to-br from-background/60 to-background-card/50 backdrop-blur-sm border border-border/30 rounded-2xl"
                  >
                    <p className="text-lg font-medium text-primary mb-2">
                      {plan.weatherInfo.temperature} •{" "}
                      {plan.weatherInfo.conditions}
                    </p>
                    <p className="text-foreground-secondary mb-1">
                      💧 Humidity: {plan.weatherInfo.humidity}
                    </p>
                    <p className="text-foreground-secondary">
                      🌅 Day/Night Variance:{" "}
                      {plan.weatherInfo.dayNightTempDifference}
                    </p>
                  </ContentCard>
                  <ContentCard
                    title="Adventure Gear Tips:"
                    icon="🎒"
                    className="bg-gradient-to-br from-background/60 to-background-card/50 backdrop-blur-sm border border-border/30 rounded-2xl"
                  >
                    <ul className="space-y-2">
                      {plan.weatherInfo.recommendations?.map(
                        (rec, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-primary mr-2 mt-1">
                              •
                            </span>
                            <p className="text-foreground-secondary">
                              {rec}
                            </p>
                          </li>
                        ),
                      )}
                    </ul>
                  </ContentCard>
                </ContentGrid>
              </TravelPlanSection>
            )}

            {/* Adventure Safety & Cultural Intel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Safety Command */}
              {plan.safetyTips && (
                <TravelPlanSection rotation="left" glowColor="primary">
                  <SectionHeader
                    icon={Shield}
                    title="Adventure Safety Command"
                    emoji="⚠️"
                    badgeColor="primary"
                  />

                  <ul className="space-y-1">
                    {plan.safetyTips.map((tip, index) => (
                      <li
                        key={index}
                        className="flex items-start px-4"
                      >
                        <span className="text-secondary mr-3 mt-1 text-lg">
                          •
                        </span>
                        <p className="text-foreground-secondary">{tip}</p>
                      </li>
                    ))}
                  </ul>
                </TravelPlanSection>
              )}

              {/* Cultural Quest Guide */}
              <TravelPlanSection rotation="left" glowColor="primary">
                <SectionHeader
                  icon={BookOpen}
                  title="Adventure Cultural Quest Guide"
                  emoji="🏹"
                  badgeColor="primary"
                />
                <ul className="space-y-1">
                  {plan.socialEtiquette.map((tip, index) => (
                    <li
                      key={index}
                      className="flex items-start px-4"
                    >
                      <span className="text-accent mr-3 mt-1 text-lg">
                        •
                      </span>
                      <p className="text-foreground-secondary">{tip}</p>
                    </li>
                  ))}
                </ul>
              </TravelPlanSection>
            </div>

            {/* Currency & Payments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Local Currency */}
              <TravelPlanSection>
                <SectionHeader icon={CreditCard} title="Payment Guide" emoji="💰" badgeColor="primary" />
                <p>
                  The local currency is{" "}
                  <span className="font-medium">
                    {plan.localCurrency.currency}
                  </span>
                  .
                  {plan.localCurrency.cashNeeded
                    ? " Cash is recommended for some purchases."
                    : " Credit cards are widely accepted."}
                </p>
                {plan.localCurrency.exchangeRate && (
                  <div className="mt-3 mb-2rounded-lg">
                    <h6 className="mb-2">Current Exchange Rate</h6>
                    <p>
                      1 {plan.localCurrency.exchangeRate.from} ={" "}
                      {plan.localCurrency.exchangeRate.rate}{" "}
                      {plan.localCurrency.exchangeRate.to}
                    </p>
                  </div>
                )}
                {plan.localCurrency.tips &&
                  plan.localCurrency.tips.length > 0 && (
                    <div className="mt-4">
                      <h6 className="mb-2">Money Tips:</h6>
                      <ul className="space-y-1">
                        <li className="flex items-start">
                          <p className="mr-2">•</p>
                          <p>Credit card usage</p>
                        </li>
                        <span className="text-sm ml-4">
                          {plan.localCurrency.creditCardUsage}
                        </span>
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
                  <SectionHeader icon={CreditCard} title="Tipping Etiquette" emoji="💰" badgeColor="primary" />
                  <div className="space-y-1">
                    {Object.entries(plan.tipEtiquette).map(
                      ([category, tip], index) => (
                        <div key={index} className="mb-2">
                          <p className="font-semibold">
                            {category.charAt(0).toUpperCase() +
                              category.slice(1)}
                            :
                          </p>
                          <p>{tip}</p>
                        </div>
                      ),
                    )}
                  </div>
                </TravelPlanSection>
              )}
            </div>

            {/* Adventure Hydration HQ */}
            {plan.tapWaterSafe && (
              <TravelPlanSection rotation="left" glowColor="primary">
                <SectionHeader
                  icon={Droplets}
                  title="Hydration Command"
                  emoji="🍿"
                  badgeColor="primary"
                />
                <ContentCard>
                  <div className="flex items-start">
                    <span
                      className={`text-2xl mr-4 ${plan.tapWaterSafe.safe ? "animate-bounce-subtle" : "animate-pulse-slow"}`}
                    >
                      {plan.tapWaterSafe.safe ? "✅" : "⚠️"}
                    </span>
                    <div>
                      <p
                        className={`text-lg font-bold ${plan.tapWaterSafe.safe ? "text-green-600" : "text-amber-600"}`}
                      >
                        {plan.tapWaterSafe.safe
                          ? "Tap water is safe to drink!"
                          : "Tap water is not recommended for drinking."}
                      </p>
                    </div>
                  </div>
                </ContentCard>
              </TravelPlanSection>
            )}

            {/* Adventure Chronicles */}
            {plan.history && (
              <TravelPlanSection rotation="right" glowColor="secondary">
                <SectionHeader
                  icon={BookOpen}
                  title="Adventure Chronicles"
                  emoji="🏰"
                  badgeColor="secondary"
                />

                <ContentCard>
                  <p className="text-foreground-secondary leading-relaxed">
                    {plan.history}
                  </p>
                </ContentCard>
              </TravelPlanSection>
            )}
          </div>
        )}
      </div>

      {/* KML Export Loading Overlay */}
      <KMLExportLoading isVisible={isExportingKML} />
    </div>
  );
}
