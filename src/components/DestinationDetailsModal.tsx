import React, { useState } from "react";
import { X, MapPin, ArrowRight, ImageIcon, Heart, Loader2 } from "lucide-react";
import { Destination } from "../types/travel";
import { useDestinationImage } from '../hooks/useDestinationImage';
import { useAuth } from '../contexts/AuthContext';
import { makeAuthenticatedRequest } from '../lib/auth';

interface DestinationDetailsModalProps {
  destination: Destination;
  isOpen: boolean;
  onClose: () => void;
  onSelectForPlanning: (destination: Destination) => void;
}

export function DestinationDetailsModal({
  destination,
  isOpen,
  onClose,
  onSelectForPlanning,
}: DestinationDetailsModalProps) {
  const { user } = useAuth();
  const { imageUrl, isLoading } = useDestinationImage({
    destination: destination.name,
    country: destination.country,
    count: 1
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const displayImage = imageUrl || destination.image;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSelectForPlanning = () => {
    onSelectForPlanning(destination);
    onClose();
  };

  const handleSaveDestination = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert("Please sign in to save destinations.");
      return;
    }

    if (isSaved) {
      return; // Already saved
    }

    setIsSaving(true);

    try {
      const response = await makeAuthenticatedRequest("/api/user/destinations", {
        method: "POST",
        body: JSON.stringify({
          destination,
          notes: `Saved from destination details - ${destination.description.substring(0, 100)}...`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409) {
          // Already saved
          setIsSaved(true);
          return;
        }
        throw new Error(errorData.error || "Failed to save destination");
      }

      setIsSaved(true);
      // Optional: Show a brief success message
    } catch (error) {
      console.error("Error saving destination:", error);
      alert(error instanceof Error ? error.message : "Failed to save destination. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl relative mx-auto animate-in slide-in-from-bottom-4 duration-300">
        {/* Header with image */}
        <div className="relative h-80 md:h-96">
          {isLoading ? (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <ImageIcon className="w-12 h-12 animate-pulse" />
                <span>Loading image...</span>
              </div>
            </div>
          ) : (
            <img
              src={displayImage}
              alt={destination.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== destination.image) {
                  target.src = destination.image;
                }
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Action buttons */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {/* Save button */}
            {user && (
              <button
                onClick={handleSaveDestination}
                disabled={isSaving || isSaved}
                className={`bg-white/90 hover:bg-white rounded-full p-2 transition-all duration-300 hover:scale-105 disabled:cursor-not-allowed ${
                  isSaved 
                    ? 'text-red-500' 
                    : 'text-gray-600 hover:text-red-500'
                }`}
                title={isSaved ? "Destination saved!" : "Save destination"}
              >
                {isSaving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Heart className={`w-5 h-5 transition-all duration-300 ${
                    isSaved ? 'fill-current text-red-500' : ''
                  }`} />
                )}
              </button>
            )}

            {/* Close button */}
            <button
              onClick={onClose}
              className="bg-white/90 hover:bg-white text-black rounded-full p-2 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Location badge */}
          <div className="absolute top-4 left-4">
            <div className="flex items-center bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
              <MapPin className="w-4 h-4 text-primary mr-1.5" />
              <span className="text-sm font-medium text-foreground">
                {destination.country}
              </span>
            </div>
          </div>

          {/* Title */}
          <div className="absolute bottom-6 left-6 right-6">
            <h2 className="mb-4 text-white">{destination.name}</h2>
            <p className="max-w-2xl text-white">{destination.description}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 max-h-[45vh] overflow-y-auto">
          {/* Quick info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 items-start">
            <div className="flex items-center">
              {/* <Calendar className="w-5 h-5 text-primary mr-3" /> */}
              <div>
                <p className="font-semibold">📅 Best Time to Visit</p>
                <p className="font-sm text-foreground ml-6">
                  {destination.bestTimeToVisit}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              {/* <DollarSign className="w-5 h-5 text-primary mr-3" /> */}
              <div>
                <p className="font-semibold">💰 Estimated Cost</p>
                <p className="font-sm text-foreground ml-6">
                  {destination.estimatedCost}
                </p>
              </div>
            </div>
          </div>

          {/* Highlights */}
          <div className="mb-8">
            <h6 className="mb-4">Highlights</h6>
            <div className="space-y-3">
              {destination.highlights.map((highlight, index) => (
                <div
                  key={index}
                  className="px-4 py-2 bg-secondary/10 rounded-lg border border-secondary/20"
                >
                  <div className="text-sm">
                    <span className="font-semibold text-secondary text-sm">
                      {highlight.name}
                    </span>
                    {highlight.description && (
                      <>
                        <span className="text-secondary text-sm">: </span>
                        <span className="text-foreground text-sm">{highlight.description}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Activities */}
          <div className="mb-8">
            <h6 className="mb-4">Key Activities</h6>
            <div className="flex flex-wrap gap-3">
              {destination.keyActivities.map((activity, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-secondary/10 text-primary rounded-lg text-sm font-medium"
                >
                  {activity}
                </span>
              ))}
            </div>
          </div>

          {/* Detailed Information */}
          {destination.details && (
            <div className="mb-8">
              <h6 className="mb-4">About This Destination</h6>
              <div className="prose prose-gray max-w-none">
                {destination.details.split("\n\n").map((paragraph, index) => (
                  <p
                    key={index}
                    className="text-foreground-secondary leading-relaxed mb-4"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
            <button onClick={handleSelectForPlanning} className="btn-3d-primary">
              Let's Plan This Thing
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
