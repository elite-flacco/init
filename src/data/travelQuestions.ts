import { Question } from "../components/QuestionStep";

export const commonDestinationQuestions: Question[] = [
  {
    id: "timeOfYear",
    type: "select",
    question: "When are you planning to escape? 📅",
    options: [
      {
        label: "March – May",
        value: "March – May",
      },
      {
        label: "June – August",
        value: "June – August",
      },
      {
        label: "September – November",
        value: "September – November",
      },
      {
        label: "December – February",
        value: "December – February",
      },
      {
        label: "No idea yet / I'm flexible",
        value: "flexible with travel dates",
      },
    ],
  },
  {
    id: "duration",
    type: "select",
    question: "How long can you escape reality? ⏰",
    options: [
      {
        label: "Quick escape (3-5 days)",
        value: "3-5 days",
      },
      {
        label: "Can only get one week off work",
        value: "7-10 days",
      },
      {
        label: "I've got time!",
        value: "10+ days",
      },
    ],
  },
  {
    id: "budget",
    type: "select",
    question: "What's your wallet situation? 💰",
    options: [
      {
        label: "💸 I'm broke but determined",
        value: "budget travel low cost",
      },
      {
        label: "💰 I can afford to be comfortable but not crazy",
        value: "mid-range budget comfortable",
      },
      {
        label: "🤑 Money is no object, let's go all out",
        value: "luxury travel high budget",
      },
    ],
  },
  {
    id: "tripType",
    type: "select",
    question: "What kind of adventure calls to you? 🎭",
    options: [
      {
        label: "🌳 Nature & outdoors",
        value: "nature outdoor activities hiking adventure",
      },
      {
        label: "🏛️ History & culture",
        value: "cultural experiences historical sites museums",
      },
      {
        label: "🍽️ Food & drinks",
        value: "culinary experiences local cuisine food tours",
      },
      {
        label: "🏖️ Beach & chill",
        value: "beach relaxation coastal activities",
      },
      {
        label: "🏙️ Cities & nightlife",
        value: "urban exploration nightlife city experiences",
      },
      {
        label: "Mix it all up - I'm here for whatever!",
        value: "variety mixed experiences open to anything",
      },
    ],
  },
  {
    id: "weather",
    type: "select",
    question: "What's your ideal weather vibe? 🌡️",
    options: [
      {
        label: "Keep it cool - I don't do well in heat",
        value: "prefer cooler weather",
      },
      {
        label: "Warm me up - I hate being cold",
        value: "prefer warm weather",
      },
      {
        label: "Weather's weather - I'll adapt",
        value: "no weather preference",
      },
    ],
  },
  // {
  //   id: "priority",
  //   type: "select",
  //   question: "What's your main priority on this trip? 🎯",
  //   options: [
  //     {
  //       label: "🍽️ Incredible food & drinks",
  //       value: "prioritize culinary experiences",
  //     },
  //     {
  //       label: "🍸 Nightlife & social vibes",
  //       value: "prioritize nightlife and social activities",
  //     },
  //     {
  //       label: "🛍️ Shopping (sorry, credit card)",
  //       value: "prioritize shopping and retail experiences",
  //     },
  //     {
  //       label: "📸 Instagram-worthy spots",
  //       value: "prioritize photogenic and scenic locations",
  //     },
  //     {
  //       label: "👯 Meeting awesome people",
  //       value: "prioritize social connections and meeting locals",
  //     },
  //     {
  //       label: "🧘 Total relaxation mode",
  //       value: "prioritize relaxation and wellness",
  //     },
  //   ],
  // },
  {
    id: "destinationType",
    type: "select",
    question: "What kind of destination speaks to you? 🗺️",
    options: [
      {
        label: "🏛️ The classics - I don't mind crowds if it's worth it",
        value: "major tourist destinations popular attractions",
      },
      {
        label: "🌲 Hidden gems - take me off the beaten path",
        value: "off beaten path hidden gems remote destinations",
      },
      {
        label: "🚀 The next big thing - before everyone else finds it",
        value: "up and coming trending emerging destinations",
      },
    ],
  },
  {
    id: "specialActivities",
    type: "textarea",
    question:
      "Lastly... any wild dreams or bucket list items we should know about?",
    placeholder:
      "e.g., swim with sharks, learn to make pasta in Italy, see the Northern Lights, or just 'surprise me!'",
  },
];

export const regionQuestion: Question = {
  id: "region",
  type: "textarea",
  question: "Which country/region did you have in mind? 🌍",
  placeholder: "e.g., Southeast Asia, Japan, Italy, Nordic countries...",
};

// Type-specific questions for different traveler types
const typeADestinationQuestions: Question[] = [
  {
    id: "schedule",
    type: "select",
    question: "How structured do you like your itinerary? 📅",
    options: [
      {
        label: "Minute-by-minute playbook",
        value: "highly structured detailed minute by minute itinerary",
      },
      {
        label: "General daily plans",
        value: "structured daily plans with flexibility",
      },
      {
        label: "Just major highlights",
        value: "loose structure major highlights only",
      },
    ],
  },
];

const overthinkerDestinationQuestions: Question[] = [
  {
    id: "accommodation",
    type: "select",
    question: "What kind of luxury accommodation do you prefer? 🏨",
    options: [
      {
        label: "5-star hotels only",
        value: "five star hotels luxury highest tier",
      },
      {
        label: "Boutique luxury",
        value: "boutique luxury unique character properties",
      },
      {
        label: "Private villas",
        value: "private villas exclusive accommodation",
      },
      {
        label: "Luxury resorts",
        value: "luxury resorts full service amenities",
      },
    ],
  },
  {
    id: "dining",
    type: "select",
    question: "How important are fine dining experiences? 🍽️",
    options: [
      {
        label: "Michelin stars required",
        value: "michelin star dining haute cuisine",
      },
      {
        label: "Local fine dining",
        value: "local fine dining elevated cuisine",
      },
      {
        label: "Casual but high quality",
        value: "casual high quality food experiences",
      },
      {
        label: "I'm here for the sights, not the food",
        value: "not focused on dining experiences",
      },
    ],
  },
];

export const getQuestionsByTravelerType = (
  travelerTypeId: string,
): Question[] => {
  // Start with common questions
  const questions = [...commonDestinationQuestions];

  // Add type-specific questions based on traveler type
  switch (travelerTypeId) {
    case "type-a":
      return [...questions, ...typeADestinationQuestions];
    case "overthinker":
      return [...questions, ...overthinkerDestinationQuestions];
    // Add more cases for other traveler types as needed
    default:
      return questions;
  }
};

// Trip planning specific questions for different traveler types
const explorerTripPlanningQuestions: Question[] = [
  {
    id: "activityLevel",
    type: "select",
    question: "What's your adventure energy looking like? ⚡",
    options: [
      {
        label: "Pack the agenda, I want to see everything",
        value:
          "high energy very tight and active adventurous schedule, pack more activities into the itinerary with minimal breaks",
      },
      {
        label: "Balanced vibes - Adventure with strategic nap breaks",
        value:
          "moderate energy balanced adventure and relaxation, include breaks between activities",
      },
      {
        label: "I like to take it slow, 2 activities a day, max",
        value:
          "low energy relaxed adventurous mindset, don't include more than 3 activities per day",
      },
    ],
  },
];

const typeATripPlanningQuestions: Question[] = [
  {
    id: "scheduleDetail",
    type: "select",
    question: "How detailed should your itinerary be? 📅",
    options: [
      {
        label: "Minute-by-minute playbook with backup plans",
        value: "very detailed minute by minute schedule with backup plans",
      },
      {
        label: "Hourly schedule with some buffer time",
        value: "hourly schedule structured with flexibility",
      },
      {
        label: "Daily highlights with timing suggestions",
        value: "daily highlights loose timing suggestions",
      },
    ],
  },
  {
    id: "bookingPreference",
    type: "select",
    question: "How far in advance do you want things booked? 📋",
    options: [
      {
        label: "Everything reserved now - no surprises!",
        value: "book everything in advance no surprises",
      },
      {
        label: "Major things booked, some flexibility",
        value: "book major attractions some flexibility",
      },
      {
        label: "Key reservations only, rest can wait",
        value: "minimal advance booking key reservations only",
      },
    ],
  },
  {
    id: "backupPlans",
    type: "select",
    question: "Want backup plans for weather/closures? ☔",
    options: [
      {
        label: "Yes! Plan A, B, C, and D please",
        value: "multiple backup plans for all scenarios",
      },
      {
        label: "A couple alternatives would be nice",
        value: "some backup options for contingencies",
      },
      {
        label: "I'll figure it out if needed",
        value: "minimal backup planning spontaneous adaptation",
      },
    ],
  },
];

const overthinkerTripPlanningQuestions: Question[] = [
  {
    id: "luxuryLevel",
    type: "select",
    question: "What level of luxury are we talking? ✨",
    options: [
      {
        label: "Ultra-luxury everything - money no object",
        value: "ultra luxury highest tier money no object",
      },
      {
        label: "High-end but practical choices",
        value: "high end luxury practical value conscious",
      },
      {
        label: "Selective splurging on key experiences",
        value: "selective luxury splurge on special experiences",
      },
    ],
  },
  {
    id: "serviceLevel",
    type: "select",
    question: "How much personal service do you want? 🛎️",
    options: [
      {
        label: "Full concierge - handle everything for me",
        value: "full concierge service white glove treatment",
      },
      {
        label: "VIP treatment at key moments",
        value: "VIP treatment for special experiences",
      },
      {
        label: "Good service but I can handle some things",
        value: "quality service with some independence",
      },
    ],
  },
  {
    id: "exclusivity",
    type: "select",
    question: "How exclusive should your experiences be? 👑",
    options: [
      {
        label: "Private everything - no crowds ever",
        value: "completely private exclusive no crowds",
      },
      {
        label: "Skip-the-line and VIP access",
        value: "VIP access skip lines premium treatment",
      },
      {
        label: "Quality experiences, crowds are ok",
        value: "quality experiences crowds acceptable",
      },
    ],
  },
];

const chillTripPlanningQuestions: Question[] = [
  {
    id: "relaxationStyle",
    type: "select",
    question: "What's your ideal way to unwind? 😌",
    options: [
      {
        label: "Beach chair + book + cocktail = perfect",
        value: "beach relaxation reading cocktails peaceful",
      },
      {
        label: "Spa treatments and wellness activities",
        value: "spa wellness treatments self care activities",
      },
      {
        label: "Slow exploration with plenty of coffee breaks",
        value: "slow exploration coffee culture leisurely sightseeing",
      },
    ],
  },
  {
    id: "pacePreference",
    type: "select",
    question: "How packed should your days be? 🐌",
    options: [
      {
        label: "Minimal plans - maximum chill time",
        value: "minimal planning maximum free time relaxation",
      },
      {
        label: "One main thing per day, rest is flexible",
        value: "one main activity per day flexible schedule",
      },
      {
        label: "Light schedule with nap opportunities",
        value: "light schedule with rest breaks nap time",
      },
    ],
  },
  {
    id: "stressLevel",
    type: "select",
    question: "What sounds most appealing? 🧘",
    options: [
      {
        label: "Zero decisions - just tell me where to show up",
        value: "no decisions fully planned stress free",
      },
      {
        label: "Easy choices between relaxing options",
        value: "simple choices between relaxing activities",
      },
      {
        label: "Some planning but keep it stress-free",
        value: "light planning stress free low pressure",
      },
    ],
  },
];

// Destination question for when user knows where they want to go
export const destinationInputQuestion: Question = {
  id: "destination",
  type: "textarea",
  question: "Where are you planning to go? 🌍",
  placeholder: "e.g., Tokyo, Japan or Bali, Indonesia or Paris, France...",
};

// Common trip planning questions asked to all traveler types
export const commonTripPlanningQuestions: Question[] = [
  {
    id: "timeOfYear",
    type: "select",
    question: "When are you planning to escape? 📅",
    options: [
      {
        label: "March – May",
        value: "March – May",
      },
      {
        label: "June – August",
        value: "June – August",
      },
      {
        label: "September – November",
        value: "September – November",
      },
      {
        label: "December – February",
        value: "December – February",
      },
      {
        label: "No idea yet / I'm flexible",
        value: "flexible with travel dates",
      },
    ],
  },
  {
    id: "duration",
    type: "select",
    question: "How long can you escape reality? ⏰",
    options: [
      {
        label: "Quick escape (3-5 days)",
        value: "3-5 days",
      },
      {
        label: "Can only get one week off work",
        value: "7-10 days",
      },
      {
        label: "I've got time!",
        value: "10+ days",
      },
    ],
  },
  {
    id: "budget",
    type: "select",
    question: "What's your wallet situation? 💰",
    options: [
      {
        label: "💸 I'm broke but determined",
        value: "budget travel low cost",
      },
      {
        label: "💰 I can afford to be comfortable but not crazy",
        value: "mid-range budget comfortable",
      },
      {
        label: "🤑 Money is no object, let's go all out",
        value: "luxury travel high budget",
      },
    ],
  },
  {
    id: "accommodation",
    type: "select",
    question: "Where do you want to crash? 🛏️",
    options: [
      {
        label: "Hostel - Meet people, save money",
        value: "hostel budget social accommodation meet travelers",
      },
      {
        label: "Hotel - Classic comfort zone",
        value: "hotel comfortable reliable accommodation",
      },
      // {
      //   label: "Airbnb - Live like a local",
      //   value: "airbnb local experience home stay",
      // },
      // {
      //     label: 'Resort - All-inclusive paradise',
      //     value: 'resort all inclusive luxury amenities'
      // }
    ],
  },
  {
    id: "priority",
    type: "select",
    question: "What's your main priority on this trip? 🎯",
    options: [
      {
        label: "🏛️ Culture & history",
        value: "prioritize cultural experiences, museums, historical sites",
      },
      {
        label: "🌳 Nature & outdoors",
        value: "prioritize outdoor activities, hiking, nature walks",
      },
      {
        label: "🍽️ Incredible food & drinks",
        value: "prioritize culinary experiences, local cuisine, food tours",
      },
      {
        label: "🍸 Nightlife & social vibes",
        value:
          "prioritize nightlife and social activities, bars, clubs, parties",
      },
      {
        label: "🛍️ Shopping (sorry, credit card)",
        value: "prioritize shopping and retail experiences, boutiques, markets",
      },
      {
        label: "📸 Instagram-worthy spots",
        value:
          "prioritize photogenic and scenic locations, beaches, parks, landmarks",
      },
    ],
  },
  {
    id: "vibe",
    type: "select",
    question: "What kind of vibe are you going for?",
    options: [
      {
        label: "Hidden gems",
        value: "hidden gems",
      },
      {
        label: "Local & authentic",
        value: "local authentic experiences",
      },
      {
        label: "I love touristy spots",
        value: "touristy spots",
      },
    ],
  },
  // {
  //     id: 'transportation',
  //     type: 'select',
  //     question: 'How are you getting around? 🚗',
  //     options: [
  //         'Public Transport - Eco-friendly explorer',
  //         'Rental Car - Freedom to roam',
  //         'Walking/Biking - Slow travel vibes',
  //         'Tours & Taxis - Let others drive'
  //     ]
  // },
  // {
  //     id: 'restaurants',
  //     type: 'select',
  //     question: 'Want restaurant recommendations? 🍽️',
  //     options: [
  //         {
  //             label: 'Yes please! - I live to eat 🤤',
  //             value: 'yes restaurant recommendations foodie culinary experiences'
  //         },
  //         {
  //             label: 'Nah, I\'m good - I\'ll figure it out myself',
  //             value: 'no restaurant recommendations independent dining'
  //         }
  //     ]
  // },
  // {
  //     id: 'bars',
  //     type: 'select',
  //     question: 'Want bar recommendations? 🍻',
  //     options: [
  //         {
  //             label: 'Absolutely! - It\'s 5 o\'clock somewhere! 🍹',
  //             value: 'yes bar recommendations nightlife drinking culture'
  //         },
  //         {
  //             label: 'Not my scene - I\'ll stick to coffee shops',
  //             value: 'no bar recommendations prefer coffee culture'
  //         }
  //     ]
  // }
];

export const commonFinalTripPlanningQuestions: Question[] = [
  {
    id: "specialActivities",
    type: "textarea",
    question: "Lastly... anything else we should know about?",
    placeholder: "e.g. bucket list activities, special requests, etc.",
  },
];

export const getTripPlanningQuestionsByTravelerType = (
  travelerTypeId: string,
): Question[] => {
  switch (travelerTypeId) {
    case "explorer":
      return explorerTripPlanningQuestions;
    case "type-a":
      return typeATripPlanningQuestions;
    case "overthinker":
      return overthinkerTripPlanningQuestions;
    case "chill":
      return chillTripPlanningQuestions;
    default:
      return [];
  }
};
