# 🎤 Pitch 评委 Q&A 速答手册

> 6 分钟 pitch + 评委挑刺,这一页全在这。背下来。

---

## 6 分钟 Pitch 脚本

### [0:00 - 0:30] 开场 · 痛点

> 今天创作者发推,平台拿 99% 的广告费,创作者拿 1%。
>
> Pump.fun 一天发 2 万个 meme 币,99% 是垃圾,因为没有 curator。
> Banger.lol 让创作者主动发币 —— 但 99% 创作者根本不知道 web3。
>
> 我们做的事情反过来:**AI 找到你 + 钱先到你账上 + 你想拿再说。**

### [0:30 - 3:30] 现场 Demo

1. 打开 http://localhost:3000,展示今天 Sage 的精选
2. 点开"NEXTQ"那条(92 分,web3 圈 meme),详情页 + 池子数据
3. **评委亲手点 "Co-sign $0.50"** → 数据实时刷新 → 创作者累积上涨
4. 切到 `/about` 页,展示 4 步机制图
5. 终端跑 `npm run sage:loop`,**评委看到 Sage 实时给新内容评分**

### [3:30 - 4:30] 技术亮点

> 三个核心创新:
>
> **① 确定性地址** — Farcaster fid → 链上钱包,创作者完全无感持有
> **② Sage Agent** — 有人格 prompt + 链上行为可验证 + 自己的金库,自付 API 费
> **③ Co-sign Bonding Curve** — 投机者用真金白银表达"我同意 Sage 品味"

### [4:30 - 5:30] AI Agent 深度

> Sage 不是 GPT 套壳。它有金库、有声誉曲线、自主决策。
>
> 我们设计了 multi-agent 联邦 —— 不同 Sage 不同品味:
> - **学院派 Sage** 选深度内容
> - **贴吧老哥 Sage** 选有梗的
> - **文艺青年 Sage** 选有意境的
>
> 用户用 `$TASTE` 质押站队,这才是真正的 Agent x Blockchain。

### [5:30 - 6:00] 结尾

> 全球月活 5 亿创作者,99% 不知道 web3。
>
> 我们用 AI Agent 当桥梁,让 web3 **主动找到他们**,而不是反过来。
>
> Banger.lol 在 Solana 验证了这个赛道。**EVM 上这个槽位是空的。我们填。**

---

## 🎯 评委挑刺 Top 10 + 标准回答

### Q1: "这跟 Banger.lol 啥区别?"
> Banger 要创作者**主动发**,我们 AI **主动找**。
> Banger 是发行工具,我们是策展协议。
> Banger 在 Solana,EVM 槽位空着。

### Q2: "AI 评分就是 GPT 套壳吧?"
> v0 确实是 prompt-engineered Claude Sonnet。
> 但 roadmap 是用 co-signer 投票数据反向 fine-tune 一个 reward model —
> **让 Sage 真的有自己的品味,而不是 LLM 的平均口味。**
> 这是 Sage 区别于"AI 工具"成为"AI 角色"的关键。

### Q3: "这跟 Polymarket 啥区别?"
> Polymarket 卖**事件结果**,一次性,赌完就完。
> 我们卖**持久 AI 角色的 IP 所有权** —— Sage 活着,token 一直交易。
> 类比:Polymarket 是彩票,我们是球员卡。

### Q4: "创作者真的会来 claim 吗?"
> 关键设计:Sage **主动在 Farcaster @ 创作者** reply。
> Farcaster 用户本能会去看一眼自己被 mention。
> 预期 30-50% claim 率,行业基准是 15%。
> 不 claim 也无所谓,链上永远归他,这就是病毒传播素材。

### Q5: "代币化别人内容不违法吗?"
> 我们铸的不是推文本身,而是**co-signer 群体对内容的鉴赏证明 NFT**。
> 所有权概念上属于 co-signer 群体。
> 类比:你不能版权"我喜欢这条推"这件事。

### Q6: "front-running 怎么办?"
> v0 用 commit-reveal 缓解 — Sage 先承诺哈希,延迟揭晓。
> v1 计划用 ZK 隐藏 Sage 选品至公开窗口。
> **承认:这是 MEV 问题,几乎所有链上策展协议都有。**

### Q7: "Co-sign 算不算赌博?"
> 技术上是 ERC-20 持有,**不是 yes/no 押注**。
> 不是赌"事件结果",是"策展信号 + 持久 IP 投资"。
> 你买 co-sign = 你买 NFT 持有权 + 未来转售权。

### Q8: "为什么是 ETH 不是 Solana?"
> 三个理由:
> 1. Base 是 Coinbase 主推,Farcaster 原生
> 2. Privy / thirdweb / viem 工具链最成熟
> 3. **Banger.lol 已经占了 Solana 的位**,EVM 槽位空着
> ETH Beijing 主办方是 PKU + WTF Academy,EVM 是正确选择。

### Q9: "AI 调用成本不会爆吗?"
> 目前每条评分约 $0.001 (Claude Sonnet)。
> Sage 自己的金库从 co-sign 抽成中取 10%,**自给自足**。
> 这就是为什么 agent 必须有自己的钱包。

### Q10: "为什么 2026 做,2023 死掉的 TipCoin 啥区别?"
> 2023 年 AI 不够强,做不了真品味判断。
> 2024 年 Eliza / Virtuals 让 Agent 有了链上身份。
> **2026 的差异化是 Agent 本身成为可被信任的策展 IP** —
> 这不是给推文发币,这是给"AI 策展人"发币,推文是它的作品集。

---

## 🎯 极致一句话差异化

> **Pump.fun 是无差别工厂,Banger.lol 是创作者发行,Sage 是 AI 策展。**
>
> **不是"AI 帮我做内容",是"AI 是品味本身"。**

---

## ⚠️ 如果评委冷场 / 完全不感冒

把对话拉回 **AI Agent 主题**:

> "我们不是又一个 SocialFi。我们是探索 **AI Agent 作为协议参与者** 的新范式 ——
> Sage 有自己的钱包、自己的金库、自己的声誉、自己的可被雇佣的能力。
> 它不是工具,是经济实体。这才是 ETH Beijing 主题的真正意思。"

---

## 🚨 演示出问题应急话术

| 万一... | 救场话术 |
|---------|---------|
| 网络挂了 | "我录了一段 90 秒 Loom 备播视频,展示完整闭环" |
| Co-sign 按钮卡死 | "本地数据库写入冲突,我重启服务,先讲下一段" |
| Sage AI 调用超限 | "演示用预先评分的种子数据,production 会用 ESP 速率限流" |
| 评委直接打断说"不行" | "我接受批评,我想听您觉得 ___ 该怎么做" |

---

**记住:Pitch 不是讲技术,是讲故事。** 评委记不住公式,只记得画面。
**最重要的画面:评委自己点 co-sign,创作者地址余额涨。这一秒值 6 分钟。**
