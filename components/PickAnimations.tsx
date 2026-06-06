'use client';

import { motion } from 'motion/react';
import { AnimatedNumber, AnimatedCents } from './AnimatedNumber';
import { fadeUp, staggerParent, SPRING } from '@/lib/motion';

/**
 * 详情页 "Sage Verdict" 区块的动效部分:
 *  - 评分大数字 count-up 0 → score
 *  - 评分进度条从 0 滑到 score%
 *  - 评语 / viral take 入场 fade-up
 */
export function VerdictBlock({
  score,
  comment,
  viralReasoning,
  model,
}: {
  score: number;
  comment: string;
  viralReasoning: string;
  model: string;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={staggerParent(0.1, 0.05)}
      className="grid grid-cols-12 gap-6 items-start"
    >
      <motion.div variants={fadeUp} className="col-span-12 md:col-span-4">
        <span className="kw-section-label flex items-center gap-2 mb-3">
          <span className="kw-square" />
          <span>Sage / Verdict</span>
        </span>
        <div className="flex items-end gap-3">
          <AnimatedNumber
            value={score}
            format={(n) => String(Math.round(n))}
            className="font-display text-[5rem] leading-none font-black tabular-nums"
          />
          <span className="font-mono text-[0.85rem] tracking-wider2 text-ink-500 mb-2">
            / 100
          </span>
        </div>
        {/* 进度条 */}
        <div className="mt-3 h-2 border border-ink relative bg-paper overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ delay: 0.2, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-y-0 left-0 bg-ink"
          />
        </div>
      </motion.div>

      <div className="col-span-12 md:col-span-8 space-y-3">
        <motion.p
          variants={fadeUp}
          className="font-display italic text-[1.4rem] leading-snug text-ink"
        >
          “{comment}”
        </motion.p>
        <motion.p
          variants={fadeUp}
          className="text-[0.95rem] text-ink-700 leading-relaxed"
        >
          <span className="font-mono text-[0.7rem] tracking-wider2 text-ink-500">
            VIRAL TAKE —
          </span>{' '}
          {viralReasoning}
        </motion.p>
        <motion.p
          variants={fadeUp}
          className="font-mono text-[0.7rem] tracking-wider2 text-ink-500 pt-2"
        >
          MODEL · {model.toUpperCase()}
        </motion.p>
      </div>
    </motion.div>
  );
}

/**
 * 创作者累积金额的动画展示。
 * 每次 accruedCents 变化(co-sign 后服务端 refresh),数字平滑过渡。
 */
export function CreatorAccrued({ cents }: { cents: number }) {
  return (
    <AnimatedCents
      cents={cents}
      className="font-display text-[3rem] leading-none font-bold text-grass tabular-nums"
    />
  );
}

/**
 * Co-sign 池子数据块的动画版。
 */
export function PoolStats({
  count,
  poolCents,
}: {
  count: number;
  poolCents: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="font-mono text-[0.7rem] tracking-wider2 text-ink-500 mb-1">
          SIGNERS
        </p>
        <AnimatedNumber
          value={count}
          format={(n) => String(Math.round(n))}
          className="font-display text-[2.4rem] leading-none font-bold tabular-nums"
        />
      </div>
      <div>
        <p className="font-mono text-[0.7rem] tracking-wider2 text-ink-500 mb-1">
          POOL
        </p>
        <AnimatedCents
          cents={poolCents}
          className="font-display text-[2.4rem] leading-none font-bold tabular-nums"
        />
      </div>
    </div>
  );
}

/**
 * 详情页内容的入场动画外壳。
 * 整页统一 stagger,让阅读视线从上往下"流入"。
 */
export function StaggerPage({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={staggerParent(0.08, 0.05)}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={fadeUp} className={className}>
      {children}
    </motion.div>
  );
}
