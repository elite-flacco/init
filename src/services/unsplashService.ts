interface UnsplashPhoto {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string | null;
  user: {
    name: string;
    username: string;
  };
  links: {
    html: string;
  };
}

interface UnsplashSearchResponse {
  total: number;
  total_pages: number;
  results: UnsplashPhoto[];
}

class UnsplashService {
  private readonly accessKey: string;
  private readonly baseUrl = "https://api.unsplash.com";

  constructor() {
    this.accessKey = process.env.UNSPLASH_ACCESS_KEY || "";

    if (!this.accessKey && process.env.NODE_ENV === "production") {
      console.warn("Unsplash API key not configured. Using fallback images.");
    }
  }

  async searchDestinationImage(
    destinationName: string,
    country?: string,
  ): Promise<string> {
    if (!this.accessKey) {
      return this.getFallbackImage(destinationName);
    }

    try {
      const query = country ? `${destinationName} ${country}` : destinationName;
      const searchQuery = `${query} travel destination landmark`;

      const response = await fetch(
        `${this.baseUrl}/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=1&orientation=landscape`,
        {
          headers: {
            Authorization: `Client-ID ${this.accessKey}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`);
      }

      const data: UnsplashSearchResponse = await response.json();

      if (data.results.length > 0) {
        const photo = data.results[0];
        return `${photo.urls.regular}&w=800&h=600&fit=crop`;
      }

      return this.getFallbackImage(destinationName);
    } catch (error) {
      console.error("Error fetching image from Unsplash:", error);
      return this.getFallbackImage(destinationName);
    }
  }

  async getDestinationImages(
    destinationName: string,
    country?: string,
    count: number = 3,
  ): Promise<string[]> {
    if (!this.accessKey) {
      return Array(count).fill(this.getFallbackImage(destinationName));
    }

    try {
      const query = country ? `${destinationName} ${country}` : destinationName;
      const searchQuery = `${query} travel destination landmark`;

      const response = await fetch(
        `${this.baseUrl}/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=${count}&orientation=landscape`,
        {
          headers: {
            Authorization: `Client-ID ${this.accessKey}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`);
      }

      const data: UnsplashSearchResponse = await response.json();

      const images = data.results.map(
        (photo) => `${photo.urls.regular}&w=800&h=600&fit=crop`,
      );

      // Fill remaining slots with fallback if needed
      while (images.length < count) {
        images.push(this.getFallbackImage(destinationName));
      }

      return images;
    } catch (error) {
      console.error("Error fetching images from Unsplash:", error);
      return Array(count).fill(this.getFallbackImage(destinationName));
    }
  }

  private getFallbackImage(destinationName: string): string {
    // Use Pexels as fallback with a search query
    const searchTerm = encodeURIComponent(destinationName.toLowerCase());
    return `https://images.pexels.com/photos/2161449/pexels-photo-2161449.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop&text=${searchTerm}`;
  }

  isConfigured(): boolean {
    return !!this.accessKey;
  }
}

export const unsplashService = new UnsplashService();
