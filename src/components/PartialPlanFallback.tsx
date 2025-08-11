import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { ParallelChunkingState } from '../types/travel';

interface PartialPlanFallbackProps {
  state: ParallelChunkingState;
  onRetryChunk?: (chunkId: number) => void;
  onContinueWithPartial?: () => void;
  onRetryAll?: () => void;
}

const CHUNK_NAMES = {
  1: 'Places & Accommodations',
  2: 'Food & Dining', 
  3: 'Practical Information',
  4: 'Culture & Itinerary'
};

export function PartialPlanFallback({ 
  state, 
  onRetryChunk, 
  onContinueWithPartial, 
  onRetryAll 
}: PartialPlanFallbackProps) {
  const completedChunks = Object.entries(state.chunkStatuses)
    .filter(([_, status]) => status === 'completed')
    .map(([chunkId]) => parseInt(chunkId));
  
  const failedChunks = Object.entries(state.chunkStatuses)
    .filter(([_, status]) => status === 'error')
    .map(([chunkId]) => parseInt(chunkId));

  const hasEnoughData = completedChunks.length >= 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-orange-200"
    >
      <div className="flex items-start">
        <AlertTriangle className="w-6 h-6 text-orange-500 mr-3 mt-1 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Partial Travel Plan Available
          </h3>
          <p className="text-gray-600 mb-4">
            We've successfully loaded {completedChunks.length} out of {Object.keys(state.chunkStatuses).length} sections 
            for your travel plan. {failedChunks.length > 0 ? `${failedChunks.length} sections failed to load.` : ''}
          </p>

          {/* Section Status */}
          <div className="space-y-3 mb-6">
            {Object.entries(CHUNK_NAMES).map(([chunkId, name]) => {
              const id = parseInt(chunkId);
              const status = state.chunkStatuses[id];
              
              return (
                <div key={id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center">
                    {status === 'completed' ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    ) : status === 'error' ? (
                      <XCircle className="w-5 h-5 text-red-500 mr-3" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full mr-3" />
                    )}
                    <span className={`font-medium ${
                      status === 'completed' ? 'text-green-900' :
                      status === 'error' ? 'text-red-900' :
                      'text-gray-600'
                    }`}>
                      {name}
                    </span>
                  </div>
                  
                  {status === 'error' && onRetryChunk && (
                    <button
                      onClick={() => onRetryChunk(id)}
                      className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Retry
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Data Quality Assessment */}
          <div className={`p-4 rounded-lg mb-4 ${
            hasEnoughData ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center mb-2">
              {hasEnoughData ? (
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 mr-2" />
              )}
              <span className={`font-semibold ${hasEnoughData ? 'text-green-900' : 'text-red-900'}`}>
                {hasEnoughData ? 'Usable Travel Plan' : 'Insufficient Data'}
              </span>
            </div>
            <p className={`text-sm ${hasEnoughData ? 'text-green-700' : 'text-red-700'}`}>
              {hasEnoughData 
                ? 'You have enough information to start planning your trip. Missing sections can be added later.'
                : 'We need at least 2 sections to provide a meaningful travel plan. Please retry the failed sections.'
              }
            </p>
          </div>

          {/* What's Available */}
          {hasEnoughData && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">What's included in your plan:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {completedChunks.map(chunkId => (
                  <li key={chunkId} className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {CHUNK_NAMES[chunkId as keyof typeof CHUNK_NAMES]}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {hasEnoughData && onContinueWithPartial && (
              <button
                onClick={onContinueWithPartial}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Continue with Partial Plan
              </button>
            )}
            
            {failedChunks.length > 0 && onRetryAll && (
              <button
                onClick={onRetryAll}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry Failed Sections
              </button>
            )}
          </div>

          {/* Technical Info */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <details className="cursor-pointer">
              <summary className="text-sm font-medium text-gray-700 mb-2">Technical Details</summary>
              <div className="text-xs text-gray-600 space-y-1">
                <p>Completed: {completedChunks.length}/{Object.keys(state.chunkStatuses).length} sections</p>
                <p>Progress: {state.progress}%</p>
                <p>Session ID: {state.sessionId}</p>
                {failedChunks.length > 0 && (
                  <p>Failed chunks: {failedChunks.join(', ')}</p>
                )}
              </div>
            </details>
          </div>
        </div>
      </div>
    </motion.div>
  );
}