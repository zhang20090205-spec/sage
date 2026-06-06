import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'legacy endpoint deprecated; use /api/attempt for Sage Vault Arena' },
    { status: 410 },
  );
}
