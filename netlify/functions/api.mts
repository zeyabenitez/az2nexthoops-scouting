import type { Config } from "@netlify/functions";
import { timingSafeEqual } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { players, boards } from "../../db/schema.js";

/*
  Live data API for the scouting site. Every page load reads from here and
  every editor change writes here, so all devices see the same records.

    GET    /api/data                        -> { players, boards }
    POST   /api/login                       -> verify editor password
    PUT    /api/players/:id                 -> create / update a report
    DELETE /api/players/:id                 -> delete a report (and remove from boards)
    PUT    /api/boards/:level/:category     -> replace a board's ordered player ids
    POST   /api/import                      -> merge edits saved in an old browser cache

  Writes require the editor password in the `x-admin-password` header.
  Set the ADMIN_PASSWORD environment variable in Netlify to change it.
*/

const FALLBACK_PASSWORD = "zeya2002!";

const NO_CACHE = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  "Netlify-CDN-Cache-Control": "no-store",
  Pragma: "no-cache",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...NO_CACHE },
  });
}

function adminPassword() {
  return Netlify.env.get("ADMIN_PASSWORD") || FALLBACK_PASSWORD;
}

function isAuthorized(req: Request) {
  const given = Buffer.from(req.headers.get("x-admin-password") || "");
  const expected = Buffer.from(adminPassword());
  return given.length === expected.length && timingSafeEqual(given, expected);
}

async function readAll() {
  const [playerRows, boardRows] = await Promise.all([
    db.select().from(players),
    db.select().from(boards),
  ]);
  const boardMap: Record<string, Record<string, string[]>> = {};
  for (const b of boardRows) {
    (boardMap[b.level] ||= {})[b.category] = Array.isArray(b.playerIds) ? b.playerIds : [];
  }
  return { players: playerRows.map((r) => r.data), boards: boardMap };
}

function cleanPlayer(id: string, input: any) {
  if (!input || typeof input !== "object") return null;
  const p = { ...input, id };
  if (typeof p.name !== "string" || !p.name.trim()) return null;
  p.updatedAt = Number(p.updatedAt) || Date.now();
  return p;
}

async function upsertPlayer(p: any) {
  await db
    .insert(players)
    .values({ id: p.id, data: p, updatedAt: p.updatedAt })
    .onConflictDoUpdate({ target: players.id, set: { data: p, updatedAt: p.updatedAt } });
}

async function upsertBoard(level: string, category: string, ids: string[]) {
  await db
    .insert(boards)
    .values({ level, category, playerIds: ids })
    .onConflictDoUpdate({
      target: [boards.level, boards.category],
      set: { playerIds: ids, updatedAt: sql`now()` },
    });
}

function cleanIds(ids: unknown): string[] | null {
  if (!Array.isArray(ids)) return null;
  return [...new Set(ids.filter((x): x is string => typeof x === "string"))];
}

export default async (req: Request) => {
  const url = new URL(req.url);
  const parts = url.pathname.replace(/^\/api\/?/, "").split("/").filter(Boolean).map(decodeURIComponent);
  const [resource, a, b] = parts;
  const method = req.method;

  try {
    if (resource === "data" && method === "GET") {
      return json(await readAll());
    }

    if (resource === "login" && method === "POST") {
      const { password } = await req.json().catch(() => ({}));
      const given = Buffer.from(String(password || ""));
      const expected = Buffer.from(adminPassword());
      const ok = given.length === expected.length && timingSafeEqual(given, expected);
      return json({ ok }, ok ? 200 : 401);
    }

    if (method !== "GET" && !isAuthorized(req)) {
      return json({ error: "Editor password required." }, 401);
    }

    if (resource === "players" && a) {
      if (method === "PUT") {
        const p = cleanPlayer(a, await req.json().catch(() => null));
        if (!p) return json({ error: "Invalid report." }, 400);
        await upsertPlayer(p);
        return json({ ok: true, player: p });
      }
      if (method === "DELETE") {
        await db.delete(players).where(eq(players.id, a));
        // Remove the player from every board they were on.
        const rows = await db.select().from(boards);
        await Promise.all(
          rows
            .filter((r) => Array.isArray(r.playerIds) && r.playerIds.includes(a))
            .map((r) => upsertBoard(r.level, r.category, r.playerIds.filter((x) => x !== a)))
        );
        return json({ ok: true });
      }
    }

    if (resource === "boards" && a && b && method === "PUT") {
      const body = await req.json().catch(() => null);
      const ids = cleanIds(body?.playerIds);
      if (!ids) return json({ error: "Invalid board." }, 400);
      await upsertBoard(a, b, ids);
      const [row] = await db
        .select()
        .from(boards)
        .where(and(eq(boards.level, a), eq(boards.category, b)));
      return json({ ok: true, playerIds: row?.playerIds ?? ids });
    }

    if (resource === "import" && method === "POST") {
      const body = await req.json().catch(() => null);
      const incoming: any[] = Array.isArray(body?.players) ? body.players : [];
      const existing = new Map((await db.select().from(players)).map((r) => [r.id, r.updatedAt]));
      let imported = 0;
      for (const raw of incoming) {
        if (!raw || typeof raw.id !== "string") continue;
        const p = cleanPlayer(raw.id, raw);
        if (!p) continue;
        // Only take the cached copy if it is newer than what the database has.
        if (existing.has(p.id) && (existing.get(p.id) || 0) >= p.updatedAt) continue;
        await upsertPlayer(p);
        imported++;
      }
      // Boards: only fill boards that are currently empty in the database.
      const current = (await readAll()).boards;
      const inBoards = body?.boards && typeof body.boards === "object" ? body.boards : {};
      for (const level of Object.keys(inBoards)) {
        for (const cat of Object.keys(inBoards[level] || {})) {
          const ids = cleanIds(inBoards[level][cat]);
          if (ids && ids.length && !(current[level]?.[cat]?.length)) await upsertBoard(level, cat, ids);
        }
      }
      return json({ ok: true, imported, ...(await readAll()) });
    }

    return json({ error: "Not found." }, 404);
  } catch (err) {
    console.error(err);
    return json({ error: "Database request failed." }, 500);
  }
};

export const config: Config = {
  path: "/api/*",
};
