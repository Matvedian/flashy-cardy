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

## Authentication Flow

When you click "Get Started" or sign-in buttons, you'll be redirected to Clerk's hosted authentication pages. This is normal behavior:

1. **Sign In/Up**: Redirects to `https://[your-clerk-subdomain].accounts.dev/sign-in`
2. **After Authentication**: Returns to `/dashboard` (configured in `src/app/layout.tsx`)
3. **Protected Routes**: Middleware automatically protects routes that require authentication

## Troubleshooting

### "Authentication redirect not working"
- Ensure your `.env.local` file has the correct Clerk API keys
- Check that your Clerk application is configured with the correct domains
- Verify that `afterSignInUrl` and `afterSignUpUrl` are set correctly in `ClerkProvider`

### "Cannot access dashboard"
- Make sure you're signed in through Clerk's authentication flow
- Check browser console for any JavaScript errors
- Verify that database connection is working (if applicable)

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Poppins](https://fonts.google.com/specimen/Poppins), a clean and modern font family from Google Fonts.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
