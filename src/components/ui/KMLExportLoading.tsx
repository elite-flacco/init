import React from "react";
import { MapPin, Plane, Compass } from "lucide-react";
import { BaseLoading, LoadingStage } from "./BaseLoading";

interface KMLExportLoadingProps {
  isVisible: boolean;
}

const loadingStages: LoadingStage[] = [
  {
    icon: Compass,
    message: "🗺️ Creating your map...",
    detail: "Setting up the map structure and framework",
  },
  {
    icon: MapPin,
    message: "✨ Getting locations ready...",
    detail: "Preparing your travel destinations",
  },
  {
    icon: Plane,
    message: "📍 Finding exact coordinates...",
    detail: "Locating precise GPS coordinates",
  },
  {
    icon: MapPin,
    message: "🧳 Packing your digital itinerary...",
    detail: "Organizing your travel information",
  },
  {
    icon: Compass,
    message: "🌍 Geocoding destinations...",
    detail: "Converting addresses to map coordinates",
  },
  {
    icon: Plane,
    message: "🗺️ Building your personalized map...",
    detail: "Creating your custom travel map",
  },
  {
    icon: MapPin,
    message: "📱 Preparing for Google Maps...",
    detail: "Formatting for Google Maps compatibility",
  },
  {
    icon: Compass,
    message: "🚀 Almost ready!",
    detail: "Finalizing your KML export",
  },
];

export function KMLExportLoading({ isVisible }: KMLExportLoadingProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <BaseLoading
        isVisible={isVisible}
        stages={loadingStages}
        title="Preparing Your Map"
        maxProgress={95}
        stageInterval={2000}
        progressInterval={800}
        progressIncrement={() => Math.random() * 15}
        centralIcon={Compass}
        footerMessage="This may take a moment while we geocode your destinations..."
        ariaLabel="Exporting travel plan to KML format"
        showStageIndicators={false}
        showOrbitingIcon={true}
      />
    </div>
  );
}
