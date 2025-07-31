import { useState, useEffect } from "react";
import { travelerTypes } from "../data/travelerTypes";
import { TravelerType } from "../types/travel";

interface TravelerTypeSelectionProps {
  onSelect: (type: TravelerType) => void;
}

// Helper function to get card background colors based on traveler type
function getCardColors(typeId: string) {
  const colorSchemes = {
    explorer: {
      background: "from-primary/80 via-primary/20 to-primary/30",
      glow: "from-primary/30 via-accent/20 to-secondary/30",
      border: "border-primary/60",
      badge: "text-primary-light bg-primary/20",
      titleHover: "group-hover:text-primary",
      textHover: "group-hover:text-gray-500"
    },
    "type-a": {
      background: "from-secondary/80 via-secondary/20 to-secondary/30", 
      glow: "from-secondary/30 via-primary/20 to-accent/30",
      border: "border-secondary/60",
      badge: "text-secondary-light bg-secondary/20",
      titleHover: "group-hover:text-secondary",
      textHover: "group-hover:text-gray-500"
    },
    overthinker: {
      background: "from-accent/80 via-accent/20 to-accent/30",
      glow: "from-accent/30 via-secondary/20 to-primary/30", 
      border: "border-accent/60",
      badge: "text-accent-dark bg-accent/20",
      titleHover: "group-hover:text-accent",
      textHover: "group-hover:text-gray-500"
    },
    chill: {
      background: "from-coral/80 via-coral/20 to-coral/30",
      glow: "from-coral/30 via-accent/20 to-secondary/30",
      border: "border-coral/60",
      badge: "text-coral-light bg-coral/20",
      titleHover: "group-hover:text-coral",
      textHover: "group-hover:text-gray-500"
    }
  };
  
  return colorSchemes[typeId as keyof typeof colorSchemes] || colorSchemes.explorer;
}

// Helper function to render traveler cards with asymmetrical positioning
function renderTravelerCard(
  type: TravelerType,
  index: number,
  isLoaded: boolean,
  hoveredType: string | null,
  setHoveredType: (id: string | null) => void,
  onSelect: (type: TravelerType) => void,
  getAdventurePreview: (typeId: string) => string,
) {
  const colors = getCardColors(type.id);
  return (
    <div
      onClick={() => onSelect(type)}
      onMouseEnter={() => setHoveredType(type.id)}
      onMouseLeave={() => setHoveredType(null)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(type);
        }
      }}
      className={`group relative cursor-pointer transition-all duration-700 ${
        isLoaded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"
      } hover:scale-[1.03] hover:-translate-y-3`}
      style={{
        transitionDelay: `${300 + index * 150}ms`,
      }}
      role="button"
      tabIndex={0}
      aria-label={`Choose ${type.name} adventure style: ${type.description}`}
    >
      {/* Adventure Glow */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.glow} rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 -z-10 scale-110 animate-adventure-float`}></div>

      {/* Main Adventure Card */}
      <div className={`relative h-full min-h-[280px] sm:min-h-[300px] lg:min-h-[320px] bg-gradient-to-br ${colors.background} backdrop-blur-xl border-2 ${colors.border} group-hover:${colors.border} rounded-3xl shadow-xl group-hover:shadow-adventure-float transition-all duration-700 overflow-hidden`}>

        {/* Expedition Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1200 ease-out opacity-0 group-hover:opacity-100"></div>

        {/* Adventure Content */}
        <div className="relative z-10 p-4 sm:p-5 md:p-6 lg:p-7 h-full flex flex-col">
          {/* Adventure Icon */}
          <div className="text-center mb-4">
            <div className="inline-block transform transition-all duration-700 group-hover:scale-125 group-hover:rotate-12 filter drop-shadow-lg group-hover:drop-shadow-2xl">
              <span
                className="text-4xl sm:text-5xl lg:text-6xl block mb-2"
                aria-hidden="true"
              >
                {type.icon}
              </span>
            </div>
          </div>

          {/* Adventure Title */}
          <div className="text-center mb-12">
            <h5 className={`text-foreground ${colors.titleHover} transition-all duration-500 tracking-tight`}>
              {type.name}
            </h5>

            {/* Adventure Preview */}
            {/* <div
              className={`transition-all duration-500 ${hoveredType === type.id ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
            >
              <p className={`text-xs sm:text-sm font-medium ${colors.badge} px-2 sm:px-3 py-1 sm:py-1.5 rounded-full inline-block`}>
                {getAdventurePreview(type.id)}
              </p>
            </div> */}
          </div>

          {/* Adventure Story */}
          <div className="flex-grow flex items-center justify-center">
            <p className={`text-sm sm:text-base lg:text-lg text-foreground leading-relaxed text-center font-medium ${colors.textHover} transition-colors duration-500 max-w-sm`}>
              {type.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TravelerTypeSelection({
  onSelect,
}: TravelerTypeSelectionProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredType, setHoveredType] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  // Adventure-themed intro messages for each type
  const getAdventurePreview = (typeId: string) => {
    const previews = {
      explorer: "🗺️ Off the beaten path awaits...",
      "type-a": "📋 Every detail, perfectly planned...",
      overthinker: "💭 Let us handle the decisions...",
      chill: "🌊 Pure relaxation, zero stress...",
    };
    return (
      previews[typeId as keyof typeof previews] || "✨ Your adventure awaits..."
    );
  };

  return (
    <div className="relative overflow-hidden">
      {/* Adventure background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-32 right-20 text-4xl opacity-20 animate-float"
          style={{ animationDelay: "1s" }}
        >
          ✈️
        </div>
        <div
          className="absolute bottom-32 left-32 text-5xl opacity-15 animate-float"
          style={{ animationDelay: "2s" }}
        >
          🧭
        </div>
        <div
          className="absolute bottom-20 right-16 text-3xl opacity-25 animate-bounce-subtle"
          style={{ animationDelay: "0.5s" }}
        >
          ⛰️
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Asymmetrical Adventure Header */}
        <div className="relative mb-24">
          {/* Main title section - offset left */}
          <div
            className={`ml-8 md:ml-16 lg:ml-24 transition-all duration-1000 ${
              isLoaded
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-12"
            }`}
            role="banner"
            aria-labelledby="step-title"
          >
            <h1 className="mb-6">
              How do you travel?
            </h1>

            {/* Offset subtitle block */}
            <div className="ml-8 md:ml-16 max-w-2xl space-y-3">
              <p className="text-base md:text-lg text-foreground-secondary leading-relaxed font-medium">
                No judgment here — we've all got our thing. Whether you're a spreadsheet person or a 'wing it' person, we've got you covered.
              </p>
            </div>
          </div>
        </div>

        {/* Responsive Horizontal Staggered Layout */}
        <div
          className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20"
          role="group"
          aria-labelledby="step-title"
        >
          {/* Mobile & Tablet: Single/Double column */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:hidden">
            {travelerTypes.map((type, index) => (
              <div key={type.id} className="w-full max-w-sm mx-auto">
                {renderTravelerCard(
                  type,
                  index,
                  isLoaded,
                  hoveredType,
                  setHoveredType,
                  onSelect,
                  getAdventurePreview,
                )}
              </div>
            ))}
          </div>

          {/* Desktop: Horizontal staggered layout */}
          <div className="hidden lg:flex gap-6 xl:gap-8 items-stretch justify-center">
            {travelerTypes.map((type, index) => (
              <div
                key={type.id}
                className={`flex-1 ${
                  index % 2 === 0 ? "mt-0" : "mt-16"
                }`}
                style={{
                  minWidth: "280px",
                  maxWidth: "320px",
                }}
              >
                {renderTravelerCard(
                  type,
                  index,
                  isLoaded,
                  hoveredType,
                  setHoveredType,
                  onSelect,
                  getAdventurePreview,
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
