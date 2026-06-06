'use client';

import { motion, useReducedMotion } from 'motion/react';

const fallbackItems = [
  'xAPI simulation ready',
  'Agent 正在抽取主人语气',
  'Evidence +17 / Incentive +21',
  'demo scan only, no real crawler',
];

export function AgentDanmuTicker({
  items = fallbackItems,
  dark = false,
}: {
  items?: string[];
  dark?: boolean;
}) {
  const reduced = useReducedMotion();
  const safeItems = items.length > 0 ? items : fallbackItems;
  const loop = [...safeItems, ...safeItems];

  return (
    <div
      className={`overflow-hidden border p-3 ${
        dark
          ? 'border-amber-900/55 bg-black/25 text-paper'
          : 'border-ink bg-paper-50 text-ink'
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="font-mono text-[0.62rem] uppercase tracking-wider2 text-current/55">
          xAPI demo barrage
        </span>
        <span className="border border-current px-2 py-1 font-mono text-[0.56rem] uppercase tracking-wider2 text-[#e9a82f]">
          LIVE
        </span>
      </div>
      <div className="relative h-28 overflow-hidden">
        <motion.div
          className="space-y-2"
          animate={reduced ? undefined : { y: ['0%', '-50%'] }}
          transition={
            reduced
              ? undefined
              : { duration: 12, repeat: Infinity, ease: 'linear' }
          }
        >
          {loop.map((item, index) => (
            <div
              key={`${item}-${index}`}
              className={`flex items-start gap-2 border px-2 py-2 text-[0.76rem] leading-snug ${
                dark
                  ? 'border-amber-900/35 bg-[#1a120d]/80'
                  : 'border-ink/20 bg-paper'
              }`}
            >
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[#e9a82f]" />
              <span className="line-clamp-2">{item}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
