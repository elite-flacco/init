import React from "react";
import {
  TravelIcon3D,
  GlobeIcon3D,
  SuitcaseIcon3D,
  MapIcon3D,
  NotebookIcon3D,
  CameraIcon3D,
  PassportIcon3D,
  SunglassesIcon3D,
  HelicopterIcon3D,
  PalmTreeIcon3D,
  BrainIcon3D,
  SpreadSheetIcon3D,
  MapPinIcon3D,
  CoffeeIcon3D,
  UtensilsIcon3D,
  HotelIcon3D,
} from "../components/ui/Icon3D";

// Icon mapping for different activity types
export function getActivityIcon(
  iconName: string, 
  size: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" = "sm",
  animation: "float" | "pulse" | "bounce" | "spin" | "none" = "none"
) {
  const iconProps = { size, animation, className: "transition-all duration-300" };

  switch (iconName.toLowerCase()) {
    case "coffee":
    case "cafe":
    case "drink":
    case "chill":
      return <CoffeeIcon3D {...iconProps} />;
      
    case "hotel":
    case "accommodation":
    case "lodging":
      return <HotelIcon3D {...iconProps} />;
      
    case "map":
    case "navigation":
    case "directions":
      return <MapIcon3D {...iconProps} />;
      
    case "utensils":
    case "food":
    case "restaurant":
    case "dining":
      return <UtensilsIcon3D {...iconProps} />;
      
    case "compass":
    case "explore":
    case "discovery":
      return <CameraIcon3D {...iconProps} />;
      
    case "camera":
    case "photo":
    case "memory":
    case "sightseeing":
      return <CameraIcon3D {...iconProps} />;
      
    case "travel":
    case "flight":
    case "plane":
      return <TravelIcon3D {...iconProps} />;
      
    case "luggage":
    case "suitcase":
    case "packing":
      return <SuitcaseIcon3D {...iconProps} />;
      
    case "planning":
    case "itinerary":
    case "schedule":
      return <NotebookIcon3D {...iconProps} />;
      
    case "adventure":
    case "extreme":
    case "helicopter":
      return <HelicopterIcon3D {...iconProps} />;
      
    default:
      return <CameraIcon3D {...iconProps} />;
  }
}

// Traveler type icon mapping
export function getTravelerTypeIcon(
  travelerTypeId: string,
  size: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" = "xl"
) {
  const iconProps = { size, className: "object-contain" };

  switch (travelerTypeId) {
    case "explorer":
      return <HelicopterIcon3D {...iconProps} />;
    case "type-a":
      return <SpreadSheetIcon3D {...iconProps} />;
    case "overthinker":
      return <BrainIcon3D {...iconProps} />;
    case "chill":
      return <PalmTreeIcon3D {...iconProps} />;
    default:
      return <TravelIcon3D {...iconProps} />;
  }
}

export function getDestinationKnowledgeIcon(
  destinationKnowledgeId: string,
  size: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" = "sm"
) {
  const iconProps = { size, className: "object-contain" };

  switch (destinationKnowledgeId) {
    case "yes":
      return <MapPinIcon3D {...iconProps} />;
    case "country":
      return <MapIcon3D {...iconProps} />;
    case "no-clue":
      return <GlobeIcon3D {...iconProps} />;
    default:
      return <TravelIcon3D {...iconProps} />;
  }
}

// Progress step icon mapping
export function getProgressStepIcon(
  stepId: string,
  size: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" = "sm"
) {
  const iconProps = { size };

  switch (stepId) {
    case "traveler-type":
      return <SuitcaseIcon3D {...iconProps} />;
    case "destination":
      return <GlobeIcon3D {...iconProps} />;
    case "planning":
      return <NotebookIcon3D {...iconProps} />;
    case "plan":
      return <MapIcon3D {...iconProps} />;
    default:
      return <TravelIcon3D {...iconProps} />;
  }
}

// Hero icons composition
export function HeroIconsComposition() {
  return (
    <div className="relative w-full mx-auto h-72 sm:h-48 md:h-64 lg:h-80 flex items-center justify-center overflow-visible">
      {/* Center focal point */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
        <GlobeIcon3D size="xl" animation="pulse" animationDelay="0.5s" />
      </div>
      
      {/* Top row - spread across full width with better spacing */}
      <div className="absolute top-1 left-2 transform translate-y-1/4">
        <TravelIcon3D size="3xl" animation="float" animationDelay="0s" />
      </div>
      <div className="absolute top-4 left-1/3 transform -translate-x-1/4">
        <NotebookIcon3D size="lg" animation="float" animationDelay="1s" />
      </div>
      <div className="absolute top-1/4 right-1/3 transform translate-x-1/2 translate-y-1/8">
        <HelicopterIcon3D size="3xl" animation="float" animationDelay="2s" />
      </div>
      <div className="absolute top-6 right-2">
        <PalmTreeIcon3D size="xl" animation="float" animationDelay="2s" />
      </div>
      
      {/* Middle row - far left and right with more spacing from center */}
      <div className="absolute top-1/2 left-0 transform -translate-y-1/2">
        <SuitcaseIcon3D size="xl" animation="float" animationDelay="1s" />
      </div>
      <div className="absolute top-1/2 right-0 transform -translate-y-1/2">
        <CameraIcon3D size="2xl" animation="float" animationDelay="2s" />
      </div>
      
      {/* Bottom row - spread across full width with clear spacing */}
      <div className="absolute bottom-2 left-12">
        <SunglassesIcon3D size="xl" animation="float" animationDelay="4s" />
      </div>
      <div className="absolute bottom-6 left-4 transform translate-x-1/4">
        <MapIcon3D size="2xl" animation="float" animationDelay="0.5s" />
      </div>
      <div className="absolute bottom-2 right-6">
        <CoffeeIcon3D size="lg" animation="float" animationDelay="5s" />
      </div>
    </div>
  );
}