import React from "react";
import {
  TravelIcon3D,
  GlobeIcon3D,
  SuitcaseIcon3D,
  MapIcon3D,
  NotebookIcon3D,
  CameraIcon3D,
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
import { ActivityIconCategory } from "../types/travel";

// Emoji to text keyword mapping
const emojiToKeyword: Record<string, string> = {
  "☕": "coffee",
  "🍴": "utensils", 
  "🍽️": "utensils",
  "🥄": "utensils",
  "🍞": "food",
  "🍕": "food",
  "🍣": "food",
  "🍜": "food",
  "🍱": "food",
  "🏨": "hotel",
  "🏠": "hotel",
  "🏡": "hotel",
  "🗺️": "map",
  "🧭": "compass",
  "📍": "map",
  "📷": "camera",
  "📸": "camera",
  "✈️": "travel",
  "🛫": "travel",
  "🛬": "travel",
  "🧳": "suitcase",
  "👜": "suitcase",
  "🎒": "suitcase",
  "📓": "planning",
  "📔": "planning",
  "📝": "planning",
  "🚁": "helicopter",
  "⛰️": "adventure",
  "🏔️": "adventure",
  "🌴": "adventure",
  "🏖️": "adventure",
  "🏛️": "sightseeing",
  "🏰": "sightseeing",
  "🏯": "sightseeing",
  "🎭": "sightseeing",
  "🎨": "sightseeing",
  "🚶": "explore",
  "🚶‍♂️": "explore",
  "🚶‍♀️": "explore",
  "🔍": "explore",
};

// Helper function to detect if string contains emoji
function containsEmoji(str: string): boolean {
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
  return emojiRegex.test(str);
}

// Helper function to extract keyword from icon name
function normalizeIconName(iconName: string): string {
  // If it's an emoji, try to map it to a keyword
  if (containsEmoji(iconName)) {
    const keyword = emojiToKeyword[iconName.trim()];
    if (keyword) return keyword;
    
    // If no direct emoji match, try to extract any text that might be mixed with emoji
    const textOnly = iconName.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
    if (textOnly) return textOnly;
    
    // No match found, return original
    return iconName;
  }
  
  // If it's not an emoji, return as-is (lowercase will be handled in switch)
  return iconName;
}

// Icon mapping for different activity types
export function getActivityIcon(
  iconName: string | ActivityIconCategory,
  size: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" = "sm",
  animation: "float" | "pulse" | "bounce" | "spin" | "none" = "none"
) {
  const iconProps = { size, animation, className: "transition-all duration-300" };
  
  // Normalize the icon name (handle emojis and extract keywords)
  const normalizedName = normalizeIconName(iconName).toLowerCase() as ActivityIconCategory;

  switch (normalizedName) {
    case "coffee":
      return <CoffeeIcon3D {...iconProps} />;
    case "hotel":
      return <HotelIcon3D {...iconProps} />;
    case "utensils":
      return <UtensilsIcon3D {...iconProps} />;
    case "compass":
      return <MapPinIcon3D {...iconProps} />; // Use MapIcon3D for compass/exploration
    case "camera":
      return <CameraIcon3D {...iconProps} />;
    case "travel":
      return <TravelIcon3D {...iconProps} />;
    case "adventure":
      return <MapIcon3D {...iconProps} />;
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
    <div className="relative w-full mx-auto h-60 sm:h-48 md:h-64 lg:h-80 flex items-center justify-center overflow-hidden">
      {/* Center focal point */}
      <div className="hidden md:block">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <GlobeIcon3D size="xl" animation="pulse" animationDelay="0.5s" />
        </div>
      </div>
      <div className="block md:hidden">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <GlobeIcon3D size="lg" animation="pulse" animationDelay="0.5s" />
        </div>
      </div>

      {/* Top row - spread across full width with better spacing */}
      <div className="absolute top-1 left-2 transform translate-y-1/4">
        <TravelIcon3D size="3xl" animation="float" animationDelay="0s" />
      </div>
      <div className="hidden md:block absolute top-4 left-1/3 transform -translate-x-1/4">
        <NotebookIcon3D size="lg" animation="float" animationDelay="1s" />
      </div>

      <div className="hidden md:block">
        <div className="absolute top-1/4 right-1/3 transform translate-x-1/2 translate-y-1/8">
          <HelicopterIcon3D size="3xl" animation="float" animationDelay="2s" />
        </div>
      </div>
      <div className="block md:hidden">
        <div className="absolute top-1/4 right-1/3 transform translate-x-1/2 translate-y-1/4">
          <HelicopterIcon3D size="xl" animation="float" animationDelay="2s" />
        </div>
      </div>

      <div className="hidden md:block">
        <div className="absolute top-6 right-2">
          <PalmTreeIcon3D size="xl" animation="float" animationDelay="2s" />
        </div>
      </div>
      <div className="block md:hidden">
        <div className="absolute top-6 left-8">
          <PalmTreeIcon3D size="lg" animation="float" animationDelay="2s" />
        </div>
      </div>

      {/* Middle row - responsive side positioning */}
      <div className="absolute top-1/2 left-0 transform -translate-y-1/2">
        <div className="hidden md:block">
          <SuitcaseIcon3D size="xl" animation="float" animationDelay="1s" />
        </div>
        <div className="block md:hidden">
          <SuitcaseIcon3D size="lg" animation="float" animationDelay="1s" />
        </div>
      </div>

      <div className="hidden md:block">
        <div className="absolute top-1/2 right-0 transform -translate-y-1/2">
          <CameraIcon3D size="2xl" animation="float" animationDelay="2s" />
        </div>
      </div>
      <div className="block md:hidden">
        <div className="absolute top-1/2 right-0 transform -translate-y-1/2">
          <CameraIcon3D size="lg" animation="float" animationDelay="2s" />
        </div>
      </div>

      {/* Bottom row - spread across full width with clear spacing */}
      <div className="hidden md:block absolute bottom-2 left-12">
        <SunglassesIcon3D size="xl" animation="float" animationDelay="4s" />
      </div>
      <div className="hidden md:block absolute bottom-6 left-4 transform translate-x-1/4">
        <MapIcon3D size="2xl" animation="float" animationDelay="0.5s" />
      </div>
      <div className="hidden md:block absolute bottom-2 right-6">
        <CoffeeIcon3D size="lg" animation="float" animationDelay="5s" />
      </div>
    </div>
  );
}