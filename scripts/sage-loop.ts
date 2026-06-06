/**
 * Sage 巡逻脚本。
 *
 * 用法:
 *   bun run sage:loop
 *
 * 流程:
 * 1. 从 Farcaster(或 mock)抓最近 25 条热门 cast
 * 2. 跳过已经评过分的(数据库里已存在的)
 * 3. 用 Claude 给剩下的每条评分
 * 4. 评分 >= 75 的:推导创作者地址 → 写入 picks 表
 * 5. 打印一份"今日 Sage 战报"
 *
 * 环境变量:bun 自动加载 .env.local,无需 dotenv
 */

import { randomUUID } from 'node:crypto';
import { fetchTrendingCasts } from '../lib/farcaster';
import { scoreCast } from '../lib/scorer';
import { listPicks, upsertPick } from '../lib/db';
import { deriveCreatorAddress } from '../lib/derive-address';
import type { Pick } from '../lib/types';

const MIN_SCORE = 75;

async function main() {
  console.log('🌿 Sage 出门巡逻…\n');

  const existing = await listPicks();
  const existingIds = new Set(existing.map((p) => p.cast.id));

  const casts = await fetchTrendingCasts(25);
  console.log(`📥 抓到 ${casts.length} 条候选\n`);

  const toScore = casts.filter((c) => !existingIds.has(c.id));
  console.log(`🆕 ${toScore.length} 条是新的,开始评分\n`);

  let picked = 0;
  let skipped = 0;

  for (const cast of toScore) {
    process.stdout.write(`  @${cast.authorUsername.padEnd(15)} `);
    try {
      const score = await scoreCast({
        castId: cast.id,
        content: cast.content,
      });

      if (score.score >= MIN_SCORE) {
        const creatorAddress = deriveCreatorAddress(cast.authorFid);
        const pick: Pick = {
          id: randomUUID(),
          cast,
          score,
          creatorAddress,
          coSignCount: 0,
          totalPoolCents: 0,
          creatorAccruedCents: 0,
          curatedAt: new Date().toISOString(),
          nftId: `0x${randomUUID().replace(/-/g, '').slice(0, 16)}`,
        };
        await upsertPick(pick);
        console.log(`✅ ${score.score}/100 · ${score.comment}`);
        picked++;
      } else {
        console.log(`⏭️  ${score.score}/100 (低于 ${MIN_SCORE})`);
        skipped++;
      }
    } catch (err) {
      console.log(`❌ 出错: ${err instanceof Error ? err.message : err}`);
    }
  }

  console.log(
    `\n🌿 今日战报:精选 ${picked} 条,跳过 ${skipped} 条,既有 ${existing.length} 条\n`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
