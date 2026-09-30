import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { rooms } from "../../../../db/schema";

const emptyState = { decision: { title: "오늘 뭐 할까?", votes: {}, result: null }, picker: { people: [], result: null }, menu: { items: [], result: null }, schedule: { dates: [], availability: {} } };

export async function GET(_: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const db = getDb();
  const row = await db.select().from(rooms).where(eq(rooms.code, code)).get();
  return Response.json(row ? { state: JSON.parse(row.state), updatedAt: row.updatedAt } : { state: emptyState });
}

export async function PUT(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!/^[a-z0-9-]{3,40}$/.test(code)) return Response.json({ error: "invalid room" }, { status: 400 });
  const body = await request.json() as { state?: unknown };
  if (!body.state) return Response.json({ error: "state required" }, { status: 400 });
  const db = getDb();
  const updatedAt = new Date();
  await db.insert(rooms).values({ code, state: JSON.stringify(body.state), updatedAt }).onConflictDoUpdate({ target: rooms.code, set: { state: JSON.stringify(body.state), updatedAt } });
  return Response.json({ ok: true, updatedAt });
}
