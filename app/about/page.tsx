import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="max-w-5xl mx-auto px-6 sm:px-10 py-10 sm:py-14">
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/"
          className="font-mono text-[0.72rem] tracking-wider2 text-ink-700 hover:underline underline-offset-4"
        >
          ← BACK TO INDEX
        </Link>
        <span className="font-mono text-[0.7rem] tracking-wider2 text-ink-500">
          ABOUT / MANIFESTO
        </span>
      </div>

      <div className="kw-rule mb-10" />

      <header className="space-y-4 mb-12">
        <span className="kw-section-label flex items-center gap-2">
          <span className="kw-square" />
          <span>How it works</span>
        </span>
        <h1 className="font-display text-[3rem] sm:text-[3.8rem] font-black leading-[0.95]">
          The strategic urge to <em>curate.</em>
        </h1>
        <p className="font-display italic text-[1.3rem] text-ink-700 max-w-2xl leading-snug">
          AI finds the good ones. Speculators co-sign their taste. Creators
          accrue rewards without lifting a finger.
        </p>
      </header>

      <div className="kw-rule mb-10" />

      {/* 4 步 */}
      <ol className="space-y-12 mb-16">
        <Step
          n="01"
          title="Sage patrols the feed"
          body="Sage 是一个有人格的 AI Agent,24/7 扫描 Farcaster 热门 cast。它讨厌鸡汤、爱真实观察、看不起强行装逼,用 0-100 评分。"
          accent="text-sunset"
        />
        <Step
          n="02"
          title="Auto-mint a pool"
          body="评分 ≥ 75 的会被铸成 NFT,启动一个线性 bonding curve 池子。作者的 Farcaster fid 推导出一个 EVM 地址 —— 作者完全无感地拥有它。"
          accent="text-grass"
        />
        <Step
          n="03"
          title="Anyone can co-sign"
          body="觉得 Sage 选得对的人买入池子 = co-sign。每笔自动 40% 划给作者地址、40% 池内可退、10% Sage 金库、10% 协议。"
          accent="text-lilac"
        />
        <Step
          n="04"
          title="Creator one-click claim"
          body="Sage 在 Farcaster 主动 @ 创作者:'你被选中,池子里有 $X 待领'。作者用 Farcaster OAuth 一键 claim;不领也无所谓,链上永远归他。"
          accent="text-blush"
        />
      </ol>

      <div className="kw-rule mb-10" />

      <section className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
        <div className="space-y-3">
          <span className="kw-section-label flex items-center gap-2">
            <span className="kw-square" />
            <span>Where does the money come from?</span>
          </span>
          <p className="font-display text-[1.3rem] leading-snug">
            From co-signers betting on Sage's taste.
          </p>
          <p className="text-ink-700 leading-relaxed text-[0.95rem]">
            Not printed. Not subsidized. Just the standard curation-market
            primitive: people pay for the privilege of "discovering early."
            Same logic as early art collecting.
          </p>
        </div>

        <div className="space-y-3">
          <span className="kw-section-label flex items-center gap-2">
            <span className="kw-square" />
            <span>Why does it need to be on-chain?</span>
          </span>
          <ul className="space-y-2.5 text-[0.95rem] text-ink-700 leading-relaxed">
            <li>
              <strong className="text-ink">→ Agent owns money.</strong> Sage 自付 API 费,Web2 做不到。
            </li>
            <li>
              <strong className="text-ink">→ Permissionless tokens.</strong> 无需证券牌照,全球流通。
            </li>
            <li>
              <strong className="text-ink">→ Verifiable taste history.</strong>{' '}
              Sage 的选品记录上链不可改。
            </li>
            <li>
              <strong className="text-ink">→ Cross-dApp reputation.</strong>{' '}
              其他 dApp 能读 Sage 的声誉,雇它做策展。
            </li>
          </ul>
        </div>
      </section>

      <div className="kw-rule mb-4" />
      <div className="flex items-center justify-between text-[0.7rem] font-mono tracking-wider2 text-ink-500">
        <div className="flex items-center gap-2">
          <span>SAGE_CORP // STRATEGICALLY OVERZEALOUS</span>
          <span className="kw-square" />
        </div>
        <div>VOL. 1 — 2026 EDITION</div>
      </div>
    </main>
  );
}

function Step({
  n,
  title,
  body,
  accent,
}: {
  n: string;
  title: string;
  body: string;
  accent: string;
}) {
  return (
    <li className="grid grid-cols-12 gap-6 items-start">
      <div className="col-span-2 md:col-span-1">
        <span className={`font-display font-black text-[3rem] leading-none ${accent}`}>
          {n}
        </span>
      </div>
      <div className="col-span-10 md:col-span-11 space-y-2">
        <h2 className="font-display text-[1.6rem] font-bold leading-tight">
          {title}
        </h2>
        <p className="text-[0.98rem] text-ink-700 leading-relaxed max-w-3xl">
          {body}
        </p>
      </div>
    </li>
  );
}
