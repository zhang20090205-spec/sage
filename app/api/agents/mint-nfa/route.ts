import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { getAgent, updateAgentWithTransaction } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = (await req.json()) as {
    agentId?: string;
    walletAddress?: string;
  };
  const agentId = body.agentId?.trim();
  const walletAddress = body.walletAddress?.trim();
  if (!agentId || !walletAddress) {
    return NextResponse.json(
      { error: 'agentId and walletAddress required' },
      { status: 400 },
    );
  }

  const agent = await getAgent(agentId);
  if (!agent) {
    return NextResponse.json({ error: 'agent not found' }, { status: 404 });
  }
  if (agent.walletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
    return NextResponse.json(
      { error: 'agent does not belong to wallet' },
      { status: 403 },
    );
  }

  const now = new Date().toISOString();
  const updatedAgent = {
    ...agent,
    nfaStatus: 'minted' as const,
    nfaTokenId: agent.nfaTokenId ?? `NFA-${randomUUID().slice(0, 8).toUpperCase()}`,
    updatedAt: now,
  };

  await updateAgentWithTransaction(updatedAgent, {
    id: randomUUID(),
    type: 'mint_nfa',
    walletAddress,
    agentId,
    txHash: makeDemoTxHash(),
    status: 'success',
    createdAt: now,
  });

  return NextResponse.json({ ok: true, agent: updatedAgent });
}

function makeDemoTxHash(): string {
  return `0x${randomUUID().replace(/-/g, '').padEnd(64, '0').slice(0, 64)}`;
}
