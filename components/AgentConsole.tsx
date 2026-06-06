'use client';

import { useTransition } from 'react';
import { useWalletSession } from './WalletSessionProvider';
import { AgentDanmuTicker } from './AgentDanmuTicker';

export function AgentConsole() {
  const {
    wallet,
    agents,
    activeAgent,
    openConnectModal,
    openSoulModal,
    mintNfa,
    rechargeCredits,
  } = useWalletSession();
  const [pending, startTransition] = useTransition();

  if (!wallet) {
    return (
      <div className="border border-ink bg-paper-50 p-6">
        <p className="font-display text-[1.8rem] font-bold leading-tight">
          尚未绑定钱包
        </p>
        <p className="mt-3 text-[0.9rem] leading-relaxed text-ink-700">
          连接 demo 钱包后，Sage 会检查这个钱包是否已经有 managed Agent。
        </p>
        <button
          type="button"
          onClick={openConnectModal}
          className="mt-5 w-full border border-ink bg-ink px-4 py-3 font-mono text-[0.72rem] uppercase tracking-wider2 text-paper transition-colors hover:bg-paper hover:text-ink"
        >
          连接钱包
        </button>
      </div>
    );
  }

  return (
    <div className="border border-ink bg-paper-50 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[0.68rem] uppercase tracking-wider2 text-ink-500">
            当前钱包
          </p>
          <p className="mt-2 break-all font-mono text-[0.9rem]">
            {wallet.address}
          </p>
          <p className="mt-3 font-display text-[2.2rem] font-black leading-none text-sunset">
            {wallet.credits} credits
          </p>
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            startTransition(() => {
              void rechargeCredits();
            });
          }}
          className="border border-ink px-4 py-3 font-mono text-[0.7rem] uppercase tracking-wider2 transition-colors hover:bg-ink hover:text-paper disabled:opacity-45"
        >
          充值积分
        </button>
      </div>

      <div className="kw-rule-thin my-6" />

      {activeAgent ? (
        <div>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[0.68rem] uppercase tracking-wider2 text-ink-500">
                Active managed Agent
              </p>
              <p className="mt-2 font-display text-[2rem] font-bold leading-tight">
                {activeAgent.name}
              </p>
              <p className="mt-1 font-mono text-[0.68rem] uppercase tracking-wider2 text-ink-500">
                {activeAgent.id} / {activeAgent.nfaStatus}
              </p>
            </div>
            <button
              type="button"
              onClick={openSoulModal}
              className="border border-ink bg-paper px-4 py-3 font-mono text-[0.7rem] uppercase tracking-wider2 transition-colors hover:bg-ink hover:text-paper"
            >
              打开 Soul 面板
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            <SoulMetric label="人格" value={activeAgent.soul.personality} />
            <SoulMetric label="辩论风格" value={activeAgent.soul.speakingStyle} />
            <SoulMetric label="风险偏好" value={activeAgent.soul.riskTolerance} />
          </div>

          {activeAgent.soul.ownerSignal && (
            <div className="mt-5 space-y-4">
              <div className="border border-ink bg-paper p-4">
                <p className="font-mono text-[0.68rem] uppercase tracking-wider2 text-ink-500">
                  Owner signal / xAPI simulation
                </p>
                <p className="mt-2 text-[0.88rem] leading-relaxed text-ink-700">
                  {activeAgent.soul.ownerSignal.summary}
                </p>
                <p className="mt-3 font-mono text-[0.64rem] uppercase tracking-wider2 text-ink-500">
                  {activeAgent.soul.ownerSignal.tags.join(' / ')}
                </p>
              </div>
              <AgentDanmuTicker items={activeAgent.soul.ownerSignal.danmu} />
            </div>
          )}

          {activeAgent.nfaStatus === 'minted' ? (
            <div className="mt-5 border border-grass bg-grass/10 p-4">
              <p className="font-mono text-[0.68rem] uppercase tracking-wider2 text-ink-500">
                NFA identity
              </p>
              <p className="mt-1 font-display text-[1.4rem] font-bold">
                {activeAgent.nfaTokenId}
              </p>
            </div>
          ) : (
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                startTransition(() => {
                  void mintNfa(activeAgent.id);
                });
              }}
              className="mt-5 w-full border border-ink bg-sunset px-4 py-3 font-mono text-[0.72rem] uppercase tracking-wider2 transition-colors hover:bg-paper disabled:opacity-45"
            >
              Mint demo NFA 身份
            </button>
          )}
        </div>
      ) : (
        <div>
          <p className="font-display text-[1.8rem] font-bold leading-tight">
            钱包已连接，还没有 Agent
          </p>
          <p className="mt-3 text-[0.9rem] leading-relaxed text-ink-700">
            创建第一个 Soul Agent 后，系统会给这个钱包发放 300 credits。
          </p>
          <button
            type="button"
            onClick={openSoulModal}
            className="mt-5 w-full border border-ink bg-ink px-4 py-3 font-mono text-[0.72rem] uppercase tracking-wider2 text-paper transition-colors hover:bg-paper hover:text-ink"
          >
            创建 Agent
          </button>
        </div>
      )}

      {agents.length > 1 && (
        <p className="mt-5 font-mono text-[0.68rem] uppercase tracking-wider2 text-ink-500">
          当前钱包共有 {agents.length} 个 managed Agents。
        </p>
      )}
    </div>
  );
}

function SoulMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-ink/20 p-3">
      <p className="font-mono text-[0.62rem] uppercase tracking-wider2 text-ink-500">
        {label}
      </p>
      <p className="mt-2 line-clamp-4 text-[0.86rem] leading-snug text-ink-700">
        {value}
      </p>
    </div>
  );
}
