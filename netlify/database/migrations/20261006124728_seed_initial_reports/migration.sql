-- Seed the database with the reports that were previously published in js/data.js
INSERT INTO "players" ("id","data","updated_at") VALUES ('p_sample_carter', '{"id":"p_sample_carter","name":"[SAMPLE] DeShawn Carter","level":"College","position":"PG","team":"Lakeside State (sample)","vitals":{"height":"6''2\"","weight":"185","age":"20","classYear":"Sophomore","handedness":"Right"},"objective":"Efficient, low-maintenance lead guard who projects as a reliable backup floor general.","role":"Backup PG/second-unit lead guard.","strengths":["Repeatable catch-and-shoot mechanics.","Quickly reads ball-screen coverages."],"questions":["Can he stay in front of longer NBA point guards?"],"analysis":{},"context":{},"updatedAt":0}'::jsonb, 0) ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
INSERT INTO "players" ("id","data","updated_at") VALUES ('p_msjh3xxkszzk', '{"id":"p_msjh3xxkszzk","name":"Ajay Mitchell","team":"Okc Thunder","level":"NBA","position":"SG","vitals":{"height":"6-4","weight":"190","age":"24","classYear":"2024","handedness":"Left"},"objective":"Spark plug Combo guard creative finishing, displays poise under pressure.","role":"Backup combo guard, shot creator","analysis":{},"context":{},"strengths":["Shooting"],"questions":[],"updatedAt":1786141263883}'::jsonb, 1786141263883) ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
INSERT INTO "players" ("id","data","updated_at") VALUES ('p_msuu1gdc3q71', '{"id":"p_msuu1gdc3q71","name":"Yuki Kawamura","team":"Ontario Clippers (LA Clippers)","level":"G-League","position":"PG","vitals":{"height":"5-7","weight":"159","age":"25","classYear":"Undrafted (2025)","handedness":"Right"},"objective":"Playmaking guard stands out in the open court. Passes with feel on pick and roll.","role":"Developmental 2 way playmaker","analysis":{},"context":{},"strengths":["Paint touches","Playmaking","Low turnover rate"],"questions":[],"updatedAt":1788256598095}'::jsonb, 1788256598095) ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
INSERT INTO "players" ("id","data","updated_at") VALUES ('p_mtjdorkhdhe1', '{"id":"p_mtjdorkhdhe1","name":"Daron Holmes II","team":"Denver Nuggets","level":"NBA","position":"PF","vitals":{"height":"6-10","weight":"225","age":"24","classYear":"2024","handedness":"Right"},"objective":"Strong wide frame, impacts the game as a stretch pick and pop big.","role":"Mobile Skilled Stretch Big","analysis":{},"context":{},"strengths":["Post sealing position","Rolling finishes","Shooting","Post defense"],"questions":[],"updatedAt":1788425079143}'::jsonb, 1788425079143) ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
INSERT INTO "players" ("id","data","updated_at") VALUES ('p_mtlbzn2adks3', '{"id":"p_mtlbzn2adks3","name":"Adou Thiero","team":"South Bay Lakers / LA Lakers","level":"G-League","position":"SF","vitals":{"height":"6-7","weight":"220","age":"22.3","classYear":"2025 Round 2, Pick 36","handedness":"Right"},"objective":"Explosive dynamic athletic wing with high motor.","role":"Fringe Rotation / Energy Defensive Wing","analysis":{},"context":{},"strengths":["Athleticism","Motor"],"questions":[],"updatedAt":1788791735352}'::jsonb, 1788791735352) ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
INSERT INTO "boards" ("level","category","player_ids") VALUES ('NBA', 'overall', '[]'::jsonb) ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "boards" ("level","category","player_ids") VALUES ('NBA', 'shooters', '[]'::jsonb) ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "boards" ("level","category","player_ids") VALUES ('NBA', 'defenders', '[]'::jsonb) ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "boards" ("level","category","player_ids") VALUES ('NBA', 'guards', '[]'::jsonb) ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "boards" ("level","category","player_ids") VALUES ('NBA', 'wings', '[]'::jsonb) ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "boards" ("level","category","player_ids") VALUES ('NBA', 'bigs', '[]'::jsonb) ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "boards" ("level","category","player_ids") VALUES ('NBA', 'twoway', '[]'::jsonb) ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "boards" ("level","category","player_ids") VALUES ('College', 'overall', '[]'::jsonb) ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "boards" ("level","category","player_ids") VALUES ('College', 'shooters', '[]'::jsonb) ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "boards" ("level","category","player_ids") VALUES ('College', 'defenders', '[]'::jsonb) ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "boards" ("level","category","player_ids") VALUES ('College', 'guards', '[]'::jsonb) ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "boards" ("level","category","player_ids") VALUES ('College', 'wings', '[]'::jsonb) ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "boards" ("level","category","player_ids") VALUES ('College', 'bigs', '[]'::jsonb) ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "boards" ("level","category","player_ids") VALUES ('College', 'twoway', '[]'::jsonb) ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "boards" ("level","category","player_ids") VALUES ('G-League', 'overall', '[]'::jsonb) ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "boards" ("level","category","player_ids") VALUES ('G-League', 'shooters', '[]'::jsonb) ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "boards" ("level","category","player_ids") VALUES ('G-League', 'defenders', '[]'::jsonb) ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "boards" ("level","category","player_ids") VALUES ('G-League', 'guards', '[]'::jsonb) ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "boards" ("level","category","player_ids") VALUES ('G-League', 'wings', '[]'::jsonb) ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "boards" ("level","category","player_ids") VALUES ('G-League', 'bigs', '[]'::jsonb) ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "boards" ("level","category","player_ids") VALUES ('G-League', 'twoway', '[]'::jsonb) ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "boards" ("level","category","player_ids") VALUES ('International', 'overall', '[]'::jsonb) ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "boards" ("level","category","player_ids") VALUES ('International', 'shooters', '[]'::jsonb) ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "boards" ("level","category","player_ids") VALUES ('International', 'defenders', '[]'::jsonb) ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "boards" ("level","category","player_ids") VALUES ('International', 'guards', '[]'::jsonb) ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "boards" ("level","category","player_ids") VALUES ('International', 'wings', '[]'::jsonb) ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "boards" ("level","category","player_ids") VALUES ('International', 'bigs', '[]'::jsonb) ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "boards" ("level","category","player_ids") VALUES ('International', 'twoway', '[]'::jsonb) ON CONFLICT DO NOTHING;
