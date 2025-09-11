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
import { Plus, Loader2, Sparkles, ArrowLeftRight, RefreshCw } from "lucide-react";
import { createFlashcardAction, type CreateFlashcardInput } from "@/actions/flashcard-actions";

interface AddFlashcardDialogProps {
  deckId: string;
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

export function AddFlashcardDialog({ deckId, trigger }: AddFlashcardDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [aiAssistance, setAiAssistance] = useState(false);
  const [createReverse, setCreateReverse] = useState(false);
  const [fromLanguage, setFromLanguage] = useState<string>('en');
  const [toLanguage, setToLanguage] = useState<string>('es');
  const [formData, setFormData] = useState({
    front: "",
    back: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const router = useRouter();

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
          throw new Error('Please sign in to use AI translation');
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

  // Auto-translate when front text changes (if AI assistance is enabled)
  useEffect(() => {
    if (!aiAssistance || !formData.front.trim()) return;

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
  }, [formData.front, aiAssistance, fromLanguage, toLanguage]);

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

    const primaryCard: CreateFlashcardInput = {
      deckId,
      front: formData.front.trim(),
      back: formData.back.trim(),
    };

    try {
      // Create the primary flashcard
      const result = await createFlashcardAction(primaryCard);

      if (!result.success) {
        setError(result.error || "Failed to create flashcard");
        return;
      }

      // Create reverse card if requested
      if (createReverse && formData.front.trim() !== formData.back.trim()) {
        const reverseCard: CreateFlashcardInput = {
          deckId,
          front: formData.back.trim(),
          back: formData.front.trim(),
        };

        const reverseResult = await createFlashcardAction(reverseCard);
        if (!reverseResult.success) {
          console.warn("Failed to create reverse card:", reverseResult.error);
          // Don't show this as an error since the primary card succeeded
        }
      }

      // Reset form and close dialog
      setFormData({ front: "", back: "" });
      setAiAssistance(false);
      setCreateReverse(false);
      setError(null);
      setTranslationError(null);
      setOpen(false);
      
      // The page will automatically update due to revalidatePath in the server action
      router.refresh();

    } catch (error) {
      console.error("Error creating flashcard:", error);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (error) setError(null);
    if (translationError) setTranslationError(null);
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>Add New Flashcard</span>
            {aiAssistance && <Sparkles className="w-4 h-4 text-blue-500" />}
          </DialogTitle>
          <DialogDescription>
            Create a new flashcard for this deck. {aiAssistance ? 'AI will help translate your content.' : 'Add content for both the front and back of the card.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* AI Assistance Toggle */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <div>
                <Label className="text-sm font-medium">AI Translation Assistant</Label>
                <p className="text-xs text-muted-foreground">Automatically translate text as you type</p>
              </div>
            </div>
            <Switch
              checked={aiAssistance}
              onCheckedChange={setAiAssistance}
              disabled={isLoading}
            />
          </div>

          {/* Language Selection (only show if AI assistance is enabled) */}
          {aiAssistance && (
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
                  disabled={isLoading || isTranslating}
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
              {aiAssistance && (
                <span className="text-xs text-muted-foreground">
                  ({LANGUAGE_OPTIONS[fromLanguage as keyof typeof LANGUAGE_OPTIONS]})
                </span>
              )}
            </Label>
            <Textarea
              id="front"
              placeholder={aiAssistance 
                ? `Enter text in ${LANGUAGE_OPTIONS[fromLanguage as keyof typeof LANGUAGE_OPTIONS]}...` 
                : "Enter the question or prompt..."
              }
              value={formData.front}
              onChange={(e) => handleInputChange("front", e.target.value)}
              className="min-h-[80px]"
              disabled={isLoading}
            />
          </div>

          {/* Back of Card */}
          <div className="space-y-2">
            <Label htmlFor="back" className="flex items-center space-x-2">
              <span>Back of Card</span>
              {aiAssistance && (
                <span className="text-xs text-muted-foreground">
                  ({LANGUAGE_OPTIONS[toLanguage as keyof typeof LANGUAGE_OPTIONS]})
                </span>
              )}
              {isTranslating && (
                <RefreshCw className="w-3 h-3 animate-spin text-blue-500" />
              )}
            </Label>
            <Textarea
              id="back"
              placeholder={aiAssistance 
                ? `Translation will appear here...` 
                : "Enter the answer or explanation..."
              }
              value={formData.back}
              onChange={(e) => handleInputChange("back", e.target.value)}
              className="min-h-[80px]"
              disabled={isLoading || (aiAssistance && isTranslating)}
            />
          </div>

          {/* Create Reverse Card Option */}
          {aiAssistance && (
            <div className="flex items-center space-x-2">
              <Switch
                checked={createReverse}
                onCheckedChange={setCreateReverse}
                disabled={isLoading}
              />
              <Label className="text-sm">Create reverse card (both directions)</Label>
            </div>
          )}

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

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading || isTranslating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || isLoading || isTranslating}
              className="flex items-center space-x-2"
            >
              {(isLoading || isTranslating) && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>
                {isLoading 
                  ? "Creating..." 
                  : isTranslating 
                    ? "Translating..." 
                    : createReverse 
                      ? "Add Cards" 
                      : "Add Flashcard"
                }
              </span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
