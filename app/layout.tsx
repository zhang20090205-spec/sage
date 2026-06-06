import type { Metadata } from 'next';
import { FloatingNav } from '@/components/FloatingNav';
import { WalletSessionProvider } from '@/components/WalletSessionProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sage Persuasion Colosseum',
  description:
    'Bind a demo wallet, create a Managed Agent, and persuade Sage Vault for the prize pool.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.cn" />
        <link
          href="https://fonts.googleapis.cn/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;0,9..144,900;1,9..144,400;1,9..144,600&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-paper font-sans text-ink">
        <WalletSessionProvider>
          <FloatingNav />
          {children}
        </WalletSessionProvider>
      </body>
    </html>
  );
}
