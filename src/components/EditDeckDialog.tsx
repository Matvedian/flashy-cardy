"use client";

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Edit, Loader2, Trash2 } from "lucide-react";
import { updateDeckAction, deleteDeckAction, type UpdateDeckInput, type DeleteDeckInput } from "@/actions/deck-actions";
import type { SelectDeck } from "@/db/schema";

interface EditDeckDialogProps {
  deck: SelectDeck;
  trigger?: React.ReactNode;
}

export function EditDeckDialog({ deck, trigger }: EditDeckDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    title: deck.title,
    description: deck.description || "",
  });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Reset form data when deck changes or dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        title: deck.title,
        description: deck.description || "",
      });
      setError(null);
    }
  }, [open, deck]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const updateData: UpdateDeckInput = {
      deckId: deck.id,
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
    };

    try {
      // Update the deck
      const result = await updateDeckAction(updateData);

      if (!result.success) {
        setError(result.error || "Failed to update deck");
        return;
      }

      // Reset form and close dialog
      setError(null);
      setOpen(false);
      
      // The page will automatically update due to revalidatePath in the server action
      router.refresh();

    } catch (error) {
      console.error("Error updating deck:", error);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${deck.title}"? This will permanently delete the deck and all its flashcards. This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    const deleteData: DeleteDeckInput = {
      deckId: deck.id,
    };

    try {
      const result = await deleteDeckAction(deleteData);

      if (!result.success) {
        setError(result.error || "Failed to delete deck");
        return;
      }

      // Close dialog and redirect to dashboard
      setOpen(false);
      router.push("/dashboard");

    } catch (error) {
      console.error("Error deleting deck:", error);
      setError("An unexpected error occurred while deleting");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (error) setError(null);
  };

  const isFormValid = formData.title.trim().length > 0;
  const hasChanges = formData.title !== deck.title || formData.description !== (deck.description || "");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="flex items-center space-x-2">
            <Edit className="w-4 h-4" />
            <span>Edit Deck</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>Edit Deck</span>
          </DialogTitle>
          <DialogDescription>
            Update your deck's title and description. You can also delete the deck if you no longer need it.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter deck title..."
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              disabled={isLoading || isDeleting}
              className="w-full"
            />
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Enter deck description..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="min-h-[80px]"
              disabled={isLoading || isDeleting}
            />
          </div>

          <Separator />

          {/* Deck Stats */}
          <div className="text-sm text-muted-foreground space-y-1">
            <div>Cards: {deck.cardCount}</div>
            <div>Created: {new Date(deck.createdAt).toLocaleDateString()}</div>
            <div>Updated: {new Date(deck.updatedAt).toLocaleDateString()}</div>
          </div>

          {/* Errors */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading || isDeleting}
              className="flex items-center space-x-2"
            >
              {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
              <Trash2 className="w-4 h-4" />
              <span>{isDeleting ? "Deleting..." : "Delete Deck"}</span>
            </Button>
            
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading || isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!isFormValid || !hasChanges || isLoading || isDeleting}
                className="flex items-center space-x-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>
                  {isLoading ? "Updating..." : "Update Deck"}
                </span>
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
