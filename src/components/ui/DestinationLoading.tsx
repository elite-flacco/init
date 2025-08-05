import React from "react";
import { GlobeIcon3D, BrainIcon3D,  TravelIcon3D, CameraIcon3D, MapPinIcon3D } from "./Icon3D";
import { BaseLoading, LoadingStage } from "./BaseLoading";

interface DestinationLoadingProps {
  isVisible: boolean;
}

const searchStages: LoadingStage[] = [
  {
    icon: BrainIcon3D,
    message: "🧠 Getting to know your travel style...",
    detail: "Understanding what kind of trip you want",
  },
  {
    icon: GlobeIcon3D,
    message: "🌍 Evaluating thousands of destinations...",
    detail: "From bustling cities to serene beaches",
  },
  {
    icon: MapPinIcon3D,
    message: "📍 Finding perfect matches...",
    detail: "Places that fit what you're looking for",
  },
  {
    icon: CameraIcon3D,
    message: "❤️ Curating destinations you'll love...",
    detail: "Handpicking experiences made for you",
  },
  {
    icon: TravelIcon3D,
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
      showStageIndicators={false}
      simpleStageIndicators={true}
      showProgressDots={true}
      showOrbitingIcon={false}
      centralIcon={GlobeIcon3D}
      progressLabel="Sifting through thousands of destinations"
      footerMessage="We're looking for places you'll be excited to visit ✈️"
      ariaLabel="Searching for destination recommendations"
    />
  );
}
