import React from "react";
import { ActivityIconCategory } from "../types/travel";
import {
  TravelIcon3D,
  GlobeIcon3D,
  SuitcaseIcon3D,
  MapIcon3D,
  NotebookIcon3D,
  CameraIcon3D,
  HelicopterIcon3D,
  PalmTreeIcon3D,
  BrainIcon3D,
  SpreadSheetIcon3D,
  MapPinIcon3D,
  CoffeeIcon3D,
  UtensilsIcon3D,
  HotelIcon3D,
} from "../components/ui/Icon3D";

// Emoji to text keyword mapping
export const emojiToKeyword: Record<string, string> = {
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
export function containsEmoji(str: string): boolean {
  const emojiRegex =
    /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
  return emojiRegex.test(str);
}

// Helper function to extract keyword from icon name
export function normalizeIconName(iconName: string): string {
  // If it's an emoji, try to map it to a keyword
  if (containsEmoji(iconName)) {
    const keyword = emojiToKeyword[iconName.trim()];
    if (keyword) return keyword;

    // If no direct emoji match, try to extract any text that might be mixed with emoji
    const textOnly = iconName
      .replace(
        /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu,
        "",
      )
      .trim();
    if (textOnly) return textOnly;

    // No match found, return original
    return iconName;
  }

  // If it's not an emoji, return as-is (lowercase will be handled in switch)
  return iconName;
}

// Utility functions that return JSX - these should be used by components
export function getActivityIcon(
  iconName: string | ActivityIconCategory,
  size: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" = "sm",
  animation: "float" | "pulse" | "bounce" | "spin" | "none" = "none",
) {
  const iconProps = {
    size,
    animation,
    className: "transition-all duration-300",
  };

  // Normalize the icon name (handle emojis and extract keywords)
  const normalizedName = normalizeIconName(
    iconName,
  ).toLowerCase() as ActivityIconCategory;

  switch (normalizedName) {
    case "coffee":
      return <CoffeeIcon3D {...iconProps} />;
    case "hotel":
      return <HotelIcon3D {...iconProps} />;
    case "utensils":
      return <UtensilsIcon3D {...iconProps} />;
    case "compass":
      return <MapPinIcon3D {...iconProps} />;
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

export function getTravelerTypeIcon(
  travelerTypeId: string,
  size: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" = "xl",
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
  size: "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" = "sm",
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

export function getProgressStepIcon(
  stepId: string,
  size: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" = "sm",
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
