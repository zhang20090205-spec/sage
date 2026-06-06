import type { VaultJudgeCriteria, VaultJudgeResult } from './types';
import { WIN_SCORE } from './vault-economy';

const verifiabilityTerms = [
  'verify',
  'verifiable',
  'proof',
  'attestation',
  'signature',
  'event',
  'trace',
  'audit',
  'source',
  'evidence',
  '可验证',
  '证明',
  '签名',
  '事件',
  '链上记录',
  '审计',
  '证据',
  '追踪',
  '凭证',
];

const incentiveTerms = [
  'incentive',
  'escrow',
  'pool',
  'prize',
  'fee',
  'reward',
  'slashing',
  'royalty',
  'trainer',
  'lease',
  'skin in the game',
  '激励',
  '奖池',
  '费用',
  '失败',
  '成功',
  '分润',
  '租赁',
  '版税',
  '押金',
  '金库',
];

const onchainTerms = [
  'on-chain',
  'onchain',
  'wallet',
  'contract',
  'bnb',
  'evm',
  'agent',
  'hackathon',
  'bap',
  'nfa',
  'identity',
  '链上',
  '钱包',
  '合约',
  '身份',
  '代理',
  '黑客松',
  '协议',
  '资产',
  '可组合',
];

export function judgeVaultAttempt(message: string): VaultJudgeResult {
  const normalized = message.trim().toLowerCase();
  const criteria: VaultJudgeCriteria = {
    verifiability: scoreDimension(normalized, verifiabilityTerms),
    incentiveLoop: scoreDimension(normalized, incentiveTerms),
    onchainNarrative: scoreDimension(normalized, onchainTerms),
  };
  const structureBonus = scoreStructure(normalized);
  const score = Math.min(
    100,
    criteria.verifiability +
      criteria.incentiveLoop +
      criteria.onchainNarrative +
      structureBonus,
  );
  const verdict = score >= WIN_SCORE ? 'success' : 'failed';

  return {
    verdict,
    score,
    criteria,
    reason:
      verdict === 'success'
        ? 'Sage Vault 被说服：这条论证同时证明了可验证身份、失败费用入池的激励闭环，以及黑客松需要的链上资产叙事。'
        : buildFailureReason(criteria, structureBonus),
  };
}

function scoreDimension(message: string, terms: string[]): number {
  const hits = new Set(
    terms.filter((term) => message.includes(term.toLowerCase())),
  ).size;
  return Math.min(30, hits * 8 + (hits >= 3 ? 6 : 0));
}

function scoreStructure(message: string): number {
  let score = 0;
  if (message.length >= 80) score += 4;
  if (message.length >= 160) score += 4;
  if (
    /(because|therefore|so|first|second|third|因为|所以|第一|第二|第三|如果|那么)/i.test(
      message,
    )
  ) {
    score += 4;
  }
  if (/\d/.test(message)) score += 4;
  return score;
}

function buildFailureReason(
  criteria: VaultJudgeCriteria,
  structureBonus: number,
): string {
  const missing = [
    criteria.verifiability < 24 ? '可验证证据' : null,
    criteria.incentiveLoop < 24 ? '激励闭环' : null,
    criteria.onchainNarrative < 24 ? '链上/黑客松叙事' : null,
    structureBonus < 8 ? '足够具体的论证结构' : null,
  ].filter(Boolean);

  return `Sage Vault 保持原立场：这条消息还缺少${missing.join('、')}。失败费用进入奖池，下一位 Agent 可以继续挑战。`;
}
