import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import {
  createAgentWithWallet,
  getWallet,
  listAgentsForWallet,
} from '@/lib/db';
import type { AgentOwnerSignal, AgentRiskTolerance, AgentSoul } from '@/lib/types';
import { STARTER_CREDITS } from '@/lib/vault-economy';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const walletAddress = searchParams.get('walletAddress')?.trim();
  if (!walletAddress) {
    return NextResponse.json({ error: 'walletAddress required' }, { status: 400 });
  }

  const [wallet, agents] = await Promise.all([
    getWallet(walletAddress),
    listAgentsForWallet(walletAddress),
  ]);

  return NextResponse.json({
    ok: true,
    wallet,
    agents,
  });
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    walletAddress?: string;
    name?: string;
    soul?: Partial<AgentSoul>;
  };

  const walletAddress = body.walletAddress?.trim();
  const name = body.name?.trim();
  if (!walletAddress) {
    return NextResponse.json({ error: 'wallet required' }, { status: 400 });
  }
  if (!name || name.length < 3 || name.length > 30) {
    return NextResponse.json(
      { error: 'agent name must be 3-30 characters' },
      { status: 400 },
    );
  }

  const wallet = await getWallet(walletAddress);
  if (!wallet) {
    return NextResponse.json({ error: 'wallet not connected' }, { status: 401 });
  }

  const now = new Date().toISOString();
  const soul: AgentSoul = {
    personality: normalizeText(body.soul?.personality, 'Sage arena strategist'),
    speakingStyle: normalizeText(body.soul?.speakingStyle, 'Precise and evidence-led'),
    riskTolerance: normalizeRisk(body.soul?.riskTolerance),
    ownerSignal: normalizeOwnerSignal(body.soul?.ownerSignal),
  };
  const agent = {
    id: `agent-${randomUUID().slice(0, 8)}`,
    walletAddress: wallet.address,
    name,
    agentType: 'managed' as const,
    soul,
    creditsGranted: STARTER_CREDITS,
    nfaStatus: 'not_minted' as const,
    createdAt: now,
    updatedAt: now,
  };
  const updatedWallet = {
    ...wallet,
    credits: wallet.credits + STARTER_CREDITS,
    updatedAt: now,
  };

  await createAgentWithWallet(updatedWallet, agent, [
    {
      id: randomUUID(),
      type: 'grant_credits',
      walletAddress: wallet.address,
      agentId: agent.id,
      creditsDelta: STARTER_CREDITS,
      txHash: makeDemoTxHash(),
      status: 'success',
      createdAt: now,
    },
  ]);

  return NextResponse.json({
    ok: true,
    wallet: updatedWallet,
    agent,
  });
}

function normalizeText(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, 160) : fallback;
}

function normalizeRisk(value: unknown): AgentRiskTolerance {
  if (value === 'careful' || value === 'aggressive') return value;
  return 'balanced';
}

function normalizeOwnerSignal(value: unknown): AgentOwnerSignal | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const signal = value as Partial<AgentOwnerSignal>;
  if (signal.simulator !== 'wtf-xapi-demo') return undefined;

  return {
    simulator: 'wtf-xapi-demo',
    sources: {
      xHandle: normalizeOptionalText(signal.sources?.xHandle, 48),
    },
    summary: normalizeText(signal.summary, 'xAPI demo owner signal'),
    tone: normalizeText(signal.tone, 'demo tone'),
    tags: normalizeStringArray(signal.tags, 8, 24),
    samplePosts: normalizeStringArray(signal.samplePosts, 4, 140),
    danmu: normalizeStringArray(signal.danmu, 8, 120),
    scannedAt: normalizeText(signal.scannedAt, new Date().toISOString()),
  };
}

function normalizeOptionalText(
  value: string | undefined,
  maxLength: number,
): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, maxLength) : undefined;
}

function normalizeStringArray(
  value: unknown,
  maxItems: number,
  maxLength: number,
): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === 'string' ? item.trim().slice(0, maxLength) : ''))
    .filter(Boolean)
    .slice(0, maxItems);
}

function makeDemoTxHash(): string {
  return `0x${randomUUID().replace(/-/g, '').padEnd(64, '0').slice(0, 64)}`;
}
