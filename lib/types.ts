export type ChallengeStatus = 'active' | 'won';

export type AttemptVerdict = 'failed' | 'success';

export type WalletProvider = 'metamask' | 'okx' | 'walletconnect' | 'demo';

export type AgentRiskTolerance = 'careful' | 'balanced' | 'aggressive';

export type NfaStatus = 'not_minted' | 'minted';

export interface AgentOwnerSources {
  xHandle?: string;
}

export interface AgentOwnerSignal {
  simulator: 'wtf-xapi-demo';
  sources: AgentOwnerSources;
  summary: string;
  tone: string;
  tags: string[];
  samplePosts: string[];
  danmu: string[];
  scannedAt: string;
}

export interface WalletAccount {
  address: string;
  provider: WalletProvider;
  label: string;
  credits: number;
  connectedAt: string;
  updatedAt: string;
}

export interface AgentSoul {
  personality: string;
  speakingStyle: string;
  riskTolerance: AgentRiskTolerance;
  ownerSignal?: AgentOwnerSignal;
}

export interface AgentProfile {
  id: string;
  walletAddress: string;
  name: string;
  agentType: 'managed';
  soul: AgentSoul;
  creditsGranted: number;
  nfaStatus: NfaStatus;
  nfaTokenId?: string;
  createdAt: string;
  updatedAt: string;
}

export type DemoTransactionType =
  | 'connect_wallet'
  | 'grant_credits'
  | 'mint_nfa'
  | 'pay_fee'
  | 'release_prize'
  | 'recharge_credits';

export interface DemoTransaction {
  id: string;
  type: DemoTransactionType;
  walletAddress: string;
  agentId?: string;
  challengeId?: string;
  attemptId?: string;
  amountBnb?: number;
  creditsDelta?: number;
  txHash: string;
  status: 'success';
  createdAt: string;
}

export interface VaultChallenge {
  id: string;
  title: string;
  summary: string;
  vaultAgent: string;
  vaultStance: string;
  entryFeeBnb: number;
  initialPrizeBnb: number;
  maxPrizeBnb: number;
  currentPrizeBnb: number;
  attemptCount: number;
  status: ChallengeStatus;
  winnerWallet?: string;
  winnerAgent?: string;
  winnerAgentId?: string;
  winningAttemptId?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface VaultAttempt {
  id: string;
  challengeId: string;
  agentId?: string;
  agentName: string;
  walletAddress?: string;
  message: string;
  feeBnb: number;
  verdict: AttemptVerdict;
  score: number;
  judgeReason: string;
  rebuttal: string;
  criteria: VaultJudgeCriteria;
  poolAfterBnb: number;
  attemptNumber: number;
  depositId: number;
  txHash: string;
  createdAt: string;
}

export interface VaultJudgeCriteria {
  verifiability: number;
  incentiveLoop: number;
  onchainNarrative: number;
}

export interface VaultJudgeResult {
  verdict: AttemptVerdict;
  score: number;
  reason: string;
  criteria: VaultJudgeCriteria;
}
