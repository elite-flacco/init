import { Question } from '../components/QuestionStep';

export const commonDestinationQuestions: Question[] = [
    {
        id: 'timeOfYear',
        type: 'select',
        question: 'When are you planning to escape? 📅',
        options: [
            'March – May',
            'June – August',
            'September – November',
            'December – February',
            'No idea yet / I’m flexible'
        ]
    },
    {
        id: 'duration',
        type: 'select',
        question: 'How much time can you steal from life? ⏰',
        options: [
            'Long weekend warrior (3-5 days)',
            'Can only get one week off work',
            'I\'ve got time!'
        ]
    },
    {
        id: 'budget',
        type: 'select',
        question: 'What\'s your wallet situation? 💰',
        options: [
            '💸 I\'m broke but determined',
            '💰 I can afford to be comfortable',
            '🤑 Money is no object'
        ]
    },
    {
        id: 'tripType',
        type: 'select',
        question: 'What kind of adventure calls to you? 🎭',
        options: [
            'Nature & outdoors',
            'History & culture',
            'Food & drinks',
            'Beach & chill',
            'Cities & nightlife',
            'Can\'t decide, surprise me!'
        ]
    },
    {
        id: 'specialActivities',
        type: 'textarea',
        question: 'Any bucket list items we should know about?',
        placeholder: 'e.g., swim with sharks, learn to make pasta in Italy, see the Northern Lights, or just \'surprise me!\''
    },
    {
        id: 'weather',
        type: 'select',
        question: 'How do you want to feel temperature-wise? 🌡️',
        options: [
            'Don\'t want to get toasted',
            'Don\'t want to freeze my ass off',
            'Weather is whatever'
        ]
    },
    {
        id: 'priority',
        type: 'select',
        question: 'What matters most to you? 🎯',
        options: [
            '🍽️ Incredible food & drinks',
            '🍸 Nightlife & social vibes',
            '🛍️ Shopping until I\'m broke',
            '📸 Instagram-worthy spots',
            '👯 Meeting awesome people',
            '🧘 Total relaxation mode'
        ]
    }
];

export const regionQuestion: Question = {
    id: 'region',
    type: 'textarea',
    question: 'Which country/region did you have in mind? 🌍',
    placeholder: 'e.g., Southeast Asia, Japan, Italy, Nordic countries...'
};

// Type-specific questions for different traveler types
const typeADestinationQuestions: Question[] = [
    {
        id: 'schedule',
        type: 'select',
        question: 'How structured do you like your itinerary? 📅',
        options: [
            'Minute-by-minute playbook',
            'General daily plans',
            'Just major highlights',
        ]
    }
];

const bougieDestinationQuestions: Question[] = [
    {
        id: 'accommodation',
        type: 'select',
        question: 'What kind of luxury accommodation do you prefer? 🏨',
        options: [
            '5-star hotels only',
            'Boutique luxury',
            'Private villas',
            'Luxury resorts'
        ]
    },
    {
        id: 'dining',
        type: 'select',
        question: 'How important are fine dining experiences? 🍽️',
        options: [
            'Michelin stars required',
            'Local fine dining',
            'Casual but high quality',
            'I\'m here for the sights, not the food'
        ]
    }
];

export const getQuestionsByTravelerType = (travelerTypeId: string): Question[] => {
    // Start with common questions
    const questions = [...commonDestinationQuestions];

    // Add type-specific questions based on traveler type
    switch (travelerTypeId) {
        case 'type-a':
            return [...questions, ...typeADestinationQuestions];
        case 'bougie':
            return [...questions, ...bougieDestinationQuestions];
        // Add more cases for other traveler types as needed
        default:
            return questions;
    }
};

// Trip planning specific questions for different traveler types
const explorerTripPlanningQuestions: Question[] = [
    {
        id: 'activityLevel',
        type: 'select',
        question: 'What\'s your adventure energy level? ⚡',
        options: [
            'High - Go go go! I want to do EVERYTHING!',
            'Medium - A good mix of adventure and chill',
            'Low - YOLO but make it relaxed 😎'
        ]
    },
];

const typeATripPlanningQuestions: Question[] = [
    {
        id: 'scheduleDetail',
        type: 'select',
        question: 'How detailed should your itinerary be? 📅',
        options: [
            'Minute-by-minute playbook with backup plans',
            'Hourly schedule with some buffer time',
            'Daily highlights with timing suggestions'
        ]
    },
    {
        id: 'bookingPreference',
        type: 'select',
        question: 'How far in advance do you want things booked? 📋',
        options: [
            'Everything reserved now - no surprises!',
            'Major things booked, some flexibility',
            'Key reservations only, rest can wait'
        ]
    },
    {
        id: 'backupPlans',
        type: 'select',
        question: 'Want backup plans for weather/closures? ☔',
        options: [
            'Yes! Plan A, B, C, and D please',
            'A couple alternatives would be nice',
            'I\'ll figure it out if needed'
        ]
    }
];

const bougieTripPlanningQuestions: Question[] = [
    {
        id: 'luxuryLevel',
        type: 'select',
        question: 'What level of luxury are we talking? ✨',
        options: [
            'Ultra-luxury everything - money no object',
            'High-end but practical choices',
            'Selective splurging on key experiences'
        ]
    },
    {
        id: 'serviceLevel',
        type: 'select',
        question: 'How much personal service do you want? 🛎️',
        options: [
            'Full concierge - handle everything for me',
            'VIP treatment at key moments',
            'Good service but I can handle some things'
        ]
    },
    {
        id: 'exclusivity',
        type: 'select',
        question: 'How exclusive should your experiences be? 👑',
        options: [
            'Private everything - no crowds ever',
            'Skip-the-line and VIP access',
            'Quality experiences, crowds are ok'
        ]
    }
];

const chillTripPlanningQuestions: Question[] = [
    {
        id: 'relaxationStyle',
        type: 'select',
        question: 'What\'s your ideal way to unwind? 😌',
        options: [
            'Beach chair + book + cocktail = perfect',
            'Spa treatments and wellness activities',
            'Slow exploration with plenty of coffee breaks'
        ]
    },
    {
        id: 'pacePreference',
        type: 'select',
        question: 'How packed should your days be? 🐌',
        options: [
            'Minimal plans - maximum chill time',
            'One main thing per day, rest is flexible',
            'Light schedule with nap opportunities'
        ]
    },
    {
        id: 'stressLevel',
        type: 'select',
        question: 'What sounds most appealing? 🧘',
        options: [
            'Zero decisions - just tell me where to show up',
            'Easy choices between relaxing options',
            'Some planning but keep it stress-free'
        ]
    }
];

// Common trip planning questions asked to all traveler types
export const commonTripPlanningQuestions: Question[] = [
    {
        id: 'duration',
        type: 'select',
        question: 'How long can you escape reality? ⏰',
        options: [
            'Long weekend warrior (3-4 days)',
            'Can only get one week off work',
            'Sky is the limit!'
        ]
    },
    {
        id: 'budget',
        type: 'select',
        question: 'What\'s your wallet situation looking like? 💰',
        options: [
            'I\'m broke but determined',
            'I\'ve got some $$$',
            'Money is no object'
        ]
    },
    {
        id: 'accommodation',
        type: 'select',
        question: 'Where do you want to crash? 🛏️',
        options: [
            'Hostel - Meet people, save money',
            'Hotel - Classic comfort zone',
            'Airbnb - Live like a local',
            'Resort - All-inclusive paradise'
        ]
    },
    {
        id: 'transportation',
        type: 'select',
        question: 'How are you getting around? 🚗',
        options: [
            'Public Transport - Eco-friendly explorer',
            'Rental Car - Freedom to roam',
            'Walking/Biking - Slow travel vibes',
            'Tours & Taxis - Let others drive'
        ]
    },
    {
        id: 'restaurants',
        type: 'select',
        question: 'Want restaurant recommendations? 🍽️',
        options: [
            'Yes please! - I live to eat 🤤',
            'Nah, I\'m good - I\'ll figure it out myself'
        ]
    },
    {
        id: 'bars',
        type: 'select',
        question: 'Want bar recommendations? 🍻',
        options: [
            'Absolutely! - It\'s 5 o\'clock somewhere! 🍹',
            'Not my scene - I\'ll stick to coffee shops'
        ]
    }
];

export const getTripPlanningQuestionsByTravelerType = (travelerTypeId: string): Question[] => {
    switch (travelerTypeId) {
        case 'explorer':
            return explorerTripPlanningQuestions;
        case 'type-a':
            return typeATripPlanningQuestions;
        case 'bougie':
            return bougieTripPlanningQuestions;
        case 'chill':
            return chillTripPlanningQuestions;
        default:
            return [];
    }
};
