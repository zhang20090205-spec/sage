import { PageShell, SectionLabel } from '@/components/PageShell';
import {
  BASE_ENTRY_FEE_BNB,
  FEE_CAP_BNB,
  FEE_GROWTH_FACTOR,
  formatBnb,
  INITIAL_PRIZE_BNB,
  MAX_PRIZE_BNB,
  STARTER_CREDITS,
} from '@/lib/vault-economy';

const steps = [
  {
    n: '01',
    title: '连接钱包',
    body: '点击 MetaMask / OKX / WalletConnect 风格入口后，系统生成 demo 地址并写入本地 JSON，不请求真实签名。',
    accent: 'text-sunset',
  },
  {
    n: '02',
    title: '创建 Soul Agent',
    body: `填写名称、人格、说话风格和风险偏好。创建成功后钱包获得 ${STARTER_CREDITS} credits，可选择 mint demo NFA 身份。`,
    accent: 'text-grass',
  },
  {
    n: '03',
    title: '部署挑战',
    body: 'Agent 每次只能向 Sage Vault 发出一条观点。系统模拟 payFee 交易、deposit id 和 tx hash。',
    accent: 'text-lilac',
  },
  {
    n: '04',
    title: '失败入池 / 成功领奖',
    body: '未说服的挑战费进入奖池；达到 90 分后挑战锁定，奖池显示为自动打入 winner wallet。',
    accent: 'text-blush',
  },
];

export default function AboutPage() {
  return (
    <PageShell
      eyebrow="机制 / Vault Arena"
      title="Clawdyland 式玩法，Sage 式 UI。"
      description="这是黑客松 demo 版本：本地数据模拟钱包绑定、Agent 创建、BNB 支付和裁判，不复制专有应用代码，只重写“说服金库、失败入池、成功领奖”的产品闭环。"
    >
      <div className="grid min-h-[58vh] grid-cols-1 gap-8 lg:grid-cols-12">
        <section className="lg:col-span-7">
          <SectionLabel>How it works</SectionLabel>
          <ol className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {steps.map((step) => (
              <li key={step.n} className="border border-ink bg-paper-50 p-5">
                <span
                  className={`font-display text-[2.6rem] font-black leading-none ${step.accent}`}
                >
                  {step.n}
                </span>
                <h2 className="mt-4 font-display text-[1.5rem] font-bold leading-tight">
                  {step.title}
                </h2>
                <p className="mt-2 text-[0.9rem] leading-relaxed text-ink-700">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <aside className="border border-ink bg-ink p-6 text-paper lg:col-span-5">
          <SectionLabel>Demo constants</SectionLabel>
          <div className="mt-6 space-y-6">
            <Reason
              title={`${formatBnb(INITIAL_PRIZE_BNB)} initial pool`}
              body="主挑战一开始就有奖池，评委打开页面能直接看到可争夺资产。"
            />
            <Reason
              title={`${formatBnb(BASE_ENTRY_FEE_BNB)} base fee`}
              body={`费用曲线为 0.005 x ${FEE_GROWTH_FACTOR}^(n - 1)，最高 ${formatBnb(FEE_CAP_BNB)}。`}
            />
            <Reason
              title={`${formatBnb(MAX_PRIZE_BNB)} cap`}
              body="上限用于 demo 展示和 pitch 叙事，未来链上版本可由合约参数控制。"
            />
            <Reason
              title="BAP-6174 ready"
              body="协议层未来可接 NFA 身份、能力证明、trainer rights 和 lease primitive；本轮不接真实合约。"
            />
          </div>
        </aside>
      </div>
    </PageShell>
  );
}

function Reason({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <p className="font-display text-[1.35rem] font-bold leading-tight">{title}</p>
      <p className="mt-2 text-[0.9rem] leading-relaxed text-paper/70">{body}</p>
    </div>
  );
}
