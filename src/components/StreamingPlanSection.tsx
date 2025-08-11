import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  Loader, 
  AlertCircle, 
  MapPin, 
  Utensils, 
  Info, 
  Calendar,
  ChevronRight 
} from 'lucide-react';
import { StreamingPlanSection as StreamingSection } from '../types/travel';

interface StreamingSectionProps {
  section: StreamingSection;
  manifest: {
    id: string;
    title: string;
    description: string;
    preview: string[];
    estimatedItems: number;
  };
  chunkStatus: 'pending' | 'loading' | 'completed' | 'error';
  onExpand?: () => void;
  isExpanded?: boolean;
}

const sectionIcons = {
  basics: MapPin,
  dining: Utensils,
  practical: Info,
  cultural: Calendar,
};

export function StreamingPlanSection({ 
  section, 
  manifest, 
  chunkStatus, 
  onExpand,
  isExpanded = false 
}: StreamingSectionProps) {
  const [showContent, setShowContent] = useState(false);
  const IconComponent = sectionIcons[section.id as keyof typeof sectionIcons] || MapPin;

  // Show content when chunk is completed
  useEffect(() => {
    if (chunkStatus === 'completed' && section.data) {
      setShowContent(true);
    }
  }, [chunkStatus, section.data]);

  const getStatusIcon = () => {
    switch (chunkStatus) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'loading':
        return <Loader className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />;
    }
  };

  const getStatusColor = () => {
    switch (chunkStatus) {
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'loading':
        return 'border-blue-200 bg-blue-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const renderPreviewContent = () => {
    if (showContent && section.data) {
      return renderChunkContent();
    }
    
    // Show manifest preview while loading
    return (
      <div className="space-y-2">
        <p className="text-gray-600 text-sm mb-3">{manifest.description}</p>
        <div className="space-y-1">
          {manifest.preview.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: chunkStatus === 'loading' ? [0.5, 0.8, 0.5] : 0.5 }}
              transition={{ 
                duration: chunkStatus === 'loading' ? 2 : 0,
                repeat: chunkStatus === 'loading' ? Infinity : 0
              }}
              className="flex items-center text-sm text-gray-600"
            >
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>
              <span>{item}</span>
            </motion.div>
          ))}
        </div>
        <div className="text-xs text-gray-500 mt-2">
          {chunkStatus === 'loading' ? 'Loading detailed information...' : 
           chunkStatus === 'completed' ? 'Complete!' :
           chunkStatus === 'error' ? 'Failed to load' :
           `~${manifest.estimatedItems} items to load`}
        </div>
      </div>
    );
  };

  const renderChunkContent = () => {
    if (!section.data) return null;

    // Render based on section type
    switch (section.id) {
      case 'basics':
        return renderBasicsContent(section.data);
      case 'dining':
        return renderDiningContent(section.data);
      case 'practical':
        return renderPracticalContent(section.data);
      case 'cultural':
        return renderCulturalContent(section.data);
      default:
        return <div className="text-gray-600">Content loaded successfully</div>;
    }
  };

  const renderBasicsContent = (data: any) => (
    <div className="space-y-4">
      {data.placesToVisit && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Top Places to Visit</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {data.placesToVisit.slice(0, isExpanded ? undefined : 4).map((place: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-3 border border-gray-200 rounded-lg"
              >
                <h5 className="font-medium text-gray-900">{place.name}</h5>
                <p className="text-sm text-gray-600 mt-1">{place.category}</p>
              </motion.div>
            ))}
          </div>
          {!isExpanded && data.placesToVisit.length > 4 && (
            <p className="text-xs text-gray-500 mt-2">+{data.placesToVisit.length - 4} more places</p>
          )}
        </div>
      )}
      
      {data.neighborhoods && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Best Neighborhoods</h4>
          <div className="space-y-2">
            {data.neighborhoods.slice(0, isExpanded ? undefined : 3).map((neighborhood: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-2 bg-gray-50 rounded-lg"
              >
                <span className="font-medium text-gray-900">{neighborhood.name}</span>
                <span className="text-sm text-gray-600 ml-2">- {neighborhood.bestFor}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderDiningContent = (data: any) => (
    <div className="space-y-4">
      {data.restaurants && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Restaurant Recommendations</h4>
          <div className="space-y-3">
            {data.restaurants.slice(0, isExpanded ? undefined : 3).map((restaurant: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-3 border border-gray-200 rounded-lg"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-medium text-gray-900">{restaurant.name}</h5>
                    <p className="text-sm text-gray-600">{restaurant.cuisine} • {restaurant.priceRange}</p>
                  </div>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {restaurant.neighborhood}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
          {!isExpanded && data.restaurants.length > 3 && (
            <p className="text-xs text-gray-500 mt-2">+{data.restaurants.length - 3} more restaurants</p>
          )}
        </div>
      )}
      
      {data.mustTryFood && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Must-Try Local Foods</h4>
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

  const renderPracticalContent = (data: any) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.weatherInfo && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-1">Weather</h4>
            <p className="text-sm text-gray-700">{data.weatherInfo.conditions}</p>
            <p className="text-xs text-gray-600">{data.weatherInfo.temperature}</p>
          </div>
        )}
        
        {data.localCurrency && (
          <div className="p-3 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-1">Currency</h4>
            <p className="text-sm text-gray-700">{data.localCurrency.currency}</p>
            <p className="text-xs text-gray-600">
              {data.localCurrency.cashNeeded ? 'Cash needed' : 'Cards accepted'}
            </p>
          </div>
        )}
      </div>
      
      {data.safetyTips && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Safety Tips</h4>
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

  const renderCulturalContent = (data: any) => (
    <div className="space-y-4">
      {data.activities && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Unique Activities</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.activities.slice(0, isExpanded ? undefined : 4).map((activity: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-3 border border-gray-200 rounded-lg"
              >
                <h5 className="font-medium text-gray-900">{activity.name}</h5>
                <p className="text-xs text-gray-600 mt-1">{activity.type} • {activity.duration}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
      
      {data.itinerary && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Day-by-Day Itinerary</h4>
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
                <p className="text-xs text-gray-600 mt-1">{day.activities.length} activities planned</p>
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
      <div 
        className="p-4 cursor-pointer"
        onClick={onExpand}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <IconComponent className="w-6 h-6 text-gray-700 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{manifest.title}</h3>
              <div className="flex items-center mt-1">
                {getStatusIcon()}
                <span className="ml-2 text-sm text-gray-600">
                  {chunkStatus === 'completed' ? 'Complete' :
                   chunkStatus === 'loading' ? 'Loading...' :
                   chunkStatus === 'error' ? 'Failed to load' :
                   'Waiting to load'}
                </span>
              </div>
            </div>
          </div>
          <ChevronRight 
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              isExpanded ? 'rotate-90' : ''
            }`} 
          />
        </div>

        <AnimatePresence>
          {renderPreviewContent()}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}