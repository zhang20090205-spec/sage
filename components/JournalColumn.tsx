'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import type { Pick } from '@/lib/types';
import { fadeUp, staggerParent } from '@/lib/motion';

/**
 * 客户端的 "Sage / Notes" 杂志栏。
 * 每条笔记是一篇短文,带编号 + 日期 + token chip,入场 stagger。
 */
export function JournalColumn({ picks }: { picks: Pick[] }) {
  if (picks.length === 0) {
    return <p className="text-ink-500 text-sm">还没有任何 Sage 笔记。</p>;
  }

  return (
    <motion.ul
      variants={staggerParent(0.12, 0.1)}
      initial="hidden"
      animate="show"
      className="space-y-7"
    >
      {picks.map((p, idx) => (
        <motion.li key={p.id} variants={fadeUp} className="space-y-1.5 group">
          <div className="flex items-baseline justify-between text-[0.7rem] font-mono tracking-wider2 text-ink-500">
            <span>No. {String(idx + 1).padStart(2, '0')}</span>
            <span>{formatDate(p.curatedAt)}</span>
          </div>
          <Link href={`/pick/${p.id}`}>
            <h3 className="font-display text-[1.25rem] font-bold leading-snug transition-all duration-300 group-hover:italic group-hover:translate-x-0.5">
              {p.score.comment || '一句没说出口的判断'}
            </h3>
          </Link>
          <p className="text-[0.85rem] text-ink-700 leading-relaxed">
            {p.score.viralReasoning}
          </p>
          <div className="pt-1">
            <motion.span
              whileHover={{ scale: 1.08, rotate: -2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              className="kw-chip inline-flex cursor-default"
            >
              {p.score.tokenName}
            </motion.span>
          </div>
        </motion.li>
      ))}
    </motion.ul>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const m = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return `${m[d.getMonth()]}. ${String(d.getDate()).padStart(2, '0')}`;
}
