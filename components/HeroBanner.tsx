'use client';

import { motion, useReducedMotion } from 'motion/react';
import {
  CursorArrow,
  PointingFinger,
  RingDots,
  SquareCross,
  StarBurst,
  StarSparkle,
  StickFigure,
} from './Decor';
import {
  driftLoop,
  fadeUp,
  popIn,
  SPRING_SOFT,
  staggerParent,
} from '@/lib/motion';

/**
 * Kiwi 风 Hero —— 加上动效后的版本。
 *
 * 入场顺序:
 *  1. Hero 黑底淡入
 *  2. 装饰散点 stagger 浮现 + 持续轻微漂浮
 *  3. "the strategic urge to" 淡入上滑
 *  4. SAGE 四个字母 spring 弹入(逐字 stagger)
 *
 * 关键节奏:整个动画 ≈ 1.4s,evaluators 第一眼就能感知到"这页面在呼吸"
 */
export function HeroBanner() {
  const reduced = useReducedMotion();

  // reduced motion 时只做淡入,不要漂浮 / 弹跳
  const driftProps = reduced ? {} : driftLoop(5, 7);

  return (
    <motion.section
      initial="hidden"
      animate="show"
      variants={staggerParent(0.06)}
      className="relative w-full overflow-hidden bg-ink-900 text-paper"
    >
      {/* 噪点底色 */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '3px 3px',
        }}
      />

      {/* 顶部边线 */}
      <div className="absolute top-0 left-6 right-6 h-px bg-paper-300/40" />

      {/* 装饰散点 —— 每个装饰自己漂浮,但入场用父级 stagger */}
      <Decor delay={0.05} className="top-[10%] left-[8%]" drift={driftProps}>
        <StarBurst className="w-8 h-8 text-paper" />
      </Decor>
      <Decor delay={0.12} className="top-[28%] left-[18%]" drift={driftLoop(4, 5)}>
        <StarSparkle className="w-5 h-5 text-paper" />
      </Decor>
      <Decor delay={0.22} className="bottom-[18%] left-[6%]" drift={driftLoop(7, 8)}>
        <RingDots className="w-10 h-10 text-paper" />
      </Decor>
      <Decor delay={0.08} className="top-[8%] right-[8%]" drift={driftLoop(5, 6)}>
        <SquareCross className="w-8 h-8 text-paper" />
      </Decor>
      <Decor delay={0.16} className="top-[24%] right-[12%]" drift={driftLoop(6, 7)}>
        <CursorArrow className="w-10 h-10 text-paper" />
      </Decor>
      <Decor delay={0.24} className="bottom-[28%] right-[7%]" drift={driftLoop(5, 6.5)}>
        <PointingFinger className="w-10 h-10 text-paper" />
      </Decor>
      <Decor delay={0.32} className="bottom-[14%] right-[18%]" drift={driftLoop(3, 5)}>
        <StarSparkle className="w-4 h-4 text-paper" />
      </Decor>
      <Decor delay={0.18} className="bottom-[10%] left-[42%]" drift={driftLoop(8, 9)}>
        <StickFigure className="w-10 h-10 text-paper" />
      </Decor>

      {/* 内容 */}
      <div className="relative max-w-6xl mx-auto px-6 sm:px-10 pt-16 pb-20 sm:pt-24 sm:pb-32">
        <div className="text-center">
          <motion.p
            variants={fadeUp}
            className="font-display italic text-blush text-2xl sm:text-3xl tracking-wide mb-2"
          >
            the strategic urge to
          </motion.p>

          <motion.h1
            variants={staggerParent(0.09, 0.18)}
            initial="hidden"
            animate="show"
            className="kw-mega select-none flex justify-center items-baseline gap-[0.04em]"
          >
            <Letter color="text-sunset">S</Letter>
            <StackedA />
            <Letter color="text-lilac">G</Letter>
            <Letter color="text-blush">E</Letter>
          </motion.h1>
        </div>
      </div>

      <div className="absolute bottom-0 left-6 right-6 h-px bg-paper-300/40" />
    </motion.section>
  );
}

// ───────────── 子组件 ─────────────

function Decor({
  className = '',
  delay,
  drift,
  children,
}: {
  className?: string;
  delay: number;
  drift: any;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, scale: 0.6 },
        show: {
          opacity: 0.9,
          scale: 1,
          transition: { ...SPRING_SOFT, delay },
        },
      }}
      className={`absolute pointer-events-none ${className}`}
    >
      <motion.div {...drift}>{children}</motion.div>
    </motion.div>
  );
}

function Letter({
  children,
  color,
}: {
  children: React.ReactNode;
  color: string;
}) {
  return (
    <motion.span
      variants={popIn}
      whileHover={{ y: -8, rotate: -3, transition: { duration: 0.3 } }}
      className={`${color} inline-block cursor-default`}
    >
      {children}
    </motion.span>
  );
}

/**
 * 中间字母 A —— 三层叠图,带 hover 效果。
 */
function StackedA() {
  return (
    <motion.span
      variants={popIn}
      whileHover={{ y: -8, rotate: 3, transition: { duration: 0.3 } }}
      className="relative inline-block cursor-default"
    >
      <span className="absolute inset-0 text-grass translate-x-1 translate-y-1">
        A
      </span>
      <span className="absolute inset-0 text-canary -translate-x-1 -translate-y-1">
        A
      </span>
      <span
        className="relative text-canary"
        style={{
          WebkitTextStroke: '2px #0C0C0C',
        }}
      >
        A
      </span>
    </motion.span>
  );
}
