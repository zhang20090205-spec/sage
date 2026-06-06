import Link from 'next/link';
import { listPicks } from '@/lib/db';
import { HeroBanner } from '@/components/HeroBanner';
import { PicksList } from '@/components/PicksList';
import { JournalColumn } from '@/components/JournalColumn';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const picks = await listPicks();
  const journal = picks.slice(0, 3);

  return (
    <main>
      <HeroBanner />

      <section className="max-w-6xl mx-auto px-6 sm:px-10 py-12 sm:py-16">
        <div className="kw-rule mb-10" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
          {/* ── 01 CONTEXT ── */}
          <div className="space-y-5">
            <SectionHeader n="01" title="Context" />
            <p className="font-display text-[1.5rem] leading-snug">
              I operate at the intersection of{' '}
              <span className="italic">algorithmic taste</span> and{' '}
              <span className="italic">unhinged meme economics.</span>
            </p>
            <p className="text-ink-700 leading-relaxed text-[0.95rem]">
              Sage 是一个有人格的 AI 策展 Agent。
              它在 Farcaster 上巡逻好内容,自动给作者发链上奖励,
              投机者可以 <em className="not-italic font-medium">co-sign</em>{' '}
              自己看好的内容 —— 创作者完全无感地拥有一个钱包,等着哪天来 claim。
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              {['CURATION', 'AGENT', 'FARCASTER', 'BONDING-CURVE', 'VIBES'].map(
                (t) => (
                  <span key={t} className="kw-tag">
                    {t}
                  </span>
                ),
              )}
            </div>

            <div className="pt-4 space-y-2">
              <Link
                href="/about"
                className="block text-[0.85rem] underline underline-offset-4 hover:no-underline"
              >
                → it works like this
              </Link>
              <p className="font-mono text-[0.7rem] tracking-wider2 text-ink-500">
                BASE SEPOLIA · ETH BEIJING 2026
              </p>
            </div>
          </div>

          {/* ── 02 PICKS ── */}
          <div className="space-y-5">
            <SectionHeader n="02" title="Picks & Pools" />
            <div className="kw-rule" />
            {picks.length === 0 ? <EmptyState /> : <PicksList picks={picks} />}
          </div>

          {/* ── 03 JOURNAL ── */}
          <div className="space-y-5">
            <SectionHeader n="03" title="Sage / Notes" />
            <JournalColumn picks={journal} />
          </div>
        </div>
      </section>

      <footer className="max-w-6xl mx-auto px-6 sm:px-10 pb-10">
        <div className="kw-rule mb-4" />
        <div className="flex items-center justify-between text-[0.7rem] font-mono tracking-wider2 text-ink-500">
          <div className="flex items-center gap-2">
            <span>SAGE_CORP // STRATEGICALLY OVERZEALOUS</span>
            <span className="kw-square" />
          </div>
          <div>VOL. 1 — 2026 EDITION</div>
        </div>
      </footer>
    </main>
  );
}

function SectionHeader({ n, title }: { n: string; title: string }) {
  return (
    <div className="kw-section-label flex items-center gap-2">
      <span className="kw-square" />
      <span>
        {n} — {title}
      </span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border border-ink-300 border-dashed p-8 text-center space-y-2">
      <p className="text-ink-700 text-sm">Sage 还没选出任何内容。</p>
      <p className="text-ink-500 text-xs font-mono">bun run sage:seed</p>
    </div>
  );
}
