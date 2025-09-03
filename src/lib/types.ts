// Database types for the flashcard application

export interface Deck {
  id: string;
  title: string;
  description: string | null;
  userId: string;
  cardCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudySession {
  id: string;
  deckId: string;
  userId: string;
  score: number;
  totalCards: number;
  completedAt: Date;
}

// API response types
export interface CreateDeckRequest {
  title: string;
  description?: string;
}

export interface CreateCardRequest {
  front: string;
  back: string;
  deckId: string;
}


