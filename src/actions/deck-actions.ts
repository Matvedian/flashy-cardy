"use server";

import { updateDeck, deleteDeck } from "@/db/queries";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Zod schema for validating deck update input
const UpdateDeckSchema = z.object({
  deckId: z.string().min(1, "Deck ID is required"),
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
  description: z.string().max(1000, "Description is too long").optional(),
});

// Zod schema for validating deck deletion input
const DeleteDeckSchema = z.object({
  deckId: z.string().min(1, "Deck ID is required"),
});

export type UpdateDeckInput = z.infer<typeof UpdateDeckSchema>;
export type DeleteDeckInput = z.infer<typeof DeleteDeckSchema>;

export async function updateDeckAction(input: UpdateDeckInput) {
  try {
    // Validate input
    const validatedInput = UpdateDeckSchema.parse(input);
    
    // Update deck using the centralized query helper
    const updatedDeck = await updateDeck(
      validatedInput.deckId,
      validatedInput.title,
      validatedInput.description
    );
    
    if (!updatedDeck) {
      return { success: false, error: "Failed to update deck" };
    }
    
    // Revalidate the deck page and dashboard to show the updated deck
    revalidatePath(`/decks/${validatedInput.deckId}`);
    revalidatePath("/dashboard");
    
    return { success: true, deck: updatedDeck };
  } catch (error) {
    console.error("Error updating deck:", error);
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: "Invalid input data",
        details: error.issues 
      };
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update deck" 
    };
  }
}

export async function deleteDeckAction(input: DeleteDeckInput) {
  try {
    // Validate input
    const validatedInput = DeleteDeckSchema.parse(input);
    
    // Delete deck using the centralized query helper
    const success = await deleteDeck(validatedInput.deckId);
    
    if (!success) {
      return { success: false, error: "Failed to delete deck" };
    }
    
    // Revalidate the dashboard to remove the deleted deck
    revalidatePath("/dashboard");
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting deck:", error);
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: "Invalid input data",
        details: error.issues 
      };
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete deck" 
    };
  }
}
