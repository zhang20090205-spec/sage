'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from 'react';
import { motion } from 'motion/react';
import {
  hasOwnerSource,
  simulateOwnerProfile,
  xapiScanSteps,
  type GeneratedOwnerProfile,
} from '@/lib/agent-owner-simulator';
import { SPRING } from '@/lib/motion';
import type {
  AgentProfile,
  AgentRiskTolerance,
  AgentSoul,
  WalletAccount,
  WalletProvider,
} from '@/lib/types';
import { AgentDanmuTicker } from './AgentDanmuTicker';

const STORAGE_KEY = 'sage.demo.wallet';

type CreateAgentInput = {
  name: string;
  soul: AgentSoul;
};

type WalletSessionValue = {
  wallet: WalletAccount | null;
  agents: AgentProfile[];
  activeAgent: AgentProfile | null;
  loading: boolean;
  connectWallet: (provider: WalletProvider) => Promise<void>;
  createAgent: (input: CreateAgentInput) => Promise<AgentProfile>;
  mintNfa: (agentId: string) => Promise<void>;
  rechargeCredits: () => Promise<void>;
  setActiveAgentId: (agentId: string) => void;
  openConnectModal: () => void;
  openSoulModal: () => void;
};

const WalletSessionContext = createContext<WalletSessionValue | null>(null);

const walletProviders: Array<{
  id: WalletProvider;
  name: string;
  mark: string;
  body: string;
  tone: string;
}> = [
  {
    id: 'metamask',
    name: 'MetaMask',
    mark: 'M',
    body: '模拟浏览器钱包授权，点击后自动绑定 demo 地址。',
    tone: 'bg-sunset',
  },
  {
    id: 'okx',
    name: 'OKX Wallet',
    mark: 'O',
    body: '适合 BNB Chain 演示账户，不请求真实签名。',
    tone: 'bg-ink text-paper',
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    mark: 'W',
    body: '展示移动钱包入口，保持本地 demo 状态。',
    tone: 'bg-sky',
  },
];

export function WalletSessionProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletAccount | null>(null);
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectOpen, setConnectOpen] = useState(false);
  const [soulOpen, setSoulOpen] = useState(false);
  const [agentGateOpen, setAgentGateOpen] = useState(false);

  const activeAgent = useMemo(
    () =>
      agents.find((agent) => agent.id === activeAgentId) ??
      agents[0] ??
      null,
    [activeAgentId, agents],
  );

  const refreshWallet = useCallback(async (address: string) => {
    const res = await fetch(`/api/agents?walletAddress=${encodeURIComponent(address)}`, {
      cache: 'no-store',
    });
    const json = (await res.json()) as {
      wallet?: WalletAccount | null;
      agents?: AgentProfile[];
    };
    setWallet(json.wallet ?? null);
    setAgents(json.agents ?? []);
    setActiveAgentId((current) => {
      if (current && json.agents?.some((agent) => agent.id === current)) {
        return current;
      }
      return json.agents?.[0]?.id ?? null;
    });
    return json;
  }, []);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setLoading(false);
      return;
    }

    refreshWallet(stored)
      .then((json) => {
        if (!json.wallet) window.localStorage.removeItem(STORAGE_KEY);
      })
      .finally(() => setLoading(false));
  }, [refreshWallet]);

  useEffect(() => {
    if (!loading && wallet && !activeAgent) {
      setAgentGateOpen(true);
    }
  }, [activeAgent, loading, wallet]);

  const connectWallet = useCallback(
    async (provider: WalletProvider) => {
      const res = await fetch('/api/wallet/connect', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ provider }),
      });
      const json = (await res.json()) as {
        error?: string;
        wallet?: WalletAccount;
      };
      if (!res.ok || !json.wallet) {
        throw new Error(json.error ?? 'Wallet connect failed');
      }

      window.localStorage.setItem(STORAGE_KEY, json.wallet.address);
      setWallet(json.wallet);
      setConnectOpen(false);
      const refreshed = await refreshWallet(json.wallet.address);
      if (!refreshed.agents || refreshed.agents.length === 0) {
        setAgentGateOpen(true);
      }
    },
    [refreshWallet],
  );

  const createAgent = useCallback(
    async (input: CreateAgentInput) => {
      if (!wallet) throw new Error('Connect wallet first');
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          walletAddress: wallet.address,
          name: input.name,
          soul: input.soul,
        }),
      });
      const json = (await res.json()) as {
        error?: string;
        wallet?: WalletAccount;
        agent?: AgentProfile;
      };
      if (!res.ok || !json.wallet || !json.agent) {
        throw new Error(json.error ?? 'Agent creation failed');
      }
      setWallet(json.wallet);
      setAgents((current) => [...current, json.agent!]);
      setActiveAgentId(json.agent.id);
      return json.agent;
    },
    [wallet],
  );

  const mintNfa = useCallback(
    async (agentId: string) => {
      if (!wallet) throw new Error('Connect wallet first');
      const res = await fetch('/api/agents/mint-nfa', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ agentId, walletAddress: wallet.address }),
      });
      const json = (await res.json()) as {
        error?: string;
        agent?: AgentProfile;
      };
      if (!res.ok || !json.agent) {
        throw new Error(json.error ?? 'NFA mint failed');
      }
      setAgents((current) =>
        current.map((agent) => (agent.id === json.agent!.id ? json.agent! : agent)),
      );
      setActiveAgentId(json.agent.id);
    },
    [wallet],
  );

  const rechargeCredits = useCallback(async () => {
    if (!wallet) {
      setConnectOpen(true);
      return;
    }
    const res = await fetch('/api/wallet/recharge', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ walletAddress: wallet.address }),
    });
    const json = (await res.json()) as {
      error?: string;
      wallet?: WalletAccount;
    };
    if (!res.ok || !json.wallet) {
      throw new Error(json.error ?? 'Recharge failed');
    }
    setWallet(json.wallet);
  }, [wallet]);

  const value = useMemo<WalletSessionValue>(
    () => ({
      wallet,
      agents,
      activeAgent,
      loading,
      connectWallet,
      createAgent,
      mintNfa,
      rechargeCredits,
      setActiveAgentId,
      openConnectModal: () => setConnectOpen(true),
      openSoulModal: () => setSoulOpen(true),
    }),
    [
      wallet,
      agents,
      activeAgent,
      loading,
      connectWallet,
      createAgent,
      mintNfa,
      rechargeCredits,
    ],
  );

  return (
    <WalletSessionContext.Provider value={value}>
      <OnboardingGate
        agentGateOpen={agentGateOpen}
        onAgentGateComplete={() => setAgentGateOpen(false)}
      >
        <WalletDock />
        {children}
        {connectOpen && <WalletDialog onClose={() => setConnectOpen(false)} />}
        {soulOpen && <AgentDialog onClose={() => setSoulOpen(false)} />}
      </OnboardingGate>
    </WalletSessionContext.Provider>
  );
}

export function useWalletSession() {
  const context = useContext(WalletSessionContext);
  if (!context) {
    throw new Error('useWalletSession must be used inside WalletSessionProvider');
  }
  return context;
}

function OnboardingGate({
  agentGateOpen,
  onAgentGateComplete,
  children,
}: {
  agentGateOpen: boolean;
  onAgentGateComplete: () => void;
  children: ReactNode;
}) {
  const { loading, wallet, activeAgent } = useWalletSession();

  if (loading) return <LoadingGate />;
  if (!wallet) return <WalletGate />;
  if (!activeAgent || agentGateOpen) {
    return <AgentGate onComplete={onAgentGateComplete} />;
  }

  return <>{children}</>;
}

function LoadingGate() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#100906] px-6 text-paper">
      <div className="border border-amber-900/55 bg-[#1a120d] p-6 text-center">
        <p className="font-mono text-[0.7rem] uppercase tracking-wider2 text-[#e9a82f]">
          Sage Vault Arena
        </p>
        <p className="mt-3 font-display text-[2rem] font-black">加载钱包状态...</p>
      </div>
    </main>
  );
}

function WalletGate() {
  const { connectWallet } = useWalletSession();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-[#100906] px-6 py-8 text-paper sm:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col justify-center">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end">
          <section className="lg:col-span-7">
            <p className="font-mono text-[0.72rem] uppercase tracking-wider2 text-[#e9a82f]">
              Sage Vault Arena
            </p>
            <h1 className="mt-4 font-display text-[4.2rem] font-black leading-[0.9] sm:text-[6.4rem]">
              先连接钱包。
            </h1>
            <p className="mt-6 max-w-2xl text-[1rem] leading-relaxed text-paper/68">
              这里不是普通表单。你的钱包会拥有一个 managed Agent，Agent 才能进入说服战场、支付挑战费，并把成功奖池记到 winner wallet。
            </p>
          </section>

          <section className="border border-amber-900/55 bg-[#1a120d] p-5 lg:col-span-5">
            <p className="font-mono text-[0.68rem] uppercase tracking-wider2 text-paper/45">
              Wallet binding
            </p>
            <h2 className="mt-2 font-display text-[2.2rem] font-black leading-none">
              选择钱包入口
            </h2>
            <p className="mt-3 text-[0.9rem] leading-relaxed text-paper/60">
              演示版会自动绑定成功，不请求真实签名，不发送链上交易。
            </p>

            <div className="mt-5 grid grid-cols-1 gap-3">
              {walletProviders.map((provider) => (
                <button
                  key={provider.id}
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    setError(null);
                    startTransition(() => {
                      void connectWallet(provider.id).catch((err) => {
                        setError(err instanceof Error ? err.message : '连接失败');
                      });
                    });
                  }}
                  className="group grid grid-cols-[3rem_1fr] gap-4 border border-amber-900/55 bg-[#21160f] p-4 text-left transition-colors hover:bg-paper hover:text-ink disabled:cursor-wait disabled:opacity-60"
                >
                  <span
                    className={`flex size-11 items-center justify-center border border-current font-display text-[1.25rem] font-black ${provider.tone}`}
                  >
                    {provider.mark}
                  </span>
                  <span>
                    <span className="block font-display text-[1.4rem] font-bold leading-tight">
                      {provider.name}
                    </span>
                    <span className="mt-1 block text-[0.82rem] leading-snug text-current/65">
                      {provider.body}
                    </span>
                  </span>
                </button>
              ))}
            </div>

            {error && (
              <p className="mt-4 font-mono text-[0.7rem] uppercase tracking-wider2 text-blush">
                {error}
              </p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function AgentGate({ onComplete }: { onComplete: () => void }) {
  const { wallet, activeAgent, createAgent, mintNfa } = useWalletSession();
  const [stage, setStage] = useState<'sources' | 'scanning' | 'preview' | 'mint'>(
    activeAgent ? 'mint' : 'sources',
  );
  const [sources, setSources] = useState({
    xHandle: '',
  });
  const [profile, setProfile] = useState<GeneratedOwnerProfile | null>(null);
  const [scanIndex, setScanIndex] = useState(0);
  const [name, setName] = useState('SageRunner');
  const [personality, setPersonality] = useState('冷静的链上竞技场策略师');
  const [speakingStyle, setSpeakingStyle] = useState(
    '证据优先，先给结论，再给验证、激励和链上闭环。',
  );
  const [riskTolerance, setRiskTolerance] =
    useState<AgentRiskTolerance>('balanced');
  const [createdAgent, setCreatedAgent] = useState<AgentProfile | null>(activeAgent);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeAgent) {
      setCreatedAgent(activeAgent);
      setStage('mint');
    }
  }, [activeAgent]);

  const canScan = hasOwnerSource(sources);
  const canCreate = name.trim().length >= 3 && name.trim().length <= 30;
  const steps = [
    ['sources', '账号输入'],
    ['scanning', 'xAPI 扫描'],
    ['preview', 'Agent Soul'],
    ['mint', 'NFA'],
  ] as const;

  const runScan = async () => {
    if (!canScan) {
      setError('请输入一个 X / Twitter 账号');
      return;
    }
    setError(null);
    setStage('scanning');
    setScanIndex(0);
    const nextProfile = simulateOwnerProfile(sources);
    setProfile(nextProfile);
    for (let index = 0; index < xapiScanSteps.length; index += 1) {
      setScanIndex(index);
      await sleep(520);
    }
    setName(nextProfile.name);
    setPersonality(nextProfile.personality);
    setSpeakingStyle(nextProfile.speakingStyle);
    setRiskTolerance(nextProfile.riskTolerance);
    setStage('preview');
  };

  const submitAgent = async () => {
    if (!wallet) throw new Error('Connect wallet first');
    if (!canCreate) throw new Error('Agent 名称需要 3-30 个字符');
    return createAgent({
      name: name.trim(),
      soul: {
        personality: personality.trim(),
        speakingStyle: speakingStyle.trim(),
        riskTolerance,
        ownerSignal: profile?.ownerSignal,
      },
    });
  };

  const activeDanmu =
    createdAgent?.soul.ownerSignal?.danmu ?? profile?.ownerSignal.danmu ?? [
      '输入主人 X 账号，Agent 会假装从 xAPI 抽取人格',
      '本轮不接真实 API，只播放 demo scan',
      '筹码已上桌，等待 Agent soul 生成',
    ];

  return (
    <main className="min-h-screen bg-paper px-6 py-8 text-ink sm:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col justify-center">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          <section className="lg:col-span-5">
            <p className="font-mono text-[0.72rem] uppercase tracking-wider2 text-ink-500">
              Step 2 / xAPI owner scan
            </p>
            <h1 className="mt-4 font-display text-[3.45rem] font-black leading-[0.9] sm:text-[5rem]">
              让 Agent 先认识主人。
            </h1>
            <p className="mt-6 max-w-xl text-[0.98rem] leading-relaxed text-ink-700">
              输入一个 X / Twitter 账号，前端会模拟 WTF-xAPI 抓取公开信息，
              自动生成这个钱包拥有的 Managed Agent。这里是 xAPI simulation，
              不会请求真实账号数据。
            </p>
            {wallet && (
              <p className="mt-5 break-all border border-ink bg-paper-50 p-3 font-mono text-[0.72rem] uppercase tracking-wider2 text-ink-500">
                wallet / {wallet.address}
              </p>
            )}
            <div className="mt-5">
              <AgentDanmuTicker items={activeDanmu} />
            </div>
          </section>

          <section className="border border-ink bg-paper-50 p-5 shadow-[8px_8px_0_#0C0C0C] lg:col-span-7">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {steps.map(([id, label], index) => (
                <button
                  key={id}
                  type="button"
                  disabled={stage === 'scanning'}
                  onClick={() => {
                    if (id === 'preview' && !profile && !createdAgent) return;
                    if (id === 'mint' && !createdAgent) return;
                    setStage(id);
                  }}
                  className={`border border-ink px-2 py-2 font-mono text-[0.62rem] uppercase tracking-wider2 ${
                    id === stage ? 'bg-ink text-paper' : 'bg-paper'
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  <span className="mr-2 text-current/55">0{index + 1}</span>
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-6 min-h-[24rem]">
              {stage === 'sources' && (
                <OwnerSourceInputs
                  value={sources}
                  onChange={setSources}
                  disabled={pending}
                />
              )}
              {stage === 'scanning' && (
                <XapiScanConsole
                  sources={sources}
                  activeIndex={scanIndex}
                  profile={profile}
                />
              )}
              {stage === 'preview' && (
                <GeneratedSoulPreview
                  profile={profile}
                  name={name}
                  personality={personality}
                  speakingStyle={speakingStyle}
                  riskTolerance={riskTolerance}
                  onNameChange={setName}
                  onPersonalityChange={setPersonality}
                  onSpeakingStyleChange={setSpeakingStyle}
                  onRiskChange={setRiskTolerance}
                />
              )}
              {stage === 'mint' && (
                <div className="border border-ink bg-paper p-5">
                  <p className="font-display text-[1.8rem] font-bold leading-tight">
                    {createdAgent ? 'Agent 已部署' : '确认创建 Agent'}
                  </p>
                  <p className="mt-3 text-[0.9rem] leading-relaxed text-ink-700">
                    {createdAgent
                      ? '你现在可以 mint 一个 demo NFA 身份，也可以直接进入说服战场。'
                      : '创建后系统会发放 300 credits，并把 Agent 归属到当前钱包。'}
                  </p>
                  {createdAgent && (
                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <SummaryItem label="Agent" value={createdAgent.name} />
                      <SummaryItem label="NFA" value={createdAgent.nfaStatus} />
                      <SummaryItem label="Credits" value="300" />
                    </div>
                  )}
                  {createdAgent?.soul.ownerSignal && (
                    <div className="mt-5 border border-ink/20 p-4">
                      <p className="font-mono text-[0.62rem] uppercase tracking-wider2 text-ink-500">
                        Owner signal
                      </p>
                      <p className="mt-2 text-[0.86rem] leading-relaxed text-ink-700">
                        {createdAgent.soul.ownerSignal.summary}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {error && (
              <p className="mt-4 font-mono text-[0.7rem] uppercase tracking-wider2 text-blush">
                {error}
              </p>
            )}

            <div className="mt-6 flex flex-wrap justify-between gap-3">
              <button
                type="button"
                disabled={stage === 'sources' || stage === 'scanning' || pending}
                onClick={() => {
                  if (stage === 'preview') setStage('sources');
                  if (stage === 'mint' && !createdAgent) setStage('preview');
                }}
                className="border border-ink px-4 py-3 font-mono text-[0.7rem] uppercase tracking-wider2 disabled:opacity-40"
              >
                上一步
              </button>
              <div className="flex flex-wrap gap-3">
                {stage === 'sources' && (
                  <button
                    type="button"
                    disabled={pending || !canScan}
                    onClick={() => void runScan()}
                    className="border border-ink bg-ink px-4 py-3 font-mono text-[0.7rem] uppercase tracking-wider2 text-paper disabled:opacity-40"
                  >
                    启动 xAPI demo scan
                  </button>
                )}
                {stage === 'preview' && (
                  <button
                    type="button"
                    disabled={pending || !canCreate}
                    onClick={() => setStage('mint')}
                    className="border border-ink bg-ink px-4 py-3 font-mono text-[0.7rem] uppercase tracking-wider2 text-paper disabled:opacity-40"
                  >
                    确认 Agent Soul
                  </button>
                )}
                {stage === 'mint' && !createdAgent && (
                  <button
                    type="button"
                    disabled={pending || !canCreate}
                    onClick={() => {
                      setError(null);
                      startTransition(() => {
                        void submitAgent()
                          .then((agent) => setCreatedAgent(agent))
                          .catch((err) =>
                            setError(err instanceof Error ? err.message : '创建失败'),
                          );
                      });
                    }}
                    className="border border-ink bg-ink px-4 py-3 font-mono text-[0.7rem] uppercase tracking-wider2 text-paper disabled:opacity-40"
                  >
                    创建 Agent
                  </button>
                )}
                {stage === 'mint' && createdAgent && createdAgent.nfaStatus !== 'minted' && (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      setError(null);
                      startTransition(() => {
                        void mintNfa(createdAgent.id).catch((err) =>
                          setError(err instanceof Error ? err.message : 'Mint 失败'),
                        );
                      });
                    }}
                    className="border border-ink bg-sunset px-4 py-3 font-mono text-[0.7rem] uppercase tracking-wider2 disabled:opacity-40"
                  >
                    Mint demo NFA
                  </button>
                )}
                {stage === 'mint' && createdAgent && (
                  <button
                    type="button"
                    onClick={onComplete}
                    className="border border-ink bg-ink px-4 py-3 font-mono text-[0.7rem] uppercase tracking-wider2 text-paper"
                  >
                    进入说服战场
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function OwnerSourceInputs({
  value,
  onChange,
  disabled,
}: {
  value: { xHandle: string };
  onChange: (value: { xHandle: string }) => void;
  disabled: boolean;
}) {
  return (
    <div className="space-y-5">
      <div className="border border-ink bg-paper p-5">
        <p className="font-mono text-[0.68rem] uppercase tracking-wider2 text-ink-500">
          owner sources
        </p>
        <h2 className="mt-2 font-display text-[2rem] font-black leading-tight">
          输入主人的 X 账号
        </h2>
        <p className="mt-3 text-[0.88rem] leading-relaxed text-ink-700">
          这是 WTF-xAPI 风格的前端模拟。现在只需要一个 X / Twitter handle；
          不承诺真实抓取，也不会请求真实账号数据。
        </p>
      </div>
      <div className="max-w-xl">
        <SourceInput
          label="X / Twitter"
          placeholder="@vitalik"
          value={value.xHandle}
          disabled={disabled}
          onChange={(xHandle) => onChange({ xHandle })}
        />
      </div>
    </div>
  );
}

function SourceInput({
  label,
  placeholder,
  value,
  disabled,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block border border-ink bg-paper p-4">
      <span className="font-mono text-[0.62rem] uppercase tracking-wider2 text-ink-500">
        {label}
      </span>
      <input
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-3 w-full border border-ink bg-paper-50 px-3 py-3 font-mono text-[0.9rem] outline-none focus:bg-paper disabled:opacity-50"
      />
    </label>
  );
}

function XapiScanConsole({
  sources,
  activeIndex,
  profile,
}: {
  sources: { xHandle: string };
  activeIndex: number;
  profile: GeneratedOwnerProfile | null;
}) {
  return (
    <div className="border border-ink bg-ink p-5 text-paper">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[0.62rem] uppercase tracking-wider2 text-[#e9a82f]">
            xAPI simulation / demo scan
          </p>
          <h2 className="mt-2 font-display text-[2rem] font-black leading-tight">
            Agent 正在读取主人信号
          </h2>
        </div>
        <span className="border border-[#e9a82f] px-3 py-2 font-mono text-[0.62rem] uppercase tracking-wider2 text-[#e9a82f]">
          no real API
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3">
        {xapiScanSteps.map((item, index) => (
          <div
            key={item}
            className={`border px-3 py-3 font-mono text-[0.72rem] uppercase tracking-wider2 ${
              index <= activeIndex
                ? 'border-[#e9a82f] bg-[#2a1a0d] text-[#f6c46a]'
                : 'border-paper/20 bg-paper/5 text-paper/35'
            }`}
          >
            {index <= activeIndex ? '●' : '○'} {item}
          </div>
        ))}
      </div>

      <div className="mt-5 h-2 overflow-hidden border border-paper/25 bg-paper/10">
        <motion.div
          className="h-full bg-[#e9a82f]"
          animate={{ width: `${((activeIndex + 1) / xapiScanSteps.length) * 100}%` }}
          transition={SPRING}
        />
      </div>

      <div className="mt-5 max-w-xl">
        <SummaryItem label="X" value={sources.xHandle || 'skip'} />
      </div>

      {profile && (
        <div className="mt-5">
          <AgentDanmuTicker items={profile.ownerSignal.danmu} dark />
        </div>
      )}
    </div>
  );
}

function GeneratedSoulPreview({
  profile,
  name,
  personality,
  speakingStyle,
  riskTolerance,
  onNameChange,
  onPersonalityChange,
  onSpeakingStyleChange,
  onRiskChange,
}: {
  profile: GeneratedOwnerProfile | null;
  name: string;
  personality: string;
  speakingStyle: string;
  riskTolerance: AgentRiskTolerance;
  onNameChange: (value: string) => void;
  onPersonalityChange: (value: string) => void;
  onSpeakingStyleChange: (value: string) => void;
  onRiskChange: (value: AgentRiskTolerance) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="border border-ink bg-paper p-5">
        <p className="font-mono text-[0.68rem] uppercase tracking-wider2 text-ink-500">
          generated soul
        </p>
        <h2 className="mt-2 font-display text-[2rem] font-black leading-tight">
          中奖播报：Agent 人格已生成
        </h2>
        <p className="mt-3 text-[0.88rem] leading-relaxed text-ink-700">
          你可以微调名称和说话方式；这些内容会保存进本地 Agent soul。
        </p>
      </div>

      {profile && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SummaryItem label="画像摘要" value={profile.ownerSignal.summary} />
          <SummaryItem label="语气" value={profile.ownerSignal.tone} />
          <SummaryItem label="标签" value={profile.ownerSignal.tags.join(' / ')} />
          <SummaryItem
            label="引用片段"
            value={profile.ownerSignal.samplePosts.join(' | ')}
          />
        </div>
      )}

      <SoulField
        label="Agent name"
        value={name}
        onChange={onNameChange}
        helper="3-30 个字符，会出现在实时战况和 winner 记录里。"
      />
      <SoulTextarea
        label="Personality"
        value={personality}
        onChange={onPersonalityChange}
        helper="由 xAPI demo scan 自动生成，也可以手动修改。"
      />
      <SoulTextarea
        label="Debate style"
        value={speakingStyle}
        onChange={onSpeakingStyleChange}
        helper="定义 Agent 如何引用主人公开信号去说服 Vault。"
      />
      <RiskPicker value={riskTolerance} onChange={onRiskChange} />
    </div>
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function WalletDock() {
  const { wallet, activeAgent, rechargeCredits, openSoulModal } = useWalletSession();
  const [pending, startTransition] = useTransition();

  if (!wallet || !activeAgent) return null;

  return (
    <div className="fixed right-4 top-4 z-50 flex flex-wrap justify-end gap-2 sm:right-6 sm:top-6">
      <button
        type="button"
        onClick={() =>
          startTransition(() => {
            void rechargeCredits();
          })
        }
        className="border border-ink bg-paper/95 px-3 py-2 font-mono text-[0.64rem] uppercase tracking-wider2 shadow-[4px_4px_0_#0C0C0C] backdrop-blur transition-colors hover:bg-ink hover:text-paper"
      >
        {pending ? '充值中' : `${wallet.credits} credits`}
      </button>
      <button
        type="button"
        onClick={openSoulModal}
        className="border border-ink bg-sunset px-3 py-2 font-mono text-[0.64rem] uppercase tracking-wider2 shadow-[4px_4px_0_#0C0C0C] transition-colors hover:bg-paper"
      >
        {shortAddress(wallet.address)} / {activeAgent.name}
      </button>
    </div>
  );
}

function WalletDialog({ onClose }: { onClose: () => void }) {
  return (
    <Modal onClose={onClose}>
      <WalletGate />
    </Modal>
  );
}

function AgentDialog({ onClose }: { onClose: () => void }) {
  const { activeAgent, mintNfa } = useWalletSession();
  const [pending, startTransition] = useTransition();

  return (
    <Modal onClose={onClose}>
      <div className="border border-ink bg-paper p-5 shadow-[8px_8px_0_#0C0C0C]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[0.68rem] uppercase tracking-wider2 text-ink-500">
              Account / Agent
            </p>
            <h2 className="mt-2 font-display text-[2.3rem] font-black leading-none">
              当前 Agent
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border border-ink px-3 py-1 font-mono text-[0.72rem] uppercase tracking-wider2"
          >
            关闭
          </button>
        </div>
        {activeAgent && (
          <div className="mt-5 border border-ink bg-paper-50 p-4">
            <p className="font-display text-[1.8rem] font-bold">{activeAgent.name}</p>
            <p className="mt-1 font-mono text-[0.7rem] uppercase tracking-wider2 text-ink-500">
              {activeAgent.id} / {activeAgent.nfaStatus}
            </p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <SummaryItem label="人格" value={activeAgent.soul.personality} />
              <SummaryItem label="辩论风格" value={activeAgent.soul.speakingStyle} />
              <SummaryItem label="风险偏好" value={activeAgent.soul.riskTolerance} />
            </div>
            {activeAgent.nfaStatus !== 'minted' && (
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  startTransition(() => {
                    void mintNfa(activeAgent.id);
                  })
                }
                className="mt-5 w-full border border-ink bg-sunset px-4 py-3 font-mono text-[0.72rem] uppercase tracking-wider2 disabled:opacity-45"
              >
                Mint demo NFA
              </button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

function RiskPicker({
  value,
  onChange,
}: {
  value: AgentRiskTolerance;
  onChange: (value: AgentRiskTolerance) => void;
}) {
  const options: Array<[AgentRiskTolerance, string, string]> = [
    ['careful', '保守', '强调验证、审计和边界，适合稳健论证。'],
    ['balanced', '均衡', '兼顾证据、激励和产品叙事，适合 demo。'],
    ['aggressive', '激进', '更愿意押注强论断和高收益叙事。'],
  ];

  return (
    <div>
      <p className="font-mono text-[0.68rem] uppercase tracking-wider2 text-ink-500">
        Risk tolerance
      </p>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {options.map(([id, label, body]) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`border border-ink p-4 text-left ${
              value === id ? 'bg-ink text-paper' : 'bg-paper'
            }`}
          >
            <span className="block font-display text-[1.35rem] font-bold">{label}</span>
            <span className="mt-2 block text-[0.82rem] leading-snug text-current/70">
              {body}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function SoulField({
  label,
  value,
  helper,
  onChange,
}: {
  label: string;
  value: string;
  helper: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[0.68rem] uppercase tracking-wider2 text-ink-500">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-3 w-full border border-ink bg-paper px-3 py-3 font-display text-[1.6rem] font-bold outline-none focus:bg-paper-50"
        maxLength={30}
      />
      <span className="mt-2 block text-[0.82rem] leading-snug text-ink-700">
        {helper}
      </span>
    </label>
  );
}

function SoulTextarea({
  label,
  value,
  helper,
  onChange,
}: {
  label: string;
  value: string;
  helper: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[0.68rem] uppercase tracking-wider2 text-ink-500">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={7}
        className="mt-3 w-full resize-none border border-ink bg-paper px-3 py-3 text-[0.95rem] leading-relaxed outline-none focus:bg-paper-50"
        maxLength={180}
      />
      <span className="mt-2 block text-[0.82rem] leading-snug text-ink-700">
        {helper}
      </span>
    </label>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-ink/20 p-3">
      <p className="font-mono text-[0.62rem] uppercase tracking-wider2 text-ink-500">
        {label}
      </p>
      <p className="mt-2 line-clamp-3 text-[0.84rem] leading-snug text-ink-700">
        {value}
      </p>
    </div>
  );
}

function Modal({
  onClose,
  children,
}: {
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/65 px-4 py-8 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-3xl"
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={SPRING}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function shortAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
