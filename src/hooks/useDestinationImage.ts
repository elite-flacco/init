import { useState, useEffect } from 'react';

interface UseDestinationImageOptions {
  destination: string;
  country?: string;
  count?: number;
  enabled?: boolean;
}

interface UseDestinationImageResult {
  imageUrl: string | null;
  imageUrls: string[] | null;
  isLoading: boolean;
  error: string | null;
}

interface CacheEntry {
  imageUrl?: string;
  imageUrls?: string[];
  error?: string;
  timestamp: number;
}

// Global cache to store fetched images across all hook instances
const imageCache = new Map<string, CacheEntry>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useDestinationImage({
  destination,
  country,
  count = 1,
  enabled = true
}: UseDestinationImageOptions): UseDestinationImageResult {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !destination) {
      return;
    }

    // Create cache key
    const cacheKey = `${destination}-${country || ''}-${count}`;
    
    // Check if we have cached data
    const cached = imageCache.get(cacheKey);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      // Use cached data
      setIsLoading(false);
      setError(cached.error || null);
      
      if (count === 1) {
        setImageUrl(cached.imageUrl || null);
        setImageUrls(null);
      } else {
        setImageUrls(cached.imageUrls || null);
        setImageUrl(null);
      }
      return;
    }

    const fetchImage = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          destination,
          ...(country && { country }),
          count: count.toString()
        });

        const response = await fetch(`/api/images/destination?${params}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch destination image');
        }

        const data = await response.json();
        
        // Cache the result
        const cacheEntry: CacheEntry = {
          timestamp: now
        };
        
        if (count === 1) {
          cacheEntry.imageUrl = data.imageUrl;
          setImageUrl(data.imageUrl);
          setImageUrls(null);
        } else {
          cacheEntry.imageUrls = data.imageUrls;
          setImageUrls(data.imageUrls);
          setImageUrl(null);
        }
        
        imageCache.set(cacheKey, cacheEntry);
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        
        // Set fallback image on error
        const fallbackImage = `https://images.pexels.com/photos/2161449/pexels-photo-2161449.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop`;
        
        // Cache the error and fallback
        const cacheEntry: CacheEntry = {
          error: errorMessage,
          timestamp: now
        };
        
        if (count === 1) {
          cacheEntry.imageUrl = fallbackImage;
          setImageUrl(fallbackImage);
        } else {
          cacheEntry.imageUrls = Array(count).fill(fallbackImage);
          setImageUrls(Array(count).fill(fallbackImage));
        }
        
        imageCache.set(cacheKey, cacheEntry);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImage();
  }, [destination, country, count, enabled]);

  return {
    imageUrl,
    imageUrls,
    isLoading,
    error
  };
}