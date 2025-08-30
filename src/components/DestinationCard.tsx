import React, { useState } from "react";
import Image from "next/image";
import {
  Calendar,
  DollarSign,
  ArrowRight,
  Search,
  Heart,
  Loader2,
} from "lucide-react";
import { Destination } from "../types/travel";
import { MapPinIcon3D } from "./ui/Icon3D";
import { useDestinationImage } from "../hooks/useDestinationImage";
import { useAuth } from "../contexts/AuthContext";
import { makeAuthenticatedRequest } from "../lib/auth";

interface DestinationCardProps {
  destination: Destination;
  onViewDetails: (destination: Destination) => void;
}

export function DestinationCard({
  destination,
  onViewDetails,
}: DestinationCardProps) {
  const { user } = useAuth();
  const { imageUrl } = useDestinationImage({
    destination: destination.name,
    country: destination.country,
    count: 1,
  });

  const [isHovered, setIsHovered] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveDestination = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!user) {
      alert("Please sign in to save destinations.");
      return;
    }

    if (isSaved) {
      return; // Already saved
    }

    setIsSaving(true);

    try {
      const response = await makeAuthenticatedRequest(
        "/api/user/destinations",
        {
          method: "POST",
          body: JSON.stringify({
            destination,
            notes: `Saved from destination recommendations - ${destination.matchReason}`,
          }),
        },
      );

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
      setTimeout(() => {
        // Could show a toast or other feedback here
      }, 1000);
    } catch (error) {
      console.error("Error saving destination:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to save destination. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const displayImage = imageUrl || destination.image;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group h-full"
    >
      <div className="card-3d-destination h-full overflow-hidden">
        {/* Hero Image Section */}
        <div className="relative h-72 overflow-hidden">
          <Image
            src={displayImage}
            alt={destination.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700 z-0"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              console.error("Image failed to load:", target.src);
              if (target.src !== destination.image) {
                target.src = destination.image;
              }
            }}
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent z-10 pointer-events-none" />

          {/* Country Badge */}
          <div className="absolute top-6 left-6 z-20 pointer-events-none">
            <div className="glass px-3 py-1 rounded-full text-sm text-white font-semibold depth-light flex items-center">
              <div>
                <MapPinIcon3D size="2xs" />
              </div>
              {destination.country}
            </div>
          </div>

          {/* Save Button */}
          {user && (
            <div className="absolute top-6 right-6 z-30">
              <button
                onClick={handleSaveDestination}
                disabled={isSaving || isSaved}
                className={`glass p-2 rounded-full transition-all duration-300 hover:scale-110 disabled:cursor-not-allowed ${
                  isSaved
                    ? "bg-red-500/20 text-red-500"
                    : "text-white hover:bg-white/20"
                }`}
                title={isSaved ? "Destination saved!" : "Save destination"}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Heart
                    className={`w-4 h-4 transition-all duration-300 ${
                      isSaved ? "fill-current text-red-500" : ""
                    }`}
                  />
                )}
              </button>
            </div>
          )}

          {/* Destination Title */}
          <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none">
            <h3 className="text-3d-title text-2xl md:text-3xl text-white mb-2">
              {destination.name}
            </h3>
            <div
              className={`overflow-hidden transition-all duration-500 ${isHovered ? "max-h-20 opacity-100" : "max-h-0 opacity-0"}`}
            >
              <p className="text-white/90 text-sm font-medium">
                {destination.description.split(".")[0]}...
              </p>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-6">
          {/* Key Info */}
          <div className="flex flex-col gap-2 sm:gap-4 mb-2 sm:mb-4">
            <div className="card-3d-soft p-4">
              <div className="flex items-center mb-2">
                <span className="text-sm font-semibold text-secondary">
                  📅 Best Time
                </span>
              </div>
              <p className="text-sm text-foreground font-medium">
                {destination.bestTimeToVisit}
              </p>
            </div>

            <div className="card-3d-soft p-4">
              <div className="flex items-center mb-2">
                <span className="text-sm font-semibold text-secondary">
                  💰 Cost
                </span>
              </div>
              <p className="text-sm text-foreground font-medium">
                {destination.estimatedCost}
              </p>
            </div>
          </div>

          {/* Highlights */}
          <div className="mb-8">
            <h6 className="text-3d-title mb-3">Highlights</h6>
            <div className="flex flex-wrap gap-2">
              {destination.highlights.slice(0, 3).map((highlight, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(
                      `https://www.google.com/search?q=${encodeURIComponent(highlight.name + " " + destination.name + " " + destination.country)}`,
                      "_blank",
                    );
                  }}
                  className="badge-secondary group flex items-center justify-start gap-1.5 rounded-lg hover:bg-secondary/20 transition-all duration-200"
                  title={`Search Google for ${highlight.name} in ${destination.name}`}
                >
                  <span className="text-left text-xs font-semibold text-secondary">
                    {highlight.name}
                  </span>
                  <Search className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity duration-200" />
                </button>
              ))}
              {destination.highlights.length > 3 && (
                <span className="badge text-foreground-muted bg-foreground-muted/10 border border-foreground-muted/30">
                  +{destination.highlights.length - 3} more
                </span>
              )}
            </div>
          </div>

          {/* Activities */}
          <div className="mb-8">
            <h6 className="text-3d-title mb-3">Adventure Awaits</h6>
            <div className="flex flex-wrap gap-2">
              {destination.keyActivities.slice(0, 2).map((activity, index) => (
                <span key={index} className="badge-primary rounded-lg">
                  {activity}
                </span>
              ))}
              {destination.keyActivities.length > 2 && (
                <span className="badge text-foreground-muted bg-foreground-muted/10 border border-foreground-muted/30 rounded-lg">
                  +{destination.keyActivities.length - 2} more
                </span>
              )}
            </div>
          </div>

          {/* Match Reason */}
          <div className="mb-8">
            <h6 className="text-3d-title mb-2">Perfect For You</h6>
            <p className="text-sm text-foreground-secondary font-medium leading-relaxed">
              {destination.matchReason}
            </p>
          </div>

          {/* CTA Button */}
          <button
            className="btn-3d-primary w-full"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(destination);
            }}
          >
            <span className="flex items-center justify-center gap-2 text-white">
              🚀 Explore This
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
