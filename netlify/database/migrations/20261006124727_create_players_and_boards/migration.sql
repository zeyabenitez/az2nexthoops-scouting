CREATE TABLE "boards" (
	"level" text,
	"category" text,
	"player_ids" jsonb DEFAULT '[]' NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "boards_pkey" PRIMARY KEY("level","category")
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" text PRIMARY KEY,
	"data" jsonb NOT NULL,
	"updated_at" bigint DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
