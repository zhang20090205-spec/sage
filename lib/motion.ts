/**
 * 全站动效语汇,集中在这里,保证整个 demo 一个节奏。
 *
 * 设计原则(借鉴 Emil Kowalski):
 * - spring 物理,不用线性 easing
 * - 入场 ease-out,退场 ease-in
 * - 只动 GPU 属性(transform / opacity)
 * - 200-450ms 为甜区,Hero 例外可以慢一点
 * - 列表用 stagger 而不是同时出现
 * - 尊重 prefers-reduced-motion
 */

import type { Transition, Variants } from 'motion/react';

// ───── 通用 transition ─────
export const SPRING: Transition = {
  type: 'spring',
  stiffness: 320,
  damping: 28,
  mass: 0.7,
};

export const SPRING_SOFT: Transition = {
  type: 'spring',
  stiffness: 180,
  damping: 22,
  mass: 0.9,
};

export const EASE_OUT: Transition = {
  duration: 0.45,
  ease: [0.16, 1, 0.3, 1], // expo out
};

export const EASE_IN_OUT: Transition = {
  duration: 0.5,
  ease: [0.65, 0, 0.35, 1],
};

// ───── 入场:从下方淡入 ─────
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: EASE_OUT },
};

// ───── 入场:轻轻浮上 ─────
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.55, ease: 'easeOut' } },
};

// ───── 入场:缩放 spring(Hero 大字用) ─────
export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.7, y: 20 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { ...SPRING_SOFT, opacity: { duration: 0.4 } },
  },
};

// ───── 父容器:批量 stagger ─────
export const staggerParent = (
  staggerChildren = 0.08,
  delayChildren = 0,
): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren, delayChildren },
  },
});

// ───── 装饰元素的"漂浮"循环(配合 motion 的 animate 用) ─────
export const driftLoop = (range = 6, duration = 6) => ({
  animate: {
    y: [0, -range, 0, range, 0],
    rotate: [0, 4, 0, -4, 0],
    transition: {
      duration,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
});

// ───── 鼠标 hover/tap 反馈 ─────
export const tapPress = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.96 },
  transition: SPRING,
};
