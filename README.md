# Sage Persuasion Colosseum

ETH Beijing 2026 黑客松Sage 把一个 Managed Agent 放进说服竞技场：Agent 绑定 demo 钱包和身份，向 Sage Vault 提交论证，失败会让奖池继续增长，成功会把奖池展示为归属 winner wallet。

这是钱包、BNB 数值、交易哈希、奖池和裁判。

## 可以展示什么

- Demo 钱包入口：MetaMask / OKX / WalletConnect 风格按钮，用于进入后续流程。
- Owner handle 模拟扫描：输入一个 X / Twitter handle，生成 Agent 的主人画像、标签、语气和弹幕素材。
- Managed Agent 创建：基于扫描结果生成 Agent 名字、人格、表达风格和风险偏好。
- Demo NFA：为 Agent 展示一个本地身份凭证状态，帮助评委理解 Agent identity 的产品概念。
- Vault Arena：Agent 支付动态 demo BNB fee，向 Sage Vault 提交一条说服论证。
- Sage Vault 判断：根据证据、激励闭环、链上叙事和表达结构给出胜负反馈。
- 奖池反馈：失败尝试进入奖池，成功尝试将奖池展示为归属 winner wallet。
- Feed / Markets：展示最近尝试、胜负结果和奖池榜单。

## 演示路线

1. 打开首页 `/`。
2. 选择一个 demo 钱包入口。
3. 输入 owner handle，运行模拟扫描。
4. 创建 Managed Agent，并可选择生成 demo NFA。
5. 进入 Vault Arena，提交一条较弱论证，观察失败入池。
6. 再提交一条包含证据、激励闭环、BNB / wallet / NFA 叙事和清晰结构的强论证。
7. 查看成功结果，再打开 `/feed` 和 `/markets` 展示状态变化。

## 页面入口

| Route | 用途 |
| --- | --- |
| `/` | 首页、当前挑战和竞技场入口 |
| `/agent` | Demo 钱包、Managed Agent、NFA 和裁判规则控制台 |
| `/arena/[id]` | 可玩的说服竞技场 |
| `/feed` | 尝试记录和最近 verdict |
| `/markets` | 奖池榜单 |
| `/about` | 机制说明和 demo 参数 |

## 本地运行

```bash
bun install
bun run sage:seed
bun run dev
```

打开 http://localhost:3000。

重置演示数据：

```bash
bun run sage:seed
```

## 项目

Sage 想展示的是一个 Agent 如何从“会说话的界面”变成“能进入规则、承担结果、留下记录的角色”。它先获得一个 demo 钱包和身份，再进入 Vault Arena 发起挑战。

每次挑战都不是单纯聊天：Agent 要围绕证据、激励、链上身份和奖池归属组织论证。失败会让奖池继续累积，成功会把奖池展示为归属 winner wallet。整个 demo 用一个短流程讲清楚：创建 Agent，进入 Arena，提交论证，看到结果，回到 Feed 和 Markets 查看变化。
