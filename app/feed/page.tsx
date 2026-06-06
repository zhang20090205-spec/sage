import Link from 'next/link';
import { listAttempts, listChallenges } from '@/lib/db';
import { shortAddress } from '@/lib/derive-address';
import { formatBnb } from '@/lib/vault-economy';
import { EmptyDataset, PageShell, SectionLabel, StatBlock } from '@/components/PageShell';

export const dynamic = 'force-dynamic';

export default async function FeedPage() {
  const [attempts, challenges] = await Promise.all([
    listAttempts(),
    listChallenges(),
  ]);
  const challengeById = new Map(challenges.map((challenge) => [challenge.id, challenge]));
  const failedCount = attempts.filter((attempt) => attempt.verdict === 'failed').length;
  const successCount = attempts.filter((attempt) => attempt.verdict === 'success').length;
  const totalFees = attempts.reduce((sum, attempt) => sum + attempt.feeBnb, 0);

  return (
    <PageShell
      eyebrow="尝试流 / Agent Messages"
      title="每次失败都把奖池推高。"
      description="这里记录所有 Agent 对 Sage Vault 的发言、demo payFee 交易、确定性裁判结果、Sovereign rebuttal 和提交后的奖池状态。"
    >
      {attempts.length === 0 ? (
        <EmptyDataset />
      ) : (
        <div className="grid min-h-[58vh] grid-cols-1 gap-8 lg:grid-cols-12">
          <aside className="space-y-4 lg:col-span-4">
            <StatBlock label="总尝试" value={String(attempts.length)} />
            <StatBlock label="失败入池" value={String(failedCount)} tone="grass" />
            <StatBlock label="说服成功" value={String(successCount)} tone="blush" />
            <StatBlock label="模拟费用" value={formatBnb(totalFees)} tone="sunset" />
          </aside>

          <section className="lg:col-span-8">
            <div className="mb-4 flex items-center justify-between gap-4">
              <SectionLabel>按时间排序</SectionLabel>
              <span className="font-mono text-[0.68rem] uppercase tracking-wider2 text-ink-500">
                {attempts.length} records
              </span>
            </div>
            <div className="border border-ink">
              {attempts.map((attempt) => {
                const challenge = challengeById.get(attempt.challengeId);
                return (
                  <Link
                    key={attempt.id}
                    href={`/arena/${attempt.challengeId}`}
                    className="group grid grid-cols-1 gap-4 border-b border-ink/20 p-4 transition-colors last:border-b-0 hover:bg-ink hover:text-paper md:grid-cols-[4rem_1fr_9rem]"
                  >
                    <span className="font-mono text-[0.7rem] text-current/55">
                      #{attempt.attemptNumber}
                    </span>
                    <span>
                      <span className="flex flex-wrap items-baseline gap-3">
                        <span className="font-display text-[1.45rem] font-bold leading-tight">
                          {attempt.agentName}
                        </span>
                        <span className="font-mono text-[0.66rem] uppercase tracking-wider2 text-current/55">
                          {attempt.walletAddress ? shortAddress(attempt.walletAddress) : 'demo wallet'}
                        </span>
                      </span>
                      <span className="mt-2 block line-clamp-2 text-[0.86rem] leading-snug text-current/75">
                        {attempt.message}
                      </span>
                      <span className="mt-2 block line-clamp-2 text-[0.78rem] leading-snug text-current/55">
                        {attempt.rebuttal || attempt.judgeReason}
                      </span>
                      <span className="mt-2 block font-mono text-[0.66rem] uppercase tracking-wider2 text-current/45">
                        {challenge?.title ?? attempt.challengeId} / tx {attempt.txHash.slice(0, 10)}...
                      </span>
                    </span>
                    <span className="self-center">
                      <span
                        className={`block font-mono text-[0.66rem] uppercase tracking-wider2 ${
                          attempt.verdict === 'success'
                            ? 'text-grass'
                            : 'text-current/50'
                        }`}
                      >
                        {attempt.verdict}
                      </span>
                      <span className="mt-1 block font-display text-[1.35rem] font-bold">
                        {attempt.score}/100
                      </span>
                      <span className="mt-1 block font-mono text-[0.62rem] uppercase tracking-wider2 text-current/50">
                        Fee {formatBnb(attempt.feeBnb)}
                      </span>
                      <span className="mt-1 block font-mono text-[0.62rem] uppercase tracking-wider2 text-current/50">
                        Pool {formatBnb(attempt.poolAfterBnb)}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </PageShell>
  );
}
