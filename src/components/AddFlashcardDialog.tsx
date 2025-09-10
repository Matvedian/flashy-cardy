"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2 } from "lucide-react";
import { createFlashcardAction, type CreateFlashcardInput } from "@/actions/flashcard-actions";

interface AddFlashcardDialogProps {
  deckId: string;
  trigger?: React.ReactNode;
}

export function AddFlashcardDialog({ deckId, trigger }: AddFlashcardDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    front: "",
    back: "",
  });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const input: CreateFlashcardInput = {
      deckId,
      front: formData.front.trim(),
      back: formData.back.trim(),
    };

    try {
      const result = await createFlashcardAction(input);

      if (result.success) {
        // Reset form and close dialog
        setFormData({ front: "", back: "" });
        setOpen(false);
        // The page will automatically update due to revalidatePath in the server action
        router.refresh();
      } else {
        setError(result.error || "Failed to create flashcard");
      }
    } catch (error) {
      console.error("Error creating flashcard:", error);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const isFormValid = formData.front.trim().length > 0 && formData.back.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Flashcard</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Flashcard</DialogTitle>
          <DialogDescription>
            Create a new flashcard for this deck. Add content for both the front and back of the card.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="front">Front of Card</Label>
            <Textarea
              id="front"
              placeholder="Enter the question or prompt..."
              value={formData.front}
              onChange={(e) => handleInputChange("front", e.target.value)}
              className="min-h-[80px]"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="back">Back of Card</Label>
            <Textarea
              id="back"
              placeholder="Enter the answer or explanation..."
              value={formData.back}
              onChange={(e) => handleInputChange("back", e.target.value)}
              className="min-h-[80px]"
              disabled={isLoading}
            />
          </div>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || isLoading}
              className="flex items-center space-x-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isLoading ? "Creating..." : "Add Flashcard"}</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
