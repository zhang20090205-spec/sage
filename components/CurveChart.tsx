'use client';

import { useMemo } from 'react';
import { motion } from 'motion/react';
import { priceAt } from '@/lib/bonding-curve';

/**
 * 简洁、印刷风的 bonding curve 折线图。
 *
 * 动画:
 *  - 入场:整条曲线像被笔尖画出来(stroke-dashoffset 从满 dash 到 0)
 *  - 当前点:粉色圆点 + 持续脉冲 ring
 *  - 当 count 变化:黑色虚直线下落同步移动到新位置
 */
export function CurveChart({ count }: { count: number }) {
  const W = 600;
  const H = 180;
  const PAD = 28;
  const MAX_N = Math.max(30, count + 10);

  const { d, totalLen, currentPoint } = useMemo(() => {
    const pts: Array<[number, number]> = [];
    const maxPrice = priceAt(MAX_N);
    for (let n = 0; n <= MAX_N; n++) {
      const x = PAD + ((W - 2 * PAD) * n) / MAX_N;
      const y = H - PAD - ((H - 2 * PAD) * priceAt(n)) / maxPrice;
      pts.push([x, y]);
    }
    const dStr = pts
      .map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`)
      .join(' ');
    // 简化的曲线长度估算
    let len = 0;
    for (let i = 1; i < pts.length; i++) {
      const dx = pts[i][0] - pts[i - 1][0];
      const dy = pts[i][1] - pts[i - 1][1];
      len += Math.sqrt(dx * dx + dy * dy);
    }
    return {
      d: dStr,
      totalLen: len,
      currentPoint: pts[count] ?? pts[pts.length - 1],
    };
  }, [count, MAX_N]);

  const gridY = [0, 0.25, 0.5, 0.75, 1].map(
    (t) => H - PAD - t * (H - 2 * PAD),
  );
  const gridX = [0, 0.25, 0.5, 0.75, 1].map((t) => PAD + t * (W - 2 * PAD));

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto text-ink"
      preserveAspectRatio="none"
    >
      {/* 网格 */}
      {gridY.map((y, i) => (
        <line
          key={`gy-${i}`}
          x1={PAD}
          y1={y}
          x2={W - PAD}
          y2={y}
          stroke="#0C0C0C"
          strokeOpacity={0.12}
          strokeWidth={0.5}
          strokeDasharray="2 3"
        />
      ))}
      {gridX.map((x, i) => (
        <line
          key={`gx-${i}`}
          x1={x}
          y1={PAD}
          x2={x}
          y2={H - PAD}
          stroke="#0C0C0C"
          strokeOpacity={0.12}
          strokeWidth={0.5}
          strokeDasharray="2 3"
        />
      ))}

      {/* 轴线 */}
      <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="currentColor" strokeWidth={1.2} />
      <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="currentColor" strokeWidth={1.2} />

      {/* 曲线 —— 描线动画 */}
      <motion.path
        d={d}
        stroke="currentColor"
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* 当前位置垂直虚线 */}
      <motion.line
        x1={currentPoint[0]}
        x2={currentPoint[0]}
        y1={H - PAD}
        y2={currentPoint[1]}
        stroke="#E76EA0"
        strokeWidth={1}
        strokeDasharray="3 3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.4 }}
      />

      {/* 当前点 + 脉冲圈 */}
      <motion.g
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.1, type: 'spring', stiffness: 280, damping: 22 }}
      >
        <motion.circle
          cx={currentPoint[0]}
          cy={currentPoint[1]}
          r={5}
          fill="#E76EA0"
        />
        <motion.circle
          cx={currentPoint[0]}
          cy={currentPoint[1]}
          fill="none"
          stroke="#E76EA0"
          strokeWidth={1.5}
          animate={{ r: [5, 14, 5], opacity: [0.7, 0, 0.7] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
        />
      </motion.g>

      <motion.text
        x={currentPoint[0] + 10}
        y={currentPoint[1] - 8}
        fill="#E76EA0"
        fontSize={11}
        fontFamily="JetBrains Mono, monospace"
        initial={{ opacity: 0, x: currentPoint[0] }}
        animate={{ opacity: 1, x: currentPoint[0] + 10 }}
        transition={{ delay: 1.2, duration: 0.4 }}
      >
        n={count}
      </motion.text>

      {/* 坐标标注 */}
      <text x={PAD - 4} y={14} fill="#737373" fontSize={9} fontFamily="JetBrains Mono, monospace" textAnchor="end">
        ¢
      </text>
      <text
        x={W - PAD}
        y={H - 6}
        fill="#737373"
        fontSize={9}
        fontFamily="JetBrains Mono, monospace"
        textAnchor="end"
      >
        # CO-SIGN
      </text>
    </svg>
  );
}
