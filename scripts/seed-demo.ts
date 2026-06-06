/**
 * Demo 种子数据脚本。
 *
 * 用法:
 *   bun run sage:seed
 *
 * 在不调 AI、不调 Farcaster 的情况下,把数据库塞满演示数据。
 * 这样评委来看的时候首页直接有 5 条带评语的精选 + 一些已有的 co-sign 活动。
 *
 * Pitch 演示流程:
 * 1. 跑 sage:seed → 首页有数据
 * 2. 现场让评委点其中一条 → 看到完整详情、Sage 评语、bonding curve 图
 * 3. 评委点 "Co-sign $0.50" → 数据立刻刷新,创作者累积 +
 * 4. 切到 Pitch slide,讲未来怎么上链
 *
 * 环境变量:bun 自动加载 .env.local,无需 dotenv
 */

import { randomUUID } from 'node:crypto';
import {
  appendCoSign,
  listCoSignsForPick,
  upsertPick,
} from '../lib/db';
import { deriveCreatorAddress } from '../lib/derive-address';
import {
  creatorAccruedFromPool,
  poolValueCents,
  priceAt,
} from '../lib/bonding-curve';
import type { Pick } from '../lib/types';

interface SeedRow {
  castId: string;
  content: string;
  authorFid: number;
  authorUsername: string;
  score: number;
  comment: string;
  tokenName: string;
  viralReasoning: string;
  /** 预填几个 co-sign */
  initialCoSigns: number;
}

const SEEDS: SeedRow[] = [
  {
    castId: 'seed-001',
    content:
      '上海地铁里又看见有人在直播带货,卖的还是"让你年薪百万的副业课"。我端着咖啡的手都抖了 —— 不是被吓的,是终于明白为什么咖啡涨价了。',
    authorFid: 10001,
    authorUsername: 'laowang',
    score: 87,
    comment: '把"咖啡涨价"和"副业课"绑在一起,这个反转有节奏。',
    tokenName: 'COFFEE',
    viralReasoning: '中产焦虑 + 黑色幽默,通勤族会自发转发。',
    initialCoSigns: 12,
  },
  {
    castId: 'seed-002',
    content:
      '公司新来的 95 后实习生说她的职业规划是"35 岁前财富自由"。我顿了顿,回了她一句:"我也是,只不过我现在 36 了。"',
    authorFid: 10002,
    authorUsername: 'tinyhuman',
    score: 91,
    comment: '一句话两代人的代沟,这是脱口秀剧本的级别。',
    tokenName: 'FIRE36',
    viralReasoning: '所有 35+ 的人都会转,自带打工人共鸣。',
    initialCoSigns: 23,
  },
  {
    castId: 'seed-003',
    content:
      '今天和朋友算了一下,我们公司晨会的总时长 × 全员时薪 = 一个工程师的年薪。开了三年。CTO 还在问为什么招不到人。',
    authorFid: 10003,
    authorUsername: 'devnotes',
    score: 83,
    comment: '把抽象的"无效会议"换算成具体年薪,数字本身就是梗。',
    tokenName: 'STANDUP',
    viralReasoning: '程序员圈层精准命中,但出圈难度中等。',
    initialCoSigns: 8,
  },
  {
    castId: 'seed-004',
    content:
      '加密圈最玄学的事:你看着一个项目从 0 涨到 100 倍,你没买,你恨;你看着另一个项目从 100 倍跌到 0,你买了,你还是恨。',
    authorFid: 10004,
    authorUsername: 'cryptocat',
    score: 89,
    comment: '把币圈情绪写到骨头里,FOMO 和 cope 各打 50 分。',
    tokenName: 'COPE',
    viralReasoning: 'web3 圈层封神,可能被各种 KOL 二次创作。',
    initialCoSigns: 18,
  },
  {
    castId: 'seed-005',
    content:
      '相亲对象问我:"你平时下班都干嘛?" 我说:"看 GitHub。" 她说:"GitHub 是哪个 APP,我下一个我们一起看。" 这局,我输了,但又像赢了。',
    authorFid: 10005,
    authorUsername: 'singlecoder',
    score: 85,
    comment: '"我输了,但又像赢了"这句收尾把整个段子盘活。',
    tokenName: 'GHDATE',
    viralReasoning: '程序员浪漫派 + 普通人好奇,跨圈传播潜力强。',
    initialCoSigns: 14,
  },
  {
    castId: 'seed-006',
    content:
      'Web3 项目方:"我们这个是真正去中心化的。" 提问环节:"那你们 token 80% 在团队和 VC 手里是为啥?" 项目方:"下一个问题。"',
    authorFid: 10010,
    authorUsername: 'rugwatcher',
    score: 92,
    comment: '"下一个问题"四个字是 2024 加密圈年度名场面。',
    tokenName: 'NEXTQ',
    viralReasoning: '所有 web3 黑客松评委都见过这一幕,会心一笑。',
    initialCoSigns: 31,
  },
];

async function main() {
  console.log('🌱 预填演示数据…\n');

  let i = 0;
  for (const seed of SEEDS) {
    i++;
    const creatorAddress = deriveCreatorAddress(seed.authorFid);
    const pick: Pick = {
      id: `pick-${seed.castId}`,
      cast: {
        id: seed.castId,
        content: seed.content,
        authorFid: seed.authorFid,
        authorUsername: seed.authorUsername,
        sourceUrl: `https://warpcast.com/${seed.authorUsername}/${seed.castId}`,
        fetchedAt: new Date(Date.now() - i * 3600 * 1000).toISOString(),
      },
      score: {
        castId: seed.castId,
        score: seed.score,
        comment: seed.comment,
        tokenName: seed.tokenName,
        viralReasoning: seed.viralReasoning,
        model: 'seed',
        scoredAt: new Date(Date.now() - i * 3600 * 1000).toISOString(),
      },
      creatorAddress,
      coSignCount: 0,
      totalPoolCents: 0,
      creatorAccruedCents: 0,
      curatedAt: new Date(Date.now() - i * 3600 * 1000).toISOString(),
      nftId: `0x${seed.castId.replace(/-/g, '').padEnd(16, '0').slice(0, 16)}`,
    };

    await upsertPick(pick);

    // 模拟若干 co-sign
    const existing = await listCoSignsForPick(pick.id);
    const needed = seed.initialCoSigns - existing.length;
    for (let k = 0; k < needed; k++) {
      const price = priceAt(pick.coSignCount + k);
      await appendCoSign({
        id: randomUUID(),
        pickId: pick.id,
        signerAddress: `0x${randomUUID().replace(/-/g, '').slice(0, 40)}`,
        signerLabel: `cosigner-${k + 1}`,
        amountCents: price,
        priceCents: price,
        poolAfterCents: poolValueCents(pick.coSignCount + k + 1),
        signedAt: new Date(
          Date.now() - (seed.initialCoSigns - k) * 60 * 1000,
        ).toISOString(),
      });
    }

    const finalCount = seed.initialCoSigns;
    const finalPool = poolValueCents(finalCount);
    await upsertPick({
      ...pick,
      coSignCount: finalCount,
      totalPoolCents: finalPool,
      creatorAccruedCents: creatorAccruedFromPool(finalPool),
    });

    console.log(
      `  ✅ ${seed.tokenName.padEnd(7)} · ${seed.score}/100 · ${finalCount} co-signs · ${creatorAddress}`,
    );
  }

  console.log(
    `\n🌱 完成。运行 npm run dev,打开 http://localhost:3000 即可看到演示。\n`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
