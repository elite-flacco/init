import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader, CheckCircle, AlertTriangle } from 'lucide-react';
import { ManifestPreview } from './ManifestPreview';
import { StreamingPlanSection } from './StreamingPlanSection';
import { RealTimeProgressIndicator } from './RealTimeProgressIndicator';
import { PartialPlanFallback } from './PartialPlanFallback';
import { ParallelChunkingState, StreamingPlanSection as StreamingSection } from '../types/travel';

interface ManifestDrivenLoadingProps {
  state: ParallelChunkingState;
  onRetry?: () => void;
  onRetryChunk?: (chunkId: number) => void;
  onContinueWithPartial?: () => void;
}

export function ManifestDrivenLoading({ 
  state, 
  onRetry, 
  onRetryChunk, 
  onContinueWithPartial 
}: ManifestDrivenLoadingProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const createStreamingSections = (): StreamingSection[] => {
    if (!state.manifest) return [];

    return state.manifest.sections.map(manifestSection => ({
      id: manifestSection.id,
      title: manifestSection.title,
      data: state.chunks[parseInt(manifestSection.id)] || null,
      isLoading: state.chunkStatuses[parseInt(manifestSection.id)] === 'loading',
      error: state.chunkStatuses[parseInt(manifestSection.id)] === 'error' ? 'Failed to load section' : null,
      preview: manifestSection.preview
    }));
  };

  const getOverallProgress = () => {
    if (!state.manifestLoaded) return 10; // Manifest is 10% of progress
    return 10 + (state.progress * 0.9); // Chunks are 90% of progress
  };

  const getProgressColor = () => {
    if (state.error) return 'bg-red-500';
    if (state.progress === 100) return 'bg-green-500';
    return 'bg-blue-500';
  };

  // Show error state
  if (state.error && !state.manifest) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-4xl mx-auto p-6"
      >
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Travel Plan</h2>
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
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Creating Your Travel Plan</h2>
          <p className="text-gray-600">Analyzing your preferences and destination...</p>
          <div className="mt-6 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: '10%' }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">Generating travel outline...</p>
        </div>
      </motion.div>
    );
  }

  const streamingSections = createStreamingSections();

  // Check if we should show partial plan fallback
  const hasFailedChunks = Object.values(state.chunkStatuses).some(status => status === 'error');
  const hasCompletedChunks = Object.values(state.chunkStatuses).some(status => status === 'completed');
  const isStillLoading = Object.values(state.chunkStatuses).some(status => status === 'loading');
  const showPartialFallback = hasFailedChunks && hasCompletedChunks && !isStillLoading && !state.combinedData;

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* Real-time Progress Indicator */}
      <RealTimeProgressIndicator
        chunkStatuses={state.chunkStatuses}
        totalChunks={state.totalChunks}
        completedChunks={state.completedChunks}
        isManifestLoaded={state.manifestLoaded}
        manifestLoadTime={state.manifest ? 2500 : undefined} // Mock manifest load time
      />

      {/* Manifest Preview */}
      <AnimatePresence>
        {state.manifest && (
          <ManifestPreview 
            key="manifest"
            manifest={state.manifest} 
          />
        )}
      </AnimatePresence>

      {/* Streaming Sections */}
      <div className="space-y-4">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-2xl font-bold text-gray-900 px-2"
        >
          Detailed Travel Information
        </motion.h2>
        
        <div className="space-y-3">
          {streamingSections.map((section, index) => {
            const manifestSection = state.manifest?.sections.find(s => s.id === section.id);
            if (!manifestSection) return null;

            const chunkId = parseInt(section.id);
            const chunkStatus = state.chunkStatuses[chunkId] || 'pending';

            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <StreamingPlanSection
                  section={section}
                  manifest={manifestSection}
                  chunkStatus={chunkStatus}
                  onExpand={() => toggleSection(section.id)}
                  isExpanded={expandedSections[section.id]}
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Partial Plan Fallback */}
      <AnimatePresence>
        {showPartialFallback && (
          <motion.div
            key="partial-fallback"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <PartialPlanFallback
              state={state}
              onRetryChunk={onRetryChunk}
              onContinueWithPartial={onContinueWithPartial}
              onRetryAll={onRetry}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion Message */}
      <AnimatePresence>
        {state.progress === 100 && state.combinedData && (
          <motion.div
            key="completion"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 text-center border border-green-200"
          >
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="text-xl font-semibold text-green-900 mb-2">
              Your Travel Plan is Ready! 🎉
            </h3>
            <p className="text-green-700">
              All sections have been loaded with personalized recommendations tailored to your preferences.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}