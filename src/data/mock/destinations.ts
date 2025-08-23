import { Destination } from "../../types/travel";

export const destinations: Destination[] = [
  {
    id: "bali",
    name: "Bali",
    country: "Indonesia",
    description:
      "Tropical paradise with stunning beaches, ancient temples, and vibrant culture",
    image:
      "https://images.pexels.com/photos/2161449/pexels-photo-2161449.jpeg?auto=compress&cs=tinysrgb&w=800",
    highlights: [
      { name: "Super super super supser long named Beautiful beaches", description: "Stunning white sand beaches with turquoise waters perfect for swimming and relaxation" },
      { name: "Ancient temples", description: "Sacred Hindu temples with intricate architecture and spiritual significance" },
      { name: "Rice terraces", description: "Breathtaking emerald green terraced landscapes that showcase traditional farming" },
      { name: "Yoga retreats", description: "World-class wellness centers and yoga studios in serene natural settings" },
    ],
    bestTimeToVisit: "April - October",
    estimatedCost: "$50-80/day",
    keyActivities: ["Beach", "Temple", "Rice Terrace", "Yoga Retreat"],
    matchReason: "Perfect for those interested in beaches and temples",
    details: "bali details",
  },
  {
    id: "iceland",
    name: "Iceland",
    country: "Iceland",
    description:
      "Land of fire and ice with breathtaking landscapes and natural wonders",
    image:
      "https://images.pexels.com/photos/1433052/pexels-photo-1433052.jpeg?auto=compress&cs=tinysrgb&w=800",
    highlights: [
      { name: "Northern Lights", description: "Spectacular aurora borealis displays dancing across the winter sky" },
      { name: "Geysers", description: "Natural hot springs shooting steaming water high into the air" },
      { name: "Waterfalls", description: "Powerful cascades like Gullfoss and Skógafoss amid dramatic landscapes" },
      { name: "Blue Lagoon", description: "Geothermal spa with mineral-rich milky blue waters for ultimate relaxation" },
    ],
    bestTimeToVisit: "June - August",
    estimatedCost: "$120-180/day",
    keyActivities: ["Northern Lights", "Geysers", "Waterfalls", "Blue Lagoon"],
    matchReason: "Perfect for those interested in nature and adventure",
    details: "iceland details",
  },
  {
    id: "tokyo",
    name: "Tokyo",
    country: "Japan",
    description: "Perfect blend of traditional culture and modern innovation",
    image:
      "https://images.pexels.com/photos/161251/senso-ji-temple-japan-kyoto-landmark-161251.jpeg?auto=compress&cs=tinysrgb&w=800",
    highlights: [
      { name: "Ancient temples", description: "Historic shrines and temples showcasing traditional Japanese architecture" },
      { name: "Cherry blossoms", description: "Beautiful sakura season with pink petals creating magical landscapes" },
      { name: "Modern cities", description: "Futuristic urban landscapes with neon lights and cutting-edge technology" },
      { name: "Amazing food", description: "World-class cuisine from sushi and ramen to innovative fusion dishes" },
    ],
    bestTimeToVisit: "March - May, September - November",
    estimatedCost: "$80-120/day",
    keyActivities: [
      "Ancient temples",
      "Cherry blossoms",
      "Modern cities",
      "Amazing food",
    ],
    matchReason: "Perfect for those interested in culture and food",
    details: "tokyo details",
  },
  {
    id: "costa-rica",
    name: "Costa Rica",
    country: "Costa Rica",
    description:
      "Biodiversity hotspot with lush rainforests and pristine beaches",
    image:
      "https://images.pexels.com/photos/2725675/pexels-photo-2725675.jpeg?auto=compress&cs=tinysrgb&w=800",
    highlights: [
      { name: "Rainforest adventures", description: "Explore lush cloud forests teeming with exotic wildlife and plants" },
      { name: "Wildlife viewing", description: "Spot colorful birds, monkeys, sloths, and other incredible creatures" },
      { name: "Zip-lining", description: "Soar through the canopy on thrilling zip-line adventures" },
      { name: "Pristine beaches", description: "Relax on unspoiled Pacific and Caribbean coastlines" },
    ],
    bestTimeToVisit: "December - April",
    estimatedCost: "$60-100/day",
    keyActivities: [
      "Rainforest adventures",
      "Wildlife viewing",
      "Zip-lining",
      "Pristine beaches",
    ],
    matchReason: "Perfect for those interested in nature and adventure",
    details: "costa rica details",
  },
  {
    id: "greece",
    name: "Greece",
    country: "Greece",
    description:
      "Historic islands with stunning architecture and crystal-clear waters",
    image:
      "https://images.pexels.com/photos/1285625/pexels-photo-1285625.jpeg?auto=compress&cs=tinysrgb&w=800",
    highlights: [
      { name: "Ancient ruins", description: "Explore millennia-old archaeological sites like the Acropolis and Delphi" },
      { name: "Island hopping", description: "Discover unique islands each with distinct character and beauty" },
      { name: "Mediterranean cuisine", description: "Savor fresh seafood, olive oil, feta cheese, and local wines" },
      { name: "Sunset views", description: "Witness breathtaking sunsets over the Aegean Sea from clifftop villages" },
    ],
    bestTimeToVisit: "April - June, September - October",
    estimatedCost: "$70-110/day",
    keyActivities: [
      "Ancient ruins",
      "Island hopping",
      "Mediterranean cuisine",
      "Sunset views",
    ],
    matchReason: "Perfect for those interested in culture and food",
    details: "greece details",
  },
  {
    id: "new-zealand",
    name: "New Zealand",
    country: "New Zealand",
    description:
      "Adventure playground with diverse landscapes and outdoor activities",
    image:
      "https://images.pexels.com/photos/552779/pexels-photo-552779.jpeg?auto=compress&cs=tinysrgb&w=800",
    highlights: [
      { name: "Adventure sports", description: "Bungee jumping, skydiving, and extreme sports in epic locations" },
      { name: "Stunning landscapes", description: "Dramatic mountains, fjords, and pristine wilderness scenery" },
      { name: "Hobbiton", description: "Visit the movie set from Lord of the Rings in the rolling green hills" },
      { name: "Milford Sound", description: "Cruise through the spectacular fiord surrounded by towering peaks" },
    ],
    bestTimeToVisit: "December - February",
    estimatedCost: "$90-140/day",
    keyActivities: [
      "Adventure sports",
      "Stunning landscapes",
      "Hobbiton",
      "Milford Sound",
    ],
    matchReason: "Perfect for those interested in nature and adventure",
    details: "new zealand details",
  },
];
