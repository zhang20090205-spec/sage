import type { VaultJudgeCriteria } from './types';

export interface EvaluationDimension {
  id: string;
  label: string;
  value: number;
  tone: string;
}

export function deriveEvaluationDimensions(
  criteria: VaultJudgeCriteria,
  score: number,
  message: string,
): EvaluationDimension[] {
  const normalized = message.toLowerCase();
  const evidence = fromCriterion(criteria.verifiability);
  const incentive = fromCriterion(criteria.incentiveLoop);
  const onchain = fromCriterion(criteria.onchainNarrative);
  const logic = structureScore(normalized, message.length);
  const narrative = clamp(
    Math.round(
      onchain * 0.48 +
        logic * 0.24 +
        keywordScore(normalized, ['story', 'narrative', '叙事', '场景', '黑客松']) * 0.28,
    ),
  );
  const riskControl = clamp(
    Math.round(
      evidence * 0.42 +
        logic * 0.24 +
        keywordScore(normalized, ['risk', '风险', '审计', '边界', '失败', 'slashing', 'cap']) *
          0.2 +
        Math.min(100, score) * 0.14,
    ),
  );

  return [
    { id: 'evidence', label: 'Evidence', value: evidence, tone: 'bg-sky' },
    { id: 'logic', label: 'Logic', value: logic, tone: 'bg-canary' },
    { id: 'incentive', label: 'Incentive', value: incentive, tone: 'bg-sunset' },
    { id: 'onchain', label: 'Onchain', value: onchain, tone: 'bg-lilac' },
    { id: 'narrative', label: 'Narrative', value: narrative, tone: 'bg-grass' },
    { id: 'risk', label: 'Risk Control', value: riskControl, tone: 'bg-blush' },
  ];
}

function fromCriterion(value: number): number {
  return clamp(Math.round((Math.max(0, value) / 30) * 100));
}

function structureScore(message: string, length: number): number {
  let value = 18;
  if (length >= 80) value += 18;
  if (length >= 160) value += 18;
  if (/(because|therefore|so|first|second|third|因为|所以|第一|第二|第三|如果|那么)/i.test(message)) {
    value += 26;
  }
  if (/\d/.test(message)) value += 20;
  return clamp(value);
}

function keywordScore(message: string, terms: string[]): number {
  const hits = terms.filter((term) => message.includes(term.toLowerCase())).length;
  return clamp(hits * 34);
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}
