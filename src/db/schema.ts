import { integer, pgTable, varchar, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Decks table - collections of flashcards
export const decksTable = pgTable("decks", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  userId: varchar("user_id", { length: 255 }).notNull(),
  cardCount: integer("card_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Flashcards table - individual cards within decks
export const flashcardsTable = pgTable("flashcards", {
  id: uuid("id").primaryKey().defaultRandom(),
  deckId: uuid("deck_id").notNull().references(() => decksTable.id, { onDelete: "cascade" }),
  front: text("front").notNull(),
  back: text("back").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Study sessions table - tracking user progress
export const studySessionsTable = pgTable("study_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  deckId: uuid("deck_id").notNull().references(() => decksTable.id, { onDelete: "cascade" }),
  userId: varchar("user_id", { length: 255 }).notNull(),
  score: integer("score").notNull(),
  totalCards: integer("total_cards").notNull(),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
});

// Relations
export const decksRelations = relations(decksTable, ({ many }) => ({
  flashcards: many(flashcardsTable),
  studySessions: many(studySessionsTable),
}));

export const flashcardsRelations = relations(flashcardsTable, ({ one }) => ({
  deck: one(decksTable, {
    fields: [flashcardsTable.deckId],
    references: [decksTable.id],
  }),
}));

export const studySessionsRelations = relations(studySessionsTable, ({ one }) => ({
  deck: one(decksTable, {
    fields: [studySessionsTable.deckId],
    references: [decksTable.id],
  }),
}));

// Infer types for TypeScript
export type InsertDeck = typeof decksTable.$inferInsert;
export type SelectDeck = typeof decksTable.$inferSelect;
export type InsertFlashcard = typeof flashcardsTable.$inferInsert;
export type SelectFlashcard = typeof flashcardsTable.$inferSelect;
export type InsertStudySession = typeof studySessionsTable.$inferInsert;
export type SelectStudySession = typeof studySessionsTable.$inferSelect;
