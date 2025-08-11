import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, Loader, AlertCircle, Zap } from 'lucide-react';

interface ChunkProgress {
  id: number;
  section: string;
  status: 'pending' | 'loading' | 'completed' | 'error';
  startTime?: number;
  completionTime?: number;
  estimatedDuration: number;
}

interface RealTimeProgressIndicatorProps {
  chunkStatuses: Record<number, 'pending' | 'loading' | 'completed' | 'error'>;
  totalChunks: number;
  completedChunks: number;
  isManifestLoaded: boolean;
  manifestLoadTime?: number;
}

const CHUNK_DEFINITIONS = [
  { id: 1, section: 'Places & Hotels', estimatedDuration: 45, icon: '🏛️' },
  { id: 2, section: 'Food & Dining', estimatedDuration: 40, icon: '🍜' },
  { id: 3, section: 'Practical Info', estimatedDuration: 35, icon: '🧭' },
  { id: 4, section: 'Culture & Itinerary', estimatedDuration: 50, icon: '📅' },
];

export function RealTimeProgressIndicator({
  chunkStatuses,
  totalChunks,
  completedChunks,
  isManifestLoaded,
  manifestLoadTime
}: RealTimeProgressIndicatorProps) {
  const [chunkTimes, setChunkTimes] = useState<Record<number, { startTime: number; duration?: number }>>({});
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update current time every second for live timers
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Track chunk timing
  useEffect(() => {
    Object.entries(chunkStatuses).forEach(([chunkId, status]) => {
      const id = parseInt(chunkId);
      
      setChunkTimes(prev => {
        const currentChunk = prev[id];
        const previousStatus = currentChunk?.startTime ? 'loading' : 'pending';
        
        if (status === 'loading' && previousStatus === 'pending') {
          return {
            ...prev,
            [id]: { startTime: Date.now() }
          };
        } else if ((status === 'completed' || status === 'error') && currentChunk?.startTime && !currentChunk.duration) {
          return {
            ...prev,
            [id]: {
              ...currentChunk,
              duration: Date.now() - currentChunk.startTime
            }
          };
        }
        
        return prev; // No changes needed
      });
    });
  }, [chunkStatuses]); // Remove chunkTimes from dependencies

  const getElapsedTime = (chunkId: number): number => {
    const chunkTime = chunkTimes[chunkId];
    if (!chunkTime?.startTime) return 0;
    if (chunkTime.duration) return chunkTime.duration;
    return currentTime - chunkTime.startTime;
  };

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  const getStatusIcon = (status: string, chunkId: number) => {
    const elapsed = getElapsedTime(chunkId);
    const isOverdue = status === 'loading' && elapsed > (CHUNK_DEFINITIONS.find(c => c.id === chunkId)?.estimatedDuration || 45) * 1000;
    
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'loading':
        return (
          <div className="relative">
            <Loader className={`w-4 h-4 animate-spin ${isOverdue ? 'text-orange-500' : 'text-blue-500'}`} />
            {isOverdue && (
              <div className="absolute -top-1 -right-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              </div>
            )}
          </div>
        );
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getProgressPercentage = (): number => {
    const manifestWeight = 0.1; // 10% for manifest
    const chunkWeight = 0.9; // 90% for chunks
    
    let progress = isManifestLoaded ? manifestWeight : 0;
    progress += (completedChunks / totalChunks) * chunkWeight;
    
    return Math.round(progress * 100);
  };

  const getEstimatedTimeRemaining = (): string => {
    const pendingChunks = Object.entries(chunkStatuses).filter(([_, status]) => status === 'pending').length;
    const loadingChunks = Object.entries(chunkStatuses).filter(([_, status]) => status === 'loading').length;
    
    if (pendingChunks === 0 && loadingChunks === 0) return '0s';
    
    // Estimate based on average completion time of completed chunks
    const completedChunkTimes = Object.values(chunkTimes)
      .filter(time => time.duration)
      .map(time => time.duration!);
    
    const avgTime = completedChunkTimes.length > 0 
      ? completedChunkTimes.reduce((sum, time) => sum + time, 0) / completedChunkTimes.length
      : 45000; // Default 45s
    
    const estimatedMs = (pendingChunks * avgTime) + (loadingChunks * avgTime * 0.5);
    return formatDuration(estimatedMs);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-4 border border-gray-100"
    >
      {/* Header with overall progress */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Zap className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Live Progress</h3>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{getProgressPercentage()}%</div>
          <div className="text-xs text-gray-500">ETA: {getEstimatedTimeRemaining()}</div>
        </div>
      </div>

      {/* Overall progress bar */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${getProgressPercentage()}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Manifest status */}
      <div className={`flex items-center justify-between p-3 rounded-lg mb-3 ${
        isManifestLoaded ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
      }`}>
        <div className="flex items-center">
          <div className="text-lg mr-3">📋</div>
          <div>
            <div className="font-medium text-gray-900">Travel Manifest</div>
            <div className="text-xs text-gray-600">Quick overview & structure</div>
          </div>
        </div>
        <div className="flex items-center">
          {isManifestLoaded && manifestLoadTime && (
            <span className="text-xs text-green-600 mr-2">
              {formatDuration(manifestLoadTime)}
            </span>
          )}
          {isManifestLoaded ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <Loader className="w-4 h-4 text-blue-500 animate-spin" />
          )}
        </div>
      </div>

      {/* Chunk progress */}
      <div className="space-y-2">
        {CHUNK_DEFINITIONS.map((chunk) => {
          const status = chunkStatuses[chunk.id] || 'pending';
          const elapsed = getElapsedTime(chunk.id);
          const isOverdue = status === 'loading' && elapsed > chunk.estimatedDuration * 1000;
          
          return (
            <motion.div
              key={chunk.id}
              initial={{ opacity: 0.7 }}
              animate={{ 
                opacity: 1,
                scale: status === 'loading' ? 1.02 : 1
              }}
              transition={{ duration: 0.2 }}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                status === 'completed' ? 'bg-green-50 border-green-200' :
                status === 'loading' ? (isOverdue ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200') :
                status === 'error' ? 'bg-red-50 border-red-200' :
                'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center">
                <div className="text-lg mr-3">{chunk.icon}</div>
                <div>
                  <div className="font-medium text-gray-900">{chunk.section}</div>
                  <div className="text-xs text-gray-600">
                    {status === 'loading' && (
                      <span className={isOverdue ? 'text-orange-600' : 'text-blue-600'}>
                        Loading... {formatDuration(elapsed)}
                        {isOverdue && ' (taking longer than expected)'}
                      </span>
                    )}
                    {status === 'completed' && elapsed > 0 && (
                      <span className="text-green-600">
                        Completed in {formatDuration(elapsed)}
                      </span>
                    )}
                    {status === 'error' && (
                      <span className="text-red-600">Failed to load</span>
                    )}
                    {status === 'pending' && (
                      <span className="text-gray-500">
                        Waiting to start (~{chunk.estimatedDuration}s)
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center">
                {getStatusIcon(status, chunk.id)}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Performance indicator */}
      <AnimatePresence>
        {completedChunks > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-700">
                ⚡ Parallel Processing Active
              </span>
              <span className="text-blue-600 font-medium">
                {completedChunks}/{totalChunks} sections done
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}