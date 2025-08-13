import { useState, useCallback, useRef } from 'react';
import {
  AITripPlanningRequest
} from '../services/aiTripPlanningService';
import {
  EnhancedTravelPlan
} from '../types/travel';

interface StreamingEvent {
  type: 'start' | 'content_delta' | 'complete' | 'error';
  chunkId?: number;
  delta?: string;
  accumulated?: string;
  data?: any;
  error?: string;
  timestamp: number;
}

export interface ChunkStreamingState {
  isStreaming: boolean;
  hasStarted: boolean;
  accumulatedContent: string;
  finalData: any;
  error: string | null;
}

export interface StreamingTripPlanningState {
  isLoading: boolean;
  chunks: Record<number, ChunkStreamingState>;
  completedChunks: number;
  totalChunks: number;
  combinedData: EnhancedTravelPlan | null;
  error: string | null;
}

interface StreamingPlanningHook {
  state: StreamingTripPlanningState;
  generateStreamingPlan: (request: AITripPlanningRequest) => Promise<void>;
  reset: () => void;
  retryChunk: (chunkId: number, request: AITripPlanningRequest) => Promise<void>;
}

const initialChunkState: ChunkStreamingState = {
  isStreaming: false,
  hasStarted: false,
  accumulatedContent: '',
  finalData: null,
  error: null
};

const initialState: StreamingTripPlanningState = {
  isLoading: false,
  chunks: {},
  completedChunks: 0,
  totalChunks: 4,
  combinedData: null,
  error: null
};

const CHUNK_DEFINITIONS = [
  { id: 1, section: 'locations', weight: 0.3, tab: 'info' },      // Neighborhoods, hotels, restaurants, bars -> Info tab
  { id: 2, section: 'attractions', weight: 0.25, tab: 'info' },     // Places to visit, local food -> Info tab  
  { id: 3, section: 'practical', weight: 0.25, tab: 'practical' }, // Practical info -> Practical tab
  { id: 4, section: 'cultural', weight: 0.2, tab: 'itinerary' }    // Activities, itinerary -> Itinerary tab
];

export function useStreamingTripPlanning(): StreamingPlanningHook {
  const [state, setState] = useState<StreamingTripPlanningState>(initialState);
  const abortControllersRef = useRef<Record<number, AbortController>>({});

  const reset = useCallback(() => {
    // Abort any active fetch requests
    Object.values(abortControllersRef.current).forEach(controller => {
      controller.abort();
    });
    abortControllersRef.current = {};

    setState(initialState);
  }, []);


  const createStreamingConnection = useCallback(
    (chunkId: number, request: AITripPlanningRequest) => {
      return new Promise<void>((resolve, reject) => {
        // Close existing connection for this chunk if any
        if (abortControllersRef.current[chunkId]) {
          abortControllersRef.current[chunkId].abort();
        }

        // Create abort controller for this request
        const controller = new AbortController();
        abortControllersRef.current[chunkId] = controller;

        // Use EventSource like the working example
        const streamChunk = async () => {
          const url = `/api/ai/trip-planning/stream?chunk=${chunkId}`;

          // Initialize chunk state  
          setState(prev => ({
            ...prev,
            chunks: {
              ...prev.chunks,
              [chunkId]: {
                ...initialChunkState,
                isStreaming: true
              }
            }
          }));

          // For POST data, we need to use fetch, but handle events like EventSource
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'text/event-stream',
            },
            body: JSON.stringify(request),
            signal: controller.signal,
          });

          if (!response.ok) {
            throw new Error(`Streaming failed: ${response.statusText}`);
          }

          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error('No response body reader');
          }

          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const eventDataStr = line.slice(6);

                if (eventDataStr === '[DONE]') {
                  continue;
                }

                try {
                  const eventData: StreamingEvent = JSON.parse(eventDataStr);

                  // Handle events like the working example - simple and direct
                  if (eventData.type === 'start') {
                    setState(prev => {
                      return {
                        ...prev,
                        chunks: {
                          ...prev.chunks,
                          [chunkId]: {
                            ...prev.chunks[chunkId],
                            hasStarted: true,
                            isStreaming: true
                          }
                        }
                      };
                    });
                  }

                  else if (eventData.type === 'content_delta' && eventData.accumulated) {
                    setState(prev => {
                      return {
                        ...prev,
                        chunks: {
                          ...prev.chunks,
                          [chunkId]: {
                            ...prev.chunks[chunkId],
                            accumulatedContent: eventData.accumulated || ''
                          }
                        }
                      };
                    });
                  }

                  else if (eventData.type === 'complete') {

                    setState(prev => {
                      try {
                        const updatedChunks = {
                          ...prev.chunks,
                          [chunkId]: {
                            ...prev.chunks[chunkId],
                            finalData: eventData.data,
                            isStreaming: false
                          }
                        };

                        const completedCount = Object.values(updatedChunks).filter(chunk => chunk.finalData !== null).length;


                        // *** CRITICAL FIX: Combine chunk data when we have completed chunks ***
                        let combinedData = prev.combinedData;
                        if (completedCount > 0) {
                          // Combine all completed chunks into a single travel plan
                          const completedChunkData = Object.values(updatedChunks)
                            .filter(chunk => chunk.finalData !== null)
                            .map(chunk => chunk.finalData);

                          if (completedChunkData.length > 0) {
                            combinedData = completedChunkData.reduce((acc, chunkData) => {
                              return { ...acc, ...chunkData };
                            }, {}) as EnhancedTravelPlan;

                          }
                        }

                        const newState = {
                          ...prev,
                          chunks: updatedChunks,
                          completedChunks: completedCount,
                          isLoading: completedCount < 4,
                          combinedData
                        };


                        return newState;
                      } catch (error) {
                        console.error(`[EventSource Style] Error in setState callback for chunk ${chunkId}:`, error);
                        return prev; // Return previous state if error occurs
                      }
                    });

                  }

                  else if (eventData.type === 'error') {
                    setState(prev => ({
                      ...prev,
                      chunks: {
                        ...prev.chunks,
                        [chunkId]: {
                          ...prev.chunks[chunkId],
                          error: eventData.error || 'Unknown streaming error',
                          isStreaming: false
                        }
                      }
                    }));
                  }

                } catch (e) {
                  console.warn('Failed to parse SSE event:', line);
                }
              }
            }
          }

          resolve();
        };

        streamChunk().catch(error => {
          setState(prev => ({
            ...prev,
            chunks: {
              ...prev.chunks,
              [chunkId]: {
                ...prev.chunks[chunkId],
                error: error instanceof Error ? error.message : 'Streaming failed',
                isStreaming: false
              }
            }
          }));
          reject(error);
        });
      });
    },
    []
  );

  const retryChunk = useCallback(
    async (chunkId: number, request: AITripPlanningRequest) => {
      setState(prev => ({
        ...prev,
        chunks: {
          ...prev.chunks,
          [chunkId]: {
            ...initialChunkState
          }
        }
      }));

      await createStreamingConnection(chunkId, request);
    },
    [createStreamingConnection]
  );

  const generateStreamingPlan = useCallback(
    async (request: AITripPlanningRequest) => {
      try {
        reset();

        setState(prev => ({
          ...prev,
          isLoading: true,
          error: null,
          chunks: Object.fromEntries(
            CHUNK_DEFINITIONS.map(chunk => [chunk.id, { ...initialChunkState }])
          )
        }));

        // Start streaming all chunks in parallel
        const streamingPromises = CHUNK_DEFINITIONS.map(chunk =>
          createStreamingConnection(chunk.id, request)
        );

        await Promise.allSettled(streamingPromises);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred';
        console.error('[Streaming Planning] Failed:', error);

        setState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
      }
    },
    [reset, createStreamingConnection]
  );

  return {
    state,
    generateStreamingPlan,
    reset,
    retryChunk
  };
}