import { TravelerType } from '../types/travel';

export const travelerTypes: TravelerType[] = [
  {
    id: 'explorer',
    name: 'Explorer',
    description: 'I’m down for whatever - just show me all the cool stuff and I’ll have a blast.',
    icon: '🎢',
    showPlaceholder: false,
  },
  {
    id: 'type-a',
    name: 'Type A',
    description: 'I have spreadsheets for my spreadsheets. Every minute planned, every detail covered.',
    icon: '📋',
    showPlaceholder: true,
    placeholderMessage: 'We\'re deep in the spreadsheets building this feature. For now, keep rocking yours.',
    greeting: 'Hello Type A friend!'
  },
  {
    id: 'overthinker',
    name: 'Typical Overthinker',
    description: 'I’ve got 51 tabs open, and still not sure where to stay.',
    icon: '🧠',
    showPlaceholder: true,
    placeholderMessage: 'We are overthinking on how to help you beat the analysis paralysis - stay tuned.',
    greeting: 'Hey overthinker, we see you.'
  },
  {
    id: 'chill',
    name: 'Just Here to Chill',
    description: 'Beach, spa, nap, repeat. My biggest decision should be piña colada or mojito.',
    icon: '🌴',
    showPlaceholder: true,
    placeholderMessage: 'We aren\'t slacking off at the beach - chill mode support is coming soon. In the meantime, Netflix and Chill.',
    greeting: 'Hello chill soul.'
  }
];