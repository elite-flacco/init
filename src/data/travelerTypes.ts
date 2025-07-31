import { TravelerType } from "../types/travel";

export const travelerTypes: TravelerType[] = [
  {
    id: "explorer",
    name: "Explorer",
    description:
      "I’m down for whatever - just show me all the cool stuff and I’ll have a blast.",
    icon: "🎢",
    showPlaceholder: false,
  },
  {
    id: "type-a",
    name: "Type A",
    description:
      "I have spreadsheets for my spreadsheets. Every minute planned, every detail covered.",
    icon: "📋",
    showPlaceholder: true,
    placeholderMessage:
      "We're currently deep in the spreadsheets perfecting this feature. Keep being your organized self - we'll have something awesome for you soon.",
    greeting: "Hey there, fellow planner!",
  },
  {
    id: "overthinker",
    name: "Typical Overthinker",
    description: "I’ve got 51 tabs open, and still not sure where to stay.",
    icon: "🧠",
    showPlaceholder: true,
    placeholderMessage:
      "We're busy overthinking how to help you stop overthinking. Stay tuned.",
    greeting: "We see those 47 tabs, friend."
  },
  {
    id: "chill",
    name: "Just Here to Chill",
    description:
      "Beach, spa, nap, repeat. My toughest decision should be piña colada or mojito.",
    icon: "🌴",
    showPlaceholder: true,
    placeholderMessage:
      "We aren't slacking off at the beach - chill mode support is coming soon. In the meantime, Netflix and chill?",
    greeting: "Hi there, relaxation expert.",
  },
];
