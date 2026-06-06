import type { ReactNode } from 'react';

export function PageShell({
  eyebrow,
  title,
  description,
  children,
  aside,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <main className="min-h-screen px-6 pb-10 pt-28 sm:px-10 sm:pt-32">
      <div className="mx-auto max-w-6xl">
        <header className="grid grid-cols-1 gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <SectionLabel>{eyebrow}</SectionLabel>
            <h1 className="mt-4 font-display text-[3.1rem] font-black leading-[0.95] sm:text-[4.8rem]">
              {title}
            </h1>
          </div>
          <div className="md:col-span-4">
            <p className="text-[0.98rem] leading-relaxed text-ink-700">
              {description}
            </p>
            {aside}
          </div>
        </header>

        <div className="kw-rule my-8 sm:my-10" />
        {children}
      </div>
    </main>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="kw-section-label inline-flex items-center gap-2">
      <span className="kw-square" />
      <span>{children}</span>
    </span>
  );
}

export function EmptyDataset({
  title = '还没有演示数据',
  body = '运行 bun run sage:seed 加载 Sage Vault Arena 数据。',
}: {
  title?: string;
  body?: string;
}) {
  return (
    <div className="border border-dashed border-ink-300 p-8 text-center">
      <p className="font-display text-[1.4rem] font-bold">{title}</p>
      <p className="mt-2 font-mono text-[0.72rem] uppercase tracking-wider2 text-ink-500">
        {body}
      </p>
    </div>
  );
}

export function StatBlock({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'grass' | 'blush' | 'sunset';
}) {
  const color =
    tone === 'grass'
      ? 'text-grass'
      : tone === 'blush'
        ? 'text-blush'
        : tone === 'sunset'
          ? 'text-sunset'
          : 'text-ink';

  return (
    <div className="border border-ink bg-paper-50 p-4">
      <p className="font-mono text-[0.66rem] uppercase tracking-wider2 text-ink-500">
        {label}
      </p>
      <p className={`mt-2 font-display text-[2rem] font-bold leading-none ${color}`}>
        {value}
      </p>
    </div>
  );
}
