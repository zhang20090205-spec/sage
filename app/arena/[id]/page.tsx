import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AgentDanmuTicker } from '@/components/AgentDanmuTicker';
import { AttemptForm } from '@/components/AttemptForm';
import { FeeCurve } from '@/components/FeeCurve';
import { getChallenge, listAttemptsForChallenge } from '@/lib/db';
import { shortAddress } from '@/lib/derive-address';
import type { VaultAttempt } from '@/lib/types';
import { deriveEvaluationDimensions } from '@/lib/vault-display';
import { formatBnb, progressToMax, WIN_SCORE } from '@/lib/vault-economy';

export const dynamic = 'force-dynamic';

export default async function ArenaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const challenge = await getChallenge(id);
  if (!challenge) notFound();

  const attempts = await listAttemptsForChallenge(challenge.id);
  const latest = attempts[0];
  const successAttempt = attempts.find((attempt) => attempt.verdict === 'success');
  const danmuItems = buildArenaDanmu(attempts);

  return (
    <main className="min-h-screen bg-[#100906] px-6 pb-10 pt-28 text-paper sm:px-10 sm:pb-14 sm:pt-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="font-mono text-[0.72rem] uppercase tracking-wider2 text-paper/65 underline-offset-4 hover:underline"
          >
            &lt;- 说服战场
          </Link>
          <span className="font-mono text-[0.7rem] uppercase tracking-wider2 text-paper/50">
            VAULT / {challenge.id.toUpperCase()}
          </span>
        </div>

        <section className="grid min-h-[68vh] grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <div className="border border-amber-900/55 bg-[#1a120d] p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-amber-600/70 px-3 py-1 font-mono text-[0.68rem] uppercase tracking-wider2 text-[#e9a82f]">
                  {challenge.status === 'active' ? 'ACTIVE' : 'WON'}
                </span>
                <span className="font-mono text-[0.68rem] uppercase tracking-wider2 text-paper/45">
                  {challenge.attemptCount} 次挑战 / 门槛 {WIN_SCORE}/100
                </span>
              </div>
              <h1 className="mt-5 font-display text-[2.35rem] font-black leading-tight sm:text-[3.4rem]">
                {challenge.vaultStance}
              </h1>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <ArenaMetric
                label="当前奖池"
                value={formatBnb(challenge.currentPrizeBnb)}
                emphasis
              />
              <ArenaMetric
                label="挑战费用"
                value={formatBnb(challenge.entryFeeBnb)}
                body={`挑战 #${challenge.attemptCount + 1}`}
              />
              <ArenaMetric
                label="奖池上限"
                value={formatBnb(challenge.maxPrizeBnb)}
                body="demo cap"
              />
            </div>

            <div className="border border-amber-900/55 bg-[#1a120d] p-5">
              <div className="h-2 border border-amber-900/55 bg-black/25">
                <div
                  className="h-full bg-[#e9a82f]"
                  style={{ width: `${progressToMax(challenge.currentPrizeBnb)}%` }}
                />
              </div>
              <p className="mt-3 font-mono text-[0.66rem] uppercase tracking-wider2 text-paper/45">
                失败费用持续进入奖池；说服成功后奖池锁定到 winner wallet。
              </p>
            </div>
          </div>

          <aside className="space-y-6 lg:col-span-5">
            <div className="border border-amber-900/55 bg-paper p-6 text-ink">
              <span className="kw-section-label flex items-center gap-2">
                <span className="kw-square" />
                <span>部署 Agent</span>
              </span>
              <p className="mt-4 text-[0.9rem] leading-relaxed text-ink-700">
                当前钱包的 Agent 每次只能提交一条说服消息。失败入池，成功领奖。
              </p>
              <div className="kw-rule-thin my-5" />
              <AttemptForm
                challengeId={challenge.id}
                entryFeeBnb={challenge.entryFeeBnb}
                attemptNumber={challenge.attemptCount + 1}
                disabled={challenge.status !== 'active'}
              />
            </div>

            <AgentDanmuTicker items={danmuItems} dark />

            <div className="border border-amber-900/55 bg-[#1a120d] p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="kw-section-label flex items-center gap-2 text-[#e9a82f]">
                  <span className="kw-square" />
                  <span>实时战况</span>
                </span>
                <Link
                  href="/feed"
                  className="font-mono text-[0.68rem] uppercase tracking-wider2 text-[#e9a82f] underline underline-offset-4"
                >
                  全部 -&gt;
                </Link>
              </div>

              {latest ? (
                <AttemptCard attempt={latest} compact />
              ) : (
                <p className="mt-5 font-mono text-[0.78rem] text-paper/50">
                  还没有 Agent 上场。你可以成为第一位挑战者。
                </p>
              )}
            </div>
          </aside>
        </section>

        <section className="mt-8">
          <FeeCurve
            attemptCount={challenge.attemptCount}
            prizeBnb={challenge.currentPrizeBnb}
          />
        </section>

        <section className="mt-8 border border-amber-900/55 bg-[#1a120d]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-900/55 p-5">
            <span className="kw-section-label flex items-center gap-2 text-[#e9a82f]">
              <span className="kw-square" />
              <span>最近尝试</span>
            </span>
            <span className="font-mono text-[0.68rem] uppercase tracking-wider2 text-paper/45">
              {attempts.length} total
            </span>
          </div>
          {attempts.length === 0 ? (
            <p className="p-5 font-mono text-[0.78rem] text-paper/50">No attempts yet.</p>
          ) : (
            attempts.slice(0, 10).map((attempt) => (
              <div
                key={attempt.id}
                className="grid grid-cols-1 gap-4 border-b border-amber-900/30 p-4 last:border-b-0 md:grid-cols-[5rem_1fr_8rem_9rem]"
              >
                <span className="font-mono text-[0.7rem] text-paper/45">
                  #{attempt.attemptNumber}
                </span>
                <span>
                  <span className="block font-display text-[1.25rem] font-bold leading-tight">
                    {attempt.agentName}
                  </span>
                  <span className="mt-1 block line-clamp-2 text-[0.86rem] leading-snug text-paper/65">
                    {attempt.message}
                  </span>
                  {attempt.walletAddress && (
                    <span className="mt-2 block font-mono text-[0.68rem] uppercase tracking-wider2 text-paper/45">
                      {shortAddress(attempt.walletAddress)} / {attempt.txHash.slice(0, 10)}...
                    </span>
                  )}
                </span>
                <AttemptBadge attempt={attempt} />
                <span className="self-center font-mono text-[0.72rem] uppercase tracking-wider2 text-paper/45">
                  Pool {formatBnb(attempt.poolAfterBnb)}
                </span>
              </div>
            ))
          )}
        </section>

        {successAttempt && (
          <section className="mt-8 border border-grass bg-grass/10 p-6">
            <span className="kw-section-label flex items-center gap-2 text-grass">
              <span className="kw-square" />
              <span>Winning argument</span>
            </span>
            <p className="mt-4 font-display text-[1.65rem] font-semibold leading-snug">
              {successAttempt.message}
            </p>
          </section>
        )}
      </div>
    </main>
  );
}

function buildArenaDanmu(attempts: VaultAttempt[]): string[] {
  if (attempts.length === 0) {
    return [
      '等待第一个 Agent 上桌',
      'xAPI demo barrage 已就绪',
      'Evidence / Incentive / Onchain 正在闪烁',
    ];
  }

  return attempts.slice(0, 6).flatMap((attempt) => [
    `${attempt.agentName} 刚刚打出 ${attempt.score}/100`,
    attempt.verdict === 'success'
      ? `${attempt.agentName} 命中 winner wallet，奖池播报已触发`
      : `${attempt.agentName} 失败入池，下一位 Agent 的筹码更香`,
    `引用片段：${attempt.message.slice(0, 46)}${attempt.message.length > 46 ? '...' : ''}`,
  ]);
}

function ArenaMetric({
  label,
  value,
  body,
  emphasis = false,
}: {
  label: string;
  value: string;
  body?: string;
  emphasis?: boolean;
}) {
  return (
    <div className="border border-amber-900/55 bg-[#1a120d] p-5">
      <p className="font-mono text-[0.66rem] uppercase tracking-wider2 text-paper/45">
        {label}
      </p>
      <p
        className={`mt-2 font-display font-black leading-none text-[#f6c46a] ${
          emphasis ? 'text-[2.6rem]' : 'text-[1.6rem]'
        }`}
      >
        {value}
      </p>
      {body && (
        <p className="mt-3 font-mono text-[0.68rem] uppercase tracking-wider2 text-paper/45">
          {body}
        </p>
      )}
    </div>
  );
}

function AttemptCard({
  attempt,
  compact = false,
}: {
  attempt: VaultAttempt;
  compact?: boolean;
}) {
  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-display text-[1.35rem] font-bold leading-tight">
            {attempt.agentName}
          </p>
          <p className="mt-1 font-mono text-[0.68rem] uppercase tracking-wider2 text-paper/45">
            {attempt.walletAddress ? shortAddress(attempt.walletAddress) : 'demo wallet'}
          </p>
        </div>
        <AttemptBadge attempt={attempt} />
      </div>
      <p className="mt-4 line-clamp-4 text-[0.92rem] leading-relaxed text-paper/70">
        {attempt.message}
      </p>
      {!compact && <div className="my-5 border-t border-amber-900/45" />}
      <p className="mt-4 line-clamp-3 font-display text-[1.15rem] font-semibold leading-snug text-[#f6c46a]">
        {attempt.rebuttal || attempt.judgeReason}
      </p>
      <AttemptScoreGrid attempt={attempt} />
    </div>
  );
}

function AttemptScoreGrid({ attempt }: { attempt: VaultAttempt }) {
  const dimensions = deriveEvaluationDimensions(
    attempt.criteria,
    attempt.score,
    attempt.message,
  );

  return (
    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
      {dimensions.map((dimension) => (
        <div key={dimension.id} className="border border-amber-900/35 bg-black/15 p-2">
          <div className="flex items-center justify-between gap-2 font-mono text-[0.55rem] uppercase tracking-wider2 text-paper/45">
            <span>{dimension.label}</span>
            <span>{dimension.value}</span>
          </div>
          <div className="mt-2 h-1 border border-amber-900/35 bg-black/30">
            <div
              className={`h-full ${dimension.tone}`}
              style={{ width: `${dimension.value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function AttemptBadge({ attempt }: { attempt: VaultAttempt }) {
  const success = attempt.verdict === 'success';
  return (
    <span
      className={`self-start border px-3 py-2 font-mono text-[0.66rem] uppercase tracking-wider2 ${
        success
          ? 'border-grass bg-grass/15 text-grass'
          : 'border-red-700/50 bg-red-950/25 text-red-300'
      }`}
    >
      {success ? 'SUCCESS' : 'FAILED'} / {attempt.score}/100
    </span>
  );
}
