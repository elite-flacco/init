import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader, 
  CheckCircle, 
  AlertCircle, 
  Zap,
  Eye,
  FileText 
} from 'lucide-react';
import { ChunkStreamingState } from '../hooks/useStreamingTripPlanning';

interface StreamingPlanContentProps {
  chunkId: number;
  chunkState: ChunkStreamingState;
  title: string;
  description: string;
  icon: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export function StreamingPlanContent({
  chunkId,
  chunkState,
  title,
  description,
  icon,
  isExpanded = false,
  onToggleExpand
}: StreamingPlanContentProps) {
  const [showRawContent, setShowRawContent] = useState(false);
  const [typewriterText, setTypewriterText] = useState('');
  
  // Typewriter effect for streaming content
  useEffect(() => {
    if (chunkState.isStreaming && chunkState.accumulatedContent) {
      const targetText = chunkState.accumulatedContent;
      const currentLength = typewriterText.length;
      
      if (currentLength < targetText.length) {
        const timeout = setTimeout(() => {
          setTypewriterText(targetText.slice(0, currentLength + Math.min(5, targetText.length - currentLength)));
        }, 50);
        
        return () => clearTimeout(timeout);
      }
    }
  }, [chunkState.accumulatedContent, chunkState.isStreaming, typewriterText]);

  const getStatusIcon = () => {
    if (chunkState.error) {
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
    if (chunkState.finalData) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    if (chunkState.isStreaming) {
      return <Loader className="w-5 h-5 text-blue-500 animate-spin" />;
    }
    return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />;
  };

  const getStatusColor = () => {
    if (chunkState.error) return 'border-red-200 bg-red-50';
    if (chunkState.finalData) return 'border-green-200 bg-green-50';
    if (chunkState.isStreaming) return 'border-blue-200 bg-blue-50';
    return 'border-gray-200 bg-gray-50';
  };

  const renderPartialData = () => {
    if (!chunkState.partialData) return null;

    // Render partial structured data based on chunk type
    switch (chunkId) {
      case 1: // Basics
        return renderBasicsPartial(chunkState.partialData);
      case 2: // Dining
        return renderDiningPartial(chunkState.partialData);
      case 3: // Practical
        return renderPracticalPartial(chunkState.partialData);
      case 4: // Cultural
        return renderCulturalPartial(chunkState.partialData);
      default:
        return null;
    }
  };

  const renderBasicsPartial = (data: any) => (
    <div className="space-y-3">
      {data.placesToVisit && data.placesToVisit.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
            <span className="mr-2">🏛️</span>
            Places to Visit ({data.placesToVisit.length} loaded)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {data.placesToVisit.slice(0, isExpanded ? undefined : 3).map((place: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-3 border border-gray-200 rounded-lg bg-white"
              >
                <h5 className="font-medium text-gray-900">{place.name}</h5>
                <p className="text-sm text-gray-600">{place.category}</p>
                {place.description && (
                  <p className="text-xs text-gray-500 mt-1">{place.description.slice(0, 100)}...</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
      
      {data.neighborhoods && data.neighborhoods.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
            <span className="mr-2">🏘️</span>
            Neighborhoods ({data.neighborhoods.length} loaded)
          </h4>
          <div className="space-y-2">
            {data.neighborhoods.slice(0, isExpanded ? undefined : 2).map((neighborhood: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-2 bg-blue-50 rounded-lg"
              >
                <span className="font-medium text-gray-900">{neighborhood.name}</span>
                {neighborhood.bestFor && (
                  <span className="text-sm text-gray-600 ml-2">- {neighborhood.bestFor}</span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderDiningPartial = (data: any) => (
    <div className="space-y-3">
      {data.restaurants && data.restaurants.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
            <span className="mr-2">🍽️</span>
            Restaurants ({data.restaurants.length} loaded)
          </h4>
          <div className="space-y-2">
            {data.restaurants.slice(0, isExpanded ? undefined : 3).map((restaurant: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-3 border border-gray-200 rounded-lg bg-white"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-medium text-gray-900">{restaurant.name}</h5>
                    <p className="text-sm text-gray-600">{restaurant.cuisine} • {restaurant.priceRange}</p>
                  </div>
                  {restaurant.neighborhood && (
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {restaurant.neighborhood}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
      
      {data.mustTryFood && data.mustTryFood.items && data.mustTryFood.items.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
            <span className="mr-2">🥟</span>
            Must-Try Foods ({data.mustTryFood.items.length} loaded)
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {data.mustTryFood.items.slice(0, isExpanded ? undefined : 4).map((food: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="p-2 bg-green-50 rounded-lg text-center"
              >
                <span className="text-sm font-medium text-gray-900">{food.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderPracticalPartial = (data: any) => (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {data.weatherInfo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 bg-blue-50 rounded-lg"
          >
            <h4 className="font-semibold text-gray-900 mb-1 flex items-center">
              <span className="mr-2">🌤️</span>Weather
            </h4>
            <p className="text-sm text-gray-700">{data.weatherInfo.conditions}</p>
            {data.weatherInfo.temperature && (
              <p className="text-xs text-gray-600">{data.weatherInfo.temperature}</p>
            )}
          </motion.div>
        )}
        
        {data.localCurrency && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 bg-green-50 rounded-lg"
          >
            <h4 className="font-semibold text-gray-900 mb-1 flex items-center">
              <span className="mr-2">💰</span>Currency
            </h4>
            <p className="text-sm text-gray-700">{data.localCurrency.currency}</p>
            <p className="text-xs text-gray-600">
              {data.localCurrency.cashNeeded ? 'Cash needed' : 'Cards accepted'}
            </p>
          </motion.div>
        )}
      </div>
      
      {data.safetyTips && data.safetyTips.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
            <span className="mr-2">🛡️</span>
            Safety Tips ({data.safetyTips.length} loaded)
          </h4>
          <div className="space-y-1">
            {data.safetyTips.slice(0, isExpanded ? undefined : 3).map((tip: string, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-start"
              >
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-2 mt-2"></div>
                <span className="text-sm text-gray-700">{tip}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderCulturalPartial = (data: any) => (
    <div className="space-y-3">
      {data.activities && data.activities.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
            <span className="mr-2">🎭</span>
            Activities ({data.activities.length} loaded)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {data.activities.slice(0, isExpanded ? undefined : 4).map((activity: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-3 border border-gray-200 rounded-lg bg-white"
              >
                <h5 className="font-medium text-gray-900">{activity.name}</h5>
                <p className="text-xs text-gray-600">{activity.type} • {activity.duration}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
      
      {data.itinerary && data.itinerary.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
            <span className="mr-2">📅</span>
            Daily Itinerary ({data.itinerary.length} days loaded)
          </h4>
          <div className="space-y-2">
            {data.itinerary.slice(0, isExpanded ? undefined : 3).map((day: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-2 bg-purple-50 rounded-lg"
              >
                <span className="font-medium text-gray-900">Day {day.day}: {day.title}</span>
                {day.activities && (
                  <p className="text-xs text-gray-600 mt-1">{day.activities.length} activities planned</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`rounded-lg border-2 transition-all duration-200 ${getStatusColor()}`}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <span className="text-2xl mr-3">{icon}</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                {title}
                {chunkState.isStreaming && (
                  <Zap className="w-4 h-4 text-blue-500 ml-2 animate-pulse" />
                )}
              </h3>
              <div className="flex items-center mt-1">
                {getStatusIcon()}
                <span className="ml-2 text-sm text-gray-600">
                  {chunkState.error ? 'Failed to load' :
                   chunkState.finalData ? 'Complete' :
                   chunkState.isStreaming ? `Streaming... ${chunkState.progress}%` :
                   'Waiting to start'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {chunkState.isStreaming && (
              <button
                onClick={() => setShowRawContent(!showRawContent)}
                className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                title="Toggle raw content view"
              >
                {showRawContent ? <Eye className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
              </button>
            )}
            
            {onToggleExpand && (
              <button
                onClick={onToggleExpand}
                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
              >
                {isExpanded ? 'Show Less' : 'Show More'}
              </button>
            )}
          </div>
        </div>

        {/* Progress bar for streaming */}
        {chunkState.isStreaming && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-1">
              <motion.div
                className="bg-blue-600 h-1 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${chunkState.progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="space-y-4">
          {/* Show error */}
          {chunkState.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{chunkState.error}</p>
            </div>
          )}

          {/* Show streaming content */}
          <AnimatePresence>
            {showRawContent && chunkState.isStreaming && typewriterText && (
              <motion.div
                key="raw-content"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-gray-900 text-green-400 text-xs font-mono p-3 rounded-lg overflow-hidden"
              >
                <div className="whitespace-pre-wrap break-words max-h-40 overflow-y-auto">
                  {typewriterText}
                  <span className="animate-pulse">|</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Show partial structured data */}
          {!showRawContent && chunkState.partialData && (
            <div>
              <div className="flex items-center mb-2">
                <Zap className="w-4 h-4 text-blue-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Live Preview</span>
              </div>
              {renderPartialData()}
            </div>
          )}

          {/* Show final data */}
          {chunkState.finalData && (
            <div>
              <div className="flex items-center mb-2">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Final Content</span>
              </div>
              {renderPartialData()}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}