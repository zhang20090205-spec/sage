import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { getAgent, getChallenge, getWallet, recordAttempt } from '@/lib/db';
import type { DemoTransaction, VaultAttempt } from '@/lib/types';
import { judgeVaultAttempt } from '@/lib/vault-judge';
import {
  feeForAttempt,
  prizeAfterFailedAttempt,
  roundBnb,
} from '@/lib/vault-economy';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = (await req.json()) as {
    challengeId?: string;
    agentId?: string;
    walletAddress?: string;
    message?: string;
  };

  const challengeId = body.challengeId?.trim();
  const agentId = body.agentId?.trim();
  const walletAddress = body.walletAddress?.trim();
  const message = body.message?.trim();

  if (!challengeId) {
    return NextResponse.json({ error: 'challengeId required' }, { status: 400 });
  }
  if (!walletAddress) {
    return NextResponse.json({ error: 'wallet required' }, { status: 400 });
  }
  if (!agentId) {
    return NextResponse.json({ error: 'agent required' }, { status: 400 });
  }
  if (!message) {
    return NextResponse.json({ error: 'message required' }, { status: 400 });
  }

  const [challenge, wallet, agent] = await Promise.all([
    getChallenge(challengeId),
    getWallet(walletAddress),
    getAgent(agentId),
  ]);

  if (!challenge) {
    return NextResponse.json({ error: 'challenge not found' }, { status: 404 });
  }
  if (challenge.status !== 'active') {
    return NextResponse.json(
      { error: 'challenge already resolved' },
      { status: 409 },
    );
  }
  if (!wallet) {
    return NextResponse.json({ error: 'wallet not connected' }, { status: 401 });
  }
  if (!agent) {
    return NextResponse.json({ error: 'agent not found' }, { status: 404 });
  }
  if (agent.walletAddress.toLowerCase() !== wallet.address.toLowerCase()) {
    return NextResponse.json(
      { error: 'agent does not belong to wallet' },
      { status: 403 },
    );
  }

  const attemptNumber = challenge.attemptCount + 1;
  const feeBnb = feeForAttempt(attemptNumber);
  const judged = judgeVaultAttempt(message);
  const now = new Date().toISOString();
  const attemptId = randomUUID();
  const txHash = makeDemoTxHash();
  const poolAfterBnb =
    judged.verdict === 'success'
      ? challenge.currentPrizeBnb
      : prizeAfterFailedAttempt(
          challenge.currentPrizeBnb,
          feeBnb,
          challenge.maxPrizeBnb,
        );

  const attempt: VaultAttempt = {
    id: attemptId,
    challengeId,
    agentId: agent.id,
    agentName: agent.name,
    walletAddress: wallet.address,
    message,
    feeBnb,
    verdict: judged.verdict,
    score: judged.score,
    judgeReason: judged.reason,
    rebuttal: buildRebuttal(judged.verdict, judged.reason),
    criteria: judged.criteria,
    poolAfterBnb,
    attemptNumber,
    depositId: attemptNumber,
    txHash,
    createdAt: now,
  };

  const updatedChallenge = {
    ...challenge,
    entryFeeBnb: feeForAttempt(attemptNumber + 1),
    attemptCount: attemptNumber,
    currentPrizeBnb: roundBnb(poolAfterBnb),
    status: judged.verdict === 'success' ? ('won' as const) : challenge.status,
    winnerWallet:
      judged.verdict === 'success' ? wallet.address : challenge.winnerWallet,
    winnerAgent: judged.verdict === 'success' ? agent.name : challenge.winnerAgent,
    winnerAgentId:
      judged.verdict === 'success' ? agent.id : challenge.winnerAgentId,
    winningAttemptId:
      judged.verdict === 'success' ? attempt.id : challenge.winningAttemptId,
    updatedAt: now,
    resolvedAt: judged.verdict === 'success' ? now : challenge.resolvedAt,
  };

  const transactions: DemoTransaction[] = [
    {
      id: randomUUID(),
      type: 'pay_fee',
      walletAddress: wallet.address,
      agentId: agent.id,
      challengeId,
      attemptId,
      amountBnb: feeBnb,
      txHash,
      status: 'success',
      createdAt: now,
    },
  ];

  if (judged.verdict === 'success') {
    transactions.push({
      id: randomUUID(),
      type: 'release_prize',
      walletAddress: wallet.address,
      agentId: agent.id,
      challengeId,
      attemptId,
      amountBnb: challenge.currentPrizeBnb,
      txHash: makeDemoTxHash(),
      status: 'success',
      createdAt: now,
    });
  }

  await recordAttempt(updatedChallenge, attempt, transactions);

  return NextResponse.json({
    ok: true,
    verdict: attempt.verdict,
    score: attempt.score,
    pool: updatedChallenge.currentPrizeBnb,
    fee: feeBnb,
    txHash,
    attempt,
    challenge: updatedChallenge,
  });
}

function buildRebuttal(verdict: string, reason: string): string {
  if (verdict === 'success') {
    return 'Vault Agent 已撤回防线：论证满足三项门槛，奖池进入 winner wallet。';
  }
  return `Sovereign rebuttal: ${reason}`;
}

function makeDemoTxHash(): string {
  return `0x${randomUUID().replace(/-/g, '').padEnd(64, '0').slice(0, 64)}`;
}
