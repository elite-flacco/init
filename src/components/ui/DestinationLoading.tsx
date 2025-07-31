import React from "react";
import {
  Globe,
  Sparkles,
  MapPin,
  Search,
  Brain,
  Plane,
  Heart,
} from "lucide-react";
import { BaseLoading, LoadingStage } from "./BaseLoading";

interface DestinationLoadingProps {
  isVisible: boolean;
}

const searchStages: LoadingStage[] = [
  {
    icon: Brain,
    message: "🧠 Getting to know your travel style...",
    detail: "Understanding what kind of trip you want",
  },
  {
    icon: Search,
    message: "🔍 Scanning the globe for hidden gems...",
    detail: "Exploring destinations off the beaten path",
  },
  {
    icon: Globe,
    message: "🌍 Evaluating thousands of destinations...",
    detail: "From bustling cities to serene beaches",
  },
  {
    icon: MapPin,
    message: "📍 Finding perfect matches...",
    detail: "Places that fit what you're looking for",
  },
  {
    icon: Heart,
    message: "❤️ Curating destinations you'll love...",
    detail: "Handpicking experiences made for you",
  },
  {
    icon: Sparkles,
    message: "✨ Adding the finishing touches...",
    detail: "Making sure we've got the best options for you",
  },
  {
    icon: Plane,
    message: "🛫 Almost ready!",
    detail: "Your destination recommendations are coming up",
  },
];

export function DestinationLoading({ isVisible }: DestinationLoadingProps) {
  return (
    <BaseLoading
      isVisible={isVisible}
      stages={searchStages}
      title="Finding destinations for you..."
      maxProgress={85}
      stageInterval={2500}
      progressInterval={800}
      progressIncrement={() => Math.random() * 10}
      showStageIndicators={true}
      simpleStageIndicators={true}
      showProgressDots={true}
      showOrbitingIcon={false}
      centralIcon={Globe}
      progressLabel="Sifting through thousands of destinations"
      footerMessage="We're looking for places you'll be excited to visit ✈️"
      ariaLabel="Searching for destination recommendations"
    />
  );
}
