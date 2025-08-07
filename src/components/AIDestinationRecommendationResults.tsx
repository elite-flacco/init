import React, { useState } from "react";
import { RefreshCw } from "lucide-react";
import { DestinationCard } from "./DestinationCard";
import { DestinationDetailsModal } from "./DestinationDetailsModal";
import { DestinationLoading } from "./ui/DestinationLoading";
import { Destination } from "../types/travel";
import { AIDestinationResponse } from "../services/aiDestinationService";

interface AIDestinationRecommendationResultsProps {
  aiResponse: AIDestinationResponse | null;
  onSelect: (destination: Destination) => void;
  onBack: () => void;
  onRegenerate?: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export function AIDestinationRecommendationResults({
  aiResponse,
  onSelect,
  onBack,
  onRegenerate,
  isLoading = false,
  error = null,
}: AIDestinationRecommendationResultsProps) {
  const [selectedDestinationForModal, setSelectedDestinationForModal] =
    useState<Destination | null>(null);

  // Show loading state
  if (isLoading) {
    return <DestinationLoading isVisible={true} />;
  }

  // Show error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-20">
          <div className="max-w-2xl mx-auto">
            {/* Error icon */}
            <div className="relative inline-flex items-center justify-center w-20 h-20 mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-error/20 to-warning/20 rounded-full animate-pulse"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-error/10 to-warning/10 rounded-full flex items-center justify-center border border-error/30">
                <span className="text-2xl">😅</span>
              </div>
            </div>

            <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-error bg-clip-text text-transparent mb-4">
              Oops, we hit a snag
            </h2>
            <p className="text-lg text-foreground-secondary mb-8 leading-relaxed">
              Our AI took a little coffee break. {error}
            </p>

            <button
              onClick={onRegenerate}
              className="btn-3d-gradient"
            >
              <svg
                className="w-5 h-5 mr-3 group-hover:rotate-180 transition-transform duration"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                ></path>
              </svg>
              Let's Try This Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle case where aiResponse is null
  if (!aiResponse) {
    return <div>No response data available</div>;
  }

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
          <h2 className="mb-2 text-3d-gradient">Your Top Hits</h2>
          <p className="page-subtitle text-left">We think you'll love these 😉</p>
        </div>
        {onRegenerate && destinations.length > 0 && (
          <button onClick={onRegenerate} className="btn-3d-primary">
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
            <button onClick={onRegenerate} className="btn-3d-primary">
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
