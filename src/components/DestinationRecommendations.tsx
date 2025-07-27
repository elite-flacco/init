import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { destinations } from '../data/destinations';
import { DestinationCard } from './DestinationCard';
import { TravelerType, Destination } from '../types/travel';

interface DestinationRecommendationsProps {
  travelerType: TravelerType;
  onSelect: (destination: Destination) => void;
  onBack: () => void;
}

export function DestinationRecommendations({ 
  travelerType, 
  onSelect, 
  onBack 
}: DestinationRecommendationsProps) {
  const [recommendedDestinations, setRecommendedDestinations] = useState<Destination[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    setIsGenerating(true);
    
    setTimeout(() => {
      // Simulate AI recommendation based on traveler type
      let filtered = [...destinations];
      
      if (travelerType.id === 'yolo') {
        // YOLO travelers get all destinations shuffled
        filtered = filtered.sort(() => Math.random() - 0.5);
      } else if (travelerType.id === 'adventure') {
        // Adventure seekers get more outdoor destinations first
        filtered = filtered.sort((a, b) => {
          const adventureDestinations = ['iceland', 'new-zealand', 'costa-rica'];
          const aScore = adventureDestinations.includes(a.id) ? 1 : 0;
          const bScore = adventureDestinations.includes(b.id) ? 1 : 0;
          return bScore - aScore;
        });
      } else if (travelerType.id === 'culture') {
        // Culture explorers get historical destinations first
        filtered = filtered.sort((a, b) => {
          const cultureDestinations = ['japan', 'greece'];
          const aScore = cultureDestinations.includes(a.id) ? 1 : 0;
          const bScore = cultureDestinations.includes(b.id) ? 1 : 0;
          return bScore - aScore;
        });
      } else if (travelerType.id === 'relaxation') {
        // Relaxation focused get peaceful destinations first
        filtered = filtered.sort((a, b) => {
          const relaxationDestinations = ['bali', 'greece'];
          const aScore = relaxationDestinations.includes(a.id) ? 1 : 0;
          const bScore = relaxationDestinations.includes(b.id) ? 1 : 0;
          return bScore - aScore;
        });
      }
      
      setRecommendedDestinations(filtered);
      setIsGenerating(false);
      setTimeout(() => setIsLoaded(true), 100);
    }, 1500);
  }, [travelerType]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center mb-8">
        <button
          onClick={onBack}
          className="flex items-center text-foreground-muted hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>
      </div>

      {isGenerating ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-6">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Curating perfect destinations for you...
          </h2>
          <p className="text-foreground-secondary mb-8">
            Our AI is analyzing your preferences
          </p>
          <div className="flex justify-center">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className={`text-center mb-12 transition-all duration-1000 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <h1 className="text-5xl font-bold text-foreground mb-6">
              Perfect destinations for {travelerType.name.toLowerCase()}s
            </h1>
            <p className="text-xl text-foreground-secondary max-w-3xl mx-auto leading-relaxed">
              Based on your travel style, here are our AI-curated recommendations. Choose the destination that excites you most!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recommendedDestinations.map((destination, index) => (
              <div
                key={destination.id}
                className={`transition-all duration-700 ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <DestinationCard
                  destination={destination}
                  onSelect={onSelect}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}