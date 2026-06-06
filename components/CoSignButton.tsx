'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { SPRING } from '@/lib/motion';

export function CoSignButton({
  pickId,
  priceCents,
}: {
  pickId: string;
  priceCents: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  const [shake, setShake] = useState(0);

  const onClick = () => {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch('/api/cosign', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ pickId }),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `HTTP ${res.status}`);
        }
        setFlash(true);
        setTimeout(() => setFlash(false), 600);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Co-sign 失败');
        setShake((s) => s + 1);
      }
    });
  };

  return (
    <div className="space-y-2">
      <motion.button
        key={shake}
        onClick={onClick}
        disabled={pending}
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.96 }}
        transition={SPRING}
        animate={
          shake > 0
            ? { x: [0, -6, 6, -4, 4, 0], transition: { duration: 0.35 } }
            : {}
        }
        className="relative w-full overflow-hidden border border-ink bg-ink text-paper font-mono text-[0.78rem] tracking-wider2 uppercase py-3 disabled:opacity-50"
      >
        {/* 成功 flash 覆盖层 */}
        <AnimatePresence>
          {flash && (
            <motion.span
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1.4 }}
              exit={{ opacity: 0, scale: 1.6 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 bg-grass"
            />
          )}
        </AnimatePresence>

        <span className="relative flex items-center justify-center gap-2">
          {pending ? (
            <PendingDots />
          ) : (
            <>
              Co-sign  ·  $
              <AnimatedPriceLabel cents={priceCents} />
            </>
          )}
        </span>
      </motion.button>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="font-mono text-[0.7rem] tracking-wider2 text-blush"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <p className="font-mono text-[0.65rem] tracking-wider2 text-ink-500">
        DEMO · MOCK WALLET · BASE SEPOLIA POSTPROD
      </p>
    </div>
  );
}

function PendingDots() {
  return (
    <span className="flex items-center gap-1.5">
      <span className="text-ink-300">·</span>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            delay: i * 0.12,
            ease: 'easeInOut',
          }}
          className="inline-block w-1 h-1 bg-paper rounded-full"
        />
      ))}
      <span className="text-ink-300">·</span>
      <span className="ml-1">signing</span>
    </span>
  );
}

function AnimatedPriceLabel({ cents }: { cents: number }) {
  // 简洁版:每次 price 变,弹一下
  return (
    <motion.span
      key={cents}
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      className="inline-block tabular-nums"
    >
      {(cents / 100).toFixed(2)}
    </motion.span>
  );
}
