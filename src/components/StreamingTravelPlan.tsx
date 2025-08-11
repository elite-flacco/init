import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, RefreshCw, Zap, CheckCircle, Loader } from 'lucide-react';
import { ManifestPreview } from './ManifestPreview';
import { StreamingPlanContent } from './StreamingPlanContent';
import { RealTimeProgressIndicator } from './RealTimeProgressIndicator';
import { StreamingTripPlanningState } from '../hooks/useStreamingTripPlanning';

interface StreamingTravelPlanProps {
  state: StreamingTripPlanningState;
  onRetry?: () => void;
  onRetryChunk?: (chunkId: number) => void;
}

const CHUNK_DEFINITIONS = [
  { id: 1, title: 'Places & Hotels', description: 'Top attractions and accommodations', icon: '🏛️' },
  { id: 2, title: 'Food & Dining', description: 'Restaurants and local cuisine', icon: '🍜' },
  { id: 3, title: 'Practical Info', description: 'Weather, transport, and money', icon: '🧭' },
  { id: 4, title: 'Culture & Itinerary', description: 'Activities and daily plans', icon: '📅' }
];

export function StreamingTravelPlan({ 
  state, 
  onRetry, 
  onRetryChunk 
}: StreamingTravelPlanProps) {
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});

  const toggleSection = (chunkId: number) => {
    setExpandedSections(prev => ({
      ...prev,
      [chunkId]: !prev[chunkId]
    }));
  };

  // Show error state if manifest fails to load
  if (state.error && !state.manifest) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-4xl mx-auto p-6"
      >
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Start Streaming</h2>
          <p className="text-gray-600 mb-6">{state.error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  // Show initial loading state before manifest
  if (!state.manifestLoaded && state.isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-4xl mx-auto p-6"
      >
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <Loader className="w-16 h-16 text-blue-600 animate-spin" />
            <Zap className="w-6 h-6 text-yellow-500 absolute top-2 right-2 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Initializing Streaming Travel Plan</h2>
          <p className="text-gray-600">Setting up real-time plan generation...</p>
          <div className="mt-6 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: '15%' }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">Preparing streaming connections...</p>
        </div>
      </motion.div>
    );
  }

  const hasActiveStreaming = Object.values(state.chunks).some(chunk => chunk.isStreaming);
  const hasErrors = Object.values(state.chunks).some(chunk => chunk.error);
  const allCompleted = state.completedChunks === state.totalChunks;

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* Streaming Progress Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-blue-500"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Zap className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Real-Time Streaming Travel Plan
              </h3>
              <p className="text-sm text-gray-600">
                {hasActiveStreaming 
                  ? 'Live content streaming in progress...' 
                  : allCompleted 
                    ? 'All sections completed!' 
                    : 'Preparing to stream'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{state.overallProgress}%</div>
            <div className="text-xs text-gray-500">
              {state.completedChunks}/{state.totalChunks} sections
            </div>
          </div>
        </div>
        
        {/* Overall progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${state.overallProgress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        
        {/* Live indicators */}
        {hasActiveStreaming && (
          <div className="flex items-center mt-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <span className="text-sm text-blue-600 ml-2">Streaming content in real-time</span>
          </div>
        )}
      </motion.div>

      {/* Manifest Preview */}
      <AnimatePresence>
        {state.manifest && (
          <motion.div
            key="manifest"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ManifestPreview manifest={state.manifest} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Streaming Sections */}
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex items-center justify-between"
        >
          <h2 className="text-2xl font-bold text-gray-900">
            Live Travel Plan Generation
          </h2>
          
          {hasErrors && onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center px-4 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry All
            </button>
          )}
        </motion.div>

        <div className="space-y-3">
          {CHUNK_DEFINITIONS.map((chunkDef, index) => {
            const chunkState = state.chunks[chunkDef.id];
            
            return (
              <motion.div
                key={chunkDef.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <StreamingPlanContent
                  chunkId={chunkDef.id}
                  chunkState={chunkState}
                  title={chunkDef.title}
                  description={chunkDef.description}
                  icon={chunkDef.icon}
                  isExpanded={expandedSections[chunkDef.id]}
                  onToggleExpand={() => toggleSection(chunkDef.id)}
                />
                
                {/* Individual chunk retry button */}
                {chunkState?.error && onRetryChunk && (
                  <div className="mt-2 px-4">
                    <button
                      onClick={() => onRetryChunk(chunkDef.id)}
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Retry this section
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Completion Celebration */}
      <AnimatePresence>
        {allCompleted && state.combinedData && (
          <motion.div
            key="completion"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 text-center border border-green-200"
          >
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="text-xl font-semibold text-green-900 mb-2">
              🎉 Your Streaming Travel Plan is Complete!
            </h3>
            <p className="text-green-700">
              All sections have been streamed and generated with real-time AI processing.
            </p>
            <div className="mt-4 flex items-center justify-center space-x-6 text-sm text-green-600">
              <span>✨ Real-time streaming</span>
              <span>📊 Structured outputs</span>
              <span>🚀 Parallel processing</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Technical Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="bg-gray-50 rounded-lg p-4"
      >
        <details className="cursor-pointer">
          <summary className="text-sm font-medium text-gray-700 mb-2">
            🔧 Streaming Technical Details
          </summary>
          <div className="text-xs text-gray-600 space-y-1 mt-2">
            <p>Session: {state.sessionId}</p>
            <p>Streaming Protocol: Server-Sent Events with OpenAI Streaming API</p>
            <p>Schema Validation: JSON Schema with Structured Outputs</p>
            <p>Progress: {state.overallProgress}% ({state.completedChunks}/{state.totalChunks} sections)</p>
            <p>Active Streams: {Object.values(state.chunks).filter(c => c.isStreaming).length}</p>
            <div className="mt-2">
              <p>Chunk Status:</p>
              {Object.entries(state.chunks).map(([id, chunk]) => (
                <div key={id} className="ml-2 flex items-center justify-between">
                  <span>Chunk {id}:</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    chunk.error ? 'bg-red-100 text-red-700' :
                    chunk.finalData ? 'bg-green-100 text-green-700' :
                    chunk.isStreaming ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {chunk.error ? 'Error' :
                     chunk.finalData ? 'Complete' :
                     chunk.isStreaming ? `Streaming ${chunk.progress}%` :
                     'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </details>
      </motion.div>
    </div>
  );
}