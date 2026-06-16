# QuickBite — Food Delivery App

A DoorDash-style food delivery platform built with TypeScript. Includes a **Next.js website** and an **Expo React Native mobile app**, sharing types and data through a common package.

## Features

- Browse restaurants with search and cuisine filters
- View menus and add items to cart
- Cart management with quantity controls
- Checkout with delivery address and driver tip
- Live order tracking with status timeline
- Responsive web UI and native mobile experience

## Project Structure

```
quickbite/
├── apps/
│   ├── web/          # Next.js website
│   └── mobile/       # Expo React Native app
└── packages/
    └── shared/       # Shared types, mock data, utilities
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- For mobile: Expo Go app on your phone, or Xcode/Android Studio for simulators

### Install

```bash
cd quickbite
npm install
npm run build:shared
```

### Run the Website

```bash
npm run dev:web
```

Open [http://localhost:3000](http://localhost:3000)

### Run the Mobile App

```bash
npm run dev:mobile
```

Then scan the QR code with Expo Go, or press `i` for iOS simulator / `a` for Android emulator.

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Web      | Next.js 16, React 19, Tailwind CSS  |
| Mobile   | Expo 56, React Native, React Navigation |
| Shared   | TypeScript                          |
| State    | Zustand                             |

## What's Mocked

This is a frontend MVP. Restaurant data, menus, and order tracking are simulated with mock data. To go production-ready you'd add:

- Backend API (Node/Express, NestJS, etc.)
- Database for restaurants, orders, users
- Authentication (email, OAuth)
- Payment processing (Stripe)
- Real-time driver tracking (WebSockets)
- Push notifications for order updates

## License

MIT
