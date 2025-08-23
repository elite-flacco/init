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
  MoreVertical,
  Menu,
  X,
} from "lucide-react";
import { getActivityIcon } from "../utils/iconMappingUtils";
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
import { MapIcon3D, MapPinIcon3D, NotebookIcon3D, CalendarIcon3D, UtensilsIcon3D, CameraIcon3D } from "./ui/Icon3D";

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
    "itinerary" | "info" | "food" | "practical"
  >("info");
  const [isExportingKML, setIsExportingKML] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [, setShareUrl] = useState<string | null>(null);
  const [showMobileActions, setShowMobileActions] = useState(false);
  const mobileActionsRef = useRef<HTMLDivElement>(null);

  // Initialize streaming hooks
  const { state: parallelState, generatePlan } = useParallelTripPlanning();
  const { state: streamingState, generateStreamingPlan } = useStreamingTripPlanning();

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
  const getTabLoadingState = (tab: 'itinerary' | 'info' | 'food' | 'practical') => {
    if (!isActivelyStreaming) return { isLoading: false, hasContent: !!livePlan };

    if (!activeStreamingState?.chunks) return { isLoading: true, hasContent: false };

    // Map tabs to their required chunks
    const tabChunkMap = {
      itinerary: [4], // Cultural chunk has activities and itinerary
      info: [1],      // Places and neighborhoods only
      food: [2],      // Dining, bars, and local food
      practical: [3]  // Practical chunk
    };

    const requiredChunks = tabChunkMap[tab];
    const completedChunks = requiredChunks.filter(chunkId =>
      activeStreamingState.chunks[chunkId]?.finalData
    );

    const result = {
      isLoading: completedChunks.length < requiredChunks.length,
      hasContent: completedChunks.length > 0
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
    if (!livePlan) {
      alert("Please wait for your travel plan to finish loading before exporting to PDF.");
      return;
    }

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
    if (!livePlan) {
      alert("Please wait for your travel plan to finish loading before exporting to Maps.");
      return;
    }

    setIsExportingKML(true);

    // Track KML export
    trackTravelEvent.exportPlan('kml');

    try {
      // Create plan object with destination info for KML service
      const planWithDestination = {
        ...livePlan,
        destination: destination
      };

      // First try with real coordinates, but with a shorter timeout
      try {
        await KMLExportService.downloadKML(planWithDestination, undefined, {
          useRealCoordinates: true,
        });
      } catch {
        // Fallback to approximate coordinates if geocoding fails
        await KMLExportService.downloadKML(planWithDestination, undefined, {
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
    if (!livePlan) {
      alert("Please wait for your plan to finish loading before sharing.");
      return;
    }

    setIsSharing(true);

    // Track share attempt
    trackTravelEvent.sharePlan('url');

    try {
      // Construct the AI response object from live data
      const shareableAiResponse = aiResponse || {
        plan: livePlan,
        streamingState: activeStreamingState,
        streamingHooks: null,
      };

      const requestPayload = {
        destination,
        travelerType,
        aiResponse: shareableAiResponse,
      };
      const response = await fetch("/api/shared-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        let errorText;
        try {
          errorText = await response.text();
        } catch (parseError) {
          errorText = 'Unknown error response';
        }
        throw new Error(`Failed to create shared plan - Status: ${response.status}, Body: ${errorText}`);
      }

      const responseData = await response.json();

      const { shareUrl: newShareUrl } = responseData;
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

      alert(`Couldn't create the share link. Error: ${error instanceof Error ? error.message : String(error)}`);

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

    return getActivityIcon(iconName, "xs", getAnimationFromIconName(iconName) as "bounce" | "pulse" | "spin" | "float" | "none");
  };

  // Render a single activity
  const renderActivity = (activity: Activity, index: number) => (
    <div key={index} className="relative group">
      <div className="transform hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300">
        <div className="bg-gradient-to-br from-background/80 to-background-card/70 backdrop-blur-sm border-2 border-border/30 hover:border-primary/40 rounded-2xl p-6 shadow-card hover:shadow-adventure-float transition-all duration-300 relative overflow-hidden">
          {/* Activity Highlight */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-2xl"></div>
          <div className="flex flex-col md:flex-row items-start relative z-10">
            {/* Time Badge */}
            <div className="flex-shrink-0 mr-4 mb-4">
              <div className="inline-flex items-center justify-start bg-primary/20 text-primary px-3 py-2 rounded-full font-bold text-xs sm:text-sm transform -rotate-1 group-hover:rotate-0 transition-transform duration-300">
                {activity.time}
              </div>
            </div>

            {/* Activity Content */}
            <div className="flex-1">
              <div className="flex items-start">
                <div className="hidden md:block flex-shrink-0 mr-3">
                  {activity.icon ? (
                    getIconComponent(activity.icon)
                  ) : (
                    <Compass className="w-6 h-6 text-primary" />
                  )}
                </div>
                <div className="">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold group-hover:text-primary transition-colors duration-300">
                    {activity.title}
                  </h3>
                  {activity.location && (
                    <div className="flex items-center text-sm mb-3">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span className="font-medium text-xs">{activity.location}</span>
                    </div>
                  )}
                  {activity.description && (
                    <div className="mt-4">
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
      </div>
    </div>
  );

  // Render a single day's itinerary
  const renderDayItinerary = (day: ItineraryDay) => (
    <div key={day.day} className="mb-2 md:mb-6 relative">
      {/* Daily Itinerary Card */}
      <div className="transform hover:-rotate-1 transition-transform duration-500">
        <div className="bg-gradient-to-br from-background/95 to-background-card/90 backdrop-blur-xl border-2 border-border/40 hover:border-primary/50 rounded-3xl p-8 lg:p-10 shadow-card hover:shadow-adventure-float transition-all duration-500 relative overflow-hidden">
          {/* Card Highlight */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 rounded-3xl blur-xl opacity-0 hover:opacity-100 transition-all duration-700 -z-10"></div>

          {/* Day Header */}
          <div className="flex items-center mb-4 sm:mb-6 md:mb-8">
            <div className="inline-flex items-center bg-primary/20 text-primary px-2 py-1 sm:px-4 sm:py-2 md:px-6 md:py-3 rounded-full font-bold text-sm md:text-base lg:text-lg mr-4 transform -rotate-2 hover:rotate-0 transition-transform duration-300">
              <CalendarIcon3D size="xs" />
              {day.title}
            </div>
          </div>

          {/* Daily Activities */}
          <div className="space-y-4 sm:m-4 md:m-6">
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
    <div className="min-h-screen">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto">
          {/* Desktop Single Line Layout */}
          <div className="hidden lg:flex items-center justify-between h-16">
            {/* Left: Destination Info */}
            <div className="flex items-center space-x-4 flex-shrink-0">
              <Sparkles className="w-6 h-6 text-primary" />
              <div>
                <h3 className="">{destination.name}</h3>
              </div>
            </div>

            {/* Center: Navigation */}
            <nav className="flex items-center space-x-2 flex-1 justify-center max-w-5xl">
              {["itinerary", "info", "food", "practical"].map((tab) => {
                const tabDataMap = {
                  itinerary: { label: "Itinerary", icon: <MapPinIcon3D size="xs" /> },
                  info: { label: "What to See & Do", icon: <CameraIcon3D size="xs" /> },
                  food: { label: "What to Eat", icon: <UtensilsIcon3D size="xs" /> },
                  practical: { label: "Practical Info", icon: <NotebookIcon3D size="xs" /> },
                } as const;
                const tabData = tabDataMap[tab as keyof typeof tabDataMap];

                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`flex items-center space-x-0 px-4 py-1 rounded-xl text-sm font-medium transition-all duration-300 ${activeTab === tab
                      ? 'btn-3d-gradient !text-white [&>*]:!text-white rotate-1'
                      : 'text-foreground-secondary hover:text-primary hover:bg-primary/10 hover:transform hover:-rotate-1'
                      }`}
                  >
                    <span className="w-8 h-12">{tabData.icon}</span>
                    <p className="hidden xl:inline font-bold -ml-6">{tabData.label}</p>
                    {getTabLoadingState(tab as any).isLoading && (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right: Hamburger Menu */}
            <div className="relative flex-shrink-0" ref={mobileActionsRef}>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowMobileActions(!showMobileActions);
                }}
                className="btn-3d-outline p-2 flex items-center space-x-2"
                title="Actions"
              >
                {showMobileActions ? (
                  <X className="w-4 h-4" />
                ) : (
                  <MoreVertical className="w-4 h-4" />
                )}              </button>

              {showMobileActions && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-border/50 py-2 z-50 pointer-events-auto">
                  <button
                    onPointerDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onRegeneratePlan();
                      setShowMobileActions(false);
                    }}
                    className="flex items-center justify-start px-4 py-2 text-sm text-left hover:bg-background-soft transition-colors pointer-events-auto"
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Regenerate Plan
                  </button>
                  <button
                    onPointerDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!livePlan) {
                        alert("Please wait for your travel plan to finish loading before exporting to PDF.");
                        return;
                      }
                      handleExportToPdf();
                      setShowMobileActions(false);
                    }}
                    disabled={!livePlan}
                    className="flex items-center justify-start w-full px-4 py-2 text-sm text-left hover:bg-background-soft transition-colors disabled:opacity-50 disabled:cursor-not-allowed pointer-events-auto"
                    style={{ pointerEvents: 'auto' }}
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Export to PDF
                  </button>
                  <button
                    onPointerDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!livePlan) {
                        alert("Please wait for your travel plan to finish loading before exporting to Maps.");
                        return;
                      }
                      handleExportToGoogleMaps();
                      setShowMobileActions(false);
                    }}
                    disabled={isExportingKML || !livePlan}
                    className="flex items-center justify-start w-full px-4 py-2 text-sm text-left hover:bg-background-soft transition-colors disabled:opacity-50 disabled:cursor-not-allowed pointer-events-auto"
                    style={{ pointerEvents: 'auto' }}
                  >
                    {isExportingKML ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-1" />
                    ) : (
                      <Download className="w-4 h-4 mr-1" />
                    )}
                    Export to Maps
                  </button>
                  <button
                    onPointerDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!livePlan) {
                        alert("Please wait for your plan to finish loading before sharing.");
                        return;
                      }
                      handleShare();
                      setShowMobileActions(false);
                    }}
                    disabled={isSharing || !livePlan}
                    className="flex items-center justify-start w-full px-4 py-2 text-sm text-left hover:bg-background-soft transition-colors disabled:opacity-50 disabled:cursor-not-allowed pointer-events-auto"
                    style={{ pointerEvents: 'auto' }}
                  >
                    {isSharing ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-foreground border-t-transparent mr-1"></div>
                    ) : (
                      <Share2 className="w-4 h-4 mr-1" />
                    )}
                    Share Plan
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile & Tablet Layout */}
          <div className="lg:hidden">
            {/* Mobile Header */}
            <div className="flex items-center justify-between h-12">
              {/* Left: Destination */}
              <div className="flex items-center space-x-3">
              </div>

              {/* Mobile Navigation Tabs */}
              <div>
                <div className="flex justify-center">
                  <div className="flex space-x-1rounded-full">
                    {["itinerary", "info", "food", "practical"].map((tab) => {
                      const tabDataMap = {
                        itinerary: { label: "Itinerary", icon: <MapPinIcon3D size="2xs" /> },
                        info: { label: "Places", icon: <CameraIcon3D size="2xs" /> },
                        food: { label: "Food", icon: <UtensilsIcon3D size="2xs" /> },
                        practical: { label: "Practical", icon: <NotebookIcon3D size="2xs" /> },
                      } as const;
                      const tabData = tabDataMap[tab as keyof typeof tabDataMap];

                      return (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab as any)}
                          className={`flex items-center space-x-0 p-1 text-xs font-medium rounded-full transition-all duration-300 ${activeTab === tab
                            ? 'btn-3d-secondary !text-white [&>*]:!text-white transform rotate-1'
                            : 'text-foreground-secondary hover:text-primary hover:bg-primary/10'
                            }`}
                        >
                          <span  className="w-6 h-8">{tabData.icon}</span>
                          {getTabLoadingState(tab as any).isLoading && (
                            <Loader2 className="w-2 h-2 animate-spin -ml-2" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right: Hamburger Menu */}
              <div className="relative" ref={mobileActionsRef}>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowMobileActions(!showMobileActions);
                  }}
                  className="btn-3d-outline p-2"
                  title="Menu"
                >
                  {showMobileActions ? (
                    <X className="w-3 h-3" />
                  ) : (
                    <Menu className="w-3 h-3" />
                  )}
                </button>

                {showMobileActions && (
                  <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-lg border border-border/50 py-2 z-50 pointer-events-auto">
                    <button
                      onPointerDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onRegeneratePlan();
                        setShowMobileActions(false);
                      }}
                      className="flex items-center justify-start w-full px-4 py-3 text-sm text-left hover:bg-background-soft transition-colors pointer-events-auto"
                    >
                      <RefreshCw className="w-4 h-4 mr-1 text-primary" />
                      <span>Regenerate Plan</span>
                    </button>
                    <hr className="border-border/30 mx-2" />
                    <button
                      onPointerDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!livePlan) {
                          alert("Please wait for your travel plan to finish loading before exporting to PDF.");
                          return;
                        }
                        handleExportToPdf();
                        setShowMobileActions(false);
                      }}
                      disabled={!livePlan}
                      className="flex items-center justify-start w-full px-4 py-3 text-sm text-left hover:bg-background-soft transition-colors disabled:opacity-50 disabled:cursor-not-allowed pointer-events-auto"
                    >
                      <FileText className="w-4 h-4 mr-1 text-secondary" />
                      <span>Export to PDF</span>
                    </button>
                    <button
                      onPointerDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!livePlan) {
                          alert("Please wait for your travel plan to finish loading before exporting to Maps.");
                          return;
                        }
                        handleExportToGoogleMaps();
                        setShowMobileActions(false);
                      }}
                      disabled={isExportingKML || !livePlan}
                      className="flex items-center justify-start w-full px-4 py-3 text-sm text-left hover:bg-background-soft transition-colors disabled:opacity-50 disabled:cursor-not-allowed pointer-events-auto"
                    >
                      {isExportingKML ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-1 text-accent" />
                      ) : (
                        <Download className="w-4 h-4 mr-1 text-accent" />
                      )}
                      <span>Export to Maps</span>
                    </button>
                    <button
                      onPointerDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!livePlan) {
                          alert("Please wait for your plan to finish loading before sharing.");
                          return;
                        }
                        handleShare();
                        setShowMobileActions(false);
                      }}
                      disabled={isSharing || !livePlan}
                      className="flex items-center justify-start w-full px-4 py-3 text-sm text-left hover:bg-background-soft transition-colors disabled:opacity-50 disabled:cursor-not-allowed pointer-events-auto"
                    >
                      {isSharing ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-foreground border-t-transparent mr-1"></div>
                      ) : (
                        <Share2 className="w-4 h-4 mr-1 text-primary" />
                      )}
                      <span>Share Plan</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-2 sm:py-4">
        <div className="pt-4">

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
                        <div className="text-center mb-8">
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
                          <h3 className="text-xl font-bold mb-2">
                            Adventure Map Loading...
                          </h3>
                          <p>
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
            <div className="space-y-8">
              {/* Streaming progress indicator for info tab */}
              {isActivelyStreaming && getTabLoadingState('info').isLoading && (
                <div className="text-center">
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
                                          <p className="text-sm">
                                            💡 {place.ticketInfo.bookingAdvice}
                                          </p>
                                          {place.ticketInfo.peakTime && (
                                            <p className="text-xs mt-2">
                                              <strong>Peak time:</strong> {place.ticketInfo.peakTime.join(", ")}
                                            </p>
                                          )}
                                          {place.ticketInfo.averageWaitTime && (
                                            <p className="text-xs">
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
              ) : isActivelyStreaming && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 bg-primary/20 text-primary rounded-full">
                        <span className="text-sm font-bold">🏛️ Must-See Spots</span>
                      </div>
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="space-y-3">
                        <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Best Neighborhoods */}
              {livePlan?.neighborhoods ? (
                <TravelPlanSection rotation="left" glowColor="accent">
                  <SectionHeader
                    icon={Home}
                    title="Perfect Base Camps"
                    emoji="🏡"
                    badgeColor="accent"
                  />
                  <ItemGrid columns={2}>
                    {livePlan?.neighborhoods.map((neighborhood, index) => (
                      <ItemCard
                        key={index}
                        title={neighborhood.name}
                        subtitle={neighborhood.vibe}
                        description={neighborhood.summary}
                      >
                        <div className="mt-2">
                          <p className="italic mb-4 text-sm">
                            <span className="font-bold text-sm text-primary">Best for:</span> {neighborhood.bestFor.slice(9)}
                          </p>
                          <div className="flex gap-4">
                            <div className="flex-1 flex flex-col items-start">
                              <p className="bg-success/10 border border-success/20 rounded-lg p-1 font-medium text-sm text-success mb-2">Pros</p>
                              <ul className="text-foreground/80">
                                {neighborhood.pros.map((pro, idx) => (
                                  <li className="mr-2 text-sm" key={idx}>• {pro}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="flex-1 flex flex-col items-start">
                              <p className="bg-error/10 border border-error/20 rounded-lg p-1 font-medium text-sm text-error mb-2">Cons</p>
                              <ul className="text-foreground/80">
                                {neighborhood.cons.map((con, idx) => (
                                  <li className="mr-2 text-sm" key={idx}>• {con}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </ItemCard>
                    ))}
                  </ItemGrid>
                </TravelPlanSection>
              ) : isActivelyStreaming && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 bg-accent/20 text-accent rounded-full">
                        <span className="text-sm font-bold">🏡 Perfect Base Camps</span>
                      </div>
                      <Loader2 className="w-4 h-4 animate-spin text-accent" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="space-y-3">
                        <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
              ) : isActivelyStreaming && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 bg-secondary/20 text-secondary rounded-full">
                        <span className="text-sm font-bold">🛏️ Great Places to Stay</span>
                      </div>
                      <Loader2 className="w-4 h-4 animate-spin text-secondary" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="space-y-3">
                        <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
              ) : isActivelyStreaming && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 bg-primary/20 text-primary rounded-full">
                        <span className="text-sm font-bold">🎪 Local Festivities</span>
                      </div>
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="space-y-3">
                        <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
              ) : isActivelyStreaming && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 bg-accent/20 text-accent rounded-full">
                        <span className="text-sm font-bold">⚡ Cool Local Experiences</span>
                      </div>
                      <Loader2 className="w-4 h-4 animate-spin text-accent" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="space-y-3">
                        <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Local History */}
              {livePlan?.history ? (
                <TravelPlanSection rotation="right" glowColor="secondary">
                  <SectionHeader
                    icon={BookOpen}
                    title="Local History"
                    emoji="🏰"
                    badgeColor="secondary"
                  />

                  <p className="leading-relaxed">
                    {livePlan?.history}
                  </p>
                </TravelPlanSection>
              ) : isActivelyStreaming && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 bg-secondary/20 text-secondary rounded-full">
                        <span className="text-sm font-bold">🏰 Local History</span>
                      </div>
                      <Loader2 className="w-4 h-4 animate-spin text-secondary" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-3 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "food" && (
            <div className="space-y-8">
              {/* Streaming progress indicator for food tab */}
              {isActivelyStreaming && getTabLoadingState('food').isLoading && (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full">
                    <Loader2 className="w-4 h-4 animate-spin text-accent" />
                    <span className="text-sm font-medium text-accent">
                      Discovering {destination.name}'s culinary scene...
                    </span>
                  </div>
                </div>
              )}

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
              ) : isActivelyStreaming && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 bg-primary/20 text-primary rounded-full">
                        <span className="text-sm font-bold">🍴 Where to Eat & Drink</span>
                      </div>
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    </div>
                  </div>
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
                </div>
              )}

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
              ) : isActivelyStreaming && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 bg-accent/20 text-accent rounded-full">
                        <span className="text-sm font-bold">🤤 Must-Try Local Flavors</span>
                      </div>
                      <Loader2 className="w-4 h-4 animate-spin text-accent" />
                    </div>
                  </div>
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
                </div>
              )}
            </div>
          )}

          {activeTab === "practical" && (
            <div className="space-y-8">
              {/* Streaming progress indicator for practical tab */}
              {isActivelyStreaming && getTabLoadingState('practical').isLoading && (
                <div className="text-center">
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
                      <p className="mb-3">
                        {livePlan?.transportationInfo.publicTransport}
                      </p>
                      <div className="flex items-center">
                        <span className="text-sm mr-2">
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
                      <p className="mb-3">
                        {livePlan?.transportationInfo.ridesharing}
                      </p>
                      <div className="flex flex-col justify-start items-start mb-3">
                        <p className="font-bold mb-2">
                          💰 Taxi Average cost
                        </p>
                        <span className="text-sm text-primary">
                          {livePlan?.transportationInfo.taxiInfo?.averageCost}
                        </span>
                      </div>
                      {livePlan?.transportationInfo.taxiInfo?.tips && (
                        <div>
                          <div className="flex items-center mb-2">
                            {/* <span className="text-sm mr-2">💡</span> */}
                            <p className="font-bold">
                              💡 Pro Tips
                            </p>
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
                                  <span>
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
                                <h6 className="font-medium">
                                  {airport.name}
                                </h6>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="bg-primary/20 text-primary text-sm font-bold px-3 py-1 rounded-full">
                                  {airport.code}
                                </span>
                                <span className="text-sm">
                                  📍 {airport.distanceToCity}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2 sm:space-y-4">
                              {airport.transportOptions?.map(
                                (option, optionIndex) => (
                                  <div
                                    key={optionIndex}
                                    className="bg-gradient-to-r from-background/60 to-background-card/50 backdrop-blur-sm border border-border/60 rounded-xl px-4 py-2 sm:py-4"
                                  >
                                    <div className="flex flex-col justify-start items-start">
                                      <p className="font-bold mb-2">
                                        {option.type}
                                      </p>
                                      <div className="">
                                        <div className="font-semibold text-primary text-xs mb-1">
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
              ) : isActivelyStreaming && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 bg-primary/20 text-primary rounded-full">
                        <span className="text-sm font-bold">🚌 Getting Around</span>
                      </div>
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2].map(i => (
                      <div key={i} className="space-y-3">
                        <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                      title="Weather Conditions"
                      icon="🌡️"
                    >
                      <p className="font-bold">Temperature</p>
                      <p className="mb-4">
                        {livePlan?.weatherInfo.temperature}
                      </p>
                      <p className="font-bold">Conditions</p>
                      <p className="mb-4">
                        {livePlan?.weatherInfo.conditions}
                      </p>
                      <p className="font-bold">Humidity</p>
                      <p className="mb-4">
                        {livePlan?.weatherInfo.humidity}
                      </p>
                      <p className="font-bold">Day/Night Temp Difference</p>
                      <p className="mb-4">
                        {livePlan?.weatherInfo.dayNightTempDifference}
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
                            <p>{rec}</p>
                          </li>
                        ))}
                      </ul>
                    </ContentCard>
                  </ContentGrid>
                </TravelPlanSection>
              ) : isActivelyStreaming && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 bg-secondary/20 text-secondary rounded-full">
                        <span className="text-sm font-bold">☀️ Weather Info</span>
                      </div>
                      <Loader2 className="w-4 h-4 animate-spin text-secondary" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2].map(i => (
                      <div key={i} className="space-y-3">
                        <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                          <p>{tip}</p>
                        </li>
                      ))}
                    </ul>
                  </TravelPlanSection>
                ) : isActivelyStreaming && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="px-3 py-1 bg-primary/20 text-primary rounded-full">
                          <span className="text-sm font-bold">⚠️ Safety Tips</span>
                        </div>
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-3 bg-gray-200 rounded animate-pulse"></div>
                      ))}
                    </div>
                  </div>
                )}

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
                          <p>{tip}</p>
                        </li>
                      ))}
                    </ul>
                  </TravelPlanSection>
                ) : isActivelyStreaming && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="px-3 py-1 bg-primary/20 text-primary rounded-full">
                          <span className="text-sm font-bold">🏹 Cultural Insights</span>
                        </div>
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-3 bg-gray-200 rounded animate-pulse"></div>
                      ))}
                    </div>
                  </div>
                )}
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
                        <p className="font-bold mb-2">Current Exchange Rate</p>
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
                          <p className="font-bold mb-2">Money Tips</p>
                          <ul className="space-y-1">
                            <li className="flex items-start">
                              <p className="text-accent mr-2">•</p>
                              <p>Credit card usage</p>
                            </li>
                            <span className="text-sm ml-4 leading-[1rem]">
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
                              <p className="font-bold">
                                {category.charAt(0).toUpperCase() +
                                  category.slice(1)}
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
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="px-3 py-1 bg-primary/20 text-primary rounded-full">
                          <span className="text-sm font-bold">💰 Payment Guide</span>
                        </div>
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[1, 2].map(i => (
                        <div key={i} className="h-3 bg-gray-200 rounded animate-pulse"></div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="px-3 py-1 bg-primary/20 text-primary rounded-full">
                          <span className="text-sm font-bold">💰 Tipping Etiquette</span>
                        </div>
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[1, 2].map(i => (
                        <div key={i} className="h-3 bg-gray-200 rounded animate-pulse"></div>
                      ))}
                    </div>
                  </div>
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
              ) : isActivelyStreaming && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 bg-primary/20 text-primary rounded-full">
                        <span className="text-sm font-bold">💧 Drinking Water</span>
                      </div>
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[1, 2].map(i => (
                      <div key={i} className="h-3 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </main>

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
          className="fixed bottom-12 sm:bottom-18 right-2 sm:right-6 btn-3d-primary z-50 flex items-center p-2"
          aria-label="Go back to edit plan"
        >
          <Edit className="w-4 h-4" />
        </motion.button>
      )}
    </div>
  );
}
