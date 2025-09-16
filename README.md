# Flashy Cardy

A modern flashcard application built with Next.js 14, Clerk authentication, and Drizzle ORM.

## Features

- 🔐 **Secure Authentication** with Clerk
- 📚 **Organize Flashcard Decks** by subject or topic
- 🤖 **Free Translation** for language learning flashcards
- 🎯 **Smart Study System** with progress tracking
- 📊 **Progress Analytics** to monitor learning
- 🌙 **Dark Theme** with beautiful UI components
- 🔄 **Reverse Card Generation** for bidirectional learning

## Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- A Clerk account (sign up at [clerk.com](https://clerk.com))

## Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd flashy-cardy
npm install
```

### 2. Configure Clerk Authentication

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application or use existing one
3. Copy your API keys from the API Keys section
4. Create a `.env.local` file in the root directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here

# Database connection (required for flashcard storage)
DATABASE_URL=your_database_connection_string_here
```

⚠️ **Important**: Replace the placeholder values with your actual Clerk and database credentials.

### 3. Free Translation Feature ✨

The app includes **completely free translation** for language learning flashcards using **MyMemory API**:

- ✅ **No API key required** - Works out of the box
- ✅ **No costs or quotas** - Unlimited free translations  
- ✅ **20+ Languages supported** - English, Spanish, French, German, Italian, Portuguese, Japanese, Korean, Chinese (Mandarin), Arabic, Russian, Hindi, Dutch, Swedish, Norwegian, Danish, Polish, Turkish, Thai, Vietnamese, and more
- ✅ **High quality translations** - Professional-grade results
- ✅ **Perfect for flashcards** - Optimized for language learning

**No setup required!** The translation feature works immediately after installation.

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev  
# or
pnpm dev
# or
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## How to Use

1. **Sign up/Sign in** using Clerk authentication
2. **Create flashcard decks** organized by topic or subject
3. **Add flashcards** with front and back content
4. **Use auto-translation** - Toggle "Auto-Translation" when creating cards to automatically translate between languages
5. **Study your decks** with the smart study system
6. **Track your progress** with built-in analytics

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL with Drizzle ORM  
- **Authentication**: Clerk
- **UI Components**: shadcn/ui + Tailwind CSS
- **Translation**: MyMemory API (free)
- **Deployment**: Vercel-ready

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).
