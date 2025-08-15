interface PixabayImage {
  id: number;
  pageURL: string;
  type: string;
  tags: string;
  previewURL: string;
  webformatURL: string;
  largeImageURL: string;
  fullHDURL?: string;
  imageWidth: number;
  imageHeight: number;
  imageSize: number;
  views: number;
  downloads: number;
  likes: number;
  user: string;
}

interface PixabaySearchResponse {
  total: number;
  totalHits: number;
  hits: PixabayImage[];
}

class PixabayService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://pixabay.com/api/';

  constructor() {
    this.apiKey = process.env.PIXABAY_API_KEY || '';
    
    if (!this.apiKey && process.env.NODE_ENV === 'production') {
      console.warn('Pixabay API key not configured. Using fallback images.');
    }
  }

  async searchDestinationImage(destinationName: string, country?: string): Promise<string> {
    if (!this.apiKey) {
      return this.getFallbackImage();
    }

    try {
      const query = country ? `${destinationName} ${country}` : destinationName;
      const searchQuery = `${query} travel destination landmark`;
      const url = `${this.baseUrl}?key=${this.apiKey}&q=${encodeURIComponent(searchQuery)}&image_type=photo&orientation=horizontal&category=travel&min_width=800&min_height=600&per_page=3&safesearch=true`;
      
      const response = await fetch(url, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Pixabay API error: ${response.status}`);
      }

      const data: PixabaySearchResponse = await response.json();
      
      if (data.hits.length > 0) {
        const image = data.hits[0];
        // Use webformatURL as it's more reliable for browser display
        return image.webformatURL;
      }
      
      return this.getFallbackImage();
    } catch (error) {
      console.error('Error fetching image from Pixabay:', error);
      return this.getFallbackImage();
    }
  }

  async getDestinationImages(destinationName: string, country?: string, count: number = 3): Promise<string[]> {
    if (!this.apiKey) {
      return Array(count).fill(this.getFallbackImage());
    }

    try {
      const query = country ? `${destinationName} ${country}` : destinationName;
      const searchQuery = `${query} travel destination landmark`;
      
      const response = await fetch(
        `${this.baseUrl}?key=${this.apiKey}&q=${encodeURIComponent(searchQuery)}&image_type=photo&orientation=horizontal&category=travel&min_width=800&min_height=600&per_page=${Math.max(count, 3)}&safesearch=true`,
        {
          method: 'GET',
        }
      );

      if (!response.ok) {
        throw new Error(`Pixabay API error: ${response.status}`);
      }

      const data: PixabaySearchResponse = await response.json();
      
      const images = data.hits.slice(0, count).map(image => 
        image.webformatURL
      );
      
      // Fill remaining slots with fallback if needed
      while (images.length < count) {
        images.push(this.getFallbackImage());
      }
      
      return images;
    } catch (error) {
      console.error('Error fetching images from Pixabay:', error);
      return Array(count).fill(this.getFallbackImage());
    }
  }

  private getFallbackImage(): string {
    // Use a default Pexels travel image as fallback
    return "https://images.pexels.com/photos/2161449/pexels-photo-2161449.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop";
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

export const pixabayService = new PixabayService();