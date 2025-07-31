import React, { useState } from 'react'
import { MapPin, Search } from 'lucide-react'
import { TravelerType } from '../types/travel'

interface DestinationInputComponentProps {
  travelerType: TravelerType
  onSubmit: (destination: string) => void
}

export function DestinationInputComponent({ travelerType, onSubmit }: DestinationInputComponentProps) {
  const [destination, setDestination] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!destination.trim()) {
      setError('Please enter a destination')
      return
    }
    
    if (destination.length < 2) {
      setError('Please enter a valid destination')
      return
    }
    
    onSubmit(destination.trim())
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDestination(e.target.value)
    if (error) setError('')
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-6">
          <MapPin className="w-8 h-8 text-primary" />
        </div>
        
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Where are you planning to go?
        </h1>
        
        <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">
          {travelerType.name === 'YOLO' && "Let's plan an epic adventure! "}
          {travelerType.name === 'Type A' && "Perfect! Let's get your itinerary organized. "}
          {travelerType.name === 'Boogey' && "Great! We'll make sure you're well-prepared. "}
          {travelerType.name === 'Chill' && "Awesome! Let's plan something relaxing. "}
          Tell us your dream destination and we'll create the perfect travel plan for you.
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={destination}
              onChange={handleInputChange}
              placeholder="e.g. Tokyo, Paris, New York, Bali..."
              className={`block w-full pl-10 pr-3 py-4 border rounded-lg text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                error 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-300 bg-white hover:border-gray-400'
              }`}
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!destination.trim()}
            className="w-full bg-primary text-white py-4 px-6 rounded-lg text-lg font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Planning
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-foreground-secondary">
            💡 Tip: Be as specific as you like! You can enter a city, country, or even a specific area like "Tokyo, Japan" or "Tuscany, Italy"
          </p>
        </div>
      </div>
    </div>
  )
}