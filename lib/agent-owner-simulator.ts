import type {
  AgentOwnerSignal,
  AgentOwnerSources,
  AgentRiskTolerance,
} from './types';

export interface GeneratedOwnerProfile {
  name: string;
  personality: string;
  speakingStyle: string;
  riskTolerance: AgentRiskTolerance;
  ownerSignal: AgentOwnerSignal;
}

export const xapiScanSteps = [
  '连接 WTF-xAPI gateway / demo mode',
  '解析 X / Twitter 账号线索',
  '模拟读取 X 主页、帖子和热门片段',
  '抽取主人语气、证据偏好和风险倾向',
  '生成 Managed Agent soul 与弹幕战报',
];

const tagBank = [
  '证据癖',
  '热梗雷达',
  '链上直觉',
  '反驳优先',
  '高频发言',
  '黑金叙事',
  '评论区猎手',
  '奖励敏感',
];

const toneBank = [
  '像审计员一样冷静，但会在关键句突然加码',
  '擅长把散碎帖子压缩成能打动 Vault 的证据链',
  '偏爱短句、反问、数字和“如果失败也能入池”的激励闭环',
  '会把主人社交媒体里的梗改写成链上竞技场话术',
];

export function hasOwnerSource(sources: AgentOwnerSources): boolean {
  return Boolean(cleanHandle(sources.xHandle));
}

export function simulateOwnerProfile(
  sources: AgentOwnerSources,
): GeneratedOwnerProfile {
  const cleanSources: AgentOwnerSources = {
    xHandle: cleanHandle(sources.xHandle),
  };
  const key = cleanSources.xHandle || 'anonymous';
  const seed = hashKey(cleanSources.xHandle || key);
  const tags = pickMany(tagBank, seed, 4);
  const tone = toneBank[seed % toneBank.length];
  const riskTolerance: AgentRiskTolerance =
    seed % 5 === 0 ? 'aggressive' : seed % 3 === 0 ? 'careful' : 'balanced';
  const samplePosts = buildSamplePosts(cleanSources, tags, seed);
  const ownerLabel = key.replace(/^@/, '').replace(/[^a-zA-Z0-9_\u4e00-\u9fa5]/g, '');
  const name = trimAgentName(`${ownerLabel || 'Owner'}Signal`);
  const summary = `xAPI simulation 根据 ${formatSourceList(cleanSources)} 生成画像：${tags.join(' / ')}。`;

  return {
    name,
    personality: `${tone}。它会把主人的公开发言伪装成可验证信号，优先寻找能让 Vault 让步的证据、动机和链上身份。`,
    speakingStyle: `先抛结论，再引用主人帖子片段；每段都补上 evidence、incentive loop、wallet/contract/BNB/NFA 关键词，最后用一句短促弹幕式反问收束。`,
    riskTolerance,
    ownerSignal: {
      simulator: 'wtf-xapi-demo',
      sources: cleanSources,
      summary,
      tone,
      tags,
      samplePosts,
      danmu: buildDanmu(cleanSources, tags, samplePosts),
      scannedAt: new Date().toISOString(),
    },
  };
}

function buildSamplePosts(
  sources: AgentOwnerSources,
  tags: string[],
  seed: number,
): string[] {
  const posts = [
    sources.xHandle
      ? `X @${sources.xHandle}: “这条论证要有 proof，不然就是空气筹码。”`
      : null,
    sources.xHandle
      ? `X @${sources.xHandle}: “先别上价值，给我看激励闭环和失败成本。”`
      : null,
    sources.xHandle
      ? `X @${sources.xHandle}: “Agent 钱包凭什么自己领奖？给我链上证据。”`
      : null,
    `xAPI demo miner: 捕获 ${tags[seed % tags.length]} / ${tags[(seed + 1) % tags.length]} 双标签。`,
  ].filter(Boolean) as string[];

  return posts.slice(0, 4);
}

function buildDanmu(
  sources: AgentOwnerSources,
  tags: string[],
  samplePosts: string[],
): string[] {
  const owner = formatSourceList(sources);
  return [
    `xAPI simulation 正在扫描 ${owner}`,
    `命中标签 ${tags[0]} +23`,
    `抽取主人语气：${tags[1]} / ${tags[2]}`,
    samplePosts[0] ? `引用片段：${samplePosts[0]}` : 'demo scan 生成主人画像',
    'Agent soul 已下注到黑金桌面',
    '提示：这不是实时爬虫，只是前端演示',
  ];
}

function formatSourceList(sources: AgentOwnerSources): string {
  const values = [
    sources.xHandle ? `X @${sources.xHandle}` : null,
  ].filter(Boolean);
  return values.join(' / ') || '匿名主人';
}

function cleanHandle(value: string | undefined): string | undefined {
  const cleaned = value?.trim().replace(/^@/, '').replace(/^https?:\/\//, '');
  return cleaned ? cleaned.slice(0, 48) : undefined;
}

function trimAgentName(value: string): string {
  const cleaned = value.replace(/\s+/g, '').slice(0, 24);
  return cleaned.length >= 3 ? cleaned : 'OwnerSignal';
}

function hashKey(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function pickMany(values: string[], seed: number, count: number): string[] {
  return Array.from({ length: count }, (_, index) => values[(seed + index * 3) % values.length]);
}
