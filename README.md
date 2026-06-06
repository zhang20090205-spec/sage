# 🌿 Sage — AI 策展协议

> ETH Beijing 2026 黑客松项目 · AI Agent × Blockchain 主题

**一句话:** 一个 AI Agent 在 Farcaster 上巡逻好内容,自动给作者发链上奖励,投机者 `co-sign` 自己看好的内容,创作者**完全无感**收钱。

---

## 🎯 这是什么

Sage 是一个 AI 内容策展协议:

1. **AI 巡逻** —— Sage 这个 AI agent 24/7 在 Farcaster 扫描内容,有强烈的人格和品味
2. **自动铸造** —— 评分 ≥ 75 的内容自动铸成 NFT + 启动 bonding curve 池子
3. **确定性地址** —— 创作者的 Farcaster fid 推导出一个链上钱包,**作者完全不操作就拥有它**
4. **Co-sign 机制** —— 任何人可以买入池子(押注 Sage 眼光),押对赚钱
5. **作者一键 claim** —— 哪天想拿钱,Farcaster OAuth 登录 → 提走

**钱从哪来?** 完全是 co-signer 之间的资金流转 + 顺路给作者打赏。和早期艺术品收藏一个逻辑:有人愿意为"早发现"付费。

---

## 📂 项目结构

```
.
├── app/                          # Next.js 14 App Router
│   ├── layout.tsx                # 全局布局
│   ├── page.tsx                  # 首页 — 今日精选列表
│   ├── about/page.tsx            # 产品介绍页(给评委 30 秒看完)
│   ├── pick/[id]/page.tsx        # 单个 pick 详情页(co-sign 按钮在这)
│   └── api/cosign/route.ts       # 服务端 co-sign 接口
│
├── components/
│   ├── CoSignButton.tsx          # 客户端 co-sign 按钮
│   └── CurveChart.tsx            # bonding curve 折线图(纯 SVG)
│
├── lib/                          # 业务核心(可以独立测试)
│   ├── types.ts                  # 全局类型
│   ├── sage-prompt.ts            # Sage 的人格 prompt 💡
│   ├── scorer.ts                 # Claude API 调用层
│   ├── farcaster.ts              # Neynar API + mock 回退
│   ├── derive-address.ts         # fid → 确定性 EVM 地址
│   ├── bonding-curve.ts          # 价格 / 池子 / 分账计算
│   └── db.ts                     # 本地 JSON 文件数据库
│
├── scripts/
│   ├── sage-loop.ts              # Sage 真巡逻一次(调 AI)
│   └── seed-demo.ts              # 预填演示数据(不调 AI)
│
├── data/db.json                  # 本地数据库(运行后自动生成)
└── .env.local                    # 你的 API key(自己创建)
```

---

## 🚀 5 分钟跑起来

### 步骤 1:装依赖
```bash
npm install
```

### 步骤 2:配置环境变量
```bash
cp .env.local.example .env.local
```

然后填写 `.env.local`,**只有一个必填**:

| 变量 | 必填 | 怎么拿 |
|------|------|--------|
| `ANTHROPIC_API_KEY` | ✅ | https://console.anthropic.com/ 注册,$5 免费额度 |
| `NEYNAR_API_KEY` | ❌ | 不填会自动用 mock 数据。需要真实数据去 https://neynar.com/ 免费层 |

### 步骤 3:塞演示数据
```bash
npm run sage:seed
```
塞 6 条精心准备的中文段子 + 假装已经有几十个 co-signer 的池子。

### 步骤 4:启动
```bash
npm run dev
```
打开 http://localhost:3000

### (可选) 步骤 5:让 Sage 真的去巡逻
```bash
npm run sage:loop
```
会调 Claude 给真实 Farcaster cast 评分。如果没填 Neynar key,用 mock cast 也能跑。

---

## 🎬 现场 Demo 流程(5 分钟)

| 时间 | 动作 | 评委看到 |
|------|------|---------|
| 0:00 | 打开 http://localhost:3000 | 首页 6 条精选,每条带 Sage 评语 + 池子数据 |
| 0:30 | 点开 "FIRE36"(91 分那条) | 详情页 + bonding curve 图 + 累积 $X 待 claim |
| 1:30 | 评委自己点 "Co-sign $X" | 数据实时刷新,创作者累积 + |
| 2:30 | 切换到 `/about` 页 | 4 步图解整个机制 |
| 3:30 | 现场跑 `npm run sage:loop` | 终端实时看 Sage 评分新内容 |
| 4:30 | 切到 Pitch slide | 讲 roadmap:确定性地址 → 智能账户 → 跨 dApp 声誉 |

---

## 🧠 设计要点(评委挑刺时讲)

### 1. Sage 不是 GPT 套壳
**v0:** prompt-engineered LLM (Claude Sonnet) + 严格 JSON schema
**v1:** 用 co-signer 投票数据反向 fine-tune reward model
**v2:** 多 Sage 联邦,各有品味,用户质押站队

### 2. 确定性地址 = 0 摩擦
`address = keccak256(salt || fid)[-20:]`
作者 fid 决定一切,完全无感。等他用 Farcaster OAuth 登录证明所有权后,把累积奖励转给他自己绑定的钱包。

### 3. Bonding Curve(线性,简单)
`price(n) = 50 + n * 10` (cents)
分账:40% 创作者 / 40% co-signer 可退回 / 10% Sage 金库 / 10% 协议

### 4. 不是 Polymarket
Polymarket 卖**事件结果**,赌完即消失。
Sage 卖的是**持久 AI 角色 + 内容 IP** 的所有权,token 一直在交易,AI 一直活着。

---

## 🛠 技术栈

| 层 | 选型 |
|----|------|
| 框架 | Next.js 15 + App Router |
| 语言 | TypeScript |
| 样式 | Tailwind CSS |
| AI | Anthropic Claude Sonnet 4.5 |
| Farcaster | Neynar API(有 mock fallback) |
| 钱包推导 | viem (keccak256) |
| 数据库 | 本地 JSON 文件(demo) → 生产换 Postgres |
| 部署 | Vercel(一键) |

---

## 🗺 Roadmap

### 黑客松(48 小时)
- [x] AI 评分 + 确定性地址 + bonding curve 数学
- [x] 精选 / 详情 / co-sign UI
- [x] Mock 上链(本地 JSON db)
- [ ] 真合约部署到 Base Sepolia(thirdweb 模板)
- [ ] Sage 在 Farcaster 上自动 @ 创作者

### Post-Hackathon
- [ ] Privy 嵌入式钱包接入
- [ ] Farcaster OAuth 签名验证 → 创作者 claim
- [ ] 多 Sage 联邦 + Sage IP token(可质押)
- [ ] 跨 dApp 声誉调用接口(其他项目可读 Sage 选品历史)

---

## ⚠️ 已知限制(诚实告诉评委)

1. **Sage 现在就是 prompt + Claude**,真品味要靠数据迭代
2. **没有合约部署**,co-sign 写在本地 JSON,生产需要补 ERC-20 + escrow
3. **没有冷启动方案** —— 需要 100 个种子 co-signer 才能 work
4. **front-running 风险** —— Sage 选品链上公开,bots 会抢跑

每一点都有应对方案,见 [Pitch 评委 Q&A](./PITCH_QA.md)(可选补充)

---

## 📖 灵感来源 / 同类项目

| 项目 | 区别 |
|------|------|
| [Banger.lol](https://banger.lol) | Solana 版本,人主动发币,我们 AI 主动选 |
| [Bracky](https://bracket.game) | feed 里 AI 下注体育,我们做策展 |
| [Virtuals AIXBT](https://virtuals.io) | AI agent 自己发推,我们 AI 评价别人的推 |
| [Pump.fun](https://pump.fun) | 无差别 meme 工厂,我们有 curator |
| [Clanker](https://clanker.world) | Farcaster @ bot 发币,我们 AI 自动选 |

---

## 🤝 团队 & 联系

ETH Beijing 2026 · AI Agent × Blockchain Track

> 用 AI Agent 把"在网上发段子"变成可累积资产的协议层。
