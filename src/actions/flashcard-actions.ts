"use server";

import { createFlashcard, updateFlashcard, deleteFlashcard } from "@/db/queries";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Zod schema for validating flashcard creation input
const CreateFlashcardSchema = z.object({
  deckId: z.string().min(1, "Deck ID is required"),
  front: z.string().min(1, "Front text is required").max(1000, "Front text is too long"),
  back: z.string().min(1, "Back text is required").max(1000, "Back text is too long"),
});

// Zod schema for validating flashcard update input
const UpdateFlashcardSchema = z.object({
  flashcardId: z.string().min(1, "Flashcard ID is required"),
  front: z.string().min(1, "Front text is required").max(1000, "Front text is too long"),
  back: z.string().min(1, "Back text is required").max(1000, "Back text is too long"),
});

// Zod schema for validating flashcard deletion input
const DeleteFlashcardSchema = z.object({
  flashcardId: z.string().min(1, "Flashcard ID is required"),
  deckId: z.string().min(1, "Deck ID is required"), // For revalidation
});

export type CreateFlashcardInput = z.infer<typeof CreateFlashcardSchema>;
export type UpdateFlashcardInput = z.infer<typeof UpdateFlashcardSchema>;
export type DeleteFlashcardInput = z.infer<typeof DeleteFlashcardSchema>;

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

export async function updateFlashcardAction(input: UpdateFlashcardInput) {
  try {
    // Validate input
    const validatedInput = UpdateFlashcardSchema.parse(input);
    
    // Update flashcard using the centralized query helper
    const updatedFlashcard = await updateFlashcard(
      validatedInput.flashcardId,
      validatedInput.front,
      validatedInput.back
    );
    
    // Revalidate the deck page to show the updated flashcard
    revalidatePath(`/decks/${updatedFlashcard.deckId}`);
    
    return { success: true, flashcard: updatedFlashcard };
  } catch (error) {
    console.error("Error updating flashcard:", error);
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: "Invalid input data",
        details: error.issues 
      };
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update flashcard" 
    };
  }
}

export async function deleteFlashcardAction(input: DeleteFlashcardInput) {
  try {
    // Validate input
    const validatedInput = DeleteFlashcardSchema.parse(input);
    
    // Delete flashcard using the centralized query helper
    const success = await deleteFlashcard(validatedInput.flashcardId);
    
    if (!success) {
      return { success: false, error: "Failed to delete flashcard" };
    }
    
    // Revalidate the deck page to remove the deleted flashcard
    revalidatePath(`/decks/${validatedInput.deckId}`);
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting flashcard:", error);
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: "Invalid input data",
        details: error.issues 
      };
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete flashcard" 
    };
  }
}
