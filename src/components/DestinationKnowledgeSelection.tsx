import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { DestinationKnowledge } from "../types/travel";
import { getDestinationKnowledgeIcon } from "../utils/iconMappingUtils";

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
    <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div
        className={`page-header transition-all duration-700 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
        role="banner"
        aria-labelledby="step-title"
      >
        <h1 className="page-title">Where are we headed?</h1>
        <p className="page-subtitle max-w-2xl mx-auto mb-4">
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
            className={`group relative cursor-pointer transition-all duration-500 ${isLoaded
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
            <div className={`option-card-rotating p-4 md:p-8 lg:pl-16 lg:pr-8 lg:pt-8 lg:pb-8 ${index % 2 === 0 ? 'card-3d-rotate-left' : 'card-3d-rotate-right'}`}>

              <div className="flex items-center justify-between">
                <span className="text-2xl mr-2 md:mr-3 lg:mr-4">
                  <div className="hidden sm:block">
                    {getDestinationKnowledgeIcon(option.type)}
                  </div>
                  <div className="block sm:hidden">
                    {getDestinationKnowledgeIcon(option.type, "2xs")}
                  </div>
                </span>
                <div className="flex-1">
                  <div className="flex items-center">
                    <h3 className="option-card-title">
                      {option.label}
                    </h3>
                  </div>
                  <p className="option-card-description">
                    {option.description}
                  </p>
                </div>

                {/* Selection Arrow */}
                <div className="ml-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 hidden sm:block">
                  <div className="w-8 h-8 gradient-primary rounded-full flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-white" />
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
