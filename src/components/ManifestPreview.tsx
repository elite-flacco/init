import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, DollarSign, Star, Calendar, Users } from 'lucide-react';
import { TravelPlanManifest } from '../types/travel';

interface ManifestPreviewProps {
  manifest: TravelPlanManifest;
  className?: string;
}

export function ManifestPreview({ manifest, className = '' }: ManifestPreviewProps) {
  const { destination, overview, quickRecommendations } = manifest;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white rounded-xl shadow-lg p-6 ${className}`}
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center mb-3">
          <MapPin className="w-6 h-6 text-blue-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900">
            {destination.name}, {destination.country}
          </h1>
        </div>
        <p className="text-gray-600 text-lg">{overview.vibe}</p>
      </div>

      {/* Key Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center p-3 bg-blue-50 rounded-lg">
          <Clock className="w-5 h-5 text-blue-600 mr-3" />
          <div>
            <p className="text-sm text-gray-600">Duration</p>
            <p className="font-semibold text-gray-900">{overview.duration}</p>
          </div>
        </div>
        <div className="flex items-center p-3 bg-green-50 rounded-lg">
          <DollarSign className="w-5 h-5 text-green-600 mr-3" />
          <div>
            <p className="text-sm text-gray-600">Budget</p>
            <p className="font-semibold text-gray-900">{overview.budget}</p>
          </div>
        </div>
        <div className="flex items-center p-3 bg-purple-50 rounded-lg">
          <Users className="w-5 h-5 text-purple-600 mr-3" />
          <div>
            <p className="text-sm text-gray-600">Perfect For</p>
            <p className="font-semibold text-gray-900">{overview.bestFor[0]}</p>
          </div>
        </div>
      </div>

      {/* Highlights */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
          <Star className="w-5 h-5 text-yellow-500 mr-2" />
          Trip Highlights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {overview.highlights.map((highlight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center p-2 bg-gray-50 rounded-lg"
            >
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <span className="text-gray-700">{highlight}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">🏛️ Top Attractions</h4>
          <ul className="space-y-1">
            {quickRecommendations.topAttractions.slice(0, 3).map((attraction, index) => (
              <li key={index} className="text-gray-700 text-sm">• {attraction}</li>
            ))}
          </ul>
          {quickRecommendations.topAttractions.length > 3 && (
            <p className="text-xs text-gray-500 mt-2">
              +{quickRecommendations.topAttractions.length - 3} more attractions
            </p>
          )}
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">🍜 Must-Try Food</h4>
          <ul className="space-y-1">
            {quickRecommendations.mustTryFood.slice(0, 3).map((food, index) => (
              <li key={index} className="text-gray-700 text-sm">• {food}</li>
            ))}
          </ul>
          {quickRecommendations.mustTryFood.length > 3 && (
            <p className="text-xs text-gray-500 mt-2">
              +{quickRecommendations.mustTryFood.length - 3} more dishes
            </p>
          )}
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">🏘️ Best Neighborhoods</h4>
          <ul className="space-y-1">
            {quickRecommendations.neighborhoods.slice(0, 3).map((neighborhood, index) => (
              <li key={index} className="text-gray-700 text-sm">• {neighborhood}</li>
            ))}
          </ul>
          {quickRecommendations.neighborhoods.length > 3 && (
            <p className="text-xs text-gray-500 mt-2">
              +{quickRecommendations.neighborhoods.length - 3} more areas
            </p>
          )}
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">💰 Budget Tips</h4>
          <ul className="space-y-1">
            {quickRecommendations.budgetTips.slice(0, 3).map((tip, index) => (
              <li key={index} className="text-gray-700 text-sm">• {tip}</li>
            ))}
          </ul>
          {quickRecommendations.budgetTips.length > 3 && (
            <p className="text-xs text-gray-500 mt-2">
              +{quickRecommendations.budgetTips.length - 3} more tips
            </p>
          )}
        </div>
      </div>

      {/* Loading Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          <span>Loading detailed recommendations and itinerary...</span>
        </div>
      </div>
    </motion.div>
  );
}