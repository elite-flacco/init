"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AITravelPlan } from "../../../src/components/AITravelPlan";
import { TravelerType, Destination } from "../../../src/types/travel";
import { AITripPlanningResponse } from "../../../src/services/aiTripPlanningService";

interface SharedPlanData {
  destination: Destination;
  travelerType: TravelerType;
  aiResponse: AITripPlanningResponse;
}

export default function SharedPlanPage() {
  const params = useParams();
  const shareId = params.id as string;
  const [planData, setPlanData] = useState<SharedPlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedPlan = async () => {
      try {
        const response = await fetch(`/api/shared-plans/${shareId}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError("This shared travel plan could not be found.");
          } else if (response.status === 410) {
            setError("This shared travel plan has expired.");
          } else {
            setError("Failed to load the shared travel plan.");
          }
          return;
        }

        const data = await response.json();
        setPlanData(data);
      } catch {
        setError("Failed to load the shared travel plan.");
      } finally {
        setLoading(false);
      }
    };

    if (shareId) {
      fetchSharedPlan();
    }
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading shared travel plan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">🧳</div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Travel Plan Not Found
          </h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Create Your Own Travel Plan
          </a>
        </div>
      </div>
    );
  }

  if (!planData) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Shared plan banner */}
      <div className="bg-primary/10 border-b border-primary/20 py-3 mb-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-primary font-medium">
                📤 Shared Travel Plan
              </span>
            </div>
            <a
              href="/"
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Create Your Own →
            </a>
          </div>
        </div>
      </div>

      <AITravelPlan
        destination={planData.destination}
        travelerType={planData.travelerType}
        aiResponse={planData.aiResponse}
        onRegeneratePlan={() => {
          // Redirect to home page for plan regeneration
          window.location.href = "/";
        }}
      />
    </div>
  );
}
