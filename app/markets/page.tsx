import Link from 'next/link';
import { topChallengesByPrize } from '@/lib/db';
import { formatBnb } from '@/lib/vault-economy';
import { EmptyDataset, PageShell, SectionLabel } from '@/components/PageShell';

export const dynamic = 'force-dynamic';

export default async function MarketsPage() {
  const challenges = await topChallengesByPrize(12);

  return (
    <PageShell
      eyebrow="奖池榜 / Vault Pools"
      title="越失败，奖池越大。"
      description="Active 和 won 挑战按当前奖池排序。失败尝试会把动态挑战费注入奖池；成功说服后，奖池锁定给 winner wallet。"
    >
      {challenges.length === 0 ? (
        <EmptyDataset />
      ) : (
        <section className="min-h-[58vh]">
          <div className="mb-4 flex items-center justify-between gap-4">
            <SectionLabel>按奖池排序</SectionLabel>
            <span className="font-mono text-[0.68rem] uppercase tracking-wider2 text-ink-500">
              Demo BNB / local JSON state
            </span>
          </div>

          <div className="border border-ink">
            {challenges.map((challenge, index) => (
              <Link
                key={challenge.id}
                href={`/arena/${challenge.id}`}
                className="group grid grid-cols-1 gap-4 border-b border-ink/20 p-4 transition-colors last:border-b-0 hover:bg-ink hover:text-paper md:grid-cols-[3rem_1.25fr_0.7fr_0.7fr_0.8fr]"
              >
                <span className="font-mono text-[0.7rem] text-current/55">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span>
                  <span className="block font-display text-[1.65rem] font-bold leading-none">
                    {challenge.title}
                  </span>
                  <span className="mt-2 block line-clamp-2 text-[0.82rem] text-current/70">
                    {challenge.vaultAgent} / {challenge.summary}
                  </span>
                </span>
                <MarketMetric label="当前奖池" value={formatBnb(challenge.currentPrizeBnb)} />
                <MarketMetric label="尝试次数" value={String(challenge.attemptCount)} />
                <MarketMetric
                  label="状态"
                  value={challenge.status === 'active' ? 'ACTIVE' : 'WON'}
                />
              </Link>
            ))}
          </div>
        </section>
      )}
    </PageShell>
  );
}

function MarketMetric({ label, value }: { label: string; value: string }) {
  return (
    <span className="self-center">
      <span className="block font-mono text-[0.62rem] uppercase tracking-wider2 text-current/50">
        {label}
      </span>
      <span className="mt-1 block font-display text-[1.25rem] font-bold">
        {value}
      </span>
    </span>
  );
}
