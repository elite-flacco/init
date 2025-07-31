import React from "react";
import {
  Brain,
  Compass,
  Utensils,
  Home,
  Globe,
  Map,
  Navigation,
} from "lucide-react";
import { BaseLoading, LoadingStage } from "./BaseLoading";

interface TravelPlanLoadingProps {
  isVisible: boolean;
  destinationName?: string;
}

const adventureStages: LoadingStage[] = [
  {
    icon: Brain,
    message: "🧠 Getting to know your travel style...",
    detail: "Understanding what kind of trip you're looking for",
  },
  {
    icon: Map,
    message: "🗺️ Finding great places to visit...",
    detail: "Discovering cool spots and local favorites",
  },
  {
    icon: Navigation,
    message: "🧭 Planning your route...",
    detail: "Creating the perfect mix of must-sees and relaxation",
  },
  {
    icon: Utensils,
    message: "🍽️ Finding amazing food spots...",
    detail: "From street food to fine dining - whatever you're into",
  },
  {
    icon: Home,
    message: "🏠 Picking the best areas to stay...",
    detail: "Finding neighborhoods that match your vibe",
  },
  {
    icon: Compass,
    message: "✨ Adding special experiences...",
    detail: "The memorable moments that make trips amazing",
  },
  {
    icon: Globe,
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
      centralIcon={Compass}
      className="min-h-screen"
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
    >
      {/* Adventure Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-20 left-10 text-4xl opacity-[0.03] animate-float-slow transform rotate-12">
          🗺️
        </div>
        <div className="absolute top-60 right-20 text-3xl opacity-[0.04] animate-float-delayed transform -rotate-12">
          🧭
        </div>
        <div className="absolute bottom-40 left-20 text-5xl opacity-[0.02] animate-float transform rotate-45">
          ⛰️
        </div>
        <div className="absolute bottom-20 right-10 text-3xl opacity-[0.03] animate-float-slow transform -rotate-6">
          🎒
        </div>
      </div>
    </BaseLoading>
  );
}
