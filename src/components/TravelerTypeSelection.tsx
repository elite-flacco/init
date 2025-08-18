import { useState, useEffect } from "react";
import { ArrowDown } from "lucide-react";
import { travelerTypes } from "../data/travelerTypes";
import { TravelerType } from "../types/travel";
import { getTravelerTypeIcon } from "../utils/iconMappingUtils";
import { HeroIconsComposition } from "../utils/iconMapping";
import { useTypingEffect } from "../hooks/useTypingEffect";

interface TravelerTypeSelectionProps {
  onSelect: (type: TravelerType) => void;
}

// Helper function to get card colors based on traveler type
function getCardColors(typeId: string) {
  const colorSchemes = {
    explorer: {
      titleHover: "group-hover:text-primary",
      textHover: "group-hover:text-foreground"
    },
    "type-a": {
      titleHover: "group-hover:text-secondary",
      textHover: "group-hover:text-foreground"
    },
    overthinker: {
      titleHover: "group-hover:text-accent",
      textHover: "group-hover:text-foreground"
    },
    chill: {
      titleHover: "group-hover:text-coral",
      textHover: "group-hover:text-foreground"
    }
  };

  return colorSchemes[typeId as keyof typeof colorSchemes] || colorSchemes.explorer;
}

// Helper function to render traveler cards
function renderTravelerCard(
  type: TravelerType,
  index: number,
  isLoaded: boolean,
  hoveredType: string | null,
  setHoveredType: (id: string | null) => void,
  onSelect: (type: TravelerType) => void,
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
      className={`group transition-all duration-500 ${isLoaded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"}`}
      style={{
        transitionDelay: `${300 + index * 150}ms`,
      }}
      role="button"
      tabIndex={0}
      aria-label={`Choose ${type.name} adventure style: ${type.description}`}
    >
      <div className="traveler-card">
        <div className="relative z-10 h-full flex flex-col">
          {/* Icon */}
          <div className="text-center mb-4 sm:mb-6">
            <div className="inline-block rotate-hover group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
            <div className="block sm:block md:hidden">
              {getTravelerTypeIcon(type.id, "md")}
            </div>
            <div className="hidden sm:hidden md:block">
              {getTravelerTypeIcon(type.id, "xl")}
            </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-4 sm:mb-6 md:mb-8">
            <h5 className={`text-3d-title text-lg sm:text-xl lg:text-2xl ${colors.titleHover} transition-colors duration-500`}>
              {type.name}
            </h5>
          </div>

          {/* Description */}
          <div className="flex-grow flex items-center justify-center">
            <p className={`text-sm sm:text-base lg:text-lg text-foreground-secondary text-center font-medium ${colors.textHover} mb-2 sm:mb-4 transition-colors duration-500 max-w-sm`}>
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
  
  // Typing effect for hero title
  const { displayedText: typedHeroTitle, isComplete: heroTitleComplete } = useTypingEffect({
    text: "Plan your trip, your way",
    speed: 80,
    delay: 800
  });

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  const scrollToTravelerTypes = () => {
    const element = document.getElementById('traveler-types-section');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative overflow-hidden">

      <div className="container mx-auto relative z-10">
        {/* Hero Section */}
        <div className="text-center min-h-screen flex items-center justify-center mb-12">
          <div
            className={`transition-all duration-1000 ${isLoaded
              ? "opacity-100 -translate-y-16"
              : "opacity-0 translate-y-12"
              }`}
          >
            {/* Hero Icons Section */}
            <div className="relative max-w-6xl mx-auto mb-8 sm:mb-12">
              {/* 3D Icons container */}
              <HeroIconsComposition />
            </div>

            {/* Hero Title */}
            <h1 className="text-3d-gradient text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl mb-4 sm:mb-6 px-2">
              {typedHeroTitle}
              <span className={`inline-block w-1 h-4 sm:h-6 md:h-8 lg:h-12 xl:h-16 bg-primary ml-1 sm:ml-2 ${!heroTitleComplete ? 'animate-pulse' : 'opacity-0'} transition-opacity duration-500`}>
              </span>
            </h1>
            {/* Hero Subtitle */}
            <p className={`text-3d-title text-base sm:text-lg md:text-xl lg:text-2xl text-foreground-secondary max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed transition-all duration-700 px-4 ${heroTitleComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              Spreadsheets or vibes - we've got you.
            </p>
            {/* Blurb */}
            <p className={`text-sm sm:text-base md:text-lg max-w-3xl mx-auto mb-8 sm:mb-12 leading-relaxed transition-all duration-700 delay-300 px-4 ${heroTitleComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              Not a travel agent. Just the smart, thoughtful co-pilot that helps you figure out where to go and what to do — so that you can focus on the fun stuff.
            </p>

            <button
              onClick={scrollToTravelerTypes}
              className={`btn-3d-primary px-8 py-4 rounded-full text-lg lift-hover transition-all duration-700 delay-500 ${heroTitleComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            >
              Let's Go
              <ArrowDown className="w-5 h-5 text-white animate-bounce" />
            </button>
            

          </div>
        </div>

        {/* Asymmetrical Adventure Header */}
        <div id="traveler-types-section" className="relative mb-8 sm:mb-12 md:mb-16 lg:mb-20">
          {/* Main title section - offset left */}
          <div
            className={`ml-8 md:ml-16 lg:ml-24 transition-all duration-1000 ${isLoaded
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-12"
              }`}
            role="banner"
            aria-labelledby="step-title"
          >
            <h2 className="text-3d-hero mb-6">
              How do you travel?
            </h2>

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
                )}
              </div>
            ))}
          </div>

          {/* Desktop: Horizontal staggered layout */}
          <div className="hidden lg:flex gap-6 xl:gap-8 items-stretch justify-center">
            {travelerTypes.map((type, index) => (
              <div
                key={type.id}
                className={`flex-1 ${index % 2 === 0 ? "mt-0" : "mt-16"
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
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
