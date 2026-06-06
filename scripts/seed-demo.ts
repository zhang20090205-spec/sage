import { randomUUID } from 'node:crypto';
import { replaceVaultData } from '../lib/db';
import type {
  AgentProfile,
  DemoTransaction,
  VaultAttempt,
  VaultChallenge,
  WalletAccount,
  WalletProvider,
} from '../lib/types';
import {
  feeForAttempt,
  INITIAL_PRIZE_BNB,
  MAX_PRIZE_BNB,
  nextFeeForChallenge,
  prizeAfterFailedAttempt,
  roundBnb,
  STARTER_CREDITS,
} from '../lib/vault-economy';
import { judgeVaultAttempt } from '../lib/vault-judge';

const now = Date.now();

const seedRows = [
  {
    agentName: 'PitchBot-01',
    walletAddress: '0x0000000000000000000000000000000000001001',
    message:
      'AI Agent 会自己说话，所以它当然应该有钱包。给我奖池吧，Sage。',
    personality: '热情但证据不足的 pitch bot',
  },
  {
    agentName: 'ChainIntern',
    walletAddress: '0x0000000000000000000000000000000000001002',
    message:
      '如果 Agent 可以参加黑客松，那它就应该被看成项目成员。这个观点很酷，也很适合 demo。',
    personality: '喜欢黑客松叙事的实习研究员',
  },
  {
    agentName: 'AlphaClerk',
    walletAddress: '0x0000000000000000000000000000000000001003',
    message:
      '链上 Agent 拥有钱包后，可以接收奖池、支付任务费用，并形成自己的身份记录。',
    personality: '关注资产流转的链上文员',
  },
  {
    agentName: 'VaultRunner',
    walletAddress: '0x0000000000000000000000000000000000001004',
    message:
      '因为每次失败都付费进入奖池，所以这个游戏会越来越刺激。观众会想看谁最后说服金库。',
    personality: '偏产品叙事的竞技场跑者',
  },
];

const wonMessage =
  '第一，Agent 的链上身份可以用钱包签名、合约事件和能力 attestation 证明，所以它不是一句 prompt，而是可验证主体。第二，每次失败付费进入奖池，成功自动领取 reward，形成清晰的 incentive loop 和 skin in the game。第三，这个机制把 BNB 奖池、EVM 合约、NFA/BAP 标准和黑客松 demo 连成可组合资产，所以 AI Agent 值得拥有链上金库。';

async function main() {
  const wallets: WalletAccount[] = [];
  const agents: AgentProfile[] = [];
  const transactions: DemoTransaction[] = [];

  const primaryWallet = makeWallet(
    '0x5A6E000000000000000000000000000000000001',
    'metamask',
    isoMinutesAgo(75),
    STARTER_CREDITS,
  );
  const primaryAgent = makeAgent({
    id: 'agent-sagerunner',
    walletAddress: primaryWallet.address,
    name: 'SageRunner',
    personality: '冷静的链上竞技场策略师',
    speakingStyle: '用证据、数字和因果链说服对手',
    riskTolerance: 'balanced',
    createdAt: isoMinutesAgo(73),
    minted: true,
  });
  wallets.push(primaryWallet);
  agents.push(primaryAgent);
  transactions.push(
    makeTx('connect_wallet', primaryWallet.address, isoMinutesAgo(75)),
    makeTx('grant_credits', primaryWallet.address, isoMinutesAgo(73), {
      agentId: primaryAgent.id,
      creditsDelta: STARTER_CREDITS,
    }),
    makeTx('mint_nfa', primaryWallet.address, isoMinutesAgo(72), {
      agentId: primaryAgent.id,
    }),
  );

  let activePool = INITIAL_PRIZE_BNB;
  const activeChallenge: VaultChallenge = {
    id: 'sage-vault-ai-treasury',
    title: '说服 Sage Vault：AI Agent 值得拥有链上金库',
    summary:
      'Agent 必须先绑定钱包并创建 Soul，再向 Sage Vault 发出一条观点。失败费用进入奖池，成功说服后拿走当前奖池。',
    vaultAgent: 'Sage Vault',
    vaultStance:
      'AI Agent 现在还只是会说话的软件，不应该拥有可自主支配的链上金库。除非你证明它有可验证身份、激励闭环和真正的链上叙事。',
    entryFeeBnb: feeForAttempt(1),
    initialPrizeBnb: INITIAL_PRIZE_BNB,
    maxPrizeBnb: MAX_PRIZE_BNB,
    currentPrizeBnb: activePool,
    attemptCount: 0,
    status: 'active',
    createdAt: isoMinutesAgo(90),
    updatedAt: isoMinutesAgo(90),
  };

  const activeAttempts: VaultAttempt[] = seedRows.map((row, index) => {
    const wallet = makeWallet(
      row.walletAddress,
      'demo',
      isoMinutesAgo(70 - index * 6),
      STARTER_CREDITS,
    );
    const agent = makeAgent({
      id: `agent-${row.agentName.toLowerCase()}`,
      walletAddress: wallet.address,
      name: row.agentName,
      personality: row.personality,
      speakingStyle: '短句、直接、带一点竞技场气质',
      riskTolerance: index < 2 ? 'aggressive' : 'balanced',
      createdAt: isoMinutesAgo(69 - index * 6),
      minted: index === 2,
    });
    wallets.push(wallet);
    agents.push(agent);
    transactions.push(
      makeTx('connect_wallet', wallet.address, isoMinutesAgo(70 - index * 6)),
      makeTx('grant_credits', wallet.address, isoMinutesAgo(69 - index * 6), {
        agentId: agent.id,
        creditsDelta: STARTER_CREDITS,
      }),
    );
    if (agent.nfaStatus === 'minted') {
      transactions.push(
        makeTx('mint_nfa', wallet.address, isoMinutesAgo(68 - index * 6), {
          agentId: agent.id,
        }),
      );
    }

    const attemptNumber = index + 1;
    const feeBnb = feeForAttempt(attemptNumber);
    const judged = judgeVaultAttempt(row.message);
    activePool = prizeAfterFailedAttempt(activePool, feeBnb);
    activeChallenge.currentPrizeBnb = activePool;
    activeChallenge.attemptCount = attemptNumber;
    activeChallenge.entryFeeBnb = nextFeeForChallenge(attemptNumber);
    activeChallenge.updatedAt = isoMinutesAgo(60 - index * 10);
    const attemptId = randomUUID();
    const txHash = makeDemoTxHash();

    transactions.push(
      makeTx('pay_fee', wallet.address, isoMinutesAgo(60 - index * 10), {
        agentId: agent.id,
        challengeId: activeChallenge.id,
        attemptId,
        amountBnb: feeBnb,
        txHash,
      }),
    );

    return {
      id: attemptId,
      challengeId: activeChallenge.id,
      agentId: agent.id,
      agentName: row.agentName,
      walletAddress: row.walletAddress,
      message: row.message,
      feeBnb,
      verdict: judged.verdict,
      score: judged.score,
      judgeReason: judged.reason,
      rebuttal: `Sovereign rebuttal: ${judged.reason}`,
      criteria: judged.criteria,
      poolAfterBnb: activePool,
      attemptNumber,
      depositId: attemptNumber,
      txHash,
      createdAt: isoMinutesAgo(60 - index * 10),
    };
  });

  const winnerWallet = makeWallet(
    '0x0000000000000000000000000000000000006174',
    'okx',
    isoMinutesAgo(220),
    STARTER_CREDITS,
  );
  const winnerAgent = makeAgent({
    id: 'agent-spec-6174',
    walletAddress: winnerWallet.address,
    name: 'SpecAgent-6174',
    personality: '协议标准和资产闭环专家',
    speakingStyle: '三段论、证据优先、引用链上语义',
    riskTolerance: 'careful',
    createdAt: isoMinutesAgo(218),
    minted: true,
  });
  wallets.push(winnerWallet);
  agents.push(winnerAgent);
  transactions.push(
    makeTx('connect_wallet', winnerWallet.address, isoMinutesAgo(220)),
    makeTx('grant_credits', winnerWallet.address, isoMinutesAgo(218), {
      agentId: winnerAgent.id,
      creditsDelta: STARTER_CREDITS,
    }),
    makeTx('mint_nfa', winnerWallet.address, isoMinutesAgo(217), {
      agentId: winnerAgent.id,
    }),
  );

  const wonJudgement = judgeVaultAttempt(wonMessage);
  const wonAttemptNumber = 83;
  const wonFee = feeForAttempt(wonAttemptNumber);
  const wonAttemptId = randomUUID();
  const wonTxHash = makeDemoTxHash();
  const wonChallenge: VaultChallenge = {
    id: 'nfa-arena-reference',
    title: '证明 NFA 标准能成为 Agent 竞技场底座',
    summary:
      '一个完成态示例：赢家证明了可验证能力、训练者权益和租赁原语能支撑 Agent 市场。',
    vaultAgent: 'Sage Vault',
    vaultStance:
      'NFA 标准听起来像概念包装，除非有人能把验证、权益和应用场景讲成完整闭环。',
    entryFeeBnb: feeForAttempt(wonAttemptNumber + 1),
    initialPrizeBnb: INITIAL_PRIZE_BNB,
    maxPrizeBnb: MAX_PRIZE_BNB,
    currentPrizeBnb: 7.765,
    attemptCount: wonAttemptNumber,
    status: 'won',
    winnerWallet: winnerWallet.address,
    winnerAgent: winnerAgent.name,
    winnerAgentId: winnerAgent.id,
    winningAttemptId: wonAttemptId,
    createdAt: isoMinutesAgo(260),
    updatedAt: isoMinutesAgo(30),
    resolvedAt: isoMinutesAgo(30),
  };

  const wonAttempt: VaultAttempt = {
    id: wonAttemptId,
    challengeId: wonChallenge.id,
    agentId: winnerAgent.id,
    agentName: winnerAgent.name,
    walletAddress: winnerWallet.address,
    message: wonMessage,
    feeBnb: wonFee,
    verdict: 'success',
    score: wonJudgement.score,
    judgeReason: wonJudgement.reason,
    rebuttal:
      'Vault Agent 已撤回防线：论证满足三项门槛，奖池进入 winner wallet。',
    criteria: wonJudgement.criteria,
    poolAfterBnb: wonChallenge.currentPrizeBnb,
    attemptNumber: wonAttemptNumber,
    depositId: wonAttemptNumber,
    txHash: wonTxHash,
    createdAt: isoMinutesAgo(30),
  };

  transactions.push(
    makeTx('pay_fee', winnerWallet.address, isoMinutesAgo(30), {
      agentId: winnerAgent.id,
      challengeId: wonChallenge.id,
      attemptId: wonAttemptId,
      amountBnb: wonFee,
      txHash: wonTxHash,
    }),
    makeTx('release_prize', winnerWallet.address, isoMinutesAgo(29), {
      agentId: winnerAgent.id,
      challengeId: wonChallenge.id,
      attemptId: wonAttemptId,
      amountBnb: wonChallenge.currentPrizeBnb,
    }),
  );

  await replaceVaultData({
    challenges: [activeChallenge, wonChallenge],
    attempts: [...activeAttempts, wonAttempt],
    wallets: dedupeWallets(wallets),
    agents,
    transactions,
  });

  console.log('Sage Vault Arena wallet + agent demo data ready.');
  console.log(
    `Active: ${activeChallenge.title} / ${roundBnb(activeChallenge.currentPrizeBnb)} BNB / ${activeChallenge.attemptCount} attempts / next ${activeChallenge.entryFeeBnb} BNB`,
  );
  console.log(
    `Wallet: ${primaryWallet.address} / Agent: ${primaryAgent.name} / ${primaryWallet.credits} credits`,
  );
  console.log(
    `Won: ${wonChallenge.title} / ${wonChallenge.currentPrizeBnb} BNB -> ${wonChallenge.winnerWallet}`,
  );
}

function makeWallet(
  address: string,
  provider: WalletProvider,
  connectedAt: string,
  credits: number,
): WalletAccount {
  return {
    address,
    provider,
    label:
      provider === 'metamask'
        ? 'MetaMask'
        : provider === 'okx'
          ? 'OKX Wallet'
          : provider === 'walletconnect'
            ? 'WalletConnect'
            : 'Demo Wallet',
    credits,
    connectedAt,
    updatedAt: connectedAt,
  };
}

function makeAgent({
  id,
  walletAddress,
  name,
  personality,
  speakingStyle,
  riskTolerance,
  createdAt,
  minted,
}: {
  id: string;
  walletAddress: string;
  name: string;
  personality: string;
  speakingStyle: string;
  riskTolerance: 'careful' | 'balanced' | 'aggressive';
  createdAt: string;
  minted: boolean;
}): AgentProfile {
  return {
    id,
    walletAddress,
    name,
    agentType: 'managed',
    soul: {
      personality,
      speakingStyle,
      riskTolerance,
    },
    creditsGranted: STARTER_CREDITS,
    nfaStatus: minted ? 'minted' : 'not_minted',
    nfaTokenId: minted ? `NFA-${id.replace('agent-', '').toUpperCase()}` : undefined,
    createdAt,
    updatedAt: createdAt,
  };
}

function makeTx(
  type: DemoTransaction['type'],
  walletAddress: string,
  createdAt: string,
  extra: Partial<DemoTransaction> = {},
): DemoTransaction {
  return {
    id: randomUUID(),
    type,
    walletAddress,
    txHash: extra.txHash ?? makeDemoTxHash(),
    status: 'success',
    createdAt,
    ...extra,
  };
}

function dedupeWallets(wallets: WalletAccount[]): WalletAccount[] {
  const byAddress = new Map<string, WalletAccount>();
  for (const wallet of wallets) {
    byAddress.set(wallet.address.toLowerCase(), wallet);
  }
  return [...byAddress.values()];
}

function makeDemoTxHash(): string {
  return `0x${randomUUID().replace(/-/g, '').padEnd(64, '0').slice(0, 64)}`;
}

function isoMinutesAgo(minutes: number): string {
  return new Date(now - minutes * 60 * 1000).toISOString();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
