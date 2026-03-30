# Synkr 🚀

Advanced Lifestyle Orchestration — manage bills, expenses, subscriptions, and groceries from a single premium mobile app.

## Tech Stack

- **Framework**: React Native (Expo SDK 54) + Expo Router
- **Auth**: Clerk
- **Database**: Supabase (PostgreSQL)
- **State**: Zustand
- **UI**: Premium glassmorphism design with gradient accents

## Getting Started

```bash
npm install
npx expo start
```

### Environment Variables

Create a `.env` file:

```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup

Run `supabase_schema.sql` in the Supabase SQL Editor to create the required tables.

## Features

- 📋 Bill tracking with due date alerts
- 💰 Expense categorization & analytics
- 🔄 Subscription management
- 🛒 Grocery list with auto-reminders
- 📊 Spending insights & budget tracking
- 🔐 Secure authentication via Clerk
