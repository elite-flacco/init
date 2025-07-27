import { TravelerType } from '../types/travel';

export const travelerTypes: TravelerType[] = [
  {
    id: 'explorer',
    name: 'Explorer',
    description: 'I’m down for whatever, just point me in a direction. Show me cool stuff and I’ll roll with it.',
    icon: '🎢',
    showPlaceholder: false
  },
  {
    id: 'type-a',
    name: 'Type A',
    description: 'I have spreadsheets for my spreadsheets. Every minute planned, every detail covered.',
    icon: '📋',
    showPlaceholder: true,
    placeholderMessage: 'We can\'t help you (yet), go back to your spreadsheets for now.'
  },
  {
    id: 'bougie',
    name: 'Spender',
    description: 'I’m here to live it up — 5-star stays, fine dining, and first-class vibes',
    icon: '🤑',
    showPlaceholder: true,
    placeholderMessage: 'Luxury awaits! But we can\'t help you (yet). You can hire someone else to plan it for you since you have got the money.'
  },
  {
    id: 'chill',
    name: 'Chiller',
    description: 'Beach, spa, nap, repeat. My biggest decision should be piña colada or mojito.',
    icon: '🌴',
    showPlaceholder: true,
    placeholderMessage: 'We can\'t help you (yet), you can netflix and chill at home for now.'
  }
];