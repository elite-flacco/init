import { useState, useCallback, useRef } from 'react';
import { flushSync } from 'react-dom';
import { 
  AITripPlanningRequest 
} from '../services/aiTripPlanningService';
import {
  TravelPlanManifest,
  EnhancedTravelPlan
} from '../types/travel';

interface StreamingEvent {
  type: 'start' | 'content_delta' | 'complete' | 'error';
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
  accumulatedContent: string;
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
  accumulatedContent: '',
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
  { id: 1, section: 'basics', weight: 0.3, tab: 'info' },      // Places, hotels -> Info tab
  { id: 2, section: 'dining', weight: 0.25, tab: 'info' },     // Restaurants, bars -> Info tab  
  { id: 3, section: 'practical', weight: 0.25, tab: 'practical' }, // Practical info -> Practical tab
  { id: 4, section: 'cultural', weight: 0.2, tab: 'itinerary' }    // Activities, itinerary -> Itinerary tab
];

export function useStreamingTripPlanning(): StreamingPlanningHook {
  const [state, setState] = useState<StreamingTripPlanningState>(initialState);
  const abortControllersRef = useRef<Record<number, AbortController>>({});
  const completedDataRef = useRef<Record<number, any>>({});

  const reset = useCallback(() => {
    // Abort any active fetch requests
    Object.values(abortControllersRef.current).forEach(controller => {
      controller.abort();
    });
    abortControllersRef.current = {};
    
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
        if (abortControllersRef.current[chunkId]) {
          abortControllersRef.current[chunkId].abort();
        }

        // Create abort controller for this request
        const controller = new AbortController();
        abortControllersRef.current[chunkId] = controller;

        // Use EventSource like the working example
        const streamChunk = async () => {
          const url = `/api/ai/trip-planning/stream?chunk=${chunkId}&sessionId=${sessionId}`;
        
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
            console.log(`[EventSource Style] Chunk ${chunkId} stream ended`);
            break;
          }
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const eventDataStr = line.slice(6);
              
              if (eventDataStr === '[DONE]') {
                console.log(`[EventSource Style] Chunk ${chunkId} received [DONE] signal`);
                continue;
              }
              
              try {
                const eventData: StreamingEvent = JSON.parse(eventDataStr);
                
                // Handle events like the working example - simple and direct
                if (eventData.type === 'start') {
                  setState(prev => ({
                    ...prev,
                    chunks: {
                      ...prev.chunks,
                      [chunkId]: {
                        ...prev.chunks[chunkId],
                        hasStarted: true,
                        isStreaming: true
                      }
                    }
                  }));
                }
                
                else if (eventData.type === 'content_delta' && eventData.accumulated) {
                  setState(prev => ({
                    ...prev,
                    chunks: {
                      ...prev.chunks,
                      [chunkId]: {
                        ...prev.chunks[chunkId],
                        accumulatedContent: eventData.accumulated || '',
                        progress: Math.min((eventData.accumulated?.length || 0) / 4000 * 100, 95)
                      }
                    }
                  }));
                }
                
                else if (eventData.type === 'complete') {
                  console.log(`[EventSource Style] Chunk ${chunkId} completing with data:`, !!eventData.data);
                  console.log(`[EventSource Style] About to call setState for chunk ${chunkId} completion`);
                  
                  setState(prev => {
                    console.log(`[EventSource Style] INSIDE setState callback for chunk ${chunkId} completion!`);
                    console.log(`[EventSource Style] Current completedChunks before update:`, prev.completedChunks);
                    
                    const updatedChunks = {
                      ...prev.chunks,
                      [chunkId]: {
                        ...prev.chunks[chunkId],
                        finalData: eventData.data,
                        isStreaming: false,
                        progress: 100
                      }
                    };
                    
                    const completedCount = Object.values(updatedChunks).filter(chunk => chunk.finalData !== null).length;
                    
                    console.log(`[EventSource Style] Setting completedChunks to ${completedCount}, isLoading to ${completedCount < 4}`);
                    
                    const newState = {
                      ...prev,
                      chunks: updatedChunks,
                      completedChunks: completedCount,
                      isLoading: completedCount < 4,
                      overallProgress: Math.round((completedCount / 4) * 100)
                    };
                    
                    console.log(`[EventSource Style] Returning new state for chunk ${chunkId}:`, {
                      completedChunks: newState.completedChunks,
                      isLoading: newState.isLoading,
                      totalChunks: Object.keys(newState.chunks).length
                    });
                    
                    console.log(`[EventSource Style] Final state chunks:`, Object.fromEntries(
                      Object.entries(newState.chunks).map(([id, chunk]) => [
                        id, 
                        { hasFinalData: !!chunk.finalData, isStreaming: chunk.isStreaming, progress: chunk.progress }
                      ])
                    ));
                    
                    return newState;
                  });
                  
                  console.log(`[EventSource Style] setState call completed for chunk ${chunkId}`);
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
        
          console.log(`[EventSource Style] Chunk ${chunkId} processing completed, resolving`);
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