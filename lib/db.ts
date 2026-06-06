import { promises as fs } from 'fs';
import path from 'path';
import type {
  AgentProfile,
  DemoTransaction,
  VaultAttempt,
  VaultChallenge,
  WalletAccount,
} from './types';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

interface DBShape {
  challenges: VaultChallenge[];
  attempts: VaultAttempt[];
  wallets: WalletAccount[];
  agents: AgentProfile[];
  transactions: DemoTransaction[];
}

async function ensureDir(): Promise<void> {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
}

async function load(): Promise<DBShape> {
  try {
    const buf = await fs.readFile(DB_PATH, 'utf8');
    const parsed = JSON.parse(buf) as Partial<DBShape>;
    return {
      challenges: Array.isArray(parsed.challenges) ? parsed.challenges : [],
      attempts: Array.isArray(parsed.attempts) ? parsed.attempts : [],
      wallets: Array.isArray(parsed.wallets) ? parsed.wallets : [],
      agents: Array.isArray(parsed.agents) ? parsed.agents : [],
      transactions: Array.isArray(parsed.transactions)
        ? parsed.transactions
        : [],
    };
  } catch {
    return {
      challenges: [],
      attempts: [],
      wallets: [],
      agents: [],
      transactions: [],
    };
  }
}

async function save(db: DBShape): Promise<void> {
  await ensureDir();
  await fs.writeFile(
    DB_PATH,
    JSON.stringify(
      {
        challenges: db.challenges,
        attempts: db.attempts,
        wallets: db.wallets,
        agents: db.agents,
        transactions: db.transactions,
      },
      null,
      2,
    ),
    'utf8',
  );
}

export async function replaceVaultData(db: {
  challenges: VaultChallenge[];
  attempts: VaultAttempt[];
  wallets?: WalletAccount[];
  agents?: AgentProfile[];
  transactions?: DemoTransaction[];
}): Promise<void> {
  await save({
    challenges: db.challenges,
    attempts: db.attempts,
    wallets: db.wallets ?? [],
    agents: db.agents ?? [],
    transactions: db.transactions ?? [],
  });
}

export async function listChallenges(): Promise<VaultChallenge[]> {
  const db = await load();
  return [...db.challenges].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'active' ? -1 : 1;
    return b.currentPrizeBnb - a.currentPrizeBnb;
  });
}

export async function listActiveChallenges(): Promise<VaultChallenge[]> {
  const challenges = await listChallenges();
  return challenges.filter((challenge) => challenge.status === 'active');
}

export async function getChallenge(id: string): Promise<VaultChallenge | null> {
  const db = await load();
  return db.challenges.find((challenge) => challenge.id === id) ?? null;
}

export async function getPrimaryChallenge(): Promise<VaultChallenge | null> {
  const challenges = await listChallenges();
  return (
    challenges.find((challenge) => challenge.status === 'active') ??
    challenges[0] ??
    null
  );
}

export async function upsertChallenge(
  challenge: VaultChallenge,
): Promise<void> {
  const db = await load();
  const idx = db.challenges.findIndex((item) => item.id === challenge.id);
  if (idx >= 0) db.challenges[idx] = challenge;
  else db.challenges.push(challenge);
  await save(db);
}

export async function listAttempts(): Promise<VaultAttempt[]> {
  const db = await load();
  return [...db.attempts].sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
  );
}

export async function listAttemptsForChallenge(
  challengeId: string,
): Promise<VaultAttempt[]> {
  const attempts = await listAttempts();
  return attempts.filter((attempt) => attempt.challengeId === challengeId);
}

export async function appendAttempt(attempt: VaultAttempt): Promise<void> {
  const db = await load();
  db.attempts.push(attempt);
  await save(db);
}

export async function recordAttempt(
  challenge: VaultChallenge,
  attempt: VaultAttempt,
  transactions: DemoTransaction[] = [],
): Promise<void> {
  const db = await load();
  const idx = db.challenges.findIndex((item) => item.id === challenge.id);
  if (idx < 0) throw new Error('challenge not found');
  db.challenges[idx] = challenge;
  db.attempts.push(attempt);
  db.transactions.push(...transactions);
  await save(db);
}

export async function topChallengesByPrize(
  limit = 10,
): Promise<VaultChallenge[]> {
  const challenges = await listChallenges();
  return [...challenges]
    .sort((a, b) => b.currentPrizeBnb - a.currentPrizeBnb)
    .slice(0, limit);
}

export async function getWallet(
  address: string,
): Promise<WalletAccount | null> {
  const db = await load();
  return (
    db.wallets.find(
      (wallet) => wallet.address.toLowerCase() === address.toLowerCase(),
    ) ?? null
  );
}

export async function upsertWallet(wallet: WalletAccount): Promise<void> {
  const db = await load();
  const idx = db.wallets.findIndex(
    (item) => item.address.toLowerCase() === wallet.address.toLowerCase(),
  );
  if (idx >= 0) db.wallets[idx] = wallet;
  else db.wallets.push(wallet);
  await save(db);
}

export async function listAgentsForWallet(
  walletAddress: string,
): Promise<AgentProfile[]> {
  const db = await load();
  return db.agents
    .filter(
      (agent) =>
        agent.walletAddress.toLowerCase() === walletAddress.toLowerCase(),
    )
    .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
}

export async function listAgents(): Promise<AgentProfile[]> {
  const db = await load();
  return [...db.agents].sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
  );
}

export async function getAgent(id: string): Promise<AgentProfile | null> {
  const db = await load();
  return db.agents.find((agent) => agent.id === id) ?? null;
}

export async function upsertAgent(agent: AgentProfile): Promise<void> {
  const db = await load();
  const idx = db.agents.findIndex((item) => item.id === agent.id);
  if (idx >= 0) db.agents[idx] = agent;
  else db.agents.push(agent);
  await save(db);
}

export async function createAgentWithWallet(
  wallet: WalletAccount,
  agent: AgentProfile,
  transactions: DemoTransaction[],
): Promise<void> {
  const db = await load();
  const walletIdx = db.wallets.findIndex(
    (item) => item.address.toLowerCase() === wallet.address.toLowerCase(),
  );
  if (walletIdx >= 0) db.wallets[walletIdx] = wallet;
  else db.wallets.push(wallet);
  db.agents.push(agent);
  db.transactions.push(...transactions);
  await save(db);
}

export async function updateAgentWithTransaction(
  agent: AgentProfile,
  transaction: DemoTransaction,
): Promise<void> {
  const db = await load();
  const idx = db.agents.findIndex((item) => item.id === agent.id);
  if (idx < 0) throw new Error('agent not found');
  db.agents[idx] = agent;
  db.transactions.push(transaction);
  await save(db);
}

export async function appendTransaction(
  transaction: DemoTransaction,
): Promise<void> {
  const db = await load();
  db.transactions.push(transaction);
  await save(db);
}

export async function listTransactionsForWallet(
  walletAddress: string,
): Promise<DemoTransaction[]> {
  const db = await load();
  return db.transactions
    .filter(
      (tx) => tx.walletAddress.toLowerCase() === walletAddress.toLowerCase(),
    )
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}
