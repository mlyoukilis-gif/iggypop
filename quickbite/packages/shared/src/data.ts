import { Restaurant, CuisineType } from './types';

export const CUISINES: CuisineType[] = [
  'American',
  'Italian',
  'Mexican',
  'Japanese',
  'Chinese',
  'Indian',
  'Thai',
  'Mediterranean',
  'Fast Food',
  'Healthy',
];

export const RESTAURANTS: Restaurant[] = [
  {
    id: 'r1',
    name: 'Burger Palace',
    description: 'Gourmet burgers, crispy fries, and hand-spun milkshakes',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
    cuisine: 'American',
    rating: 4.7,
    reviewCount: 1243,
    deliveryTime: '25-35 min',
    deliveryFee: 2.99,
    minOrder: 15,
    distance: '0.8 mi',
    featured: true,
    menu: [
      {
        id: 'm1',
        name: 'Popular',
        items: [
          {
            id: 'i1',
            name: 'Classic Smash Burger',
            description: 'Double patty, American cheese, pickles, special sauce',
            price: 14.99,
            image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
            popular: true,
          },
          {
            id: 'i2',
            name: 'Truffle Fries',
            description: 'Crispy fries with truffle oil and parmesan',
            price: 7.99,
            image: 'https://images.unsplash.com/photo-1573080496219-bf0801cf4f67?w=400&q=80',
            popular: true,
          },
          {
            id: 'i3',
            name: 'Chocolate Shake',
            description: 'Thick and creamy hand-spun chocolate milkshake',
            price: 5.99,
            image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&q=80',
          },
        ],
      },
      {
        id: 'm2',
        name: 'Burgers',
        items: [
          {
            id: 'i4',
            name: 'BBQ Bacon Burger',
            description: 'Smoky BBQ sauce, crispy bacon, cheddar',
            price: 16.99,
            image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&q=80',
          },
          {
            id: 'i5',
            name: 'Veggie Burger',
            description: 'Plant-based patty with avocado and sprouts',
            price: 13.99,
            image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400&q=80',
          },
        ],
      },
    ],
  },
  {
    id: 'r2',
    name: 'Nonna\'s Kitchen',
    description: 'Authentic Italian pasta, wood-fired pizza, and tiramisu',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
    cuisine: 'Italian',
    rating: 4.9,
    reviewCount: 892,
    deliveryTime: '30-40 min',
    deliveryFee: 3.49,
    minOrder: 20,
    distance: '1.2 mi',
    featured: true,
    menu: [
      {
        id: 'm1',
        name: 'Popular',
        items: [
          {
            id: 'i6',
            name: 'Margherita Pizza',
            description: 'Fresh mozzarella, basil, San Marzano tomatoes',
            price: 18.99,
            image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80',
            popular: true,
          },
          {
            id: 'i7',
            name: 'Spaghetti Carbonara',
            description: 'Guanciale, pecorino, egg yolk, black pepper',
            price: 19.99,
            image: 'https://images.unsplash.com/photo-1612874747227-9f4d1f4e4c4e?w=400&q=80',
            popular: true,
          },
        ],
      },
      {
        id: 'm2',
        name: 'Desserts',
        items: [
          {
            id: 'i8',
            name: 'Tiramisu',
            description: 'Classic Italian coffee-soaked ladyfingers',
            price: 8.99,
            image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80',
          },
        ],
      },
    ],
  },
  {
    id: 'r3',
    name: 'Taco Loco',
    description: 'Street-style tacos, burritos, and fresh guacamole',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80',
    cuisine: 'Mexican',
    rating: 4.5,
    reviewCount: 567,
    deliveryTime: '20-30 min',
    deliveryFee: 1.99,
    minOrder: 12,
    distance: '0.5 mi',
    featured: true,
    menu: [
      {
        id: 'm1',
        name: 'Tacos',
        items: [
          {
            id: 'i9',
            name: 'Al Pastor Tacos (3)',
            description: 'Marinated pork, pineapple, cilantro, onion',
            price: 11.99,
            image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80',
            popular: true,
          },
          {
            id: 'i10',
            name: 'Fish Tacos (3)',
            description: 'Beer-battered fish, cabbage slaw, chipotle crema',
            price: 13.99,
            image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&q=80',
          },
        ],
      },
      {
        id: 'm2',
        name: 'Sides',
        items: [
          {
            id: 'i11',
            name: 'Chips & Guacamole',
            description: 'Fresh-made guac with house tortilla chips',
            price: 6.99,
            image: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=400&q=80',
          },
        ],
      },
    ],
  },
  {
    id: 'r4',
    name: 'Sakura Sushi',
    description: 'Fresh sushi rolls, sashimi, and Japanese specialties',
    image: 'https://images.unsplash.com/photo-1579871494443-81d148bb88ce?w=800&q=80',
    cuisine: 'Japanese',
    rating: 4.8,
    reviewCount: 734,
    deliveryTime: '35-45 min',
    deliveryFee: 4.99,
    minOrder: 25,
    distance: '2.1 mi',
    menu: [
      {
        id: 'm1',
        name: 'Rolls',
        items: [
          {
            id: 'i12',
            name: 'Dragon Roll',
            description: 'Eel, avocado, cucumber, eel sauce',
            price: 16.99,
            image: 'https://images.unsplash.com/photo-1579871494443-81d148bb88ce?w=400&q=80',
            popular: true,
          },
          {
            id: 'i13',
            name: 'Spicy Tuna Roll',
            description: 'Fresh tuna, spicy mayo, sesame',
            price: 14.99,
            image: 'https://images.unsplash.com/photo-1617195737504-74b5a3664c83?w=400&q=80',
          },
        ],
      },
    ],
  },
  {
    id: 'r5',
    name: 'Green Bowl',
    description: 'Fresh salads, grain bowls, and cold-pressed juices',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
    cuisine: 'Healthy',
    rating: 4.6,
    reviewCount: 421,
    deliveryTime: '15-25 min',
    deliveryFee: 1.49,
    minOrder: 10,
    distance: '0.3 mi',
    menu: [
      {
        id: 'm1',
        name: 'Bowls',
        items: [
          {
            id: 'i14',
            name: 'Acai Power Bowl',
            description: 'Acai, granola, banana, honey, chia seeds',
            price: 12.99,
            image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&q=80',
            popular: true,
          },
          {
            id: 'i15',
            name: 'Mediterranean Bowl',
            description: 'Quinoa, falafel, hummus, feta, olives',
            price: 14.99,
            image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80',
          },
        ],
      },
    ],
  },
  {
    id: 'r6',
    name: 'Spice Route',
    description: 'Aromatic curries, tandoori, and fresh naan bread',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80',
    cuisine: 'Indian',
    rating: 4.7,
    reviewCount: 612,
    deliveryTime: '30-40 min',
    deliveryFee: 2.49,
    minOrder: 18,
    distance: '1.5 mi',
    menu: [
      {
        id: 'm1',
        name: 'Curries',
        items: [
          {
            id: 'i16',
            name: 'Butter Chicken',
            description: 'Creamy tomato curry with tender chicken',
            price: 17.99,
            image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80',
            popular: true,
          },
          {
            id: 'i17',
            name: 'Palak Paneer',
            description: 'Spinach curry with house-made paneer',
            price: 15.99,
            image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80',
          },
        ],
      },
    ],
  },
];

export function getRestaurantById(id: string): Restaurant | undefined {
  return RESTAURANTS.find((r) => r.id === id);
}

export function searchRestaurants(query: string, cuisine?: CuisineType): Restaurant[] {
  const q = query.toLowerCase().trim();
  return RESTAURANTS.filter((r) => {
    const matchesQuery =
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.cuisine.toLowerCase().includes(q);
    const matchesCuisine = !cuisine || r.cuisine === cuisine;
    return matchesQuery && matchesCuisine;
  });
}
