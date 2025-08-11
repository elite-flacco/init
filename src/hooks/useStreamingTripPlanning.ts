import { useState, useCallback, useRef } from 'react';
import { 
  AITripPlanningRequest 
} from '../services/aiTripPlanningService';
import {
  TravelPlanManifest,
  EnhancedTravelPlan
} from '../types/travel';

interface StreamingEvent {
  type: 'start' | 'json_start' | 'content_delta' | 'partial_json' | 'complete' | 'error';
  chunkId?: number;
  sessionId?: string;
  delta?: string;
  accumulated?: string;
  data?: any;
  error?: string;
  timestamp: number;
}

export interface ChunkStreamingState {
  isStreaming: boolean;
  hasStarted: boolean;
  hasJsonStarted: boolean;
  accumulatedContent: string;
  partialData: any;
  finalData: any;
  error: string | null;
  progress: number; // 0-100 based on content length
}

export interface StreamingTripPlanningState {
  isLoading: boolean;
  manifest: TravelPlanManifest | null;
  manifestLoaded: boolean;
  chunks: Record<number, ChunkStreamingState>;
  completedChunks: number;
  totalChunks: number;
  combinedData: EnhancedTravelPlan | null;
  error: string | null;
  sessionId: string | null;
  overallProgress: number;
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
  hasJsonStarted: false,
  accumulatedContent: '',
  partialData: null,
  finalData: null,
  error: null,
  progress: 0
};

const initialState: StreamingTripPlanningState = {
  isLoading: false,
  manifest: null,
  manifestLoaded: false,
  chunks: {},
  completedChunks: 0,
  totalChunks: 4,
  combinedData: null,
  error: null,
  sessionId: null,
  overallProgress: 0
};

const CHUNK_DEFINITIONS = [
  { id: 1, section: 'basics', weight: 0.3 },
  { id: 2, section: 'dining', weight: 0.25 },
  { id: 3, section: 'practical', weight: 0.25 },
  { id: 4, section: 'cultural', weight: 0.2 }
];

export function useStreamingTripPlanning(): StreamingPlanningHook {
  const [state, setState] = useState<StreamingTripPlanningState>(initialState);
  const eventSourcesRef = useRef<Record<number, EventSource>>({});

  const reset = useCallback(() => {
    // Close any active EventSource connections
    Object.values(eventSourcesRef.current).forEach(eventSource => {
      eventSource.close();
    });
    eventSourcesRef.current = {};
    
    setState(initialState);
  }, []);

  const calculateOverallProgress = useCallback((chunks: Record<number, ChunkStreamingState>, manifestLoaded: boolean) => {
    const manifestWeight = 0.1;
    let progress = manifestLoaded ? manifestWeight : 0;
    
    CHUNK_DEFINITIONS.forEach(chunk => {
      const chunkState = chunks[chunk.id];
      if (chunkState?.finalData) {
        progress += chunk.weight;
      } else if (chunkState?.isStreaming) {
        // Add partial progress based on content streaming
        progress += chunk.weight * (chunkState.progress / 100);
      }
    });
    
    return Math.round(progress * 100);
  }, []);

  const createStreamingConnection = useCallback(
    (chunkId: number, sessionId: string, request: AITripPlanningRequest) => {
      return new Promise<void>((resolve, reject) => {
        // Close existing connection for this chunk if any
        if (eventSourcesRef.current[chunkId]) {
          eventSourcesRef.current[chunkId].close();
        }

        const eventSource = new EventSource(
          `/api/ai/trip-planning/stream?chunk=${chunkId}&sessionId=${sessionId}`,
          {
            // We'll use POST via fetch instead since EventSource only supports GET
          }
        );

        // Actually, EventSource only supports GET, so let's use fetch with streaming
        const streamChunk = async () => {
          try {
            const response = await fetch(`/api/ai/trip-planning/stream?chunk=${chunkId}&sessionId=${sessionId}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/event-stream',
              },
              body: JSON.stringify(request),
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

            while (true) {
              const { done, value } = await reader.read();
              
              if (done) break;
              
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const eventData: StreamingEvent = JSON.parse(line.slice(6));
                    
                    setState(prev => {
                      const currentChunk = prev.chunks[chunkId] || initialChunkState;
                      let updatedChunk = { ...currentChunk };
                      
                      switch (eventData.type) {
                        case 'start':
                          updatedChunk = {
                            ...updatedChunk,
                            hasStarted: true,
                            isStreaming: true
                          };
                          break;
                          
                        case 'json_start':
                          updatedChunk = {
                            ...updatedChunk,
                            hasJsonStarted: true
                          };
                          break;
                          
                        case 'content_delta':
                          const newAccumulated = eventData.accumulated || '';
                          const progressEstimate = Math.min(
                            (newAccumulated.length / 4000) * 100, 
                            95
                          );
                          
                          updatedChunk = {
                            ...updatedChunk,
                            accumulatedContent: newAccumulated,
                            progress: progressEstimate
                          };
                          break;
                          
                        case 'partial_json':
                          updatedChunk = {
                            ...updatedChunk,
                            partialData: eventData.data,
                            progress: Math.min(updatedChunk.progress + 5, 95)
                          };
                          break;
                          
                        case 'complete':
                          updatedChunk = {
                            ...updatedChunk,
                            finalData: eventData.data,
                            isStreaming: false,
                            progress: 100
                          };
                          break;
                          
                        case 'error':
                          updatedChunk = {
                            ...updatedChunk,
                            error: eventData.error || 'Unknown streaming error',
                            isStreaming: false
                          };
                          break;
                      }
                      
                      const newChunks = {
                        ...prev.chunks,
                        [chunkId]: updatedChunk
                      };
                      
                      const newCompletedChunks = Object.values(newChunks)
                        .filter(chunk => chunk.finalData !== null).length;
                      
                      const newOverallProgress = calculateOverallProgress(newChunks, prev.manifestLoaded);
                      
                      // Check if we should combine data
                      let newCombinedData = prev.combinedData;
                      if (eventData.type === 'complete' && newCompletedChunks === CHUNK_DEFINITIONS.length) {
                        newCombinedData = Object.values(newChunks)
                          .filter(chunk => chunk.finalData)
                          .reduce((acc, chunk) => {
                            return { ...acc, ...chunk.finalData };
                          }, { destination: request.destination }) as EnhancedTravelPlan;
                      }
                      
                      return {
                        ...prev,
                        chunks: newChunks,
                        completedChunks: newCompletedChunks,
                        overallProgress: newOverallProgress,
                        combinedData: newCombinedData,
                        isLoading: newCompletedChunks < CHUNK_DEFINITIONS.length
                      };
                    });
                  } catch (e) {
                    console.warn('Failed to parse SSE event:', line);
                  }
                }
              }
            }
            
            resolve();
          } catch (error) {
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
          }
        };

        streamChunk();
        eventSourcesRef.current[chunkId] = eventSource;
      });
    },
    [calculateOverallProgress]
  );

  const retryChunk = useCallback(
    async (chunkId: number, request: AITripPlanningRequest) => {
      if (!state.sessionId) return;
      
      setState(prev => ({
        ...prev,
        chunks: {
          ...prev.chunks,
          [chunkId]: {
            ...initialChunkState
          }
        }
      }));
      
      await createStreamingConnection(chunkId, state.sessionId, request);
    },
    [state.sessionId, createStreamingConnection]
  );

  const generateStreamingPlan = useCallback(
    async (request: AITripPlanningRequest) => {
      try {
        reset();
        
        setState(prev => ({ 
          ...prev, 
          isLoading: true, 
          error: null
        }));

        // Step 1: Generate manifest quickly
        console.log('[Streaming Planning] Fetching manifest...');
        const manifestResponse = await fetch('/api/ai/trip-planning/manifest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request)
        });

        if (!manifestResponse.ok) {
          throw new Error('Failed to generate travel plan manifest');
        }

        const manifest: TravelPlanManifest = await manifestResponse.json();
        
        setState(prev => ({ 
          ...prev, 
          manifest,
          manifestLoaded: true,
          sessionId: manifest.sessionId,
          chunks: Object.fromEntries(
            CHUNK_DEFINITIONS.map(chunk => [chunk.id, { ...initialChunkState }])
          ),
          overallProgress: calculateOverallProgress({}, true)
        }));

        console.log('[Streaming Planning] Manifest loaded, starting streaming chunks...');

        // Step 2: Start streaming all chunks in parallel
        const streamingPromises = CHUNK_DEFINITIONS.map(chunk =>
          createStreamingConnection(chunk.id, manifest.sessionId, request)
        );

        await Promise.allSettled(streamingPromises);
        
        console.log('[Streaming Planning] All streaming connections completed');

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
    [reset, calculateOverallProgress, createStreamingConnection]
  );

  return {
    state,
    generateStreamingPlan,
    reset,
    retryChunk
  };
}