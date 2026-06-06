/**
 * Bonding curve 数学。
 *
 * Demo 用最简单的线性 + 一点凸性:
 *   price(n) = BASE_PRICE_CENTS + n * SLOPE_CENTS
 * 第 n 个 co-sign 的价格,n 从 0 开始算。
 *
 * 比 friend.tech 的 n²/16000 平缓,适合 demo 阶段小金额演示。
 */

const BASE_PRICE_CENTS = 50; // 第一个 co-sign 50 美分
const SLOPE_CENTS = 10; // 每多一个 co-sign 涨 10 美分

export function priceAt(count: number): number {
  return BASE_PRICE_CENTS + Math.max(0, count) * SLOPE_CENTS;
}

/**
 * 已有 currentCount 个 co-sign 的池子,新加 1 个 co-sign,池子里的累积价值。
 * 累积 = 等差数列求和:n*(2*BASE + (n-1)*SLOPE) / 2
 */
export function poolValueCents(count: number): number {
  if (count <= 0) return 0;
  const last = BASE_PRICE_CENTS + (count - 1) * SLOPE_CENTS;
  return Math.round((count * (BASE_PRICE_CENTS + last)) / 2);
}

/**
 * 一笔 co-sign 后,创作者按 40% 分成应得的累积金额(美分)。
 *
 * 分成模型(demo):
 * - 40% → 创作者(确定性地址)
 * - 40% → co-signer 池子(可以"卖出"时取回)
 * - 10% → Sage agent 金库(支付 API 费 / 给 Sage 持有者分红)
 * - 10% → 协议金库
 */
export function creatorAccruedFromPool(poolCents: number): number {
  return Math.floor(poolCents * 0.4);
}

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
