import { useState, useEffect } from "react";
import { DestinationKnowledge } from "../types/travel";

interface DestinationKnowledgeSelectionProps {
  onSelect: (knowledge: DestinationKnowledge) => void;
}

const destinationOptions: DestinationKnowledge[] = [
  {
    type: "yes",
    label: "Yep, I know exactly where I want to go",
    description:
      "I've done my research and my heart is set. Let's plan this thing.",
  },
  {
    type: "country",
    label: "I've got a region in mind",
    description:
      "I know the general area, but could use help finding the perfect spot within it.",
  },
  {
    type: "no-clue",
    label: "Completely clueless",
    description:
      "The world is huge and full of possibilities. Help me discover something incredible.",
  },
];

export function DestinationKnowledgeSelection({
  onSelect,
}: DestinationKnowledgeSelectionProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger the entrance animation
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div
        className={`page-header transition-all duration-700 ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        }`}
        role="banner"
        aria-labelledby="step-title"
      >
        <h1 className="page-title mb-6">Where are we headed?</h1>
        <p className="page-subtitle max-w-2xl mx-auto mb-4 opacity-90">
          Whether you've got your heart set on somewhere specific or you're completely open to suggestions, we're here for it.
        </p>
      </div>

      {/* Options Grid */}
      <div
        className="space-y-8 max-w-4xl mx-auto"
        role="group"
        aria-labelledby="step-title"
      >
        {destinationOptions.map((option, index) => (
          <div
            key={option.type}
            className={`group relative cursor-pointer transition-all duration-500 ${
              isLoaded
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-12"
            }`}
            style={{
              transitionDelay: `${200 + index * 150}ms`,
            }}
            onClick={() => onSelect(option)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(option);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={`Select ${option.label}: ${option.description}`}
          >
            {/* Adventure Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/20 to-secondary/30 rounded-3xl blur-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 -z-10 animate-glow-pulse"></div>

            {/* Asymmetrical Adventure Card */}
            <div className="bg-gradient-to-br from-background/95 to-background-card/90 backdrop-blur-xl border-2 border-primary/30 group-hover:border-primary/50 rounded-3xl shadow-adventure-float group-hover:shadow-travel-card relative overflow-hidden transform -rotate-1 group-hover:rotate-0 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 p-8 lg:pl-16 lg:pr-8 lg:pt-12 lg:pb-8">

              {/* Subtle background pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>

              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>

              <div className="relative flex items-center justify-between -ml-4 lg:-ml-8">
                <div className="flex-1">
                  <div className="flex items-center mb-4">
                    <span className="text-2xl mr-3">
                      {option.type === 'yes' ? '🎯' : option.type === 'country' ? '🗺️' : '🌍'}
                    </span>
                    <h3 className="font-display font-bold text-foreground group-hover:text-primary transition-colors duration-300 text-xl lg:text-2xl tracking-tight">
                      {option.label}
                    </h3>
                  </div>
                  <p className="text-base lg:text-lg text-foreground-secondary group-hover:text-foreground transition-colors duration-300 leading-relaxed font-medium ml-4 lg:ml-8">
                    {option.description}
                  </p>
                </div>

                {/* Selection Arrow */}
                <div className="ml-6 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                  <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">→</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
