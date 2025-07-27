import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, RefreshCw } from 'lucide-react';
import { DestinationCard } from './DestinationCard';
import { DestinationDetailsModal } from './DestinationDetailsModal';
import { TravelerType, Destination, PickDestinationPreferences, DestinationKnowledge } from '../types/travel';
import { aiDestinationService } from '../services/aiDestinationService';

interface AIDestinationRecommendationResultsProps {
  travelerType: TravelerType;
  preferences?: PickDestinationPreferences;
  destinationKnowledge?: DestinationKnowledge;
  onSelect: (destination: Destination) => void;
  onBack: () => void;
}

export function AIDestinationRecommendationResults({ 
  travelerType, 
  preferences,
  destinationKnowledge,
  onSelect, 
  onBack 
}: AIDestinationRecommendationResultsProps) {
  const [recommendedDestinations, setRecommendedDestinations] = useState<Destination[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(true);
  const [aiReasoning, setAiReasoning] = useState<string>('');
  const [confidence, setConfidence] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedDestinationForModal, setSelectedDestinationForModal] = useState<Destination | null>(null);

  const generateRecommendations = async () => {
    setIsGenerating(true);
    setError(null);
    setIsLoaded(false);
    
    try {
      const response = await aiDestinationService.getDestinationRecommendations({
        travelerType,
        preferences,
        destinationKnowledge
      });
      
      setRecommendedDestinations(response.destinations);
      setAiReasoning(response.reasoning);
      setConfidence(response.confidence);
      setIsGenerating(false);
      setTimeout(() => setIsLoaded(true), 100);
    } catch (err) {
      console.error('Failed to get AI recommendations:', err);
      setError('Unable to get AI recommendations. Please try again.');
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    generateRecommendations();
  }, [travelerType, preferences, destinationKnowledge]);

  const handleRegenerateRecommendations = () => {
    generateRecommendations();
  };

  const handleViewDetails = (destination: Destination) => {
    setSelectedDestinationForModal(destination);
  };

  const handleCloseModal = () => {
    setSelectedDestinationForModal(null);
  };

  const handleSelectFromModal = (destination: Destination) => {
    onSelect(destination);
    setSelectedDestinationForModal(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="flex items-center text-foreground-muted hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>
        
        {!isGenerating && (
          <button
            onClick={handleRegenerateRecommendations}
            className="flex items-center px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Get New Suggestions
          </button>
        )}
      </div>

      {isGenerating ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-6">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            AI is analyzing your preferences...
          </h2>
          <p className="text-foreground-secondary mb-8">
            Finding the perfect destinations that match your travel style
          </p>
          <div className="flex justify-center">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Oops! Something went wrong
            </h2>
            <p className="text-foreground-secondary mb-8">{error}</p>
            <button
              onClick={handleRegenerateRecommendations}
              className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className={`text-center mb-12 transition-all duration-1000 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <h1 className="text-5xl font-bold text-foreground mb-6">
              Your Top Hits
            </h1>
            <p className="text-xl text-foreground-secondary max-w-3xl mx-auto leading-relaxed mb-6">
              We think you'll love these!
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
                  onViewDetails={handleViewDetails}
                />
              </div>
            ))}
          </div>
          
          {recommendedDestinations.length === 0 && (
            <div className="text-center py-16">
              <p className="text-foreground-secondary mb-4">
                No destinations found matching your criteria.
              </p>
              <button
                onClick={handleRegenerateRecommendations}
                className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Different Recommendations
              </button>
            </div>
          )}
        </>
      )}
      
      {/* Modal rendered at top level to cover entire viewport */}
      {selectedDestinationForModal && (
        <DestinationDetailsModal
          destination={selectedDestinationForModal}
          isOpen={!!selectedDestinationForModal}
          onClose={handleCloseModal}
          onSelectForPlanning={handleSelectFromModal}
        />
      )}
    </div>
  );
}