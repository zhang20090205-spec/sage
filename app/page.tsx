import Link from 'next/link';
import { getPrimaryChallenge } from '@/lib/db';
import { formatBnb, progressToMax } from '@/lib/vault-economy';
import { EmptyDataset } from '@/components/PageShell';

export const dynamic = 'force-dynamic';

export default async function OverviewPage() {
  const primary = await getPrimaryChallenge();

  if (!primary) {
    return (
      <main className="min-h-screen px-6 pb-10 pt-28 sm:px-10 sm:pt-32">
        <div className="mx-auto max-w-6xl">
          <EmptyDataset />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#100906] px-6 pb-10 pt-28 text-paper sm:px-10 sm:pb-14 sm:pt-32">
      <div className="mx-auto grid min-h-[calc(100vh-10rem)] max-w-6xl grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
        <section className="lg:col-span-7">
          <p className="font-mono text-[0.72rem] uppercase tracking-wider2 text-[#e9a82f]">
            Sage Vault / 说服战场
          </p>
          <h1 className="mt-5 font-display text-[3.6rem] font-black leading-[0.92] sm:text-[5.7rem]">
            说服金库，拿走奖池。
          </h1>
          <div className="mt-6 border border-amber-900/55 bg-[#1a120d] p-5">
            <p className="font-mono text-[0.68rem] uppercase tracking-wider2 text-paper/45">
              Vault Agent 立场
            </p>
            <p className="mt-3 font-display text-[1.8rem] font-bold leading-snug">
              {primary.vaultStance}
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/arena/${primary.id}`}
              className="border border-[#e9a82f] bg-[#e9a82f] px-5 py-4 font-mono text-[0.76rem] uppercase tracking-wider2 text-[#100906] transition-colors hover:bg-paper"
            >
              进入说服战场
            </Link>
            <Link
              href="/feed"
              className="border border-amber-900/55 px-5 py-4 font-mono text-[0.76rem] uppercase tracking-wider2 text-[#e9a82f] transition-colors hover:bg-paper hover:text-ink"
            >
              查看挑战流
            </Link>
          </div>
        </section>

        <aside className="border border-amber-900/55 bg-[#1a120d] p-6 lg:col-span-5">
          <div className="grid grid-cols-1 gap-5">
            <Metric label="当前奖池" value={formatBnb(primary.currentPrizeBnb)} strong />
            <Metric label="下一次挑战费" value={formatBnb(primary.entryFeeBnb)} />
            <Metric label="挑战次数" value={`#${primary.attemptCount + 1}`} />
          </div>
          <div className="mt-6 h-2 border border-amber-900/55 bg-black/25">
            <div
              className="h-full bg-[#e9a82f]"
              style={{ width: `${progressToMax(primary.currentPrizeBnb)}%` }}
            />
          </div>
          <p className="mt-4 font-mono text-[0.66rem] uppercase tracking-wider2 text-paper/45">
            失败费用进入奖池。达到 90 分后，奖池锁定给 winner wallet。
          </p>
        </aside>
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="border border-amber-900/45 p-4">
      <p className="font-mono text-[0.66rem] uppercase tracking-wider2 text-paper/45">
        {label}
      </p>
      <p
        className={`mt-2 font-display font-black leading-none text-[#f6c46a] ${
          strong ? 'text-[3.8rem]' : 'text-[2.1rem]'
        }`}
      >
        {value}
      </p>
    </div>
  );
}
