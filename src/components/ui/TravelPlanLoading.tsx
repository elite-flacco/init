import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Brain,
  MapPin,
  Compass,
  Calendar,
  Utensils,
  Home,
  Plane,
  Map,
  Globe,
  Navigation,
} from "lucide-react";
import { Card } from "./Card";

interface TravelPlanLoadingProps {
  isVisible: boolean;
  destinationName?: string;
}

const adventureStages = [
  {
    icon: Brain,
    message: "🧠 Analyzing your explorer DNA...",
    detail: "Decoding what makes your adventure spirit tick",
  },
  {
    icon: Map,
    message: "🗺️ Charting uncharted territories...",
    detail: "Discovering hidden gems and legendary local secrets",
  },
  {
    icon: Navigation,
    message: "🧭 Plotting your expedition route...",
    detail: "Crafting the perfect balance of thrill and chill",
  },
  {
    icon: Utensils,
    message: "🍽️ Scouting epic food adventures...",
    detail: "From legendary street eats to culinary masterpieces",
  },
  {
    icon: Home,
    message: "🏠 Finding your perfect base camp...",
    detail: "Where adventure meets comfort in the best neighborhoods",
  },
  {
    icon: Compass,
    message: "✨ Adding legendary experiences...",
    detail: "The once-in-a-lifetime moments that become epic stories",
  },
  {
    icon: Globe,
    message: "🌍 Final expedition preparations...",
    detail: "Your adventure dossier is almost ready for takeoff!",
  },
];

export function TravelPlanLoading({
  isVisible,
  destinationName = "your destination",
}: TravelPlanLoadingProps) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setCurrentStageIndex(0);
      setProgress(0);
      return;
    }

    // Cycle through adventure stages every 3 seconds
    const stageInterval = setInterval(() => {
      setCurrentStageIndex((prev) => (prev + 1) % adventureStages.length);
    }, 3000);

    // Gradual progress increase
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev; // Stop at 90% to avoid reaching 100% before completion
        return prev + Math.random() * 8;
      });
    }, 1000);

    return () => {
      clearInterval(stageInterval);
      clearInterval(progressInterval);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const currentStage = adventureStages[currentStageIndex];
  const IconComponent = currentStage.icon;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
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

      <div className="relative z-10 max-w-3xl w-full">
        {/* Adventure Loading Container */}
        <div className="transform -rotate-1 hover:rotate-0 transition-transform duration-700">
          <div className="bg-gradient-to-br from-background/95 to-background-card/90 backdrop-blur-xl border-2 border-border/40 rounded-3xl p-8 lg:p-12 shadow-adventure-float relative overflow-hidden text-center">
            {/* Adventure Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/20 to-secondary/30 rounded-3xl blur-xl opacity-50 -z-10 animate-adventure-float"></div>
            {/* Adventure Command Center */}
            <div className="relative mb-10">
              <div className="relative flex justify-center items-center h-32">
                {/* Central Adventure Compass */}
                <div className="absolute">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/30 to-accent/40 rounded-full flex items-center justify-center animate-pulse-slow border-2 border-primary/50">
                      <Compass className="w-8 h-8 text-primary animate-spin-slow" />
                    </div>
                    <div className="absolute inset-0 animate-glow-pulse">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/30 rounded-full opacity-50"></div>
                    </div>
                  </div>
                </div>

                {/* Orbiting Adventure Icons */}
                <div className="absolute animate-spin-slow">
                  <div
                    className="w-28 h-28 flex items-center justify-center"
                    style={{
                      transform: "rotate(" + currentStageIndex * 51.4 + "deg)",
                    }}
                  >
                    <div
                      className="transform p-4 bg-gradient-to-br from-accent/30 to-secondary/30 rounded-full animate-bounce-subtle border border-accent/50 shadow-glow"
                      style={{
                        transform:
                          "rotate(-" + currentStageIndex * 51.4 + "deg)",
                      }}
                    >
                      <IconComponent className="w-6 h-6 text-accent" />
                    </div>
                  </div>
                </div>

                {/* Adventure Floating Elements */}
                <div className="absolute animate-float animation-delay-500">
                  <div className="transform -translate-x-12 -translate-y-8 text-2xl opacity-60 animate-bounce-subtle">
                    🗺️
                  </div>
                </div>
                <div className="absolute animate-float animation-delay-1000">
                  <div className="transform translate-x-12 -translate-y-6 text-2xl opacity-60 animate-bounce-subtle">
                    🎒
                  </div>
                </div>
                <div className="absolute animate-float animation-delay-1500">
                  <div className="transform -translate-x-10 translate-y-10 text-2xl opacity-60 animate-bounce-subtle">
                    ⛰️
                  </div>
                </div>
                <div className="absolute animate-float animation-delay-2000">
                  <div className="transform translate-x-10 translate-y-8 text-2xl opacity-60 animate-bounce-subtle">
                    🧭
                  </div>
                </div>
              </div>
            </div>

            {/* Adventure Intel Briefing */}
            <div className="mb-10">
              <div className="flex items-center justify-center mb-6">
                <div className="inline-flex items-center bg-primary/20 text-primary px-4 py-2 rounded-full font-bold text-lg mr-4 transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                  <Globe className="w-5 h-5 mr-3" />
                  Adventure Intel
                </div>
                <div className="text-2xl animate-bounce-subtle">📋</div>
              </div>

              <h2 className="text-3xl lg:text-4xl font-display font-bold mb-6 bg-gradient-to-br from-primary via-accent to-secondary bg-clip-text text-transparent leading-tight">
                Crafting Your Epic Adventure!
              </h2>

              <div key={currentStageIndex} className="animate-fade-in-fast">
                <p className="text-xl font-semibold text-primary mb-3">
                  {currentStage.message}
                </p>
                <p className="text-lg text-foreground-secondary leading-relaxed">
                  {currentStage.detail}
                </p>
              </div>
            </div>

            {/* Adventure Progress */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <span className="text-base font-medium text-foreground-secondary">
                  Expedition Progress for {destinationName}
                </span>
                <span className="text-lg font-bold text-primary">
                  {Math.min(Math.round(progress), 90)}%
                </span>
              </div>
              <div className="w-full bg-border/50 rounded-full h-4 overflow-hidden border border-border/30">
                <div
                  className="h-full bg-gradient-to-r from-primary via-accent to-secondary transition-all duration-1000 ease-out rounded-full relative shadow-glow"
                  style={{ width: `${Math.min(progress, 90)}%` }}
                >
                  <div className="absolute inset-0 bg-white/30 animate-shimmer rounded-full"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-slide-right rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Adventure Waypoints */}
            <div className="flex justify-center space-x-3 mb-8">
              {adventureStages.map((stage, index) => {
                const StageIcon = stage.icon;
                return (
                  <div
                    key={index}
                    className={`relative transition-all duration-500 ${
                      index === currentStageIndex
                        ? "scale-125 transform"
                        : index < currentStageIndex
                          ? "scale-100"
                          : "scale-75 opacity-50"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        index === currentStageIndex
                          ? "bg-primary/30 border-primary shadow-glow animate-pulse-slow"
                          : index < currentStageIndex
                            ? "bg-accent/30 border-accent"
                            : "bg-border/30 border-border"
                      }`}
                    >
                      <StageIcon
                        className={`w-4 h-4 ${
                          index === currentStageIndex
                            ? "text-primary"
                            : index < currentStageIndex
                              ? "text-accent"
                              : "text-foreground-muted"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Adventure Briefing Footer */}
            <div className="bg-gradient-to-r from-background/50 to-background-card/50 backdrop-blur-sm border border-border/30 rounded-2xl p-6">
              <p className="text-base text-foreground-secondary leading-relaxed">
                Our adventure AI is analyzing thousands of expedition insights
                to craft your perfect journey.
                <br className="hidden sm:block" />
                <span className="font-semibold text-primary">
                  Your epic adventure dossier will be ready in 30-60 seconds!
                </span>
              </p>
            </div>

            {/* Accessibility */}
            <div
              role="status"
              aria-live="polite"
              aria-label="Generating personalized adventure plan"
              className="sr-only"
            >
              {currentStage.message} - {Math.round(progress)}% complete
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
