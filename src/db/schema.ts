import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";

export const mixtapes = pgTable("mixtapes", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").unique().notNull(),
  skinId: integer("skin_id").notNull(),
  stickerId: integer("sticker_id"),
  recipientName: text("recipient_name"),
  note: text("note").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tracks = pgTable("tracks", {
  id: uuid("id").defaultRandom().primaryKey(),
  mixtapeId: uuid("mixtape_id")
    .notNull()
    .references(() => mixtapes.id, { onDelete: "cascade" }),
  fileUrl: text("file_url").notNull(),
  title: text("title").notNull(),
  trackOrder: integer("track_order").notNull(),
});

export type Mixtape = typeof mixtapes.$inferSelect;
export type Track = typeof tracks.$inferSelect;
