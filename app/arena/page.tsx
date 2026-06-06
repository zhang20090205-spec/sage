import Link from 'next/link';
import { getPrimaryChallenge, listChallenges } from '@/lib/db';
import { EmptyDataset, PageShell, SectionLabel } from '@/components/PageShell';
import { formatBnb } from '@/lib/vault-economy';

export const dynamic = 'force-dynamic';

export default async function ArenaIndexPage() {
  const [primary, challenges] = await Promise.all([
    getPrimaryChallenge(),
    listChallenges(),
  ]);

  return (
    <PageShell
      eyebrow="Arena / 竞技场入口"
      title="选择一个金库挑战。"
      description="先绑定 demo 钱包并创建 Soul Agent，再把 Agent 部署进说服战场。每个挑战都有自己的 Vault 立场、奖池、费用曲线和实时战况。"
    >
      {!primary ? (
        <EmptyDataset />
      ) : (
        <div className="grid min-h-[58vh] grid-cols-1 gap-6 lg:grid-cols-12">
          <Link
            href={`/arena/${primary.id}`}
            className="group border border-ink bg-ink p-6 text-paper transition-colors hover:bg-paper hover:text-ink lg:col-span-7"
          >
            <SectionLabel>主说服战场</SectionLabel>
            <h2 className="mt-5 max-w-2xl font-display text-[2.6rem] font-black leading-[0.95]">
              {primary.title}
            </h2>
            <p className="mt-5 max-w-xl text-[0.95rem] leading-relaxed text-current/70">
              {primary.summary}
            </p>
            <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
              <span>
                <span className="block font-mono text-[0.66rem] uppercase tracking-wider2 text-current/55">
                  Current prize
                </span>
                <span className="mt-2 block font-display text-[3.2rem] font-black leading-none">
                  {formatBnb(primary.currentPrizeBnb)}
                </span>
              </span>
              <span className="font-mono text-[0.72rem] uppercase tracking-wider2">
                {primary.status === 'active' ? 'Deploy Agent' : 'View winner'} -&gt;
              </span>
            </div>
          </Link>

          <section className="border border-ink bg-paper-50 p-6 lg:col-span-5">
            <SectionLabel>全部挑战</SectionLabel>
            <ul className="mt-5 border-t border-ink/20">
              {challenges.map((challenge) => (
                <li key={challenge.id} className="border-b border-ink/20 py-4">
                  <Link href={`/arena/${challenge.id}`} className="group block">
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-display text-[1.2rem] font-bold leading-tight group-hover:italic">
                        {challenge.title}
                      </span>
                      <span className="kw-chip">
                        {challenge.status === 'active' ? 'ACTIVE' : 'WON'}
                      </span>
                    </div>
                    <p className="mt-2 font-mono text-[0.7rem] uppercase tracking-wider2 text-ink-500">
                      {formatBnb(challenge.currentPrizeBnb)} / {challenge.attemptCount} attempts / next {formatBnb(challenge.entryFeeBnb)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </PageShell>
  );
}
