import React, { useState, useEffect } from "react";
import { MapPin, Search } from "lucide-react";
import { TravelerType } from "../types/travel";

interface DestinationInputComponentProps {
  travelerType: TravelerType;
  onSubmit: (destination: string) => void;
}

export function DestinationInputComponent({
  travelerType,
  onSubmit,
}: DestinationInputComponentProps) {
  const [destination, setDestination] = useState("");
  const [error, setError] = useState("");
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsAnimated(true), 200);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!destination.trim()) {
      setError("Come on, give us something to work with!");
      return;
    }

    if (destination.length < 2) {
      setError(
        'That\'s a bit too short - try something like "Paris" or "Tokyo"',
      );
      return;
    }

    onSubmit(destination.trim());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDestination(e.target.value);
    if (error) setError("");
  };

  // Adventure-themed messaging based on traveler type
  const getExpeditionMessage = () => {
    const messages = {
      Explorer: "Time to chart unknown territories! Where shall we venture?",
      "Type A":
        "Perfect planning starts with the perfect destination. Where's your target?",
      "Typical Overthinker":
        "Stop overthinking - just tell us where your heart wants to go!",
      "Just Here to Chill":
        "Let's find your paradise. What destination calls to your soul?",
    };
    return (
      messages[travelerType.name as keyof typeof messages] ||
      "Where shall we begin this adventure?"
    );
  };

  const getExpeditionSubtext = () => {
    const subtexts = {
      Explorer: "🗺️ We'll uncover hidden gems and secret spots just for you.",
      "Type A": "📋 Every detail will be perfectly organized and optimized.",
      "Typical Overthinker":
        "🧠 We'll make all the tough choices so you can just enjoy.",
      "Just Here to Chill":
        "🌊 Pure relaxation mode activated - stress-free planning ahead.",
    };
    return (
      subtexts[travelerType.name as keyof typeof subtexts] ||
      "✨ Your perfect adventure awaits."
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-soft to-background-muted relative overflow-hidden">
      {/* Adventure Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-12 text-4xl opacity-10 animate-float">
          🧭
        </div>
        <div
          className="absolute top-32 right-16 text-3xl opacity-15 animate-pulse-slow"
          style={{ animationDelay: "1s" }}
        >
          📍
        </div>
        <div
          className="absolute bottom-32 left-20 text-5xl opacity-10 animate-bounce-subtle"
          style={{ animationDelay: "2s" }}
        >
          🗺️
        </div>
        <div
          className="absolute bottom-20 right-32 text-4xl opacity-20 animate-float"
          style={{ animationDelay: "0.5s" }}
        >
          ✈️
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10 flex items-center min-h-screen">
        <div className="w-full max-w-4xl mx-auto">
          {/* Expedition Header */}
          <div
            className={`text-center mb-16 transition-all duration-1000 ${
              isAnimated
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-12"
            }`}
          >
            {/* Adventure Icon */}
            <div className="inline-flex items-center justify-center mb-8">
              <div className="relative">
                <div className="bg-gradient-to-br from-primary to-secondary p-6 rounded-full shadow-glow animate-glow-pulse">
                  <MapPin className="w-10 h-10 text-white" />
                </div>
                <div
                  className="absolute -top-2 -right-2 text-2xl animate-bounce-subtle"
                  style={{ animationDelay: "1s" }}
                >
                  🎯
                </div>
              </div>
            </div>

            {/* Expedition Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-8 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent leading-tight">
              Plot Your Course
            </h1>

            {/* Personalized Adventure Message */}
            <div className="max-w-3xl mx-auto space-y-4">
              <p className="text-xl md:text-2xl text-foreground-secondary leading-relaxed font-semibold">
                {getExpeditionMessage()}
              </p>
              <p className="text-lg md:text-xl text-foreground-muted leading-relaxed">
                {getExpeditionSubtext()}
              </p>
            </div>
          </div>

          {/* Expedition Planning Interface */}
          <div
            className={`max-w-2xl mx-auto transition-all duration-1000 delay-300 ${
              isAnimated
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            {/* Adventure Form Card */}
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 rounded-3xl blur-xl opacity-50 animate-glow-pulse"></div>

              <div className="relative bg-gradient-to-br from-background/95 to-background-card/90 backdrop-blur-xl border-2 border-border/50 rounded-3xl shadow-adventure-float p-8 lg:p-12">
                {/* Expedition Pattern */}
                <div className="absolute top-4 right-4 text-xl opacity-20 animate-spin-slow">
                  🧭
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Destination Input */}
                  <div className="relative">
                    <label className="block text-lg font-semibold text-foreground mb-4">
                      🌍 Destination Command Center
                    </label>

                    <div className="relative">
                      <input
                        type="text"
                        value={destination}
                        onChange={handleInputChange}
                        placeholder="Tokyo ramen district, Santorini sunset spots, Bali rice terraces..."
                        className={`w-full px-6 py-4 text-lg bg-background/80 backdrop-blur-sm border-2 rounded-xl shadow-card transition-all duration-300 focus:ring-2 focus:ring-primary/30 focus:border-primary focus:shadow-card-hover focus:bg-background ${
                          error
                            ? "border-red-300 bg-red-50/80"
                            : "border-border hover:border-border-secondary"
                        }`}
                        autoFocus
                      />

                      {/* Search Icon */}
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <Search className="w-6 h-6 text-foreground-muted" />
                      </div>
                    </div>

                    {error && (
                      <div className="mt-3 p-3 bg-red-50/80 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600 font-medium">
                          {error}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Launch Button */}
                  <button
                    type="submit"
                    disabled={!destination.trim()}
                    className="w-full group relative overflow-hidden bg-gradient-to-r from-primary to-secondary text-white font-bold py-4 px-8 rounded-xl shadow-glow hover:shadow-glow-lg transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0"
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      <span className="mr-3">🚀 Launch Expedition</span>
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center transform group-hover:translate-x-2 transition-transform duration-300">
                        <span className="text-sm">→</span>
                      </div>
                    </span>

                    {/* Button Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                  </button>
                </form>

                {/* Asymmetrical Exploration Tips */}
                <div className="mt-10 ml-8 lg:ml-16 mr-4 p-6 bg-gradient-to-br from-accent/10 via-transparent to-primary/10 border border-primary/20 rounded-2xl transform -rotate-1">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <span className="text-2xl">💡</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        Explorer's Pro Tips:
                      </h4>
                      <ul className="space-y-1 text-sm text-foreground-secondary">
                        <li>
                          • Be specific: "Kyoto bamboo forest" &gt; "Japan"
                        </li>
                        <li>
                          • Include your vibe: "Buenos Aires tango districts"
                        </li>
                        <li>
                          • Mix known + unknown: "Iceland + surprise Nordic
                          spot"
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
