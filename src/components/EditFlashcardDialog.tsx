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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Edit, Loader2, Sparkles, ArrowLeftRight, RefreshCw, BookOpen, Trash2 } from "lucide-react";
import { updateFlashcardAction, deleteFlashcardAction, type UpdateFlashcardInput, type DeleteFlashcardInput } from "@/actions/flashcard-actions";
import type { SelectFlashcard } from "@/db/schema";

interface EditFlashcardDialogProps {
  flashcard: SelectFlashcard;
  trigger?: React.ReactNode;
}

// Language options based on API
const LANGUAGE_OPTIONS = {
  'en': 'English',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'ja': 'Japanese',
  'ko': 'Korean',
  'zh': 'Chinese (Mandarin)',
  'ar': 'Arabic',
  'ru': 'Russian',
  'hi': 'Hindi',
  'nl': 'Dutch',
  'sv': 'Swedish',
  'no': 'Norwegian',
  'da': 'Danish',
  'pl': 'Polish',
  'tr': 'Turkish',
  'th': 'Thai',
  'vi': 'Vietnamese',
} as const;

interface TranslationResponse {
  translation: string;
  fromLanguage: string;
  toLanguage: string;
  originalText: string;
  fromLanguageName: string;
  toLanguageName: string;
}

interface BritishHistoryResponse {
  answer: string;
  question: string;
  service: string;
  confidence: string;
  message: string;
}

export function EditFlashcardDialog({ flashcard, trigger }: EditFlashcardDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isGeneratingAnswer, setIsGeneratingAnswer] = useState(false);
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [autoBritishHistory, setAutoBritishHistory] = useState(false);
  const [fromLanguage, setFromLanguage] = useState<string>('en');
  const [toLanguage, setToLanguage] = useState<string>('es');
  const [formData, setFormData] = useState({
    front: flashcard.front,
    back: flashcard.back,
  });
  const [error, setError] = useState<string | null>(null);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const router = useRouter();

  // Reset form data when flashcard changes or dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        front: flashcard.front,
        back: flashcard.back,
      });
      setError(null);
      setTranslationError(null);
      setHistoryError(null);
      setAutoTranslate(false);
      setAutoBritishHistory(false);
    }
  }, [open, flashcard]);

  // Translation function
  const translateText = async (text: string, from: string, to: string): Promise<string> => {
    if (!text.trim()) return "";
    
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          fromLanguage: from,
          toLanguage: to,
          context: "language learning flashcard"
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Translation failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If response is not JSON, use the status text
          errorMessage = response.statusText || `HTTP ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const data: TranslationResponse = await response.json();
      return data.translation;
    } catch (error) {
      console.error('Translation error:', error);
      
      // Provide specific error messages based on the error type
      if (error instanceof Error) {
        if (error.message.includes('Authentication required')) {
          throw new Error('Please sign in to use auto-translation');
        } else if (error.message.includes('OpenAI API key not configured')) {
          throw new Error('Translation service not available');
        } else {
          throw new Error(error.message);
        }
      } else {
        throw new Error('Translation service unavailable');
      }
    }
  };

  // British History answer generation function
  const generateHistoryAnswer = async (question: string): Promise<string> => {
    if (!question.trim()) return "";
    
    try {
      const response = await fetch('/api/british-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question.trim(),
          context: "british history flashcard"
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to generate answer';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          errorMessage = response.statusText || `HTTP ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const data: BritishHistoryResponse = await response.json();
      return data.answer;
    } catch (error) {
      console.error('British History generation error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Authentication required')) {
          throw new Error('Please sign in to use auto-answer generation');
        } else {
          throw new Error(error.message);
        }
      } else {
        throw new Error('Answer generation service unavailable');
      }
    }
  };

  // Auto-translate when front text changes (if auto-translation is enabled)
  useEffect(() => {
    if (!autoTranslate || !formData.front.trim() || formData.front === flashcard.front) return;

    const timeoutId = setTimeout(async () => {
      setIsTranslating(true);
      setTranslationError(null);
      
      try {
        const translation = await translateText(formData.front, fromLanguage, toLanguage);
        setFormData(prev => ({ ...prev, back: translation }));
      } catch (error) {
        setTranslationError(error instanceof Error ? error.message : 'Translation failed');
      } finally {
        setIsTranslating(false);
      }
    }, 1000); // Debounce for 1 second

    return () => clearTimeout(timeoutId);
  }, [formData.front, autoTranslate, fromLanguage, toLanguage, flashcard.front]);

  // Auto-generate British History answers when front text changes (if enabled)
  useEffect(() => {
    if (!autoBritishHistory || !formData.front.trim() || formData.front === flashcard.front) return;

    const timeoutId = setTimeout(async () => {
      setIsGeneratingAnswer(true);
      setHistoryError(null);
      
      try {
        const answer = await generateHistoryAnswer(formData.front);
        setFormData(prev => ({ ...prev, back: answer }));
      } catch (error) {
        setHistoryError(error instanceof Error ? error.message : 'Answer generation failed');
      } finally {
        setIsGeneratingAnswer(false);
      }
    }, 1000); // Debounce for 1 second

    return () => clearTimeout(timeoutId);
  }, [formData.front, autoBritishHistory, flashcard.front]);

  // Swap languages
  const swapLanguages = () => {
    const newFromLang = toLanguage;
    const newToLang = fromLanguage;
    setFromLanguage(newFromLang);
    setToLanguage(newToLang);
    
    // Swap the text content too
    setFormData(prev => ({
      front: prev.back,
      back: prev.front,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const updateData: UpdateFlashcardInput = {
      flashcardId: flashcard.id,
      front: formData.front.trim(),
      back: formData.back.trim(),
    };

    try {
      // Update the flashcard
      const result = await updateFlashcardAction(updateData);

      if (!result.success) {
        setError(result.error || "Failed to update flashcard");
        return;
      }

      // Reset form and close dialog
      setError(null);
      setTranslationError(null);
      setHistoryError(null);
      setOpen(false);
      
      // The page will automatically update due to revalidatePath in the server action
      router.refresh();

    } catch (error) {
      console.error("Error updating flashcard:", error);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this flashcard? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    const deleteData: DeleteFlashcardInput = {
      flashcardId: flashcard.id,
      deckId: flashcard.deckId,
    };

    try {
      const result = await deleteFlashcardAction(deleteData);

      if (!result.success) {
        setError(result.error || "Failed to delete flashcard");
        return;
      }

      // Close dialog and refresh
      setOpen(false);
      router.refresh();

    } catch (error) {
      console.error("Error deleting flashcard:", error);
      setError("An unexpected error occurred while deleting");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (error) setError(null);
    if (translationError) setTranslationError(null);
    if (historyError) setHistoryError(null);
  };

  const isFormValid = formData.front.trim().length > 0 && formData.back.trim().length > 0;
  const hasChanges = formData.front !== flashcard.front || formData.back !== flashcard.back;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="flex items-center space-x-2">
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>Edit Flashcard</span>
            {autoTranslate && <Sparkles className="w-4 h-4 text-blue-500" />}
            {autoBritishHistory && <BookOpen className="w-4 h-4 text-amber-600" />}
          </DialogTitle>
          <DialogDescription>
            Make changes to your flashcard content. 
            {autoTranslate && ' Auto-translation will help translate your content.'}
            {autoBritishHistory && ' British History mode will automatically generate answers to historical questions.'}
            {!autoTranslate && !autoBritishHistory && ' Update the content for both sides of the card.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Auto-Translation Toggle */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <div>
                <Label className="text-sm font-medium">Auto-Translation</Label>
                <p className="text-xs text-muted-foreground">Automatically translate text as you type</p>
              </div>
            </div>
            <Switch
              checked={autoTranslate}
              onCheckedChange={(checked) => {
                setAutoTranslate(checked);
                if (checked) setAutoBritishHistory(false); // Disable British History when translation is enabled
              }}
              disabled={isLoading || isDeleting || autoBritishHistory}
            />
          </div>

          {/* British History Toggle */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <div>
                <Label className="text-sm font-medium">British History Mode</Label>
                <p className="text-xs text-muted-foreground">Automatically generate answers to British History questions</p>
              </div>
            </div>
            <Switch
              checked={autoBritishHistory}
              onCheckedChange={(checked) => {
                setAutoBritishHistory(checked);
                if (checked) setAutoTranslate(false); // Disable translation when British History is enabled
              }}
              disabled={isLoading || isDeleting || autoTranslate}
            />
          </div>

          {/* Language Selection (only show if auto-translation is enabled) */}
          {autoTranslate && (
            <div className="space-y-3 p-3 border rounded-lg bg-blue-50/50">
              <Label className="text-sm font-medium">Translation Languages</Label>
              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <Select value={fromLanguage} onValueChange={setFromLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(LANGUAGE_OPTIONS).map(([code, name]) => (
                        <SelectItem key={code} value={code}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={swapLanguages}
                  disabled={isLoading || isDeleting || isTranslating}
                  className="px-2"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                </Button>
                <div className="flex-1">
                  <Select value={toLanguage} onValueChange={setToLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(LANGUAGE_OPTIONS).map(([code, name]) => (
                        <SelectItem key={code} value={code}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Front of Card */}
          <div className="space-y-2">
            <Label htmlFor="front" className="flex items-center space-x-2">
              <span>Front of Card</span>
              {autoTranslate && (
                <span className="text-xs text-muted-foreground">
                  ({LANGUAGE_OPTIONS[fromLanguage as keyof typeof LANGUAGE_OPTIONS]})
                </span>
              )}
              {autoBritishHistory && (
                <span className="text-xs text-muted-foreground">
                  (British History Question)
                </span>
              )}
            </Label>
            <Textarea
              id="front"
              placeholder={
                autoTranslate 
                  ? `Enter text in ${LANGUAGE_OPTIONS[fromLanguage as keyof typeof LANGUAGE_OPTIONS]}...` 
                  : autoBritishHistory
                    ? "Enter a British History question (e.g., 'Who defeated Napoleon at Waterloo?')..."
                    : "Enter the question or prompt..."
              }
              value={formData.front}
              onChange={(e) => handleInputChange("front", e.target.value)}
              className="min-h-[80px]"
              disabled={isLoading || isDeleting}
            />
          </div>

          {/* Back of Card */}
          <div className="space-y-2">
            <Label htmlFor="back" className="flex items-center space-x-2">
              <span>Back of Card</span>
              {autoTranslate && (
                <span className="text-xs text-muted-foreground">
                  ({LANGUAGE_OPTIONS[toLanguage as keyof typeof LANGUAGE_OPTIONS]})
                </span>
              )}
              {autoBritishHistory && (
                <span className="text-xs text-muted-foreground">
                  (Historical Answer)
                </span>
              )}
              {isTranslating && (
                <RefreshCw className="w-3 h-3 animate-spin text-blue-500" />
              )}
              {isGeneratingAnswer && (
                <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />
              )}
            </Label>
            <Textarea
              id="back"
              placeholder={
                autoTranslate 
                  ? `Translation will appear here...` 
                  : autoBritishHistory
                    ? "Historical answer will be generated automatically..."
                    : "Enter the answer or explanation..."
              }
              value={formData.back}
              onChange={(e) => handleInputChange("back", e.target.value)}
              className="min-h-[80px]"
              disabled={isLoading || isDeleting || (autoTranslate && isTranslating) || (autoBritishHistory && isGeneratingAnswer)}
            />
          </div>

          {/* Errors */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
          {translationError && (
            <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
              Translation error: {translationError}
            </div>
          )}
          {historyError && (
            <div className="text-sm text-amber-700 bg-amber-50 p-2 rounded">
              History error: {historyError}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading || isDeleting || isTranslating || isGeneratingAnswer}
              className="flex items-center space-x-2"
            >
              {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
              <Trash2 className="w-4 h-4" />
              <span>{isDeleting ? "Deleting..." : "Delete"}</span>
            </Button>
            
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading || isDeleting || isTranslating || isGeneratingAnswer}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!isFormValid || !hasChanges || isLoading || isDeleting || isTranslating || isGeneratingAnswer}
                className="flex items-center space-x-2"
              >
                {(isLoading || isTranslating || isGeneratingAnswer) && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>
                  {isLoading 
                    ? "Updating..." 
                    : isTranslating 
                      ? "Translating..." 
                      : isGeneratingAnswer
                        ? "Generating Answer..."
                        : "Update Flashcard"
                  }
                </span>
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
