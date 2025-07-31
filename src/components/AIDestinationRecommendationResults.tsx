import React, { useState } from "react";
import { RefreshCw } from "lucide-react";
import { DestinationCard } from "./DestinationCard";
import { DestinationDetailsModal } from "./DestinationDetailsModal";
import { Destination } from "../types/travel";
import { AIDestinationResponse } from "../services/aiDestinationService";

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
  onRegenerate,
}: AIDestinationRecommendationResultsProps) {
  const [selectedDestinationForModal, setSelectedDestinationForModal] =
    useState<Destination | null>(null);

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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="mb-2 page-title">Your Top Hits</h3>
          <p className="page-subtitle text-left">We think you'll love these 😉</p>
        </div>
        {onRegenerate && destinations.length > 0 && (
          <button onClick={onRegenerate} className="btn-primary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Show Me More
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {destinations.map((destination) => (
          <div key={destination.id}>
            <DestinationCard
              destination={destination}
              onViewDetails={handleViewDetails}
            />
          </div>
        ))}
      </div>

      {destinations.length === 0 && (
        <div className="text-center py-16">
          <h6 className="mb-4">Hmm, our AI is having a moment. Let's try this again.</h6>
          {onRegenerate && (
            <button onClick={onRegenerate} className="btn-primary">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
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
