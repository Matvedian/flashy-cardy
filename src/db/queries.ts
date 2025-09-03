import { auth } from "@clerk/nextjs/server";
import { Deck } from "@/lib/types";
import { db } from "./index";
import { decksTable, flashcardsTable } from "./schema";
import { eq, count, and } from "drizzle-orm";

/**
 * Get all decks for the current authenticated user
 */
export async function getUserDecks(): Promise<Deck[]> {
  const { userId } = await auth();
  
  if (!userId) {
    return []; // Return empty array instead of throwing error
  }

  const decks = await db
    .select({
      id: decksTable.id,
      title: decksTable.title,
      description: decksTable.description,
      userId: decksTable.userId,
      cardCount: decksTable.cardCount,
      createdAt: decksTable.createdAt,
      updatedAt: decksTable.updatedAt,
    })
    .from(decksTable)
    .where(eq(decksTable.userId, userId));

  return decks;
}

/**
 * Get a specific deck by ID for the current user
 */
export async function getDeckById(deckId: string): Promise<Deck | null> {
  const { userId } = await auth();
  
  if (!userId) {
    return null; // Return null instead of throwing error
  }

  const decks = await db
    .select({
      id: decksTable.id,
      title: decksTable.title,
      description: decksTable.description,
      userId: decksTable.userId,
      cardCount: decksTable.cardCount,
      createdAt: decksTable.createdAt,
      updatedAt: decksTable.updatedAt,
    })
    .from(decksTable)
    .where(and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)))
    .limit(1);

  return decks[0] || null;
}

/**
 * Create a new deck for the current user
 */
export async function createDeck(title: string, description?: string): Promise<Deck> {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Authentication required to create deck");
  }

  const [newDeck] = await db
    .insert(decksTable)
    .values({
      title,
      description: description || null,
      userId,
      cardCount: 0,
    })
    .returning();
  
  return newDeck;
}

/**
 * Update a deck's title and description
 */
export async function updateDeck(deckId: string, title: string, description?: string): Promise<Deck | null> {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Authentication required to update deck");
  }

  const [updatedDeck] = await db
    .update(decksTable)
    .set({
      title,
      description: description || null,
      updatedAt: new Date(),
    })
    .where(and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)))
    .returning();
  
  return updatedDeck || null;
}

/**
 * Delete a deck (only if user owns it)
 */
export async function deleteDeck(deckId: string): Promise<boolean> {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Authentication required to delete deck");
  }

  const result = await db
    .delete(decksTable)
    .where(and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)))
    .returning({ id: decksTable.id });
  
  return result.length > 0;
}

/**
 * Update the card count for a deck based on actual flashcards
 */
export async function updateDeckCardCount(deckId: string): Promise<void> {
  const [cardCountResult] = await db
    .select({ count: count() })
    .from(flashcardsTable)
    .where(eq(flashcardsTable.deckId, deckId));

  await db
    .update(decksTable)
    .set({ 
      cardCount: cardCountResult.count,
      updatedAt: new Date(),
    })
    .where(eq(decksTable.id, deckId));
}

/**
 * Get all flashcards for a specific deck
 */
export async function getDeckFlashcards(deckId: string) {
  const { userId } = await auth();
  
  if (!userId) {
    return [];
  }

  // First verify the user owns this deck
  const deck = await getDeckById(deckId);
  if (!deck) {
    return [];
  }

  return await db
    .select()
    .from(flashcardsTable)
    .where(eq(flashcardsTable.deckId, deckId));
}

/**
 * Create a new flashcard in a deck
 */
export async function createFlashcard(deckId: string, front: string, back: string) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Authentication required to create flashcard");
  }

  // Verify the user owns this deck
  const deck = await getDeckById(deckId);
  if (!deck) {
    throw new Error("Deck not found or access denied");
  }

  const [newCard] = await db
    .insert(flashcardsTable)
    .values({
      deckId,
      front,
      back,
    })
    .returning();

  // Update the deck's card count
  await updateDeckCardCount(deckId);
  
  return newCard;
}
