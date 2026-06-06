import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { appendTransaction, getWallet, upsertWallet } from '@/lib/db';

export const dynamic = 'force-dynamic';

const RECHARGE_CREDITS = 500;

export async function POST(req: Request) {
  const body = (await req.json()) as {
    walletAddress?: string;
  };
  const walletAddress = body.walletAddress?.trim();
  if (!walletAddress) {
    return NextResponse.json({ error: 'wallet required' }, { status: 400 });
  }

  const wallet = await getWallet(walletAddress);
  if (!wallet) {
    return NextResponse.json({ error: 'wallet not connected' }, { status: 401 });
  }

  const now = new Date().toISOString();
  const updatedWallet = {
    ...wallet,
    credits: wallet.credits + RECHARGE_CREDITS,
    updatedAt: now,
  };

  await upsertWallet(updatedWallet);
  await appendTransaction({
    id: randomUUID(),
    type: 'recharge_credits',
    walletAddress: wallet.address,
    creditsDelta: RECHARGE_CREDITS,
    txHash: makeDemoTxHash(),
    status: 'success',
    createdAt: now,
  });

  return NextResponse.json({ ok: true, wallet: updatedWallet });
}

function makeDemoTxHash(): string {
  return `0x${randomUUID().replace(/-/g, '').padEnd(64, '0').slice(0, 64)}`;
}
