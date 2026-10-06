import { pgTable, text, jsonb, bigint, timestamp, primaryKey } from "drizzle-orm/pg-core";

// One row per scouting report. The full report object lives in `data`.
export const players = pgTable("players", {
  id: text().primaryKey(),
  data: jsonb().notNull(),
  updatedAt: bigint("updated_at", { mode: "number" }).notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// One row per ranked board (level + category), holding the ordered player ids.
export const boards = pgTable(
  "boards",
  {
    level: text().notNull(),
    category: text().notNull(),
    playerIds: jsonb("player_ids").$type<string[]>().notNull().default([]),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.level, t.category] })]
);
