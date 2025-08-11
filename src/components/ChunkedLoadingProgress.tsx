import React from 'react';

interface ChunkedLoadingProgressProps {
  isLoading: boolean;
  progress: number; // 0-100
  currentSection: string;
  completedChunks: number;
  totalChunks: number;
  error?: string | null;
}

export function ChunkedLoadingProgress({
  isLoading,
  progress,
  currentSection,
  completedChunks,
  totalChunks,
  error
}: ChunkedLoadingProgressProps) {
  if (!isLoading && !error) return null;

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      {error ? (
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Travel Plan
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="text-center">
          {/* Loading Animation */}
          <div className="mb-6">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
              <div 
                className="absolute inset-0 border-4 border-blue-600 rounded-full animate-spin"
                style={{
                  borderRightColor: 'transparent',
                  borderBottomColor: 'transparent',
                }}
              ></div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{currentSection}</span>
              <span>{completedChunks}/{totalChunks} sections</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {progress}% complete
            </div>
          </div>

          {/* Section Status */}
          <div className="space-y-2 mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Creating Your Travel Plan
            </h3>
            <p className="text-gray-600">
              We're generating a comprehensive travel plan tailored to your preferences. 
              This may take a few moments as we create detailed recommendations.
            </p>
          </div>

          {/* Section Progress */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className={`p-3 rounded-lg border ${
              completedChunks >= 1 ? 'bg-green-50 border-green-200 text-green-800' : 
              currentSection.includes('basics') || currentSection.includes('places') || currentSection.includes('neighborhood') 
                ? 'bg-blue-50 border-blue-200 text-blue-800' 
                : 'bg-gray-50 border-gray-200 text-gray-600'
            }`}>
              <div className="flex items-center">
                {completedChunks >= 1 ? (
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <div className="w-4 h-4 mr-2 border-2 border-current rounded-full"></div>
                )}
                <span className="font-medium">Places & Hotels</span>
              </div>
            </div>

            <div className={`p-3 rounded-lg border ${
              completedChunks >= 2 ? 'bg-green-50 border-green-200 text-green-800' : 
              currentSection.includes('dining') || currentSection.includes('restaurant') || currentSection.includes('food')
                ? 'bg-blue-50 border-blue-200 text-blue-800' 
                : 'bg-gray-50 border-gray-200 text-gray-600'
            }`}>
              <div className="flex items-center">
                {completedChunks >= 2 ? (
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <div className="w-4 h-4 mr-2 border-2 border-current rounded-full"></div>
                )}
                <span className="font-medium">Dining & Food</span>
              </div>
            </div>

            <div className={`p-3 rounded-lg border ${
              completedChunks >= 3 ? 'bg-green-50 border-green-200 text-green-800' : 
              currentSection.includes('practical') || currentSection.includes('weather') || currentSection.includes('transport')
                ? 'bg-blue-50 border-blue-200 text-blue-800' 
                : 'bg-gray-50 border-gray-200 text-gray-600'
            }`}>
              <div className="flex items-center">
                {completedChunks >= 3 ? (
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <div className="w-4 h-4 mr-2 border-2 border-current rounded-full"></div>
                )}
                <span className="font-medium">Practical Info</span>
              </div>
            </div>

            <div className={`p-3 rounded-lg border ${
              completedChunks >= 4 ? 'bg-green-50 border-green-200 text-green-800' : 
              currentSection.includes('cultural') || currentSection.includes('itinerary') || currentSection.includes('history')
                ? 'bg-blue-50 border-blue-200 text-blue-800' 
                : 'bg-gray-50 border-gray-200 text-gray-600'
            }`}>
              <div className="flex items-center">
                {completedChunks >= 4 ? (
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <div className="w-4 h-4 mr-2 border-2 border-current rounded-full"></div>
                )}
                <span className="font-medium">Culture & Itinerary</span>
              </div>
            </div>
          </div>

          {/* Time estimate */}
          <div className="mt-6 text-xs text-gray-500">
            Estimated time remaining: {Math.max(1, Math.ceil((100 - progress) / 25))} minute{Math.ceil((100 - progress) / 25) !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
}