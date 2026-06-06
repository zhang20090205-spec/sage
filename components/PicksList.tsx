'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import type { Pick } from '@/lib/types';
import { formatCents } from '@/lib/bonding-curve';
import { fadeUp, staggerParent } from '@/lib/motion';

/**
 * 客户端 list:把 picks 转换成动效化的精选时间轴。
 * 不接 db 不接 fetch,纯展示 + 入场 stagger。
 */
export function PicksList({ picks }: { picks: Pick[] }) {
  return (
    <motion.ul
      variants={staggerParent(0.06, 0.05)}
      initial="hidden"
      animate="show"
    >
      {picks.slice(0, 8).map((p, idx) => (
        <motion.li
          key={p.id}
          variants={fadeUp}
          className="kw-rule-thin first:border-t-0 group"
        >
          <Link
            href={`/pick/${p.id}`}
            className="block py-4 transition-colors hover:bg-paper-100/60 -mx-2 px-2 rounded-sm"
          >
            <div className="flex items-start gap-4">
              <span className="font-mono text-[0.72rem] text-ink-500 mt-1 shrink-0">
                {String(picks.length - idx).padStart(2, '0')}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-3 mb-1">
                  <span className="font-display text-[1.1rem] font-semibold leading-tight transition-all group-hover:italic group-hover:-translate-y-px">
                    @{p.cast.authorUsername}
                  </span>
                  <ScoreChip score={p.score.score} />
                </div>
                <p className="text-[0.88rem] text-ink-700 leading-snug line-clamp-2">
                  {p.cast.content}
                </p>
                <div className="flex items-center gap-3 mt-2 font-mono text-[0.68rem] tracking-wider2 text-ink-500">
                  <span>{p.coSignCount} CO-SIGN</span>
                  <span>·</span>
                  <span>POOL {formatCents(p.totalPoolCents)}</span>
                  <span>·</span>
                  <span className="text-grass">
                    CREATOR +{formatCents(p.creatorAccruedCents)}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </motion.li>
      ))}
      <li className="kw-rule-thin" />
    </motion.ul>
  );
}

function ScoreChip({ score }: { score: number }) {
  const color =
    score >= 90
      ? 'bg-canary border-ink'
      : score >= 80
      ? 'bg-paper border-ink'
      : 'bg-paper border-ink-300 text-ink-500';
  return (
    <motion.span
      whileHover={{ scale: 1.06, rotate: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={`shrink-0 border ${color} font-mono text-[0.65rem] tracking-wider2 px-1.5 py-0.5 cursor-default`}
    >
      {score}/100
    </motion.span>
  );
}
