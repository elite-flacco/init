import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { DestinationCard } from './DestinationCard';
import { DestinationDetailsModal } from './DestinationDetailsModal';
import { Destination } from '../types/travel';
import { AIDestinationResponse } from '../services/aiDestinationService';

interface AIDestinationRecommendationResultsProps {
  aiResponse: AIDestinationResponse;
  onSelect: (destination: Destination) => void;
  onBack: () => void;
  onRegenerate?: () => void;
}

export function AIDestinationRecommendationResults({
  aiResponse,
  onSelect,
  onBack,
  onRegenerate
}: AIDestinationRecommendationResultsProps) {
  const [selectedDestinationForModal, setSelectedDestinationForModal] = useState<Destination | null>(null);

  const { destinations } = aiResponse;
  
  // Acknowledge unused parameter to prevent linting error
  void onBack;


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
      <div className="text-center mb-12">
        <h1 className="mb-6">
          Your Top Hits
        </h1>
        <p className="max-w-3xl mx-auto mb-6">
          Based on your vibe, we're pretty confident one of these will make you go "YES, this is it!"
        </p>
        <div className="flex justify-center m-4">
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              className="btn-primary"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Show Me More Options
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {destinations.map((destination) => (
          <div key={destination.id}>
            <DestinationCard
              destination={destination}
              onSelect={onSelect}
              onViewDetails={handleViewDetails}
            />
          </div>
        ))}
      </div>

      {destinations.length === 0 && (
        <div className="text-center py-16">
          <p className="mb-4">
            No destinations found matching your criteria.
          </p>
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              className="btn-primary"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Give Me Something Else
            </button>
          )}
        </div>
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