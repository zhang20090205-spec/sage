'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { SPRING } from '@/lib/motion';
import type { VaultAttempt } from '@/lib/types';
import { deriveEvaluationDimensions } from '@/lib/vault-display';
import { formatBnb } from '@/lib/vault-economy';
import { useWalletSession } from './WalletSessionProvider';

type BattlePhase =
  | 'idle'
  | 'payingFee'
  | 'queued'
  | 'arbiterScreening'
  | 'sovereignEvaluating'
  | 'failed'
  | 'won';

const runningPhases: BattlePhase[] = [
  'payingFee',
  'queued',
  'arbiterScreening',
  'sovereignEvaluating',
];

const battleStages: Array<{
  id: Exclude<BattlePhase, 'idle' | 'failed' | 'won'>;
  label: string;
  title: string;
}> = [
  { id: 'payingFee', label: 'Pay Fee', title: '挑战费进入托管' },
  { id: 'queued', label: 'Queue', title: 'Agent 进入挑战队列' },
  { id: 'arbiterScreening', label: 'Arbiter', title: '预筛论证结构' },
  { id: 'sovereignEvaluating', label: 'Sovereign', title: 'Vault 作出判定' },
];

export function AttemptForm({
  challengeId,
  entryFeeBnb,
  attemptNumber,
  disabled,
}: {
  challengeId: string;
  entryFeeBnb: number;
  attemptNumber: number;
  disabled: boolean;
}) {
  const router = useRouter();
  const {
    wallet,
    agents,
    activeAgent,
    setActiveAgentId,
    openConnectModal,
    openSoulModal,
  } = useWalletSession();
  const [phase, setPhase] = useState<BattlePhase>('idle');
  const [message, setMessage] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState('');
  const [result, setResult] = useState<{
    verdict: string;
    score: number;
    pool: number;
    txHash: string;
    attempt?: VaultAttempt;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isRunning = runningPhases.includes(phase);
  const isWon = phase === 'won' || result?.verdict === 'success';
  const canEdit = !isRunning && !isWon;

  const gate = useMemo(() => {
    if (disabled) {
      return {
        title: 'Vault 已关闭',
        body: '这个挑战已经被说服，奖池已锁定到 winner wallet。',
        action: null,
      };
    }
    if (!wallet) {
      return {
        title: '先连接钱包',
        body: '绑定 demo 钱包后，才能创建 Agent 并把一次挑战记录到本地交易流。',
        action: 'connect' as const,
      };
    }
    if (!activeAgent) {
      return {
        title: '创建你的 Agent',
        body: 'Clawdyland 式玩法里不是人直接发言，而是钱包拥有的 managed Agent 上场。',
        action: 'agent' as const,
      };
    }
    return null;
  }, [activeAgent, disabled, wallet]);

  const resetAfterFailure = () => {
    setPhase('idle');
    setResult(null);
    setSubmittedMessage('');
    setError(null);
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = message.trim();
    setError(null);
    setResult(null);

    if (!wallet || !activeAgent) {
      setError('请先连接钱包并创建 Agent');
      return;
    }
    if (!trimmed) return;

    setSubmittedMessage(trimmed);

    try {
      setPhase('payingFee');
      await delay(650);
      setPhase('queued');
      await delay(650);
      setPhase('arbiterScreening');
      await delay(850);
      setPhase('sovereignEvaluating');
      await delay(800);

      const res = await fetch('/api/attempt', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          challengeId,
          walletAddress: wallet.address,
          agentId: activeAgent.id,
          message: trimmed,
        }),
      });
      const json = (await res.json()) as {
        error?: string;
        verdict?: string;
        score?: number;
        pool?: number;
        txHash?: string;
        attempt?: VaultAttempt;
      };
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);

      const nextResult = {
        verdict: json.verdict ?? 'failed',
        score: json.score ?? 0,
        pool: json.pool ?? 0,
        txHash: json.txHash ?? '',
        attempt: json.attempt,
      };
      setResult(nextResult);
      setMessage('');
      setPhase(nextResult.verdict === 'success' ? 'won' : 'failed');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交失败');
      setPhase('idle');
    }
  };

  if (gate) {
    return (
      <div className="border border-ink bg-paper-50 p-5">
        <p className="font-display text-[1.7rem] font-bold leading-tight">
          {gate.title}
        </p>
        <p className="mt-3 text-[0.9rem] leading-relaxed text-ink-700">
          {gate.body}
        </p>
        {gate.action && (
          <button
            type="button"
            onClick={gate.action === 'connect' ? openConnectModal : openSoulModal}
            className="mt-5 w-full border border-ink bg-ink px-4 py-3 font-mono text-[0.72rem] uppercase tracking-wider2 text-paper transition-colors hover:bg-paper hover:text-ink"
          >
            {gate.action === 'connect' ? '连接钱包' : '创建 Agent'}
          </button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <span className="font-mono text-[0.66rem] uppercase tracking-wider2 text-ink-500">
            Wallet
          </span>
          <div className="mt-2 truncate border border-ink bg-paper-50 px-3 py-2 font-mono text-[0.82rem]">
            {wallet ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}` : '未连接'}
          </div>
        </div>
        <label className="block">
          <span className="font-mono text-[0.66rem] uppercase tracking-wider2 text-ink-500">
            Active Agent
          </span>
          <select
            value={activeAgent?.id ?? ''}
            onChange={(event) => setActiveAgentId(event.target.value)}
            disabled={!canEdit}
            className="mt-2 w-full border border-ink bg-paper-50 px-3 py-2 font-mono text-[0.82rem] outline-none transition-colors focus:bg-paper disabled:opacity-55"
          >
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name} / {agent.nfaStatus}
              </option>
            ))}
          </select>
        </label>
        <div>
          <span className="font-mono text-[0.66rem] uppercase tracking-wider2 text-ink-500">
            Demo payment
          </span>
          <div className="mt-2 border border-ink bg-paper-50 px-3 py-2 font-mono text-[0.82rem]">
            挑战 #{attemptNumber} / {formatBnb(entryFeeBnb)}
          </div>
        </div>
      </div>

      <label className="block">
        <span className="font-mono text-[0.66rem] uppercase tracking-wider2 text-ink-500">
          One Agent message
        </span>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          disabled={!canEdit}
          rows={7}
          placeholder="用一条论证同时证明：可验证身份、失败入池与成功领奖的激励闭环、钱包/合约/BNB/NFA 的链上叙事。"
          className="mt-2 w-full resize-none border border-ink bg-paper-50 px-3 py-3 text-[0.95rem] leading-relaxed outline-none transition-colors focus:bg-paper disabled:opacity-60"
        />
      </label>

      <BattleStagePanel
        phase={phase}
        agentName={activeAgent?.name ?? 'Agent'}
        attemptNumber={attemptNumber}
        entryFeeBnb={entryFeeBnb}
        message={submittedMessage || message}
        result={result}
      />

      {phase === 'failed' && result ? (
        <button
          type="button"
          onClick={resetAfterFailure}
          className="w-full border border-ink bg-paper px-4 py-3 font-mono text-[0.76rem] uppercase tracking-wider2 text-ink transition-colors hover:bg-ink hover:text-paper"
        >
          继续下一次挑战
        </button>
      ) : (
        <motion.button
          type="submit"
          disabled={isRunning || isWon || message.trim().length === 0}
          whileHover={{ scale: isRunning || isWon ? 1 : 1.01 }}
          whileTap={{ scale: isRunning || isWon ? 1 : 0.98 }}
          transition={SPRING}
          className="w-full border border-ink bg-ink px-4 py-3 font-mono text-[0.76rem] uppercase tracking-wider2 text-paper transition-colors hover:bg-paper hover:text-ink disabled:cursor-not-allowed disabled:opacity-45"
        >
          {isRunning
            ? 'Colosseum running...'
            : isWon
              ? 'Vault 已被说服'
              : `部署 Agent 挑战 Vault / ${formatBnb(entryFeeBnb)}`}
        </motion.button>
      )}

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`border p-4 ${
              result.verdict === 'success'
                ? 'border-grass bg-grass/10'
                : 'border-ink/25 bg-paper-50'
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-[1.35rem] font-bold leading-tight">
                  {result.verdict === 'success'
                    ? '说服成功，奖池已释放到 winner wallet'
                    : '未说服，挑战费已进入奖池'}
                </p>
                <p className="mt-1 font-mono text-[0.7rem] uppercase tracking-wider2 text-ink-500">
                  Score {result.score}/100 / Pool {formatBnb(result.pool)}
                </p>
              </div>
              <span className="border border-current px-3 py-2 font-mono text-[0.64rem] uppercase tracking-wider2">
                {result.verdict === 'success' ? 'SETTLED' : 'DEPOSITED'}
              </span>
            </div>
            {result.attempt && <EvaluationPanel attempt={result.attempt} />}
            {result.txHash && (
              <p className="mt-4 break-all font-mono text-[0.62rem] uppercase tracking-wider2 text-ink-500">
                demo tx {result.txHash}
              </p>
            )}
          </motion.div>
        )}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="font-mono text-[0.7rem] tracking-wider2 text-blush"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  );
}

function BattleStagePanel({
  phase,
  agentName,
  attemptNumber,
  entryFeeBnb,
  message,
  result,
}: {
  phase: BattlePhase;
  agentName: string;
  attemptNumber: number;
  entryFeeBnb: number;
  message: string;
  result: { verdict: string; score: number; pool: number } | null;
}) {
  const activeIndex =
    phase === 'failed' || phase === 'won'
      ? battleStages.length
      : battleStages.findIndex((stage) => stage.id === phase);

  return (
    <div className="border border-ink bg-paper-50 p-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {battleStages.map((stage, index) => {
          const active = stage.id === phase;
          const done = activeIndex > index;
          return (
            <div
              key={stage.id}
              className={`min-h-[5.5rem] border p-3 ${
                active || done ? 'border-ink bg-paper' : 'border-ink/20 bg-paper-50'
              }`}
            >
              <span className="font-mono text-[0.58rem] uppercase tracking-wider2 text-ink-500">
                {stage.label}
              </span>
              <span className="mt-2 block font-display text-[1.05rem] font-bold leading-tight">
                {stage.title}
              </span>
              <span
                className={`mt-3 block h-1 ${active || done ? 'bg-ink' : 'bg-ink/15'}`}
              />
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={SPRING}
          className="mt-4 min-h-[8.5rem] border border-ink bg-ink p-4 text-paper"
        >
          {phase === 'idle' && (
            <StageCopy
              eyebrow="READY"
              title={`挑战 #${attemptNumber} 待命`}
              body={`${agentName} 将支付 ${formatBnb(entryFeeBnb)} 进入说服战场。`}
            />
          )}
          {phase === 'payingFee' && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_7rem] sm:items-center">
              <StageCopy
                eyebrow="PAY FEE"
                title={`${formatBnb(entryFeeBnb)} 正在进入奖池托管`}
                body="本地交易流生成 pay_fee 记录，模拟 BNB 进入 Vault escrow。"
              />
              <PaymentPulse />
            </div>
          )}
          {phase === 'queued' && (
            <StageCopy
              eyebrow="QUEUE"
              title={`${agentName} 已排队`}
              body={message || 'Argument 正在进入挑战队列。'}
            />
          )}
          {phase === 'arbiterScreening' && (
            <StageCopy
              eyebrow="ARBITER PRE-SCREEN"
              title="Arbiter 正在扫描证据、激励和链上语义"
              body="预筛只检查论证是否具备可判定结构，最终胜负仍交给 Sovereign。"
              scanning
            />
          )}
          {phase === 'sovereignEvaluating' && (
            <StageCopy
              eyebrow="SOVEREIGN EVALUATION"
              title="Sage Vault 正在防守自己的立场"
              body="Vault 会根据确定性 judge 计算分数；达到门槛后触发 release_prize。"
              scanning
            />
          )}
          {phase === 'failed' && result && (
            <StageCopy
              eyebrow="SETTLEMENT"
              title={`挑战失败 / ${result.score}/100`}
              body={`挑战费已进入奖池，当前奖池 ${formatBnb(result.pool)}。`}
            />
          )}
          {phase === 'won' && result && (
            <StageCopy
              eyebrow="SETTLEMENT"
              title={`说服成功 / ${result.score}/100`}
              body={`Sovereign 放弃防守，奖池 ${formatBnb(result.pool)} 锁定给 winner wallet。`}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function StageCopy({
  eyebrow,
  title,
  body,
  scanning = false,
}: {
  eyebrow: string;
  title: string;
  body: string;
  scanning?: boolean;
}) {
  return (
    <div>
      <p className="font-mono text-[0.62rem] uppercase tracking-wider2 text-[#e9a82f]">
        {eyebrow}
      </p>
      <p className="mt-2 font-display text-[1.5rem] font-bold leading-tight">
        {title}
      </p>
      <p className="mt-3 line-clamp-3 text-[0.86rem] leading-relaxed text-paper/68">
        {body}
      </p>
      {scanning && (
        <div className="mt-4 h-2 overflow-hidden border border-paper/25 bg-paper/10">
          <motion.div
            className="h-full w-1/3 bg-[#e9a82f]"
            animate={{ x: ['-110%', '320%'] }}
            transition={{ duration: 1.05, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      )}
    </div>
  );
}

function PaymentPulse() {
  return (
    <div className="relative mx-auto size-24">
      {[0, 1, 2].map((index) => (
        <motion.span
          key={index}
          className="absolute inset-0 rounded-full border border-[#e9a82f]"
          animate={{ opacity: [0.75, 0], scale: [0.45, 1] }}
          transition={{
            duration: 1.35,
            repeat: Infinity,
            delay: index * 0.32,
            ease: 'easeOut',
          }}
        />
      ))}
      <motion.span
        className="absolute left-1/2 top-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#e9a82f] bg-[#e9a82f] font-display text-[1.2rem] font-black text-ink"
        animate={{ y: [0, -6, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
      >
        B
      </motion.span>
    </div>
  );
}

function EvaluationPanel({ attempt }: { attempt: VaultAttempt }) {
  const dimensions = deriveEvaluationDimensions(
    attempt.criteria,
    attempt.score,
    attempt.message,
  );

  return (
    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {dimensions.map((dimension) => (
        <div key={dimension.id}>
          <div className="flex items-center justify-between gap-3 font-mono text-[0.62rem] uppercase tracking-wider2 text-ink-500">
            <span>{dimension.label}</span>
            <span>{dimension.value}/100</span>
          </div>
          <div className="mt-2 h-2 border border-ink/20 bg-paper">
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

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
