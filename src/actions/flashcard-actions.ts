"use server";

import { createFlashcard } from "@/db/queries";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Zod schema for validating flashcard creation input
const CreateFlashcardSchema = z.object({
  deckId: z.string().min(1, "Deck ID is required"),
  front: z.string().min(1, "Front text is required").max(1000, "Front text is too long"),
  back: z.string().min(1, "Back text is required").max(1000, "Back text is too long"),
});

export type CreateFlashcardInput = z.infer<typeof CreateFlashcardSchema>;

export async function createFlashcardAction(input: CreateFlashcardInput) {
  try {
    // Validate input
    const validatedInput = CreateFlashcardSchema.parse(input);
    
    // Create flashcard using the centralized query helper
    const newFlashcard = await createFlashcard(
      validatedInput.deckId,
      validatedInput.front,
      validatedInput.back
    );
    
    // Revalidate the deck page to show the new flashcard
    revalidatePath(`/decks/${validatedInput.deckId}`);
    
    return { success: true, flashcard: newFlashcard };
  } catch (error) {
    console.error("Error creating flashcard:", error);
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: "Invalid input data",
        details: error.issues 
      };
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create flashcard" 
    };
  }
}
