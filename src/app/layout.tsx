import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});



export const metadata: Metadata = {
  title: "Flashy Cardy",
  description: "A flashcard app with Clerk authentication",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "oklch(0.922 0 0)",
          colorBackground: "oklch(0.145 0 0)",
          colorInputBackground: "oklch(0.269 0 0)",
          colorInputText: "oklch(0.985 0 0)",
        },
        elements: {
          formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
          card: "bg-card border-border",
          headerTitle: "text-foreground",
          headerSubtitle: "text-muted-foreground",
          socialButtonsBlockButton: "border-border bg-card text-foreground hover:bg-accent",
          formFieldLabel: "text-foreground",
          formFieldInput: "bg-input border-border text-foreground",
          footerActionLink: "text-primary hover:text-primary/90",
        }
      }}
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
    >
      <html lang="en" className="dark">
        <body className={`${poppins.variable} antialiased`}>
          <header className="border-b border-gray-800 bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-8">
                  <Link href="/" className="flex-shrink-0">
                    <h1 className="text-xl font-semibold text-white hover:text-gray-300 transition-colors">
                      Flashy Cardy
                    </h1>
                  </Link>
                  <SignedIn>
                    <nav className="hidden sm:flex space-x-4">
                      <Link 
                        href="/dashboard" 
                        className="text-gray-300 hover:text-white transition-colors font-medium"
                      >
                        Dashboard
                      </Link>
                    </nav>
                  </SignedIn>
                </div>
                <div className="flex items-center space-x-4">
                  <SignedOut>
                    <SignInButton mode="modal">
                      <Button variant="default" size="sm">
                        Sign In
                      </Button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <Button variant="secondary" size="sm">
                        Sign Up
                      </Button>
                    </SignUpButton>
                  </SignedOut>
                  <SignedIn>
                    <UserButton />
                  </SignedIn>
                </div>
              </div>
            </div>
          </header>
          <main className="min-h-screen">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
