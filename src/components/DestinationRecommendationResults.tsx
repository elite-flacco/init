import { useState, useEffect } from 'react';
import { Sparkles, ExternalLink, MapPin, ChevronRight, ChevronLeft } from 'lucide-react';
import { PickDestinationPreferences, DestinationRecommendation, Destination } from '../types/travel';
import { Card } from './ui/Card';
import { cn } from '../lib/utils';

interface DestinationRecommendationResultsProps {
  preferences: PickDestinationPreferences;
  onSelect: (destination: Destination) => void;
}

// Sample destination recommendations based on preferences
const generateRecommendations = (): DestinationRecommendation[] => {
  const baseRecommendations: DestinationRecommendation[] = [
    {
      id: 'bali',
      name: 'Bali, Indonesia',
      country: 'Indonesia',
      summary: 'Get ready to fall head-over-heels for Bali! This tropical paradise serves up the perfect cocktail of ancient temples, Instagram-worthy rice terraces, and beaches that\'ll make you question why you ever lived anywhere else. Whether you\'re seeking spiritual enlightenment through yoga, adrenaline through volcano hikes, or just the perfect sunset spot for your evening Bintang, Bali delivers with a side of the warmest smiles you\'ve ever seen.',
      images: [
        'https://images.pexels.com/photos/2161449/pexels-photo-2161449.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/933054/pexels-photo-933054.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      moreInfoLink: 'https://www.indonesia.travel/id/en/destinations/bali-nusa-tenggara/bali',
      highlights: ['Ancient temples', 'Rice terraces', 'Beach paradise', 'Yoga retreats', 'Amazing food scene'],
      bestFor: ['Relaxation', 'Culture', 'Food', 'Instagram spots']
    },
    {
      id: 'japan',
      name: 'Japan',
      country: 'Japan',
      summary: 'Japan is like stepping into a fever dream where ancient traditions high-five futuristic robots, and somehow it all makes perfect sense! From slurping ramen at 2 AM in Tokyo\'s neon-lit streets to finding zen in Kyoto\'s bamboo forests, this country will blow your mind daily. Pro tip: bow to everything, including vending machines (there are more vending machines than people, we\'re pretty sure).',
      images: [
        'https://images.pexels.com/photos/161251/senso-ji-temple-japan-kyoto-landmark-161251.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/2070033/pexels-photo-2070033.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      moreInfoLink: 'https://www.japan.travel/en/',
      highlights: ['Cherry blossoms', 'Ancient temples', 'Modern cities', 'Incredible food', 'Unique culture'],
      bestFor: ['Culture', 'Food', 'History', 'Modern experiences']
    },
    {
      id: 'portugal',
      name: 'Portugal',
      country: 'Portugal',
      summary: 'Portugal is Europe\'s best-kept secret that\'s not really a secret anymore, but shh, let\'s pretend it is! This coastal gem offers everything: dramatic cliffs that\'ll make your heart skip, wine that\'ll make you skip dinner, and pastéis de nata that\'ll make you skip your diet. Plus, everyone speaks English when you butcher Portuguese, and they\'ll still smile and offer you more wine.',
      images: [
        'https://images.pexels.com/photos/2549018/pexels-photo-2549018.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/2154510/pexels-photo-2154510.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      moreInfoLink: 'https://www.visitportugal.com/en',
      highlights: ['Stunning coastline', 'Historic cities', 'Amazing wine', 'Friendly locals', 'Great weather'],
      bestFor: ['Coast lovers', 'Wine enthusiasts', 'History buffs', 'Budget travelers']
    }
  ];

  // In a real app, this would use AI to match preferences to destinations
  return baseRecommendations;
};

export function DestinationRecommendationResults({ 
  preferences, 
  onSelect
}: DestinationRecommendationResultsProps) {
  const [recommendations, setRecommendations] = useState<DestinationRecommendation[]>([]);
  const [isGenerating, setIsGenerating] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  // State for image carousel - moved to top to avoid hook order issues
  const [currentImageIndices, setCurrentImageIndices] = useState<{[key: string]: number}>({});

  useEffect(() => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const recs = generateRecommendations();
      setRecommendations(recs);
      setIsGenerating(false);
      setTimeout(() => setIsLoaded(true), 200);
    }, 2500);
  }, [preferences]);

  // Initialize current image indices - moved to top to avoid hook order issues
  useEffect(() => {
    const indices: {[key: string]: number} = {};
    recommendations.forEach(rec => {
      indices[rec.id] = 0; // Start with first image for each recommendation
    });
    setCurrentImageIndices(indices);
  }, [recommendations]);

  const handleSelectDestination = (recommendation: DestinationRecommendation) => {
    // Convert recommendation to Destination format
    const destination: Destination = {
      id: recommendation.id,
      name: recommendation.name,
      country: recommendation.country,
      description: recommendation.summary.substring(0, 200) + '...',
      image: recommendation.images[0],
      highlights: recommendation.highlights,
      bestTime: 'Year-round',
      budget: '$50-150/day'
    };
    
    onSelect(destination);
  };

  if (isGenerating) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">

        <div className="text-center py-16 md:py-24">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full mb-8 shadow-lg">
            <Sparkles className="w-10 h-10 text-primary animate-pulse" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
            Our AI travel gurus are working their magic...
          </h2>
          <p className="text-foreground-secondary mb-8 max-w-2xl mx-auto text-base md:text-lg">
            Analyzing your preferences and matching you with destinations that'll make your friends jealous 🔥
          </p>
          <div className="flex justify-center">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-primary to-secondary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-3 h-3 bg-gradient-to-r from-primary to-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-3 h-3 bg-gradient-to-r from-primary to-secondary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }


  const handleNextImage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndices(prev => ({
      ...prev,
      [id]: (prev[id] + 1) % (recommendations.find(r => r.id === id)?.images.length || 1)
    }));
  };

  const handlePrevImage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndices(prev => {
      const rec = recommendations.find(r => r.id === id);
      if (!rec) return prev;
      const newIndex = (prev[id] - 1 + rec.images.length) % rec.images.length;
      return {
        ...prev,
        [id]: newIndex
      };
    });
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className={cn(
        'text-center mb-12 transition-all duration-700 ease-out',
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      )}>
        <span className="inline-flex items-center px-4 py-2 rounded-full bg-success/10 text-success text-sm font-medium mb-6">
          🎉 Perfect Matches Found!
        </span>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 md:mb-6 leading-tight">
          Your dream destinations await!
        </h1>
        <p className="text-base md:text-lg text-foreground-secondary max-w-3xl mx-auto leading-relaxed">
          Based on your preferences, we've found {recommendations.length} amazing {recommendations.length === 1 ? 'destination' : 'destinations'} that are practically begging for your visit. Pick your favorite!
        </p>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {recommendations.map((recommendation, index) => {
          const currentImageIndex = currentImageIndices[recommendation.id] || 0;
          const hasMultipleImages = recommendation.images.length > 1;
          
          return (
            <div
              key={recommendation.id}
              className={cn(
                'transition-all duration-700 ease-out',
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              )}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <Card 
                className="h-full overflow-hidden group transition-all duration-300 hover:shadow-lg"
                onClick={() => handleSelectDestination(recommendation)}
              >
                {/* Image Gallery */}
                <div className="relative h-64 overflow-hidden">
                  <div className="relative h-full w-full">
                    <img
                      src={recommendation.images[currentImageIndex]}
                      alt={`${recommendation.name} ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover transition-opacity duration-500"
                      loading="lazy"
                    />
                    
                    {/* Image navigation arrows */}
                    {hasMultipleImages && (
                      <>
                        <button
                          onClick={(e) => handlePrevImage(recommendation.id, e)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={(e) => handleNextImage(recommendation.id, e)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                          aria-label="Next image"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    
                    {/* Image indicator dots */}
                    {hasMultipleImages && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
                        {recommendation.images.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentImageIndices(prev => ({
                                ...prev,
                                [recommendation.id]: idx
                              }));
                            }}
                            className={`w-2 h-2 rounded-full transition-all ${
                              currentImageIndex === idx 
                                ? 'w-6 bg-white' 
                                : 'bg-white/50 hover:bg-white/75'
                            }`}
                            aria-label={`View image ${idx + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  
                  {/* Location and title */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white group-hover:translate-y-[-2px] transition-transform duration-300 line-clamp-1">
                      {recommendation.name}
                    </h3>
                    <div className="flex items-center mt-1">
                      <MapPin className="w-4 h-4 text-white/80 mr-1.5 flex-shrink-0" />
                      <span className="text-sm text-white/90">{recommendation.country}</span>
                    </div>
                  </div>
                  
                  {/* More Info Link */}
                  <a
                    href={recommendation.moreInfoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm p-2 rounded-full hover:bg-white/20 transition-colors duration-200"
                    aria-label={`Learn more about ${recommendation.name}`}
                  >
                    <ExternalLink className="w-4 h-4 text-white" />
                  </a>
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Summary */}
                  <p className="text-foreground-secondary mb-5 leading-relaxed text-sm line-clamp-3">
                    {recommendation.summary}
                  </p>
                  
                  {/* Perfect For */}
                  <div className="space-y-2 mb-5">
                    <h4 className="text-sm font-semibold text-foreground">Perfect for:</h4>
                    <div className="flex flex-wrap gap-2">
                      {recommendation.bestFor.map((item, index) => (
                        <span
                          key={`best-${index}`}
                          className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="space-y-2 mb-5">
                    <h4 className="text-sm font-semibold text-foreground">Highlights:</h4>
                    <div className="flex flex-wrap gap-2">
                      {recommendation.highlights.slice(0, 3).map((highlight, index) => (
                        <span
                          key={`highlight-${index}`}
                          className="px-2.5 py-1 bg-secondary/10 text-secondary rounded-full text-xs font-medium"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Select Button */}
                <div className="px-5 pb-5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectDestination(recommendation);
                    }}
                    className="w-full bg-gradient-to-r from-primary to-secondary text-white py-2.5 rounded-lg font-semibold hover:from-primary-dark hover:to-secondary-dark transition-all duration-300 transform hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    Let's Go Here! 🚀
                  </button>
                </div>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="text-center mt-12">
        <p className="text-sm text-foreground-muted">
          Not feeling these options? Please refresh the page to start over.
        </p>
      </div>
    </div>
  );
}