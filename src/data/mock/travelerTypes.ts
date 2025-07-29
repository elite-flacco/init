import { TravelerType } from '../../types/travel';

export const travelerTypes: TravelerType[] = [
  {
    id: 'explorer',
    name: 'YOLO Traveler',
    description: 'Spontaneous and adventurous, goes with the flow',
    icon: '🚀',
    showPlaceholder: false
  },
  {
    id: 'adventure',
    name: 'Adventure Seeker',
    description: 'Loves outdoor activities and thrilling experiences',
    icon: '🏔️',
    showPlaceholder: false
  },
  {
    id: 'culture',
    name: 'Culture Explorer',
    description: 'Fascinated by history, art, and local traditions',
    icon: '🏛️',
    showPlaceholder: false
  },
  {
    id: 'relaxation',
    name: 'Relaxation Seeker',
    description: 'Prefers peaceful and rejuvenating experiences',
    icon: '🧘',
    showPlaceholder: false
  }
];

// Convenience lookup object for tests
export const travelerTypesLookup: Record<string, TravelerType> = travelerTypes.reduce((acc, type) => {
  acc[type.id] = type;
  return acc;
}, {} as Record<string, TravelerType>);