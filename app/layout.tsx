import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sage // The strategic urge to curate',
  description: 'AI 在网上找好内容,投机者帮它点赞,创作者无感收钱。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        {/* 字体走国内镜像 + 系统字体兜底,避免 Google CDN 卡住 */}
        <link rel="preconnect" href="https://fonts.googleapis.cn" />
        <link
          href="https://fonts.googleapis.cn/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;0,9..144,900;1,9..144,400;1,9..144,600&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans bg-paper text-ink min-h-screen">
        {children}
      </body>
    </html>
  );
}
