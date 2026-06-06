import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { appendTransaction, getWallet, upsertWallet } from '@/lib/db';
import type { WalletProvider } from '@/lib/types';

export const dynamic = 'force-dynamic';

const providerLabels: Record<WalletProvider, string> = {
  metamask: 'MetaMask',
  okx: 'OKX Wallet',
  walletconnect: 'WalletConnect',
  demo: 'Demo Wallet',
};

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    provider?: WalletProvider;
    address?: string;
  };
  const provider = normalizeProvider(body.provider);
  const now = new Date().toISOString();
  const address = normalizeAddress(body.address) ?? makeDemoAddress(provider);
  const existing = await getWallet(address);

  const wallet = existing
    ? {
        ...existing,
        provider,
        label: providerLabels[provider],
        updatedAt: now,
      }
    : {
        address,
        provider,
        label: providerLabels[provider],
        credits: 0,
        connectedAt: now,
        updatedAt: now,
      };

  await upsertWallet(wallet);

  if (!existing) {
    await appendTransaction({
      id: randomUUID(),
      type: 'connect_wallet',
      walletAddress: wallet.address,
      txHash: makeDemoTxHash(),
      status: 'success',
      createdAt: now,
    });
  }

  return NextResponse.json({ ok: true, wallet });
}

function normalizeProvider(value: string | undefined): WalletProvider {
  if (value === 'metamask' || value === 'okx' || value === 'walletconnect') {
    return value;
  }
  return 'demo';
}

function normalizeAddress(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (trimmed && /^0x[a-fA-F0-9]{40}$/.test(trimmed)) return trimmed;
  return null;
}

function makeDemoAddress(provider: WalletProvider): string {
  const seed = `${provider}${randomUUID().replace(/-/g, '')}`;
  const suffix = seed.replace(/[^a-fA-F0-9]/g, '').padEnd(36, '0').slice(0, 36);
  return `0x5A6E${suffix}`.slice(0, 42);
}

function makeDemoTxHash(): string {
  return `0x${randomUUID().replace(/-/g, '').padEnd(64, '0').slice(0, 64)}`;
}
