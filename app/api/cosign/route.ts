import { NextResponse } from 'next/server';
import { appendCoSign, getPick, upsertPick } from '@/lib/db';
import {
  creatorAccruedFromPool,
  poolValueCents,
  priceAt,
} from '@/lib/bonding-curve';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

/**
 * 一次 co-sign 的服务端处理。
 *
 * Demo 阶段:
 * 1. 找到对应的 Pick
 * 2. 按 bonding curve 算这次的价格
 * 3. 把这一笔记到 coSigns 表
 * 4. 更新 pick 的 count / pool / creatorAccrued
 *
 * Production 阶段:
 * 这里会先验证用户钱包签名,然后调用 Base Sepolia 上的合约,
 * 等链上事件确认后再更新本地索引。
 */
export async function POST(req: Request) {
  const body = (await req.json()) as { pickId?: string; signer?: string };
  const pickId = body.pickId;
  if (!pickId) {
    return NextResponse.json({ error: 'pickId required' }, { status: 400 });
  }

  const pick = await getPick(pickId);
  if (!pick) {
    return NextResponse.json({ error: 'pick not found' }, { status: 404 });
  }

  const price = priceAt(pick.coSignCount);
  const newCount = pick.coSignCount + 1;
  const newPool = poolValueCents(newCount);
  const newCreatorAccrued = creatorAccruedFromPool(newPool);

  const signerAddress =
    body.signer ?? `0x${randomUUID().replace(/-/g, '').slice(0, 40)}`;
  const signerLabel = `demo-${newCount}`;

  await appendCoSign({
    id: randomUUID(),
    pickId,
    signerAddress,
    signerLabel,
    amountCents: price,
    priceCents: price,
    poolAfterCents: newPool,
    signedAt: new Date().toISOString(),
  });

  await upsertPick({
    ...pick,
    coSignCount: newCount,
    totalPoolCents: newPool,
    creatorAccruedCents: newCreatorAccrued,
  });

  return NextResponse.json({
    ok: true,
    nextPrice: priceAt(newCount),
    pool: newPool,
    creatorAccrued: newCreatorAccrued,
  });
}
