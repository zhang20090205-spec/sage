/**
 * Sage 项目的核心数据类型。
 *
 * 整个 demo 围绕这几个对象转:
 * - Cast       —— 一条社交媒体内容(Farcaster cast 或手工 seed)
 * - SageScore  —— Sage 对这条内容的评分 + 评语
 * - Pick       —— 被 Sage 选中、铸成 NFT、启动 bonding curve 的一条
 * - CoSign     —— 一次 co-sign 行为(谁、押了多少)
 * - Creator    —— 创作者及其确定性钱包地址
 */

export interface Cast {
  /** Farcaster cast hash 或 seed 数据的本地 ID */
  id: string;
  /** 原始内容文字 */
  content: string;
  /** 作者 Farcaster fid(或 mock fid) */
  authorFid: number;
  /** 作者展示名 */
  authorUsername: string;
  /** 作者头像 URL */
  authorAvatar?: string;
  /** 来源链接(Warpcast / X / 等) */
  sourceUrl?: string;
  /** 抓取时间 ISO 字符串 */
  fetchedAt: string;
}

export interface SageScore {
  castId: string;
  /** 0-100 */
  score: number;
  /** Sage 的一句评语 */
  comment: string;
  /** 假想的代币符号,4-6 字母大写 */
  tokenName: string;
  /** Sage 对"会不会火"的推理 */
  viralReasoning: string;
  /** 评分模型 */
  model: string;
  /** 评分时间 */
  scoredAt: string;
}

/**
 * 一条 Pick 就是 Sage 决定"我看好,启动池子" —— 这是产品的核心资产。
 * 在 demo 阶段没有真合约,我们用 mock 数字模拟 bonding curve。
 */
export interface Pick {
  id: string;
  cast: Cast;
  score: SageScore;
  /** 创作者的确定性钱包地址(EVM 0x...) */
  creatorAddress: string;
  /** 当前 co-sign 数量 */
  coSignCount: number;
  /** 累积投入(以美分为单位,演示时用) */
  totalPoolCents: number;
  /** 创作者累积已分到的奖励(美分) */
  creatorAccruedCents: number;
  /** Sage 选中时间 */
  curatedAt: string;
  /** mock 的 NFT tokenId */
  nftId: string;
}

export interface CoSign {
  id: string;
  pickId: string;
  /** co-signer 钱包地址(demo 时随机生成或用 mock) */
  signerAddress: string;
  signerLabel?: string;
  amountCents: number;
  /** 这一笔买入时的 bonding curve 价格(美分) */
  priceCents: number;
  /** 这一笔后池子的总规模 */
  poolAfterCents: number;
  signedAt: string;
}

export interface Creator {
  fid: number;
  username: string;
  /** keccak256(salt + fid) 推导出的地址 */
  address: string;
  /** 累积总收入(美分) */
  accruedCents: number;
  /** 是否已 claim(demo 时点一下按钮即可) */
  claimed: boolean;
}
