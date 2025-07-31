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
      setError('Come on, give us something to work with!')
      return
    }
    
    if (destination.length < 2) {
      setError('That\'s a bit too short - try something like "Paris" or "Tokyo"')
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
          Alright, spill the beans - where to?
        </h1>
        
        <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">
          {travelerType.name === 'Explorer' && "Let's plan something unforgettable. "}
          {travelerType.name === 'Type A' && "Perfect! Let's get this trip meticulously planned. "}
          {travelerType.name === 'Typical Overthinker' && "Great choice! We'll handle the details so you can close some tabs. "}
          {travelerType.name === 'Just Here to Chill' && "Excellent! Let's craft the perfect chill escape. "}
          Drop your dream destination here and we'll build you the perfect trip.
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray" />
            </div>
            <input
              type="text"
              value={destination}
              onChange={handleInputChange}
              placeholder="e.g. Tokyo, Paris, Bali, somewhere with great tacos..."
              className={`block w-full pl-4 pr-3 py-4 border rounded-lg text-sm placeholder-gray focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                error 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-300 bg-white hover:border-gray'
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
            className="w-full btn-primary"
          >
            Let's Plan This Trip
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-foreground-secondary">
            💡 Pro tip: Get as specific as you want - "Tokyo ramen district" hits different than just "Japan"
          </p>
        </div>
      </div>
    </div>
  )
}