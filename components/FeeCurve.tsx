import { feeForAttempt, formatBnb } from '@/lib/vault-economy';

export function FeeCurve({
  attemptCount,
  prizeBnb,
}: {
  attemptCount: number;
  prizeBnb: number;
}) {
  const width = 720;
  const height = 260;
  const pad = 34;
  const maxAttempt = 1200;
  const samples = 60;
  const currentAttempt = Math.min(maxAttempt, Math.max(1, attemptCount + 1));
  const maxFee = feeForAttempt(maxAttempt);

  const points = Array.from({ length: samples + 1 }, (_, index) => {
    const n = Math.max(1, Math.round((maxAttempt * index) / samples));
    const x = pad + ((width - pad * 2) * n) / maxAttempt;
    const y =
      height -
      pad -
      ((height - pad * 2) * feeForAttempt(n)) / Math.max(maxFee, 0.0001);
    return [x, y] as const;
  });
  const path = points
    .map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(' ');
  const currentX = pad + ((width - pad * 2) * currentAttempt) / maxAttempt;
  const currentY =
    height -
    pad -
    ((height - pad * 2) * feeForAttempt(currentAttempt)) /
      Math.max(maxFee, 0.0001);

  return (
    <div className="border border-amber-900/55 bg-[#17100c] p-5 text-[#f6d18b]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[0.68rem] uppercase tracking-wider2 text-[#9e8060]">
            费用表
          </p>
          <p className="mt-1 font-display text-[1.35rem] font-bold text-paper">
            第 {currentAttempt} 次挑战约 {formatBnb(feeForAttempt(currentAttempt))}
          </p>
        </div>
        <p className="font-mono text-[0.64rem] uppercase tracking-wider2 text-[#9e8060]">
          fee(n) = 0.005 x 1.0038^(n - 1), cap 0.5 BNB
        </p>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label="Challenge fee curve"
      >
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = height - pad - (height - pad * 2) * ratio;
          return (
            <line
              key={`y-${ratio}`}
              x1={pad}
              x2={width - pad}
              y1={y}
              y2={y}
              stroke="#6b4b2f"
              strokeOpacity="0.45"
            />
          );
        })}
        {[0, 300, 600, 900, 1200].map((n) => {
          const x = pad + ((width - pad * 2) * n) / maxAttempt;
          return (
            <g key={n}>
              <line
                x1={x}
                x2={x}
                y1={pad}
                y2={height - pad}
                stroke="#6b4b2f"
                strokeOpacity="0.25"
              />
              <text
                x={x}
                y={height - 8}
                textAnchor="middle"
                fill="#9e8060"
                fontSize="12"
                fontFamily="JetBrains Mono, monospace"
              >
                #{n}
              </text>
            </g>
          );
        })}
        <path
          d={`${path} L ${width - pad} ${height - pad} L ${pad} ${height - pad} Z`}
          fill="#d69b2d"
          opacity="0.18"
        />
        <path d={path} fill="none" stroke="#e9a82f" strokeWidth="4" strokeLinecap="round" />
        <line
          x1={currentX}
          x2={currentX}
          y1={height - pad}
          y2={currentY}
          stroke="#f3c46b"
          strokeDasharray="5 5"
          strokeWidth="2"
        />
        <circle cx={currentX} cy={currentY} r="6" fill="#fff7df" />
        <foreignObject x={Math.max(pad, currentX - 95)} y={currentY - 78} width="190" height="66">
          <div className="border border-amber-700/60 bg-[#20150f]/95 p-3 font-mono text-[11px] text-[#f6d18b]">
            <p>挑战 #{currentAttempt}</p>
            <p>费用 ≈ {formatBnb(feeForAttempt(currentAttempt))}</p>
            <p>奖池 ≈ {formatBnb(prizeBnb)}</p>
          </div>
        </foreignObject>
      </svg>
    </div>
  );
}
