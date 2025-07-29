import { Destination } from '../../types/travel';

export const destinations: Destination[] = [
  {
    id: 'bali',
    name: 'Bali',
    country: 'Indonesia',
    description: 'Tropical paradise with stunning beaches, ancient temples, and vibrant culture',
    image: 'https://images.pexels.com/photos/2161449/pexels-photo-2161449.jpeg?auto=compress&cs=tinysrgb&w=800',
    highlights: ['Beautiful beaches', 'Ancient temples', 'Rice terraces', 'Yoga retreats'],
    bestTime: 'April - October',
    budget: '$50-80/day'
  },
  {
    id: 'iceland',
    name: 'Iceland',
    country: 'Iceland',
    description: 'Land of fire and ice with breathtaking landscapes and natural wonders',
    image: 'https://images.pexels.com/photos/1433052/pexels-photo-1433052.jpeg?auto=compress&cs=tinysrgb&w=800',
    highlights: ['Northern Lights', 'Geysers', 'Waterfalls', 'Blue Lagoon'],
    bestTime: 'June - August',
    budget: '$120-180/day'
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    country: 'Japan',
    description: 'Perfect blend of traditional culture and modern innovation',
    image: 'https://images.pexels.com/photos/161251/senso-ji-temple-japan-kyoto-landmark-161251.jpeg?auto=compress&cs=tinysrgb&w=800',
    highlights: ['Ancient temples', 'Cherry blossoms', 'Modern cities', 'Amazing food'],
    bestTime: 'March - May, September - November',
    budget: '$80-120/day'
  },
  {
    id: 'costa-rica',
    name: 'Costa Rica',
    country: 'Costa Rica',
    description: 'Biodiversity hotspot with lush rainforests and pristine beaches',
    image: 'https://images.pexels.com/photos/2725675/pexels-photo-2725675.jpeg?auto=compress&cs=tinysrgb&w=800',
    highlights: ['Rainforest adventures', 'Wildlife viewing', 'Zip-lining', 'Pristine beaches'],
    bestTime: 'December - April',
    budget: '$60-100/day'
  },
  {
    id: 'greece',
    name: 'Greece',
    country: 'Greece',
    description: 'Historic islands with stunning architecture and crystal-clear waters',
    image: 'https://images.pexels.com/photos/1285625/pexels-photo-1285625.jpeg?auto=compress&cs=tinysrgb&w=800',
    highlights: ['Ancient ruins', 'Island hopping', 'Mediterranean cuisine', 'Sunset views'],
    bestTime: 'April - June, September - October',
    budget: '$70-110/day'
  },
  {
    id: 'new-zealand',
    name: 'New Zealand',
    country: 'New Zealand',
    description: 'Adventure playground with diverse landscapes and outdoor activities',
    image: 'https://images.pexels.com/photos/552779/pexels-photo-552779.jpeg?auto=compress&cs=tinysrgb&w=800',
    highlights: ['Adventure sports', 'Stunning landscapes', 'Hobbiton', 'Milford Sound'],
    bestTime: 'December - February',
    budget: '$90-140/day'
  }
];