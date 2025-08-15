import {
  Destination,
  TripPreferences,
  TravelerType,
  DestinationKnowledge,
  PickDestinationPreferences,
  EnhancedTravelPlan as ImportedEnhancedTravelPlan,
} from "../types/travel";
import { StreamingTripPlanningState } from '../hooks/useStreamingTripPlanning';

export interface AITripPlanningRequest {
  destination: Destination;
  preferences: TripPreferences;
  travelerType: TravelerType;
  destinationKnowledge?: DestinationKnowledge | null;
  pickDestinationPreferences?: PickDestinationPreferences | null;
}

export interface AITripPlanningResponse {
  plan: ImportedEnhancedTravelPlan;
  reasoning: string;
  confidence: number;
  personalizations: string[];
  // Optional streaming state for real-time plan building
  streamingState?: StreamingTripPlanningState;
  streamingHooks?: {
    generateStreamingPlan: (request: AITripPlanningRequest) => Promise<void>;
    retryChunk: (chunkId: number, request: AITripPlanningRequest) => Promise<void>;
    streamingRequest?: AITripPlanningRequest;
  };
}

export interface ChunkedTripPlanningResponse {
  sessionId: string;
  chunks: {
    id: number;
    section: string;
    description: string;
  }[];
  totalChunks: number;
}

class AITripPlanningService {
  async generateTravelPlan(
    request: AITripPlanningRequest,
  ): Promise<AITripPlanningResponse> {
    // Always use chunked approach for better UX
    return this.generateChunkedTravelPlan(request);
  }

  async initializeChunkedTravelPlan(
    request: AITripPlanningRequest,
  ): Promise<ChunkedTripPlanningResponse> {
    try {
      const response = await fetch("/api/ai/trip-planning/chunked", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Failed to initialize chunked session: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error("Failed to initialize chunked travel plan");
    }
  }

  async getChunk(
    request: AITripPlanningRequest,
    chunkId: number,
    sessionId: string,
  ): Promise<{
    chunk: {
      chunkId: number;
      totalChunks: number;
      section: string;
      description: string;
    };
    data: Record<string, unknown>;
    isComplete: boolean;
    sessionId: string;
  }> {
    try {
      const response = await fetch(
        `/api/ai/trip-planning/chunked?chunk=${chunkId}&sessionId=${sessionId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get chunk ${chunkId}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error(`Failed to get chunk ${chunkId}`);
    }
  }

  async generateChunkedTravelPlan(
    request: AITripPlanningRequest
  ): Promise<AITripPlanningResponse> {
    try {
      // Initialize chunked session
      const session = await this.initializeChunkedTravelPlan(request);
      
      let combinedData: Record<string, unknown> = {};
      // Removed unused totalChunks variable
      
      // Request each chunk
      for (let i = 0; i < session.chunks.length; i++) {
        const chunk = session.chunks[i];
        
        const chunkResponse = await this.getChunk(request, chunk.id, session.sessionId);
        
        // Merge chunk data
        combinedData = { ...combinedData, ...chunkResponse.data };

        // If complete, use the combined data from the API
        if (chunkResponse.isComplete && chunkResponse.data.destination) {
          combinedData = chunkResponse.data;
          break;
        }
      }

      // Ensure destination is included
      if (!combinedData.destination) {
        combinedData.destination = request.destination;
      }

      // Return in standard format
      return {
        plan: combinedData as unknown as ImportedEnhancedTravelPlan,
        reasoning: "AI-generated travel plan created using chunked processing",
        confidence: 0.9,
        personalizations: [
          `Customized for ${request.travelerType.name} traveler type`,
          `Tailored to ${request.preferences.budget} budget`,
          `Optimized for ${request.preferences.duration} trip duration`,
        ],
      };
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error("Failed to generate chunked travel plan");
    }
  }
}

export const aiTripPlanningService = new AITripPlanningService();
