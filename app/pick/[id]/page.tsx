import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPick, listCoSignsForPick } from '@/lib/db';
import { formatCents, priceAt } from '@/lib/bonding-curve';
import { shortAddress } from '@/lib/derive-address';
import { CoSignButton } from '@/components/CoSignButton';
import { CurveChart } from '@/components/CurveChart';
import {
  CreatorAccrued,
  PoolStats,
  StaggerItem,
  StaggerPage,
  VerdictBlock,
} from '@/components/PickAnimations';

export const dynamic = 'force-dynamic';

export default async function PickPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pick = await getPick(id);
  if (!pick) notFound();

  const signs = await listCoSignsForPick(pick.id);
  const nextPrice = priceAt(pick.coSignCount);

  return (
    <main className="max-w-5xl mx-auto px-6 sm:px-10 py-10 sm:py-14">
      <StaggerPage>
        <StaggerItem>
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/"
              className="font-mono text-[0.72rem] tracking-wider2 text-ink-700 hover:underline underline-offset-4 transition-colors"
            >
              ← BACK TO INDEX
            </Link>
            <span className="font-mono text-[0.7rem] tracking-wider2 text-ink-500">
              PICK / {pick.id.slice(-6).toUpperCase()}
            </span>
          </div>
          <div className="kw-rule mb-8" />
        </StaggerItem>

        {/* 元数据栏 */}
        <StaggerItem>
          <div className="grid grid-cols-12 gap-6 mb-10">
            <div className="col-span-12 md:col-span-3 space-y-2">
              <span className="kw-section-label flex items-center gap-2">
                <span className="kw-square" />
                <span>Author</span>
              </span>
              <p className="font-display text-2xl font-bold leading-tight">
                @{pick.cast.authorUsername}
              </p>
              <p className="font-mono text-[0.7rem] tracking-wider2 text-ink-500">
                FID {pick.cast.authorFid}
              </p>
            </div>

            <div className="col-span-12 md:col-span-6">
              <span className="kw-section-label flex items-center gap-2 mb-3">
                <span className="kw-square" />
                <span>The post</span>
              </span>
              <p className="font-display text-[1.6rem] sm:text-[1.85rem] leading-snug text-ink">
                {pick.cast.content}
              </p>
              {pick.cast.sourceUrl && (
                <a
                  href={pick.cast.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-3 font-mono text-[0.68rem] tracking-wider2 underline underline-offset-4 hover:no-underline text-ink-700"
                >
                  VIEW SOURCE ↗
                </a>
              )}
            </div>

            <div className="col-span-12 md:col-span-3 space-y-2">
              <span className="kw-section-label flex items-center gap-2">
                <span className="kw-square" />
                <span>Token</span>
              </span>
              <p className="font-display text-2xl font-bold">
                ${pick.score.tokenName}
              </p>
              <p className="font-mono text-[0.7rem] tracking-wider2 text-ink-500">
                NFT {pick.nftId.slice(0, 10)}…
              </p>
            </div>
          </div>
          <div className="kw-rule mb-10" />
        </StaggerItem>

        {/* Sage 的评分卡 —— count-up + 进度条 */}
        <section className="mb-12">
          <VerdictBlock
            score={pick.score.score}
            comment={pick.score.comment}
            viralReasoning={pick.score.viralReasoning}
            model={pick.score.model}
          />
        </section>

        <StaggerItem>
          <div className="kw-rule mb-10" />
        </StaggerItem>

        {/* 创作者 + 池子 双栏 */}
        <StaggerItem>
          <section className="grid grid-cols-12 gap-6 mb-12">
            <div className="col-span-12 md:col-span-6 border border-ink p-6 bg-paper-50">
              <span className="kw-section-label flex items-center gap-2 mb-4">
                <span className="kw-square" />
                <span>Creator / Deterministic Wallet</span>
              </span>
              <p className="font-mono text-[0.78rem] break-all text-ink mb-5">
                {pick.creatorAddress}
              </p>
              <div className="kw-rule-thin mb-4" />
              <p className="font-mono text-[0.7rem] tracking-wider2 text-ink-500 mb-1">
                ACCRUED · WAITING TO BE CLAIMED
              </p>
              <CreatorAccrued cents={pick.creatorAccruedCents} />
              <p className="text-[0.82rem] text-ink-700 mt-3">
                @{pick.cast.authorUsername} 用 Farcaster 登录可一键 claim
                累积奖励。
              </p>
            </div>

            <div className="col-span-12 md:col-span-6 border border-ink p-6 bg-paper-50">
              <span className="kw-section-label flex items-center gap-2 mb-4">
                <span className="kw-square" />
                <span>Co-Sign Pool</span>
              </span>

              <div className="mb-4">
                <PoolStats
                  count={pick.coSignCount}
                  poolCents={pick.totalPoolCents}
                />
              </div>

              <div className="kw-rule-thin mb-4" />

              <p className="font-mono text-[0.7rem] tracking-wider2 text-ink-500 mb-2">
                NEXT CO-SIGN PRICE
              </p>
              <p className="font-display text-2xl font-bold mb-4 tabular-nums">
                {formatCents(nextPrice)}
              </p>

              <CoSignButton pickId={pick.id} priceCents={nextPrice} />
            </div>
          </section>
        </StaggerItem>

        {/* Bonding curve 图表 —— 描线动画 */}
        <StaggerItem>
          <section className="mb-12 border border-ink p-6 bg-paper-50">
            <div className="flex items-center justify-between mb-4">
              <span className="kw-section-label flex items-center gap-2">
                <span className="kw-square" />
                <span>Bonding Curve / Linear</span>
              </span>
              <span className="font-mono text-[0.7rem] tracking-wider2 text-ink-500">
                P(n) = 50 + n × 10 (¢)
              </span>
            </div>
            <CurveChart count={pick.coSignCount} />
          </section>
        </StaggerItem>

        {/* 最近活动 */}
        <StaggerItem>
          <section className="mb-16">
            <span className="kw-section-label flex items-center gap-2 mb-4">
              <span className="kw-square" />
              <span>Recent Activity</span>
            </span>
            {signs.length === 0 ? (
              <p className="text-ink-500 text-sm font-mono">
                没有 co-sign 记录。你来当第一个?
              </p>
            ) : (
              <ul>
                {signs.slice(0, 15).map((s, idx) => (
                  <li
                    key={s.id}
                    className="kw-rule-thin flex items-center justify-between py-3 text-[0.85rem]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[0.68rem] tracking-wider2 text-ink-500 w-8">
                        {String(signs.length - idx).padStart(2, '0')}
                      </span>
                      <span className="font-mono text-ink-700">
                        {s.signerLabel ?? shortAddress(s.signerAddress)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 font-mono text-[0.72rem] text-ink-500">
                      <span>{formatCents(s.priceCents)}</span>
                      <span>
                        {new Date(s.signedAt).toLocaleTimeString('zh-CN')}
                      </span>
                    </div>
                  </li>
                ))}
                <li className="kw-rule-thin" />
              </ul>
            )}
          </section>
        </StaggerItem>

        <StaggerItem>
          <div className="kw-rule mb-4" />
          <div className="flex items-center justify-between text-[0.7rem] font-mono tracking-wider2 text-ink-500">
            <div className="flex items-center gap-2">
              <span>SAGE_CORP // STRATEGICALLY OVERZEALOUS</span>
              <span className="kw-square" />
            </div>
            <div>VOL. 1 — 2026 EDITION</div>
          </div>
        </StaggerItem>
      </StaggerPage>
    </main>
  );
}
