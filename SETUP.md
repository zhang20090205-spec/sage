# 🛠 SETUP — 第一次跑起来手册

> 给团队成员看的:从 0 到看到首页只需要 10 分钟。

---

## ⚡ 最快路径(只跑 demo 看效果)

```bash
# 1. 装依赖
npm install

# 2. 配置(只填 Claude key,其他保持默认)
cp .env.local.example .env.local
# 用编辑器打开 .env.local,填上 ANTHROPIC_API_KEY

# 3. 塞演示数据(不调 AI)
npm run sage:seed

# 4. 启动
npm run dev
```

打开 http://localhost:3000 ,完事。

---

## 🔑 API Key 你只需要 1 个

### **必须填的:Claude API Key**
- 注册:https://console.anthropic.com/
- 新账号有 **$5 免费额度**,够整个黑客松用
- 在 Settings → API Keys → Create Key
- 填到 `.env.local` 的 `ANTHROPIC_API_KEY`

> 💡 **不填这个也能跑 demo**(用 `npm run sage:seed` 预填的种子数据),
> 只是 `npm run sage:loop` 真巡逻功能不能用。

### 可选填的:Neynar(Farcaster 数据)
- 注册:https://neynar.com/
- 免费层每月 1 万次调用,够用
- 不填的话 `fetchTrendingCasts()` 自动用 mock cast(全是精心准备的中文段子)

---

## 📁 文件依赖关系图

```
            ┌──────────────────┐
            │   app/page.tsx   │  ← 首页
            └──────────────────┘
                     │
                     ├──→ lib/db.ts (listPicks)
                     │
            ┌────────┴─────────┐
            │ app/pick/[id]    │  ← 单条详情
            └──────────────────┘
                     │
                     ├──→ components/CoSignButton
                     │         │
                     │         └──→ POST /api/cosign
                     │                       │
                     │                       └──→ lib/db.ts (upsertPick)
                     │                       └──→ lib/bonding-curve.ts
                     │
                     └──→ components/CurveChart

            ┌────────────────────┐
            │  scripts/sage-loop │  ← 真巡逻
            └────────────────────┘
                     │
                     ├──→ lib/farcaster.ts (fetchTrendingCasts)
                     │         └──→ Neynar API 或 mock
                     │
                     ├──→ lib/scorer.ts (scoreCast)
                     │         └──→ Anthropic API
                     │         └──→ lib/sage-prompt.ts (SAGE_PERSONA)
                     │
                     ├──→ lib/derive-address.ts (deriveCreatorAddress)
                     │         └──→ viem keccak256
                     │
                     └──→ lib/db.ts (upsertPick)
```

---

## 🐛 常见问题

### `npm install` 报错
- Node 版本至少 18,推荐 20+
- 如果是 Windows,网络问题可以试 `npm install --registry=https://registry.npmmirror.com`

### `npm run dev` 启动失败
- 检查 3000 端口有没有被占用
- 看看是不是 `.env.local` 写错了(注意不要把变量名写错)

### 首页是空的
- 跑过 `npm run sage:seed` 吗?它会在 `data/db.json` 写入种子数据
- 检查 `data/db.json` 是否存在 + 有内容

### `npm run sage:loop` 报 "缺少 ANTHROPIC_API_KEY"
- 编辑 `.env.local`,填上你的 Claude key
- 注意是 `sk-ant-` 开头的

### Co-sign 按钮点了没反应
- 打开浏览器 DevTools 看 Network 标签 → 看 `/api/cosign` 的响应
- 可能是 `data/db.json` 文件权限问题(Windows 上偶尔)

---

## 🚢 部署到 Vercel(2 分钟)

```bash
# 装 Vercel CLI
npm i -g vercel

# 第一次部署
vercel

# 后续部署
vercel --prod
```

**注意:** Vercel 上文件系统是只读的,所以 `data/db.json` 写不进去。
- **黑客松 demo:** 本地跑就行,演示时把笔记本投屏
- **演示后想上线:** 换成 Vercel KV / Supabase,改 `lib/db.ts` 就行(接口已经抽象)

---

## 📋 给团队成员的"我能做什么"任务卡

### 如果你只懂前端
- 改 `app/page.tsx` 的 UI(让首页更美)
- 改 `components/CoSignButton.tsx` 的动效
- 改 `components/CurveChart.tsx` 让曲线动起来
- 加一个新页面 `app/leaderboard/page.tsx` 显示排行榜(用 `topPicksByPool()`)

### 如果你只懂后端
- 改 `lib/sage-prompt.ts` 让 Sage 评分更准
- 改 `lib/farcaster.ts` 接其他平台(微博、X、小红书)
- 改 `lib/bonding-curve.ts` 改分账模型
- 加一个 `scripts/sage-reply.ts` 实现 Sage 自动 @ 创作者

### 如果你会 Solidity
- 在 `contracts/` 文件夹(自己建)写一个 escrow + ERC-20 工厂
- 改 `app/api/cosign/route.ts` 接合约调用替代 db 写入
- Base Sepolia 部署:https://thirdweb.com/base-sepolia

### 如果你做 Pitch 和设计
- 改 `app/about/page.tsx` 让产品讲解更清晰
- 改 `README.md` 让 GitHub repo 评委眼前一亮
- 演练 `PITCH_QA.md` 的 6 分钟脚本

---

## ⏰ 48 小时分阶段冲刺

### Day 1 上半 (0-12h)
- 把 demo 跑起来,所有人能在自己电脑看到
- Pitch 大纲定稿
- 现场预演一次

### Day 1 下半 (12-24h)
- 接 Privy 嵌入式钱包(真的能登录)
- Sage Twitter / Farcaster 账号注册
- 写自动 @ 创作者的 reply 脚本

### Day 2 上半 (24-36h)
- 部署一个真的 ERC-20 工厂到 Base Sepolia(用 thirdweb)
- 改 co-sign API 调真合约
- 现场预演评委体验

### Day 2 下半 (36-48h)
- 录 Loom 视频(网络挂了备用)
- Slides 定稿
- 每个人讲一遍 pitch
- **睡觉**(至少 4 小时,不然现场翻车)

---

**有任何问题,看 `PITCH_QA.md` 和 `README.md`。冲。** 🌿
