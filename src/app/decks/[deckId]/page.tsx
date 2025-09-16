import { getDeckById, getDeckFlashcards } from "@/db/queries";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowLeft, Plus, BookOpen, Calendar } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddFlashcardDialog } from "@/components/AddFlashcardDialog";
import { EditFlashcardDialog } from "@/components/EditFlashcardDialog";
import { EditDeckDialog } from "@/components/EditDeckDialog";
import { DeleteFlashcardButton } from "@/components/DeleteFlashcardButton";

interface DeckPageProps {
  params: Promise<{
    deckId: string;
  }>;
}

export default async function DeckPage({ params }: DeckPageProps) {
  const { deckId } = await params;
  
  // Fetch deck and flashcards data
  const [deck, flashcards] = await Promise.all([
    getDeckById(deckId),
    getDeckFlashcards(deckId)
  ]);

  // If deck doesn't exist or user doesn't have access, show 404
  if (!deck) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <SignedOut>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-semibold text-foreground">
              Please sign in to view this deck
            </h1>
            <SignInButton mode="modal">
              <Button size="lg">Sign In</Button>
            </SignInButton>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="container mx-auto p-6 space-y-6">
          {/* Navigation */}
          <div className="flex items-center space-x-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Button>
            </Link>
          </div>

          {/* Deck Header */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <h1 className="text-3xl font-bold text-foreground">{deck.title}</h1>
                  <EditDeckDialog
                    deck={deck}
                    trigger={
                      <Button variant="outline" size="sm" className="text-xs h-7 px-2">
                        Edit
                      </Button>
                    }
                  />
                </div>
                {deck.description && (
                  <p className="text-lg text-muted-foreground">{deck.description}</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <BookOpen className="w-3 h-3" />
                  <span>{deck.cardCount} {deck.cardCount === 1 ? 'card' : 'cards'}</span>
                </Badge>
              </div>
            </div>

            {/* Deck Meta Information */}
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center space-x-1 cursor-default">
                    <Calendar className="w-4 h-4" />
                    <span>Created {new Date(deck.createdAt).toLocaleDateString()}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Date Created</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center space-x-1 cursor-default">
                    <Calendar className="w-4 h-4" />
                    <span>Updated {new Date(deck.updatedAt).toLocaleDateString()}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Date Updated</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <AddFlashcardDialog deckId={deckId} />
              {flashcards.length > 0 && (
                <Button variant="outline" size="lg">
                  Study Deck
                </Button>
              )}
            </div>
          </div>

          {/* Flashcards Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Flashcards</h2>
            
            {flashcards.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No flashcards yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Add your first flashcard to start studying this deck!
                </p>
                <AddFlashcardDialog 
                  deckId={deckId}
                  trigger={
                    <Button className="flex items-center space-x-2">
                      <Plus className="w-4 h-4" />
                      <span>Add Your First Flashcard</span>
                    </Button>
                  }
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {flashcards.map((flashcard, index) => (
                  <Card key={flashcard.id} className="group hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          Card {index + 1}
                        </Badge>
                        <div className="flex items-center space-x-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="text-xs text-muted-foreground cursor-default">
                                {new Date(flashcard.createdAt).toLocaleDateString()}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Date Created</p>
                            </TooltipContent>
                          </Tooltip>
                          <div className="flex items-center space-x-1">
                            <EditFlashcardDialog
                              flashcard={flashcard}
                              trigger={
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-xs h-6 px-2"
                                >
                                  Edit
                                </Button>
                              }
                            />
                            <DeleteFlashcardButton flashcard={flashcard} />
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Front</h4>
                        <p className="text-sm">{flashcard.front}</p>
                      </div>
                      <Separator />
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Back</h4>
                        <p className="text-sm">{flashcard.back}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </SignedIn>
    </div>
  );
}
