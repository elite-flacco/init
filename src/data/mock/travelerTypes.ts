import { TravelerType } from '../../types/travel';

export const travelerTypes: TravelerType[] = [
  {
    id: 'explorer',
    name: 'Explorer',
    description: 'Spontaneous and adventurous, goes with the flow',
    icon: '🚀',
    showPlaceholder: false
  },
  {
    id: 'adventure',
    name: 'Type A',
    description: 'Loves outdoor activities and thrilling experiences',
    icon: '🏔️',
    showPlaceholder: false
  },
  {
    id: 'culture',
    name: 'Typical Overthinker',
    description: 'Fascinated by history, art, and local traditions',
    icon: '🏛️',
    showPlaceholder: false
  },
  {
    id: 'relaxation',
    name: 'Just Here to Chill',
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