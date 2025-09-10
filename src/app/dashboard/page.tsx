import { getUserDecks } from "@/db/queries";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function DashboardPage() {
  const decks = await getUserDecks();

  return (
    <div className="min-h-screen bg-background">
      <SignedOut>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-semibold text-foreground">
              Please sign in to access your dashboard
            </h1>
            <SignInButton mode="modal">
              <Button size="lg">Sign In</Button>
            </SignInButton>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground">Manage your flashcard decks</p>
            </div>
            <Button size="lg">
              Create New Deck
            </Button>
          </div>

          {decks.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                No decks yet
              </h2>
              <p className="text-muted-foreground mb-4">
                Create your first flashcard deck to get started!
              </p>
              <Button>Create Your First Deck</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {decks.map((deck) => (
                <Link href={`/decks/${deck.id}`} key={deck.id}>
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{deck.title}</CardTitle>
                        <Badge variant="secondary">
                          {deck.cardCount} {deck.cardCount === 1 ? 'card' : 'cards'}
                        </Badge>
                      </div>
                      {deck.description && (
                        <CardDescription className="line-clamp-2">
                          {deck.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Created {new Date(deck.createdAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </SignedIn>
    </div>
  );
}
