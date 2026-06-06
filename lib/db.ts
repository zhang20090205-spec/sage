import { promises as fs } from 'fs';
import path from 'path';
import type { CoSign, Pick } from './types';

/**
 * 超简单的本地 JSON 数据库。
 *
 * 黑客松 demo 阶段够用:文件读写,无并发问题,Vercel 上跑用 /tmp 也能起来。
 * 上生产时换 Supabase / Postgres 即可,接口都已经抽象在这。
 */

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

interface DBShape {
  picks: Pick[];
  coSigns: CoSign[];
}

async function ensureDir(): Promise<void> {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
}

async function load(): Promise<DBShape> {
  try {
    const buf = await fs.readFile(DB_PATH, 'utf8');
    return JSON.parse(buf) as DBShape;
  } catch {
    return { picks: [], coSigns: [] };
  }
}

async function save(db: DBShape): Promise<void> {
  await ensureDir();
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
}

// ---------------------------------------------------------------------------
// Picks
// ---------------------------------------------------------------------------
export async function listPicks(): Promise<Pick[]> {
  const db = await load();
  return [...db.picks].sort(
    (a, b) => +new Date(b.curatedAt) - +new Date(a.curatedAt),
  );
}

export async function getPick(id: string): Promise<Pick | null> {
  const db = await load();
  return db.picks.find((p) => p.id === id) ?? null;
}

export async function upsertPick(pick: Pick): Promise<void> {
  const db = await load();
  const idx = db.picks.findIndex((p) => p.id === pick.id);
  if (idx >= 0) db.picks[idx] = pick;
  else db.picks.push(pick);
  await save(db);
}

// ---------------------------------------------------------------------------
// Co-signs
// ---------------------------------------------------------------------------
export async function listCoSignsForPick(pickId: string): Promise<CoSign[]> {
  const db = await load();
  return db.coSigns
    .filter((s) => s.pickId === pickId)
    .sort((a, b) => +new Date(b.signedAt) - +new Date(a.signedAt));
}

export async function appendCoSign(sign: CoSign): Promise<void> {
  const db = await load();
  db.coSigns.push(sign);
  await save(db);
}

// ---------------------------------------------------------------------------
// Leaderboard 辅助
// ---------------------------------------------------------------------------
export async function topPicksByPool(limit = 10): Promise<Pick[]> {
  const picks = await listPicks();
  return [...picks]
    .sort((a, b) => b.totalPoolCents - a.totalPoolCents)
    .slice(0, limit);
}
