import { useState, useCallback } from 'react';
import { 
  AITripPlanningRequest 
} from '../services/aiTripPlanningService';
import {
  ParallelChunkingState,
  ChunkedResponse,
  EnhancedTravelPlan
} from '../types/travel';

interface ParallelPlanningHook {
  state: ParallelChunkingState;
  generatePlan: (request: AITripPlanningRequest) => Promise<void>;
  reset: () => void;
}

const initialState: ParallelChunkingState = {
  isLoading: false,
  completedChunks: 0,
  totalChunks: 0,
  chunks: {},
  chunkStatuses: {},
  combinedData: null,
  error: null
};

// Define chunk configuration matching the backend
const CHUNK_DEFINITIONS = [
  { id: 1, section: 'locations', weight: 0.3, tab: 'info' },      // Neighborhoods, hotels, restaurants, bars -> Info tab
  { id: 2, section: 'attractions', weight: 0.25, tab: 'info' },     // Places to visit, local food -> Info tab  
  { id: 3, section: 'practical', weight: 0.25, tab: 'practical' }, // Practical info -> Practical tab
  { id: 4, section: 'cultural', weight: 0.2, tab: 'itinerary' }    // Activities, itinerary -> Itinerary tab
];

export function useParallelTripPlanning(): ParallelPlanningHook {
  const [state, setState] = useState<ParallelChunkingState>(initialState);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);


  const generatePlan = useCallback(async (request: AITripPlanningRequest) => {
    try {
      setState(prev => ({ 
        ...prev, 
        isLoading: true, 
        error: null,
        completedChunks: 0,
        chunks: {},
        chunkStatuses: {},
        combinedData: null
      }));

      // Initialize state for chunked processing
      setState(prev => ({ 
        ...prev,
        totalChunks: CHUNK_DEFINITIONS.length,
        chunkStatuses: Object.fromEntries(
          CHUNK_DEFINITIONS.map(chunk => [chunk.id, 'pending' as const])
        )
      }));

      console.log('[Parallel Planning] Starting parallel chunks...');

      // Initialize chunked session
      const sessionResponse = await fetch('/api/ai/trip-planning/chunked', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (!sessionResponse.ok) {
        throw new Error('Failed to initialize chunked session');
      }

      // Step 3: Start all chunks in parallel with retries
      const chunkPromises = CHUNK_DEFINITIONS.map(async (chunkDef) => {
        const maxRetries = 2;
        let retryCount = 0;
        
        const attemptChunk = async (): Promise<ChunkedResponse> => {
          try {
            // Update status to loading
            setState(prev => ({
              ...prev,
              chunkStatuses: { ...prev.chunkStatuses, [chunkDef.id]: 'loading' }
            }));

            // Add timeout to chunk requests - reduced to 50s for better UX
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
              console.warn(`Chunk ${chunkDef.id} request timed out after 50s`);
              controller.abort();
            }, 50000);

            try {
              const chunkResponse = await fetch(
                `/api/ai/trip-planning/chunked?chunk=${chunkDef.id}`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(request),
                  signal: controller.signal
                }
              );

              // Clear timeout on successful response
              clearTimeout(timeoutId);
              
              if (!chunkResponse.ok) {
                // Handle different HTTP error codes
                if (chunkResponse.status >= 500) {
                  throw new Error(`Server error for chunk ${chunkDef.id}`);
                } else if (chunkResponse.status === 429) {
                  throw new Error(`Rate limited for chunk ${chunkDef.id}`);
                } else {
                  throw new Error(`Failed to get chunk ${chunkDef.id}: ${chunkResponse.statusText}`);
                }
              }

              const chunkData: ChunkedResponse = await chunkResponse.json();
              return chunkData;
            } catch (error) {
              // Ensure timeout is always cleared
              clearTimeout(timeoutId);
              throw error;
            }
          } catch (error) {
            retryCount++;
            console.warn(`[Parallel Planning] Chunk ${chunkDef.id} attempt ${retryCount} failed:`, error);
            
            if (retryCount < maxRetries && !controller?.signal.aborted) {
              // Exponential backoff: wait 2^retryCount seconds
              const delay = Math.pow(2, retryCount) * 1000;
              console.log(`[Parallel Planning] Retrying chunk ${chunkDef.id} in ${delay}ms`);
              await new Promise(resolve => setTimeout(resolve, delay));
              return attemptChunk();
            }
            
            throw error;
          }
        };

        try {
          const chunkData = await attemptChunk();
          
          // Update state with completed chunk
          setState(prev => {
            const newChunkStatuses = { ...prev.chunkStatuses, [chunkDef.id]: 'completed' as const };
            const newChunks = { ...prev.chunks, [chunkDef.id]: chunkData.data };
            const newCompletedChunks = prev.completedChunks + 1;

            console.log(`[Parallel Planning] Chunk ${chunkDef.id} (${chunkDef.section}) completed after ${retryCount + 1} attempts`);

            // Check if enough chunks are completed for a usable plan
            const completedChunkCount = Object.values(newChunkStatuses).filter(status => status === 'completed').length;
            const isMinimumViable = completedChunkCount >= 2; // At least 2 chunks for a basic plan
            const isFullyComplete = completedChunkCount === CHUNK_DEFINITIONS.length;

            if (isFullyComplete || (isMinimumViable && Object.values(newChunkStatuses).every(status => status !== 'loading'))) {
              // Combine all completed chunks
              const combinedData = Object.entries(newChunks)
                .filter(([_, chunkData]) => chunkData)
                .reduce((acc, [_, chunkData]) => {
                  return { ...acc, ...chunkData };
                }, { destination: request.destination }) as EnhancedTravelPlan;

              console.log(`[Parallel Planning] ${isFullyComplete ? 'All' : 'Minimum viable'} chunks completed, combining data`);

              return {
                ...prev,
                chunks: newChunks,
                chunkStatuses: newChunkStatuses,
                completedChunks: newCompletedChunks,
                combinedData,
                isLoading: false
              };
            }

            return {
              ...prev,
              chunks: newChunks,
              chunkStatuses: newChunkStatuses,
              completedChunks: newCompletedChunks
            };
          });

          return chunkData;
        } catch (error) {
          console.error(`[Parallel Planning] Chunk ${chunkDef.id} failed after ${maxRetries + 1} attempts:`, error);
          
          setState(prev => ({
            ...prev,
            chunkStatuses: { ...prev.chunkStatuses, [chunkDef.id]: 'error' }
          }));
          
          return null; // Return null instead of throwing to allow other chunks to continue
        }
      });

      // Wait for all chunks with graceful degradation
      const results = await Promise.allSettled(chunkPromises);
      const successfulChunks = results.filter(result => result.status === 'fulfilled' && result.value !== null);
      const failedChunks = results.filter(result => result.status === 'rejected' || result.value === null);
      
      if (successfulChunks.length === 0) {
        throw new Error('No chunks loaded successfully. Please check your connection and try again.');
      }

      if (failedChunks.length > 0) {
        console.warn(`[Parallel Planning] ${failedChunks.length}/${CHUNK_DEFINITIONS.length} chunks failed, continuing with partial data`);
        
        // If we have at least some chunks, ensure we complete the process
        setState(prev => {
          if (!prev.combinedData && prev.completedChunks > 0) {
            const combinedData = Object.entries(prev.chunks)
              .filter(([_, chunkData]) => chunkData)
              .reduce((acc, [_, chunkData]) => {
                return { ...acc, ...chunkData };
              }, { destination: request.destination }) as EnhancedTravelPlan;

            return {
              ...prev,
              combinedData,
              isLoading: false
            };
          }
          return prev;
        });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      console.error('[Parallel Planning] Failed:', error);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
    }
  }, []);

  return {
    state,
    generatePlan,
    reset
  };
}

// Helper hook to provide backwards compatibility with existing components
export function useAdaptiveParallelPlanning(): ParallelPlanningHook & {
  generateChunkedPlan: (request: AITripPlanningRequest) => Promise<void>;
} {
  const parallelHook = useParallelTripPlanning();
  
  return {
    ...parallelHook,
    generateChunkedPlan: parallelHook.generatePlan // Alias for backwards compatibility
  };
}