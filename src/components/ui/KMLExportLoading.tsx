import React from "react";
import { GlobeIcon3D, MapIcon3D,  TravelIcon3D, MapPinIcon3D } from "./Icon3D";
import { BaseLoading, LoadingStage } from "./BaseLoading";

interface KMLExportLoadingProps {
  isVisible: boolean;
}

const loadingStages: LoadingStage[] = [
  {
    icon: GlobeIcon3D,
    message: "🗺️ Creating your map...",
    detail: "Setting up the map structure and framework",
  },
  {
    icon: MapPinIcon3D,
    message: "✨ Getting locations ready...",
    detail: "Preparing your travel destinations",
  },
  {
    icon: TravelIcon3D,
    message: "📍 Finding exact coordinates...",
    detail: "Locating precise GPS coordinates",
  },
  {
    icon: MapPinIcon3D,
    message: "🧳 Packing your digital itinerary...",
    detail: "Organizing your travel information",
  },
  {
    icon: MapIcon3D,
    message: "🌍 Geocoding destinations...",
    detail: "Converting addresses to map coordinates",
  },
  {
    icon: TravelIcon3D,
    message: "🗺️ Building your personalized map...",
    detail: "Creating your custom travel map",
  },
  {
    icon: MapPinIcon3D,
    message: "📱 Preparing for Google Maps...",
    detail: "Formatting for Google Maps compatibility",
  },
  {
    icon: TravelIcon3D,
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
        centralIcon={MapIcon3D}
        footerMessage="This will take a few minutes. Go grab a coffee while we geocode your destinations..."
        ariaLabel="Exporting travel plan to KML format"
        showStageIndicators={false}
        showOrbitingIcon={true}
        showProgressDots={true}
      />
    </div>
  );
}
