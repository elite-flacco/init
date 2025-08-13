import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { trackTravelEvent } from "../lib/analytics";
import { useStreamingTripPlanning } from "../hooks/useStreamingTripPlanning";
import { useParallelTripPlanning } from "../hooks/useParallelTripPlanning";
import { AITripPlanningRequest } from "../services/aiTripPlanningService";
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
  ChevronDown,
  Edit,
  Coffee,
} from "lucide-react";
import { getActivityIcon } from "../utils/iconMapping";
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
import { MapIcon3D, NotebookIcon3D, SuitcaseIcon3D, CalendarIcon3D } from "./ui/Icon3D";

interface AITravelPlanProps {
  destination: Destination;
  travelerType: TravelerType;
  aiResponse?: AITripPlanningResponse; // Make optional for streaming mode
  streamingRequest?: AITripPlanningRequest; // Add streaming request data
  onRegeneratePlan: () => void;
  onBack?: () => void;
}

export function AITravelPlan({
  destination,
  travelerType,
  aiResponse,
  streamingRequest,
  onRegeneratePlan,
  onBack,
}: AITravelPlanProps) {
  const [activeTab, setActiveTab] = useState<
    "itinerary" | "info" | "practical"
  >("info");
  const [isExportingKML, setIsExportingKML] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [, setShareUrl] = useState<string | null>(null);
  const [showMobileActions, setShowMobileActions] = useState(false);
  const mobileActionsRef = useRef<HTMLDivElement>(null);

  // Initialize streaming hooks
  const { state: parallelState, generatePlan } = useParallelTripPlanning();
  const { state: streamingState, generateStreamingPlan, retryChunk } = useStreamingTripPlanning();

  // Determine if we're in streaming mode
  const isStreamingMode = !!streamingRequest;
  const [useStreaming, setUseStreaming] = useState(false);

  // Start streaming when component mounts if we have a streaming request
  const [hasStartedStreaming, setHasStartedStreaming] = useState(false);

  useEffect(() => {
    if (streamingRequest && !hasStartedStreaming) {
      setHasStartedStreaming(true);

      const startStreaming = async () => {
        try {
          setUseStreaming(true);
          await generateStreamingPlan(streamingRequest);
        } catch (streamingError) {
          console.log('[AITravelPlan] Streaming failed, falling back to parallel approach:', streamingError);
          setUseStreaming(false);
          await generatePlan(streamingRequest);
        }
      };

      startStreaming();
    }
  }, [streamingRequest, hasStartedStreaming, generateStreamingPlan, generatePlan]);

  // Handle both streaming and completed plans
  const staticStreamingState = aiResponse?.streamingState;
  const staticStreamingHooks = aiResponse?.streamingHooks;
  const { plan } = aiResponse || {};

  // Determine which streaming state to use (live streaming or static from props)
  const activeStreamingState = isStreamingMode ? streamingState : staticStreamingState;
  const isActivelyStreaming = isStreamingMode ? (useStreaming && streamingState.isLoading) : (staticStreamingState && staticStreamingHooks);

  // Get the live plan data 
  const livePlan = isStreamingMode
    ? (useStreaming ? streamingState.combinedData : parallelState.combinedData) || plan
    : (activeStreamingState?.combinedData || plan);


  // Check which tabs have content vs are still loading based on chunk completion
  const getTabLoadingState = (tab: 'itinerary' | 'info' | 'practical') => {
    if (!isActivelyStreaming) return { isLoading: false, hasContent: !!livePlan };

    if (!activeStreamingState?.chunks) return { isLoading: true, hasContent: false };

    // Map tabs to their required chunks
    const tabChunkMap = {
      itinerary: [4], // Cultural chunk has activities and itinerary
      info: [1, 2],   // Basics (places) + dining chunks
      practical: [3]  // Practical chunk
    };

    const requiredChunks = tabChunkMap[tab];
    const completedChunks = requiredChunks.filter(chunkId =>
      activeStreamingState.chunks[chunkId]?.finalData
    );

    const result = {
      isLoading: completedChunks.length < requiredChunks.length,
      hasContent: completedChunks.length > 0,
      progress: Math.round((completedChunks.length / requiredChunks.length) * 100)
    };

    return result;
  };

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
      // Track PDF export
      trackTravelEvent.exportPlan('pdf');

      await PdfExportService.exportTravelPlanToPdf({
        destination,
        travelerType,
        plan: livePlan,
        includeItinerary: true,
        includeInfo: true,
      });
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      alert("Couldn't create the PDF. Give it another shot?");

      // Track export error
      trackTravelEvent.error('pdf_export_failed');
    }
  };

  const handleExportToGoogleMaps = async () => {
    setIsExportingKML(true);

    // Track KML export
    trackTravelEvent.exportPlan('kml');

    try {
      // First try with real coordinates, but with a shorter timeout
      try {
        await KMLExportService.downloadKML(livePlan, undefined, {
          useRealCoordinates: true,
        });
      } catch {
        // Fallback to approximate coordinates if geocoding fails
        await KMLExportService.downloadKML(livePlan, undefined, {
          useRealCoordinates: false,
        });
      }
    } catch (error) {
      console.error("Error exporting to KML:", error);
      alert("Couldn't create the map file. Try again?");

      // Track export error
      trackTravelEvent.error('kml_export_failed');
    } finally {
      setIsExportingKML(false);
    }
  };

  const handleShare = async () => {
    setIsSharing(true);

    // Track share attempt
    trackTravelEvent.sharePlan('url');

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
        alert("Share link copied! Send it around!");
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = newShareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        alert(`Got your share link: ${newShareUrl}`);
      }
    } catch (error) {
      console.error("Error creating share link:", error);
      alert("Couldn't create the share link. Try again?");

      // Track share error
      trackTravelEvent.error('share_failed');
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

  // Generic section loading component
  const SectionLoading = ({
    title,
    emoji,
    color = 'primary',
    layout = 'grid',
    columns = 2,
    items = 4,
    customContent = null
  }: {
    title: string;
    emoji: string;
    color?: 'primary' | 'secondary' | 'accent';
    layout?: 'grid' | 'list' | 'custom';
    columns?: number;
    items?: number;
    customContent?: React.ReactNode;
  }) => {
    const colorClasses = {
      primary: 'bg-primary/20 text-primary',
      secondary: 'bg-secondary/20 text-secondary',
      accent: 'bg-accent/20 text-accent'
    };

    const spinnerColorClasses = {
      primary: 'text-primary',
      secondary: 'text-secondary',
      accent: 'text-accent'
    };

    const getGridClasses = () => {
      const gridMap = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-4',
        6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      };
      return gridMap[columns as keyof typeof gridMap] || 'grid-cols-1 md:grid-cols-2';
    };

    const renderContent = () => {
      if (customContent) return customContent;

      if (layout === 'list') {
        return (
          <div className="space-y-3">
            {Array.from({ length: items }).map((_, index) => (
              <div key={index} className="h-3 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        );
      }

      if (layout === 'grid') {
        return (
          <div className={`grid ${getGridClasses()} gap-4`}>
            {Array.from({ length: items }).map((_, index) => (
              <div key={index} className="space-y-3">
                <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
              </div>
            ))}
          </div>
        );
      }

      return null;
    };

    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1 ${colorClasses[color]} rounded-full`}>
              <span className="text-sm font-bold">{emoji} {title}</span>
            </div>
            <Loader2 className={`w-4 h-4 animate-spin ${spinnerColorClasses[color]}`} />
          </div>
        </div>
        {renderContent()}
      </div>
    );
  };

  // Simplified loading components using the generic SectionLoading
  const AttractionsLoading = () => <SectionLoading title="Must-See Spots" emoji="🏛️" color="primary" columns={2} items={4} />;
  const NeighborhoodsLoading = () => <SectionLoading title="Perfect Base Camps" emoji="🏡" color="accent" columns={3} items={3} />;
  const HotelsLoading = () => <SectionLoading title="Great Places to Stay" emoji="🛏️" color="secondary" columns={3} items={3} />;
  const TransportationLoading = () => <SectionLoading title="Getting Around" emoji="🚌" color="primary" columns={2} items={2} />;
  const WeatherLoading = () => <SectionLoading title="Weather Info" emoji="☀️" color="secondary" columns={2} items={2} />;
  const LocalEventsLoading = () => <SectionLoading title="Local Festivities" emoji="🎪" color="primary" columns={3} items={3} />;
  const ActivitiesLoading = () => <SectionLoading title="Cool Local Experiences" emoji="⚡" color="accent" columns={2} items={4} />;
  const SafetyTipsLoading = () => <SectionLoading title="Safety Tips" emoji="⚠️" color="primary" layout="list" items={4} />;
  const CulturalInsightsLoading = () => <SectionLoading title="Cultural Insights" emoji="🏹" color="primary" layout="list" items={4} />;
  const DrinkingWaterLoading = () => <SectionLoading title="Drinking Water" emoji="💧" color="primary" layout="list" items={2} />;
  const LocalHistoryLoading = () => <SectionLoading title="Local History" emoji="🏰" color="secondary" layout="list" items={3} />;
  const PaymentGuideLoading = () => <SectionLoading title="Payment Guide" emoji="💰" color="primary" layout="list" items={2} />;
  const TippingEtiquetteLoading = () => <SectionLoading title="Tipping Etiquette" emoji="💰" color="primary" layout="list" items={2} />;

  const DiningLoading = () => <SectionLoading
    title="Where to Eat & Drink"
    emoji="🍴"
    color="primary"
    layout="custom"
    customContent={
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Utensils className="w-5 h-5 text-accent" />
            <span className="font-medium">Restaurants</span>
          </div>
          {[1, 2].map(item => (
            <div key={item} className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <BeerIcon className="w-5 h-5 text-secondary" />
            <span className="font-medium">Bars & Nightlife</span>
          </div>
          {[1, 2].map(item => (
            <div key={item} className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    }
  />;

  const LocalFoodLoading = () => <SectionLoading
    title="Must-Try Local Flavors"
    emoji="🤤"
    color="accent"
    layout="custom"
    customContent={
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Utensils className="w-5 h-5 text-secondary" />
            <span className="font-medium">Main Dishes</span>
          </div>
          {[1, 2, 3].map(item => (
            <div key={item} className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Coffee className="w-5 h-5 text-accent" />
            <span className="font-medium">Desserts & Drinks</span>
          </div>
          {[1, 2].map(item => (
            <div key={item} className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    }
  />;

  // Helper function to get icon component based on icon name
  const getIconComponent = (iconName: string) => {
    const getAnimationFromIconName = (name: string) => {
      switch (name) {
        case "coffee": return "pulse";
        case "map": return "bounce";
        case "utensils": return "pulse";
        case "compass": return "bounce";
        case "camera": return "none";
        case "exploration": return "none";
        case "afternoon": return "none";
        default: return "none";
      }
    };

    return getActivityIcon(iconName, "xs", getAnimationFromIconName(iconName) as any);
  };

  // Render a single activity
  const renderActivity = (activity: Activity, index: number) => (
    <div key={index} className="relative group">
      <div className="transform hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300">
        <div className="bg-gradient-to-br from-background/80 to-background-card/70 backdrop-blur-sm border-2 border-border/30 hover:border-primary/40 rounded-2xl p-6 shadow-card hover:shadow-adventure-float transition-all duration-300 relative overflow-hidden">
          {/* Activity Highlight */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-2xl"></div>

          <div className="flex items-start relative z-10">
            {/* Time Badge */}
            <div className="flex-shrink-0 mr-4">
              <div className="inline-flex items-center justify-start bg-primary/20 text-primary px-3 py-2 rounded-full font-bold text-sm transform -rotate-1 group-hover:rotate-0 transition-transform duration-300">
                {activity.time}
              </div>
            </div>

            {/* Activity Content */}
            <div className="flex-1">
              <div className="flex items-center mb-1">
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
                  <MapPin className="w-3 h-3 mr-1" />
                  <span className="font-medium text-xs">{activity.location}</span>
                </div>
              )}

              {activity.description && (
                <div className="ml-9">
                  <p className="group-hover:text-foreground transition-colors duration-300 leading-relaxed">
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

  // Render a single day's itinerary
  const renderDayItinerary = (day: ItineraryDay) => (
    <div key={day.day} className="mb-12 relative">
      {/* Daily Itinerary Card */}
      <div className="transform hover:-rotate-1 transition-transform duration-500">
        <div className="bg-gradient-to-br from-background/95 to-background-card/90 backdrop-blur-xl border-2 border-border/40 hover:border-primary/50 rounded-3xl p-8 lg:p-10 shadow-card hover:shadow-adventure-float transition-all duration-500 relative overflow-hidden">
          {/* Card Highlight */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 rounded-3xl blur-xl opacity-0 hover:opacity-100 transition-all duration-700 -z-10"></div>

          {/* Day Header */}
          <div className="flex items-center mb-8">
            <div className="inline-flex items-center bg-primary/20 text-primary px-6 py-3 rounded-full font-bold text-base md:text-lg lg:text-lg mr-4 transform -rotate-2 hover:rotate-0 transition-transform duration-300">
              <CalendarIcon3D size="xs" />
              {day.title}
            </div>
          </div>

          {/* Daily Activities */}
          <div className="space-y-6 ml-8 mr-4">
            {day.activities.map((activity, index) =>
              renderActivity(activity, index),
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Always show the main travel plan interface
  // Streaming content will appear directly in the tabs as it becomes available

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: 0.1
      }}
      className="min-h-screen"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.6,
          ease: [0.25, 0.46, 0.45, 0.94],
          delay: 0.3
        }}
        className="max-w-5xl mx-auto px-4 py-4 sm:px-6 lg:px-8"
      >
        {/* Header - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6"
        >
          <div className="mb-3 sm:mb-0">
            <div className="flex items-start">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 0.6,
                  type: "spring",
                  stiffness: 200,
                  damping: 15
                }}
              >
                <Sparkles className="w-12 h-12 text-primary mr-2" />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.8,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                className="text-3d-gradient"
              >
                Your Info Packet
              </motion.h2>
            </div>
          </div>

          {/* Desktop Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.6,
              delay: 1.0,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            className="hidden sm:flex items-center space-x-2"
          >
            <button
              onClick={onRegeneratePlan}
              className="flex items-center p-2 btn-3d-outline"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              className="flex items-center p-2 btn-3d-outline"
              onClick={handleExportToPdf}
              title="Export to PDF"
            >
              <FileText className="w-4 h-4 " />
            </button>
            <button
              className="flex items-center p-2 btn-3d-outline"
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
              className="flex items-center p-2 btn-3d-outline"
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
          </motion.div>

          {/* Mobile Actions Dropdown */}
          <div className="relative sm:hidden" ref={mobileActionsRef}>
            <button
              onClick={() => setShowMobileActions(!showMobileActions)}
              className="flex items-center px-4 py-2 text-sm btn-3d-outline w-full justify-between"
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
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 1.2,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          className="mb-4 relative"
        >
          <div className="flex flex-col xl:flex-row justify-center items-center gap-2 xl:gap-2 px-2 max-w-none mx-auto">
            <button
              onClick={() => setActiveTab("itinerary")}
              className={`group transition-all duration-300 transform hover:scale-105 w-full xl:w-auto border-0 shadow-none ${activeTab === "itinerary" ? "scale-110" : "hover:-translate-y-1"
                }`}
            >
              <div className={`inline-flex items-center justify-center px-6 py-1.5 rounded-full font-bold text-sm transform transition-all duration-300 whitespace-nowrap ${activeTab === "itinerary"
                ? "bg-primary/20 text-primary -rotate-1 shadow-glow"
                : "bg-gradient-to-br from-background/90 to-background-card/80 backdrop-blur-sm text-foreground-secondary border-2 border-border/40 hover:bg-gradient-to-br hover:from-primary/10 hover:to-primary/5 hover:text-primary hover:border-primary/20 rotate-1 hover:rotate-0 shadow-card hover:shadow-adventure-float"
                }`}>
                <MapIcon3D size="xs" />
                <span>Adventure Blueprint</span>
                {getTabLoadingState('itinerary').isLoading && (
                  <Loader2 className="w-3 h-3 ml-2 animate-spin" />
                )}
              </div>
            </button>

            <button
              onClick={() => setActiveTab("info")}
              className={`group transition-all duration-300 transform hover:scale-105 w-full xl:w-auto border-0 shadow-none ${activeTab === "info" ? "scale-110" : "hover:-translate-y-1"
                }`}
            >
              <div className={`inline-flex items-center justify-center px-6 py-1.5 rounded-full font-bold text-sm transform transition-all duration-300 whitespace-nowrap ${activeTab === "info"
                ? "bg-secondary/20 text-secondary -rotate-2 shadow-glow-teal"
                : "bg-gradient-to-br from-background/90 to-background-card/80 backdrop-blur-sm text-foreground-secondary border-2 border-border/40 hover:bg-gradient-to-br hover:from-secondary/10 hover:to-secondary/5 hover:text-secondary hover:border-secondary/20 rotate-2 hover:rotate-0 shadow-card hover:shadow-adventure-float"
                }`}>
                <NotebookIcon3D size="xs" />
                <span>Intelligence Briefing</span>
                {getTabLoadingState('info').isLoading && (
                  <Loader2 className="w-3 h-3 ml-2 animate-spin" />
                )}
              </div>
            </button>

            <button
              onClick={() => setActiveTab("practical")}
              className={`group transition-all duration-300 transform hover:scale-105 w-full xl:w-auto border-0 shadow-none ${activeTab === "practical" ? "scale-110" : "hover:-translate-y-1"
                }`}
            >
              <div className={`inline-flex items-center justify-center px-6 py-1.5 rounded-full font-bold text-sm transform transition-all duration-300 whitespace-nowrap ${activeTab === "practical"
                ? "bg-accent/20 text-accent -rotate-2 shadow-glow-coral"
                : "bg-gradient-to-br from-background/90 to-background-card/80 backdrop-blur-sm text-foreground-secondary border-2 border-border/40 hover:bg-gradient-to-br hover:from-accent/10 hover:to-accent/5 hover:text-accent hover:border-accent/20 rotate-1 hover:rotate-0 shadow-card hover:shadow-adventure-float"
                }`}>
                <SuitcaseIcon3D size="xs" />
                <span>Practical Guide</span>
                {getTabLoadingState('practical').isLoading && (
                  <Loader2 className="w-3 h-3 ml-2 animate-spin" />
                )}
              </div>
            </button>
          </div>
        </motion.div>

        {/* Tab Content */}
        {activeTab === "itinerary" && (
          <div className="space-y-8 relative">
            {/* Travel Itinerary */}
            <div className="relative z-10">
              {livePlan?.itinerary && livePlan?.itinerary.length > 0 ? (
                <div className="space-y-8">
                  {livePlan?.itinerary.map((day) => renderDayItinerary(day))}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Streaming skeleton for itinerary */}
                  {isActivelyStreaming && getTabLoadingState('itinerary').isLoading ? (
                    <div className="space-y-4">
                      <div className="text-center mb-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          <span className="text-sm font-medium text-primary">
                            Crafting your adventure timeline...
                          </span>
                        </div>
                      </div>

                      {/* Day skeleton loaders */}
                      {[1, 2, 3].map(day => (
                        <div key={day} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-primary/20 rounded-full animate-pulse"></div>
                            <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
                          </div>
                          <div className="space-y-3">
                            <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="bg-gradient-to-br from-background/95 to-background-card/90 backdrop-blur-xl border-2 border-border/40 rounded-3xl p-12 shadow-card transform -rotate-1">
                        <div className="flex items-center justify-center mb-4">
                          <MapIcon3D size="xl" animation="bounce" />
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
              )}
            </div>
          </div>
        )}

        {activeTab === "info" && (
          <div className="space-y-12">
            {/* Streaming progress indicator for info tab */}
            {isActivelyStreaming && getTabLoadingState('info').isLoading && (
              <div className="text-center mb-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-full">
                  <Loader2 className="w-4 h-4 animate-spin text-secondary" />
                  <span className="text-sm font-medium text-secondary">
                    Gathering intelligence on {destination.name}...
                  </span>
                </div>
              </div>
            )}

            {/* Top Attractions */}
            {livePlan?.placesToVisit ? (
              <TravelPlanSection rotation="right" glowColor="primary">
                <SectionHeader
                  icon={MapPin}
                  title="Must-See Spots"
                  emoji="🏛️"
                  badgeColor="primary"
                />
                {(() => {
                  // Group places by category
                  const placesByCategory = livePlan?.placesToVisit?.reduce(
                    (acc, place) => {
                      const category = place.category || "Other";
                      if (!acc[category]) {
                        acc[category] = [];
                      }
                      acc[category].push(place);
                      return acc;
                    },
                    {} as Record<string, NonNullable<typeof livePlan>['placesToVisit']>,
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
                            >
                              {place.ticketInfo && (
                                <div className="mt-3 space-y-2">
                                  {(place.ticketInfo.required || place.ticketInfo.recommended) && (
                                    <div className="flex flex-col items-start justify-start space-y-2">
                                      {place.ticketInfo.required && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-error/10 text-error border border-error/20">
                                          🎫 Tickets Required
                                        </span>
                                      )}
                                      {place.ticketInfo.recommended && !place.ticketInfo.required && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber/10 text-amber border border-amber/20">
                                          🎫 Tickets Recommended
                                        </span>
                                      )}

                                      <div>
                                        <p className="text-sm text-foreground-secondary">
                                          💡 {place.ticketInfo.bookingAdvice}
                                        </p>
                                        {place.ticketInfo.peakTime && (
                                          <p className="text-xs text-foreground-muted">
                                            <strong>Peak time:</strong> {place.ticketInfo.peakTime.join(", ")}
                                          </p>
                                        )}
                                        {place.ticketInfo.averageWaitTime && (
                                          <p className="text-xs text-foreground-muted">
                                            <strong>Wait time:</strong> {place.ticketInfo.averageWaitTime}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                </div>
                              )}
                            </ItemCard>
                          ))}
                        </ItemGrid>
                      </CategoryGroup>
                    ),
                  );
                })()}
              </TravelPlanSection>
            ) : isActivelyStreaming && <AttractionsLoading />}

            {/* Best Neighborhoods */}
            {livePlan?.neighborhoods ? (
              <TravelPlanSection rotation="left" glowColor="accent">
                <SectionHeader
                  icon={Home}
                  title="Perfect Base Camps"
                  emoji="🏡"
                  badgeColor="accent"
                />
                <ItemGrid columns={3}>
                  {livePlan?.neighborhoods.map((neighborhood, index) => (
                    <ItemCard
                      key={index}
                      title={neighborhood.name}
                      subtitle={neighborhood.vibe}
                      description={neighborhood.summary}
                    >
                      <div className="mt-4">
                        <p className="italic mb-2 text-sm">
                          Best for: {neighborhood.bestFor.slice(9)}
                        </p>
                        <p className="inline-block bg-success/10 border border-success/20 rounded-lg p-1 font-medium text-sm text-success mt-4 mb-2">Pros</p>
                        <ul className="text-foreground/80">
                          {neighborhood.pros.map((pro, idx) => (
                            <li className="mr-2 text-sm" key={idx}>• {pro}</li>
                          ))}
                        </ul>
                        <p className="inline-block bg-error/10 border border-error/20 rounded-lg p-1 font-medium text-sm text-error mt-4 mb-2">Cons</p>
                        <ul className="text-foreground/80">
                          {neighborhood.cons.map((con, idx) => (
                            <li className="mr-2 text-sm" key={idx}>• {con}</li>
                          ))}
                        </ul>
                      </div>
                    </ItemCard>
                  ))}
                </ItemGrid>
              </TravelPlanSection>
            ) : isActivelyStreaming && <NeighborhoodsLoading />}

            {/* Hotel Recommendations */}
            {livePlan?.hotelRecommendations ? (
              <TravelPlanSection rotation="right" glowColor="secondary">
                <SectionHeader
                  icon={Home}
                  title="Great Places to Stay"
                  emoji="🛏️"
                  badgeColor="secondary"
                />
                {(() => {
                  // Group hotels by neighborhood
                  const hotelsByNeighborhood =
                    livePlan?.hotelRecommendations?.reduce(
                      (acc, hotel) => {
                        const neighborhood =
                          hotel.neighborhood || "Other Areas";
                        if (!acc[neighborhood]) {
                          acc[neighborhood] = [];
                        }
                        acc[neighborhood].push(hotel);
                        return acc;
                      },
                      {} as Record<string, NonNullable<typeof livePlan>['hotelRecommendations']>,
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
            ) : isActivelyStreaming && <HotelsLoading />}

            {/* Dining & Nightlife */}
            {(livePlan?.restaurants && livePlan?.bars) ? (
              <TravelPlanSection rotation="left" glowColor="primary">
                <SectionHeader
                  icon={Utensils}
                  title="Where to Eat & Drink"
                  emoji="🍴"
                  badgeColor="primary"
                />
                {(() => {
                  // Separate restaurants and bars with type indicators
                  const restaurants = (livePlan?.restaurants || []).map((restaurant) => ({
                    ...restaurant,
                    type: "restaurant" as const,
                    searchType: "restaurant",
                  }));

                  const bars = (livePlan?.bars || []).map((bar) => ({
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
                              <h5 className="mb-3 flex items-center">
                                <Utensils className="w-5 h-5 mr-2 text-accent" />
                                Restaurants
                              </h5>
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
                              <h5 className="mb-3 flex items-center">
                                <BeerIcon className="w-5 h-5 mr-2 text-secondary" />
                                Bars & Nightlife
                              </h5>
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
            ) : isActivelyStreaming && <DiningLoading />}

            {/* Local Specialties */}
            {livePlan?.mustTryFood?.items ? (
              <TravelPlanSection rotation="right" glowColor="accent">
                <SectionHeader
                  icon={Utensils}
                  title="Must-Try Local Flavors"
                  emoji="🤤"
                  badgeColor="accent"
                />
                {(() => {
                  // Group food items by category
                  const foodByCategory = (livePlan?.mustTryFood?.items || []).reduce(
                    (acc, item) => {
                      const category = item.category;
                      if (!acc[category]) {
                        acc[category] = [];
                      }
                      acc[category].push(item);
                      return acc;
                    },
                    {} as Record<string, NonNullable<NonNullable<typeof livePlan>['mustTryFood']>['items']>,
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
            ) : isActivelyStreaming && <LocalFoodLoading />}

            {/* Local Events */}
            {(livePlan?.localEvents && livePlan.localEvents.length > 0) ? (
              <TravelPlanSection rotation="left" glowColor="primary">
                <SectionHeader
                  icon={Calendar}
                  title="Local Festivities"
                  emoji="🎪"
                  badgeColor="primary"
                />
                <ItemGrid columns={3}>
                  {livePlan?.localEvents.map((event, index) => (
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
            ) : isActivelyStreaming && <LocalEventsLoading />}

            {/* Activities & Experiences */}
            {livePlan?.activities ? (
              <TravelPlanSection rotation="right" glowColor="accent">
                <SectionHeader
                  icon={Compass}
                  title="Cool Local Experiences"
                  emoji="⚡"
                  badgeColor="accent"
                />
                <ItemGrid columns={2}>
                  {livePlan?.activities.map((activity, index) => {
                    const tags = [];
                    if (activity.localSpecific) tags.push("Local Specialty");
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
            ) : isActivelyStreaming && <ActivitiesLoading />}


          </div>
        )}

        {activeTab === "practical" && (
          <div className="space-y-12">
            {/* Streaming progress indicator for practical tab */}
            {isActivelyStreaming && getTabLoadingState('practical').isLoading && (
              <div className="text-center mb-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full">
                  <Loader2 className="w-4 h-4 animate-spin text-accent" />
                  <span className="text-sm font-medium text-accent">
                    Compiling practical travel guide...
                  </span>
                </div>
              </div>
            )}

            {/* Getting Around */}
            {livePlan?.transportationInfo ? (
              <TravelPlanSection rotation="left" glowColor="primary">
                <SectionHeader
                  icon={Compass}
                  title="Getting Around"
                  emoji="🚌"
                  badgeColor="primary"
                />

                {/* City Transportation - 2-column layout */}
                <ContentGrid columns={2} className="mb-8">
                  <ContentCard title="Public Transport" icon="🚇">
                    <p className="text-foreground-secondary mb-3">
                      {livePlan?.transportationInfo.publicTransport}
                    </p>
                    <div className="flex items-center">
                      <span className="text-sm text-foreground-secondary mr-2">
                        💳 Credit cards:
                      </span>
                      <span
                        className={`text-sm font-medium px-2 py-1 rounded-full ${livePlan?.transportationInfo.creditCardPayment
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                          }`}
                      >
                        {livePlan?.transportationInfo.creditCardPayment
                          ? "Accepted"
                          : "Not accepted"}
                      </span>
                    </div>
                  </ContentCard>

                  <ContentCard title="Taxis & Rideshare" icon="🚕">
                    <p className="text-foreground-secondary mb-3">
                      {livePlan?.transportationInfo.ridesharing}
                    </p>
                    <div className="flex items-center mb-3">
                      <span className="text-sm text-foreground-secondary mr-2">
                        💰 Average cost:
                      </span>
                      <span className="text-sm font-bold text-primary">
                        {livePlan?.transportationInfo.taxiInfo?.averageCost}
                      </span>
                    </div>
                    {livePlan?.transportationInfo.taxiInfo?.tips && (
                      <div>
                        <div className="flex items-center mb-2">
                          {/* <span className="text-sm mr-2">💡</span> */}
                          <span className="text-sm font-medium text-foreground-secondary">
                            💡 Pro Tips:
                          </span>
                        </div>
                        <ul className="space-y-1">
                          {livePlan?.transportationInfo.taxiInfo.tips.map(
                            (tip, index) => (
                              <li
                                key={index}
                                className="flex items-start text-sm"
                              >
                                <span className="text-primary mr-2">
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

                {/* Airport Transportation - Full width dedicated section */}

                <div className="border-t border-border/30 pt-8">
                  <div className="flex items-center mb-6">
                    <h6>
                      ✈️ Airport Transportation
                    </h6>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {livePlan?.transportationInfo.airportTransport?.airports?.map(
                      (airport, airportIndex) => (
                        <div
                          key={airportIndex}
                          className="bg-gradient-to-br from-background/80 to-background-card/70 backdrop-blur-sm border-2 border-border/30 hover:border-primary/40 rounded-2xl p-6 shadow-card hover:shadow-adventure-float transition-all duration-300"
                        >
                          <div className="mb-6">
                            <div className="flex items-center mb-2">
                              <h6 className="font-medium text-foreground">
                                {airport.name}
                              </h6>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="bg-primary/20 text-primary text-sm font-bold px-3 py-1 rounded-full">
                                {airport.code}
                              </span>
                              <span className="text-foreground-secondary text-sm">
                                📍 {airport.distanceToCity}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {airport.transportOptions?.map(
                              (option, optionIndex) => (
                                <div
                                  key={optionIndex}
                                  className="bg-gradient-to-r from-background/60 to-background-card/50 backdrop-blur-sm border border-border/30 rounded-xl px-4 py-2"
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <p className="font-bold text-foreground">
                                      {option.type}
                                    </p>
                                    <div className="text-right">
                                      <div className="font-semibold text-primary text-xs">
                                        {option.cost}
                                      </div>
                                      <div className="text-xs text-foreground-muted">
                                        ⏱️ {option.duration}
                                      </div>
                                    </div>
                                  </div>

                                  <p>
                                    {option.description}
                                  </p>

                                  {option.notes && option.notes.length > 0 && (
                                    <div className="flex items-start bg-accent/10 border border-accent/20 rounded-lg p-2 mt-2">
                                      <div className="flex items-center">
                                        <span className="text-sm mr-2">💡</span>
                                      </div>
                                      <ul className="space-y-1">
                                        {option.notes.map((note, noteIndex) => (
                                          <li
                                            key={noteIndex}
                                            className="flex items-start"
                                          >
                                            <span className="text-accent mr-2 text-xs">
                                              •
                                            </span>
                                            <span className="text-sm">
                                              {note}
                                            </span>
                                          </li>
                                        ))}
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
            ) : isActivelyStreaming && <TransportationLoading />}

            {/* Weather Information */}
            {livePlan?.weatherInfo ? (
              <TravelPlanSection rotation="right" glowColor="secondary">
                <SectionHeader
                  icon={Calendar}
                  title="Weather Info"
                  emoji="☀️"
                  badgeColor="secondary"
                />

                <ContentGrid columns={2}>
                  <ContentCard
                    title="Current Conditions"
                    icon="🌡️"
                  >
                    <p className="font-medium text-primary mb-2">
                      {livePlan?.weatherInfo.temperature} •{" "}
                      {livePlan?.weatherInfo.conditions}
                    </p>
                    <p className="text-foreground-secondary mb-1">
                      Humidity: {livePlan?.weatherInfo.humidity}
                    </p>
                    <p className="text-foreground-secondary">
                      Day/Night Temp Difference: {livePlan?.weatherInfo.dayNightTempDifference}
                    </p>
                  </ContentCard>
                  <ContentCard
                    title="What to Pack:"
                    icon="🎒"
                  >
                    <ul className="space-y-2">
                      {livePlan?.weatherInfo.recommendations?.map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-primary mr-2">•</span>
                          <p className="text-foreground-secondary">{rec}</p>
                        </li>
                      ))}
                    </ul>
                  </ContentCard>
                </ContentGrid>
              </TravelPlanSection>
            ) : isActivelyStreaming && <WeatherLoading />}

            {/* Safety & Cultural Tips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Safety Tips */}
              {livePlan?.safetyTips ? (
                <TravelPlanSection rotation="left" glowColor="primary">
                  <SectionHeader
                    icon={Shield}
                    title="Safety Tips"
                    emoji="⚠️"
                    badgeColor="primary"
                  />

                  <ul className="space-y-1">
                    {livePlan?.safetyTips.map((tip, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-secondary mr-2">
                          •
                        </span>
                        <p className="text-foreground-secondary">{tip}</p>
                      </li>
                    ))}
                  </ul>
                </TravelPlanSection>
              ) : isActivelyStreaming && <SafetyTipsLoading />}

              {/* Cultural Quest Guide */}
              {livePlan?.socialEtiquette ? (
                <TravelPlanSection rotation="left" glowColor="primary">
                  <SectionHeader
                    icon={BookOpen}
                    title="Cultural Insights"
                    emoji="🏹"
                    badgeColor="primary"
                  />
                  <ul className="space-y-1">
                    {(livePlan?.socialEtiquette || []).map((tip, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <p className="text-foreground-secondary">{tip}</p>
                      </li>
                    ))}
                  </ul>
                </TravelPlanSection>
              ) : isActivelyStreaming && <CulturalInsightsLoading />}
            </div>

            {/* Currency & Payments */}
            {livePlan?.localCurrency ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Local Currency */}
                <TravelPlanSection>
                  <SectionHeader
                    icon={CreditCard}
                    title="Payment Guide"
                    emoji="💰"
                    badgeColor="primary"
                  />
                  <p>
                    The local currency is{" "}
                    <span className="font-semibold">
                      {livePlan?.localCurrency.currency}
                    </span>
                    .
                    {livePlan?.localCurrency.cashNeeded
                      ? " Cash is recommended for some purchases."
                      : " Credit cards are widely accepted."}
                  </p>
                  {livePlan?.localCurrency.exchangeRate && (
                    <div className="mt-3 mb-2rounded-lg">
                      <h6 className="mb-2">Current Exchange Rate</h6>
                      <p>
                        1 {livePlan?.localCurrency.exchangeRate.from} ={" "}
                        {livePlan?.localCurrency.exchangeRate.rate}{" "}
                        {livePlan?.localCurrency.exchangeRate.to}
                      </p>
                    </div>
                  )}
                  {livePlan?.localCurrency.tips &&
                    livePlan?.localCurrency.tips.length > 0 && (
                      <div className="mt-4">
                        <h6 className="mb-2">Money Tips:</h6>
                        <ul className="space-y-1">
                          <li className="flex items-start">
                            <p className="text-accent mr-2">•</p>
                            <p>Credit card usage</p>
                          </li>
                          <span className="text-sm ml-4">
                            {livePlan?.localCurrency.creditCardUsage}
                          </span>
                          {livePlan?.localCurrency.tips.map((tip, index) => (
                            <li key={index} className="flex items-start">
                              <p className="text-accent mr-2">•</p>
                              <p>{tip}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </TravelPlanSection>

                {/* Tipping Etiquette */}
                {livePlan?.tipEtiquette && (
                  <TravelPlanSection>
                    <SectionHeader
                      icon={CreditCard}
                      title="Tipping Etiquette"
                      emoji="💰"
                      badgeColor="primary"
                    />
                    <div className="space-y-3">
                      {Object.entries(livePlan?.tipEtiquette).map(
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
            ) : isActivelyStreaming && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PaymentGuideLoading />
                <TippingEtiquetteLoading />
              </div>
            )}

            {/* Drinking Water */}
            {livePlan?.tapWaterSafe ? (
              <TravelPlanSection rotation="left" glowColor="primary">
                <SectionHeader
                  icon={Droplets}
                  title="Drinking Water"
                  emoji="💧"
                  badgeColor="primary"
                />
                <div className="flex items-start">
                  <span
                    className={`mr-2 ${livePlan?.tapWaterSafe.safe ? "animate-bounce-subtle" : "animate-pulse-slow"}`}
                  >
                    {livePlan?.tapWaterSafe.safe ? "✅" : "⚠️"}
                  </span>
                  <div>
                    <p
                      className={`${livePlan?.tapWaterSafe.safe ? "text-green-600" : "text-amber-600"}`}
                    >
                      {livePlan?.tapWaterSafe.safe
                        ? "Tap water is safe to drink!"
                        : "Tap water is not recommended for drinking."}
                    </p>
                  </div>
                </div>
              </TravelPlanSection>
            ) : isActivelyStreaming && <DrinkingWaterLoading />}

            {/* Local History */}
            {livePlan?.history ? (
              <TravelPlanSection rotation="right" glowColor="secondary">
                <SectionHeader
                  icon={BookOpen}
                  title="Local History"
                  emoji="🏰"
                  badgeColor="secondary"
                />

                <p className="text-foreground-secondary leading-relaxed">
                  {livePlan?.history}
                </p>
              </TravelPlanSection>
            ) : isActivelyStreaming && <LocalHistoryLoading />}
          </div>
        )}
      </motion.div>

      {/* KML Export Loading Overlay */}
      <KMLExportLoading isVisible={isExportingKML} />

      {/* Back/Edit Button - Bottom Right */}
      {onBack && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.4,
            delay: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          onClick={onBack}
          className="fixed bottom-18 right-6 btn-3d-primary z-50 flex items-center p-2"
          aria-label="Go back to edit plan"
        >
          <Edit className="w-4 h-4" />
        </motion.button>
      )}
    </motion.div>
  );
}
