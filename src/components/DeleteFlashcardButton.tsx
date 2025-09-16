"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { deleteFlashcardAction, type DeleteFlashcardInput } from "@/actions/flashcard-actions";
import type { SelectFlashcard } from "@/db/schema";

interface DeleteFlashcardButtonProps {
  flashcard: SelectFlashcard;
  className?: string;
}

export function DeleteFlashcardButton({ flashcard, className }: DeleteFlashcardButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this flashcard? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);

    const deleteData: DeleteFlashcardInput = {
      flashcardId: flashcard.id,
      deckId: flashcard.deckId,
    };

    try {
      const result = await deleteFlashcardAction(deleteData);

      if (!result.success) {
        alert(result.error || "Failed to delete flashcard");
        return;
      }

      // The page will automatically update due to revalidatePath in the server action
      router.refresh();

    } catch (error) {
      console.error("Error deleting flashcard:", error);
      alert("An unexpected error occurred while deleting");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDelete}
      disabled={isDeleting}
      className={`text-xs h-6 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 ${className || ""}`}
    >
      {isDeleting ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <Trash2 className="w-3 h-3" />
      )}
      <span className="ml-1">{isDeleting ? "Deleting..." : "Delete"}</span>
    </Button>
  );
}
