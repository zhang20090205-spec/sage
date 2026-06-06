import Link from 'next/link';
import { AgentConsole } from '@/components/AgentConsole';
import { listAttempts, listChallenges } from '@/lib/db';
import { formatBnb, WIN_SCORE } from '@/lib/vault-economy';
import { EmptyDataset, PageShell, SectionLabel, StatBlock } from '@/components/PageShell';

export const dynamic = 'force-dynamic';

export default async function AgentPage() {
  const [attempts, challenges] = await Promise.all([
    listAttempts(),
    listChallenges(),
  ]);
  const recent = attempts.slice(0, 4);
  const active = challenges.filter((challenge) => challenge.status === 'active');
  const latestPrize = active[0]?.currentPrizeBnb ?? 0;

  return (
    <PageShell
      eyebrow="Vault Agent / 钱包与 Agent"
      title="Sage 有立场，也有价格。"
      description="这里展示当前 demo 钱包、managed Agent、NFA 状态和确定性裁判规则。裁判不调用外部模型，现场提交会稳定复现同样分数。"
    >
      <div className="grid min-h-[58vh] grid-cols-1 gap-8 lg:grid-cols-12">
        <section className="space-y-6 lg:col-span-5">
          <AgentConsole />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatBlock label="裁判模型" value="deterministic" />
            <StatBlock label="说服门槛" value={`${WIN_SCORE}/100`} tone="blush" />
            <StatBlock label="Active vaults" value={String(active.length)} tone="grass" />
            <StatBlock label="头部奖池" value={formatBnb(latestPrize)} tone="sunset" />
          </div>
        </section>

        <section className="border border-ink bg-paper-50 p-6 lg:col-span-7">
          <SectionLabel>裁判规则</SectionLabel>
          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
            <AgentRule
              title="可验证性"
              body="观点必须说明 Agent 身份、能力或行为能被签名、事件、证明、attestation 或审计追溯。"
            />
            <AgentRule
              title="激励闭环"
              body="观点必须解释失败费用如何入池、成功如何领奖，以及参与者为什么愿意继续尝试。"
            />
            <AgentRule
              title="链上叙事"
              body="观点必须把钱包、合约、BNB 奖池、Agent 身份和黑客松场景讲成同一个产品故事。"
            />
          </div>

          <div className="kw-rule-thin my-6" />

          <SectionLabel>最近判断</SectionLabel>
          {recent.length === 0 ? (
            <div className="mt-5">
              <EmptyDataset />
            </div>
          ) : (
            <ul className="mt-5 space-y-4">
              {recent.map((attempt) => (
                <li key={attempt.id} className="grid grid-cols-[4rem_1fr] gap-4">
                  <span className="font-display text-[1.8rem] font-bold leading-none">
                    {attempt.score}
                  </span>
                  <Link href={`/arena/${attempt.challengeId}`} className="group">
                    <p className="font-display text-[1.15rem] font-bold leading-tight group-hover:italic">
                      {attempt.agentName} / {attempt.verdict.toUpperCase()}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[0.86rem] leading-snug text-ink-700">
                      {attempt.rebuttal || attempt.judgeReason}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </PageShell>
  );
}

function AgentRule({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <p className="font-display text-[1.3rem] font-bold leading-tight">{title}</p>
      <p className="mt-2 text-[0.86rem] leading-relaxed text-ink-700">{body}</p>
    </div>
  );
}
