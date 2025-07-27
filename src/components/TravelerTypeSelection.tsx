import { useState, useEffect } from 'react';
import { travelerTypes } from '../data/travelerTypes';
import { TravelerType } from '../types/travel';
import { Card } from './ui/Card';

interface TravelerTypeSelectionProps {
  onSelect: (type: TravelerType) => void;
}

export function TravelerTypeSelection({ onSelect }: TravelerTypeSelectionProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div 
        className={`page-header ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
        role="banner"
        aria-labelledby="step-title"
      >
        <h1 id="step-title" className="page-title">
          How do you roll?
        </h1>
        {/* <p className="page-subtitle">
          Let's start by understanding your travel style. This helps us curate the perfect destinations and experiences just for you.
        </p> */}
      </div>

      {/* Traveler Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto" role="group" aria-labelledby="step-title">
        {travelerTypes.map((type, index) => (
          <div
            key={type.id}
            onClick={() => onSelect(type)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(type);
              }
            }}
            className={`traveler-card group ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
            style={{ 
              transitionDelay: `${100 + index * 100}ms`
            }}
            role="button"
            tabIndex={0}
            aria-label={`Select ${type.name} traveler type: ${type.description}`}
          >
            <div className="h-full">
              <Card className="traveler-card-inner">
                <div className="relative z-10 flex flex-col items-center h-full">
                  {/* Icon */}
                  <div className="traveler-card-icon" aria-hidden="true">
                    {type.icon}
                  </div>
                  
                  {/* Title */}
                  <h3 className="traveler-card-title">
                    {type.name}
                  </h3>
                  
                  {/* Description */}
                  <p className="traveler-card-description">
                    {type.description}
                  </p>
                  
                </div>
              </Card>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}