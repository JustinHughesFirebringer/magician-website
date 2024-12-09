export interface Magician {
  id: string;
  name: string;
  specialty: string[];
  location: {
    city: string;
    state: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  rating: number;
  reviewCount: number;
  priceRange: string;
  imageUrl: string;
  description: string;
  availability: string[];
  shows: {
    title: string;
    duration: string;
    description: string;
    price: string;
  }[];
}

export const sampleMagicians: Magician[] = [
  {
    id: "m1",
    name: "David Mysterio",
    specialty: ["Close-up Magic", "Card Magic", "Mentalism"],
    location: {
      city: "San Francisco",
      state: "CA",
      coordinates: {
        latitude: 37.7749,
        longitude: -122.4194
      }
    },
    rating: 4.8,
    reviewCount: 127,
    priceRange: "$500-$2000",
    imageUrl: "https://images.unsplash.com/photo-1542200843-f8ee535f631f",
    description: "With over 15 years of experience, David Mysterio specializes in mind-bending close-up magic and mentalism that will leave your guests speechless.",
    availability: ["Weekends", "Evenings"],
    shows: [
      {
        title: "Intimate Illusions",
        duration: "1 hour",
        description: "Perfect for cocktail parties and small gatherings",
        price: "$500"
      },
      {
        title: "Mind Reading Experience",
        duration: "2 hours",
        description: "An interactive show of mentalism and psychological illusions",
        price: "$1000"
      }
    ]
  },
  {
    id: "m2",
    name: "Luna Wonder",
    specialty: ["Stage Magic", "Levitation", "Grand Illusions"],
    location: {
      city: "Las Vegas",
      state: "NV",
      coordinates: {
        latitude: 36.1699,
        longitude: -115.1398
      }
    },
    rating: 4.9,
    reviewCount: 243,
    priceRange: "$2000-$5000",
    imageUrl: "https://images.unsplash.com/photo-1576267423445-b2e0074d68a4",
    description: "Luna Wonder brings the impossible to life with spectacular stage illusions and breathtaking levitations that will amaze audiences of all sizes.",
    availability: ["Full-time", "Touring"],
    shows: [
      {
        title: "Wonders of Magic",
        duration: "90 minutes",
        description: "A full-scale stage show with grand illusions",
        price: "$3000"
      },
      {
        title: "Corporate Magic",
        duration: "45 minutes",
        description: "Perfect for company events and conferences",
        price: "$2000"
      }
    ]
  },
  {
    id: "m3",
    name: "Professor Whimsy",
    specialty: ["Children's Magic", "Comedy Magic", "Balloon Art"],
    location: {
      city: "Boston",
      state: "MA",
      coordinates: {
        latitude: 42.3601,
        longitude: -71.0589
      }
    },
    rating: 4.7,
    reviewCount: 89,
    priceRange: "$200-$500",
    imageUrl: "https://images.unsplash.com/photo-1528495612343-9ca9f4a4de28",
    description: "Professor Whimsy combines magic with comedy to create unforgettable children's parties and family events.",
    availability: ["Weekends", "Afternoons"],
    shows: [
      {
        title: "Magic Birthday Party",
        duration: "1 hour",
        description: "Interactive magic show perfect for kids",
        price: "$300"
      },
      {
        title: "Family Fun Show",
        duration: "75 minutes",
        description: "Magic and comedy for the whole family",
        price: "$450"
      }
    ]
  }
];

