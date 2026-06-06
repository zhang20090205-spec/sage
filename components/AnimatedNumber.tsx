'use client';

import { useEffect } from 'react';
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
} from 'motion/react';

/**
 * 数字平滑过渡组件 —— 类似 Stripe / Linear 那种"价格从 X 跳到 Y"的弹跳。
 *
 * - value 变了:用 spring 平滑过渡到新值
 * - 第一次 mount:从 0 count-up 到 value
 * - 支持自定义格式化(美分→美元、整数、百分比等)
 */
export function AnimatedNumber({
  value,
  format = (n) => n.toFixed(0),
  className = '',
  duration = 1.1,
}: {
  value: number;
  format?: (n: number) => string;
  className?: string;
  duration?: number;
}) {
  const mv = useMotionValue(0);
  const display = useTransform(mv, (latest) => format(latest));

  useEffect(() => {
    const controls = animate(mv, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
    });
    return controls.stop;
  }, [value, duration, mv]);

  return <motion.span className={className}>{display}</motion.span>;
}

/**
 * 美分 → "$X.XX"
 */
export function AnimatedCents({
  cents,
  className,
}: {
  cents: number;
  className?: string;
}) {
  return (
    <AnimatedNumber
      value={cents}
      format={(n) => `$${(n / 100).toFixed(2)}`}
      className={className}
    />
  );
}
