/**
 * Kiwi 风装饰组件 —— 散点星形、箭头、笑脸、X、圆圈。
 * 这些是首屏视觉的灵魂,放在 hero 区做点缀。
 */

export function StarSparkle({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5z" />
    </svg>
  );
}

export function StarBurst({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2l1.6 5.2L19 4l-2.2 5.4L22 11l-5.2 1.6L20 18l-5.4-2.2L13 22l-1.6-5.2L6 20l2.2-5.4L2 13l5.2-1.6L4 6l5.4 2.2z" />
    </svg>
  );
}

export function CursorArrow({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
      <path d="M4 3 L20 11 L12 13 L9 21 Z" />
    </svg>
  );
}

export function SquareCross({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" />
      <line x1="3" y1="3" x2="21" y2="21" />
      <line x1="21" y1="3" x2="3" y2="21" />
    </svg>
  );
}

export function PointingFinger({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
      <path d="M14 28 L14 18 L10 18 L10 12 Q10 10 12 10 L16 10 L16 6 Q16 4 18 4 Q20 4 20 6 L20 14 L24 14 Q26 14 26 16 L26 24 Q26 28 22 28 Z" />
    </svg>
  );
}

export function RingDots({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <circle cx="12" cy="12" r="1.8" />
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const x = 12 + 8 * Math.cos(rad);
        const y = 12 + 8 * Math.sin(rad);
        return <circle key={deg} cx={x} cy={y} r="0.7" />;
      })}
    </svg>
  );
}

export function SquarePixel({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor">
      <rect x="2" y="2" width="12" height="12" />
    </svg>
  );
}

export function StickFigure({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <circle cx="16" cy="9" r="3.2" />
      <path d="M16 12 L16 22" />
      <path d="M9 16 L23 16" />
      <path d="M16 22 L11 30" />
      <path d="M16 22 L21 30" />
      <path d="M14.5 9 L17.5 9" />
    </svg>
  );
}
