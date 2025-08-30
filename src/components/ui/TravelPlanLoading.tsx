import React from "react";
import {
  BrainIcon3D,
  CoffeeIcon3D,
  GlobeIcon3D,
  MapIcon3D,
  MapPinIcon3D,
  SuitcaseIcon3D,
  TravelIcon3D,
} from "./Icon3D";
import { BaseLoading, LoadingStage } from "./BaseLoading";

interface TravelPlanLoadingProps {
  isVisible: boolean;
  destinationName?: string;
}

const adventureStages: LoadingStage[] = [
  {
    icon: BrainIcon3D,
    message: "🧠 Getting to know your travel style...",
    detail: "Understanding what kind of trip you're looking for",
  },
  {
    icon: MapPinIcon3D,
    message: "🗺️ Finding great places to visit...",
    detail: "Discovering cool spots and local favorites",
  },
  {
    icon: MapIcon3D,
    message: "🧭 Planning your route...",
    detail: "Creating the perfect mix of must-sees and relaxation",
  },
  {
    icon: CoffeeIcon3D,
    message: "🍽️ Finding amazing food spots...",
    detail: "From street food to fine dining - whatever you're into",
  },
  {
    icon: SuitcaseIcon3D,
    message: "🏠 Picking the best areas to stay...",
    detail: "Finding neighborhoods that match your vibe",
  },
  {
    icon: TravelIcon3D,
    message: "✨ Adding special experiences...",
    detail: "The memorable moments that make trips amazing",
  },
  {
    icon: GlobeIcon3D,
    message: "🌍 Putting it all together...",
    detail: "Your personalized travel plan is almost ready!",
  },
];

export function TravelPlanLoading({
  isVisible,
  destinationName = "your destination",
}: TravelPlanLoadingProps) {
  return (
    <BaseLoading
      isVisible={isVisible}
      stages={adventureStages}
      title="Creating Your Perfect Trip"
      maxProgress={90}
      stageInterval={3000}
      progressInterval={1000}
      progressIncrement={() => Math.random() * 8}
      showStageIndicators={true}
      showProgressDots={false}
      showOrbitingIcon={true}
      centralIcon={MapIcon3D}
      className=""
      progressLabel={`Planning your trip to ${destinationName}`}
      footerMessage={
        <>
          We're putting together your perfect trip (no spreadsheets required).
          <br className="hidden sm:block" />
          <span className="font-semibold text-primary">
            Your personalized travel plan will be ready soon!
          </span>
        </>
      }
      ariaLabel="Generating personalized adventure plan"
    ></BaseLoading>
  );
}
