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
        
        if (count === 1) {
          setImageUrl(data.imageUrl);
          setImageUrls(null);
        } else {
          setImageUrls(data.imageUrls);
          setImageUrl(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        // Set fallback image on error
        const fallbackImage = `https://images.pexels.com/photos/2161449/pexels-photo-2161449.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop`;
        if (count === 1) {
          setImageUrl(fallbackImage);
        } else {
          setImageUrls(Array(count).fill(fallbackImage));
        }
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