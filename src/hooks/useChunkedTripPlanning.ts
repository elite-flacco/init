import { useState, useCallback } from 'react';
import { 
  AITripPlanningRequest, 
  AITripPlanningResponse 
} from '../services/aiTripPlanningService';

interface ChunkInfo {
  chunkId: number;
  totalChunks: number;
  section: string;
  description: string;
}

interface ChunkedResponse {
  chunk: ChunkInfo;
  data: Record<string, unknown>;
  isComplete: boolean;
  sessionId: string;
}

interface ChunkedPlanningState {
  isLoading: boolean;
  completedChunks: number;
  totalChunks: number;
  currentSection: string;
  chunks: Record<number, Record<string, unknown>>;
  combinedData: Record<string, unknown> | null;
  error: string | null;
  sessionId: string | null;
}

interface ChunkedPlanningHook {
  state: ChunkedPlanningState;
  generateChunkedPlan: (request: AITripPlanningRequest) => Promise<void>;
  reset: () => void;
}

const initialState: ChunkedPlanningState = {
  isLoading: false,
  completedChunks: 0,
  totalChunks: 0,
  currentSection: '',
  chunks: {},
  combinedData: null,
  error: null,
  sessionId: null
};

export function useChunkedTripPlanning(): ChunkedPlanningHook {
  const [state, setState] = useState<ChunkedPlanningState>(initialState);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  const generateChunkedPlan = useCallback(async (request: AITripPlanningRequest) => {
    try {
      setState(prev => ({ 
        ...prev, 
        isLoading: true, 
        error: null,
        completedChunks: 0,
        chunks: {},
        combinedData: null
      }));

      // First, get session info and chunk list
      const sessionResponse = await fetch('/api/ai/trip-planning/chunked', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (!sessionResponse.ok) {
        throw new Error('Failed to initialize chunked session');
      }

      const sessionData = await sessionResponse.json();
      const { sessionId, chunks: chunkList, totalChunks } = sessionData;

      setState(prev => ({ 
        ...prev, 
        sessionId, 
        totalChunks,
        currentSection: 'Initializing...'
      }));

      // Request each chunk in sequence to show progress
      const chunkResponses: Record<number, Record<string, unknown>> = {};
      
      for (let i = 0; i < chunkList.length; i++) {
        const chunk = chunkList[i];
        
        setState(prev => ({
          ...prev,
          currentSection: chunk.description
        }));

        const chunkResponse = await fetch(
          `/api/ai/trip-planning/chunked?chunk=${chunk.id}&sessionId=${sessionId}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request)
          }
        );

        if (!chunkResponse.ok) {
          throw new Error(`Failed to get chunk ${chunk.id}: ${chunkResponse.statusText}`);
        }

        const chunkData: ChunkedResponse = await chunkResponse.json();
        chunkResponses[chunk.id] = chunkData.data;

        setState(prev => ({
          ...prev,
          chunks: { ...prev.chunks, [chunk.id]: chunkData.data },
          completedChunks: prev.completedChunks + 1
        }));

        // If this is the last chunk and it's complete, get combined data
        if (chunkData.isComplete && chunkData.data.destination) {
          setState(prev => ({
            ...prev,
            combinedData: chunkData.data,
            currentSection: 'Complete!',
            isLoading: false
          }));
          return;
        }
      }

      // Fallback: combine chunks manually if needed
      const combinedData = Object.values(chunkResponses).reduce((acc, chunk) => {
        return { ...acc, ...chunk };
      }, { destination: request.destination });

      setState(prev => ({
        ...prev,
        combinedData,
        currentSection: 'Complete!',
        isLoading: false
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      }));
    }
  }, []);

  return {
    state,
    generateChunkedPlan,
    reset
  };
}

// Helper hook for fallback to regular trip planning when chunking fails
export function useAdaptiveTripPlanning(): ChunkedPlanningHook & {
  generatePlan: (request: AITripPlanningRequest) => Promise<void>;
} {
  const chunkedHook = useChunkedTripPlanning();
  const [regularState, setRegularState] = useState<{
    isLoading: boolean;
    error: string | null;
    result: AITripPlanningResponse | null;
  }>({
    isLoading: false,
    error: null,
    result: null
  });
  
  // Get functions from chunked hook
  const { generateChunkedPlan, reset } = chunkedHook;

  const generatePlan = useCallback(async (request: AITripPlanningRequest) => {
    try {
      // Try regular endpoint first
      setRegularState({ isLoading: true, error: null, result: null });
      
      const response = await fetch('/api/ai/trip-planning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (response.status === 413) {
        // Payload too large, switch to chunked
        const errorData = await response.json();
        console.log('Switching to chunked endpoint:', errorData);
        setRegularState({ isLoading: false, error: null, result: null });
        return generateChunkedPlan(request);
      }

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const data: AITripPlanningResponse = await response.json();
      setRegularState({ isLoading: false, error: null, result: data });

    } catch (error) {
      // Try chunked as fallback
      console.log('Regular endpoint failed, trying chunked:', error);
      return generateChunkedPlan(request);
    }
  }, [generateChunkedPlan]);

  // Return combined state prioritizing chunked data if available
  const combinedState = {
    ...chunkedHook.state,
    isLoading: chunkedHook.state.isLoading || regularState.isLoading,
    error: chunkedHook.state.error || regularState.error,
    combinedData: chunkedHook.state.combinedData || regularState.result?.plan
  };

  return {
    state: combinedState,
    generateChunkedPlan,
    generatePlan,
    reset: () => {
      reset();
      setRegularState({ isLoading: false, error: null, result: null });
    }
  };
}