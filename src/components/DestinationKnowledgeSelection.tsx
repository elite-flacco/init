import { useState, useEffect } from 'react';
import { DestinationKnowledge } from '../types/travel';
import { Card } from './ui/Card';

interface DestinationKnowledgeSelectionProps {
  onSelect: (knowledge: DestinationKnowledge) => void;
}

const destinationOptions: DestinationKnowledge[] = [
  {
    type: 'yes',
    label: 'Yes, I know exactly where I want to go',
    description: 'I\'ve done my research and picked my dream destination! Let\'s plan this thing 🎯'
  },
  {
    type: 'country',
    label: 'I\'ve picked the country/countries/region',
    description: 'I know the general area, but need help narrowing it down to the perfect spot 🗺️'
  },
  {
    type: 'no-clue',
    label: 'No clue',
    description: 'The world is my oyster. Help me discover my next adventure 🌍✨'
  }
];

export function DestinationKnowledgeSelection({ onSelect }: DestinationKnowledgeSelectionProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger the entrance animation
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">

      {/* Header Section */}
      <div
        className={`page-header ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        role="banner"
        aria-labelledby="step-title"
      >
        <h1 id="step-title" className="page-title">
          Got a destination in mind?
        </h1>
        {/* <p className="page-subtitle">
          No judgment here. Whether you're a planning pro or winging it, we've got you covered 😎
        </p> */}
      </div>

      {/* Options Grid */}
      <div className="space-y-6 max-w-4xl mx-auto" role="group" aria-labelledby="step-title">
        {destinationOptions.map((option, index) => (
          <div
            key={option.type}
            className={`option-card group transition-all duration-150 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            style={{
              transitionDelay: `${100 + index * 100}ms`,
            }}
          >
            <Card
              onClick={() => onSelect(option)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(option);
                }
              }}
              onMouseEnter={() => {}}
              onMouseLeave={() => {}}
              className="option-card-inner h-full"
              role="button"
              tabIndex={0}
              aria-label={`Select ${option.label}: ${option.description}`}
            >
              <div className="relative">
                <h3 className="option-card-title">
                  {option.label}
                </h3>
                <p className="option-card-description">
                  {option.description}
                </p>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}