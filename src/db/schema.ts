import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// Lists テーブル
export const lists = sqliteTable("lists", {
  id: int().primaryKey({ autoIncrement: true }),
  title: text().notNull(),
  position: int().notNull(),
  createdAt: int({ mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: int({ mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// Cards テーブル
export const cards = sqliteTable("cards", {
  id: int().primaryKey({ autoIncrement: true }),
  title: text().notNull(),
  description: text(),
  position: int().notNull(),
  completed: int({ mode: 'boolean' }).default(false),
  dueDate: int({ mode: 'timestamp' }),
  listId: int().notNull().references(() => lists.id, { onDelete: 'cascade' }),
  createdAt: int({ mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: int({ mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// Relations（リレーションシップ定義）
import { relations } from 'drizzle-orm';

export const listsRelations = relations(lists, ({ many }) => ({
  cards: many(cards)
}));

export const cardsRelations = relations(cards, ({ one }) => ({
  list: one(lists, {
    fields: [cards.listId],
    references: [lists.id]
  })
}));