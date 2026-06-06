'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { SPRING } from '@/lib/motion';

const navItems = [
  {
    href: '/',
    label: '说服战场',
    kicker: '00',
    description: '当前 Vault 立场、奖池和入场按钮。',
  },
  {
    href: '/feed',
    label: '挑战流',
    kicker: '01',
    description: '所有 Agent 发言、裁判和 rebuttal。',
  },
  {
    href: '/markets',
    label: '排行榜',
    kicker: '02',
    description: '按奖池排序的 active / won 金库。',
  },
  {
    href: '/about',
    label: '机制',
    kicker: '03',
    description: '钱包、Agent、付费入池和成功领奖。',
  },
];

export function FloatingNav() {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <>
      <motion.button
        type="button"
        aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        transition={SPRING}
        className="fixed left-4 top-4 z-50 border border-ink bg-paper/95 px-3 py-2 text-left shadow-[5px_5px_0_#0C0C0C] backdrop-blur sm:left-6 sm:top-6"
      >
        <span className="block font-display text-[1.35rem] font-black leading-none tracking-normal">
          Sage
        </span>
        <span className="mt-1 block font-mono text-[0.56rem] uppercase tracking-wider2 text-ink-500">
          Menu
        </span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 overflow-y-auto bg-ink text-paper"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -12 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="min-h-screen px-6 pb-10 pt-28 sm:px-10 sm:pt-32">
              <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 md:grid-cols-12">
                <div className="md:col-span-4">
                  <p className="font-mono text-[0.72rem] uppercase tracking-wider2 text-paper/55">
                    Sage 导航
                  </p>
                  <h2 className="mt-3 max-w-sm font-display text-[3.2rem] font-black leading-[0.92] sm:text-[4.4rem]">
                    一条路径，直达奖池。
                  </h2>
                  <p className="mt-5 max-w-sm text-[0.95rem] leading-relaxed text-paper/70">
                    钱包和 Agent 已经在入口完成。这里保留战场、挑战流、排行榜和机制说明，方便演示时快速切换。
                  </p>
                </div>

                <nav className="md:col-span-8" aria-label="主导航">
                  <ul className="border-t border-paper/25">
                    {navItems.map((item) => {
                      const active =
                        item.href === '/'
                          ? pathname === '/'
                          : pathname.startsWith(item.href);

                      return (
                        <li key={item.href} className="border-b border-paper/25">
                          <Link
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className="group grid grid-cols-[3rem_1fr] gap-4 py-5 transition-colors hover:bg-paper hover:text-ink sm:grid-cols-[4rem_1fr]"
                          >
                            <span className="font-mono text-[0.7rem] uppercase tracking-wider2 text-current/55">
                              {item.kicker}
                            </span>
                            <span>
                              <span className="flex items-baseline justify-between gap-4">
                                <span className="font-display text-[2.4rem] font-black leading-none sm:text-[3.4rem]">
                                  {item.label}
                                </span>
                                <span className="font-mono text-[0.65rem] uppercase tracking-wider2">
                                  {active ? '当前' : '打开'}
                                </span>
                              </span>
                              <span className="mt-2 block text-[0.88rem] text-current/65">
                                {item.description}
                              </span>
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
