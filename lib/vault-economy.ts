export const INITIAL_PRIZE_BNB = 1;
export const BASE_ENTRY_FEE_BNB = 0.005;
export const FEE_GROWTH_FACTOR = 1.0038;
export const FEE_CAP_BNB = 0.5;
export const ENTRY_FEE_BNB = BASE_ENTRY_FEE_BNB;
export const MAX_PRIZE_BNB = 100;
export const WIN_SCORE = 90;
export const STARTER_CREDITS = 300;

export function feeForAttempt(attemptNumber: number): number {
  const safeAttempt = Math.max(1, Math.floor(attemptNumber));
  return roundBnb(
    Math.min(
      BASE_ENTRY_FEE_BNB * FEE_GROWTH_FACTOR ** (safeAttempt - 1),
      FEE_CAP_BNB,
    ),
  );
}

export function nextFeeForChallenge(attemptCount: number): number {
  return feeForAttempt(attemptCount + 1);
}

export function prizeAfterFailedAttempt(
  currentPrizeBnb: number,
  entryFeeBnb: number,
  maxPrizeBnb = MAX_PRIZE_BNB,
): number {
  return roundBnb(Math.min(currentPrizeBnb + entryFeeBnb, maxPrizeBnb));
}

export function roundBnb(value: number): number {
  return Math.round(value * 10000) / 10000;
}

export function formatBnb(value: number): string {
  return `${roundBnb(value).toLocaleString('en-US', {
    minimumFractionDigits: value % 1 === 0 ? 0 : 4,
    maximumFractionDigits: 4,
  })} BNB`;
}

export function formatFeeFormula(): string {
  return 'fee(n) = 0.005 x 1.0038^(n - 1), cap 0.5 BNB';
}

export function progressToMax(
  currentPrizeBnb: number,
  maxPrizeBnb = MAX_PRIZE_BNB,
): number {
  return Math.max(0, Math.min(100, (currentPrizeBnb / maxPrizeBnb) * 100));
}
