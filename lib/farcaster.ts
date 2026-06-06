import type { Cast } from './types';

/**
 * Farcaster 抓取层。
 *
 * 真接 Neynar API 时填 NEYNAR_API_KEY,fetchTrendingCasts 会调真实接口。
 * 没填的时候自动回退到 mock 数据,demo 完全能跑。
 */

const NEYNAR_BASE = 'https://api.neynar.com/v2/farcaster';

export async function fetchTrendingCasts(limit = 25): Promise<Cast[]> {
  const key = process.env.NEYNAR_API_KEY;
  if (!key || key === 'NEYNAR_xxx') {
    return mockTrendingCasts().slice(0, limit);
  }

  try {
    const res = await fetch(
      `${NEYNAR_BASE}/feed/trending?limit=${limit}&time_window=24h`,
      {
        headers: {
          accept: 'application/json',
          'x-api-key': key,
        },
        // Next.js 缓存:每 5 分钟刷新一次
        next: { revalidate: 300 },
      },
    );
    if (!res.ok) {
      console.warn(`[neynar] fetch failed ${res.status},回退 mock`);
      return mockTrendingCasts().slice(0, limit);
    }
    const data = (await res.json()) as NeynarFeedResponse;
    return (data.casts ?? []).map(toCast);
  } catch (err) {
    console.warn('[neynar] error,回退 mock', err);
    return mockTrendingCasts().slice(0, limit);
  }
}

function toCast(c: NeynarCast): Cast {
  return {
    id: c.hash,
    content: c.text,
    authorFid: c.author.fid,
    authorUsername: c.author.username ?? `fid:${c.author.fid}`,
    authorAvatar: c.author.pfp_url,
    sourceUrl: `https://warpcast.com/${c.author.username}/${c.hash.slice(0, 10)}`,
    fetchedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Mock 数据 —— Demo 时一定能用,且都是中文,便于评委秒懂。
// ---------------------------------------------------------------------------
function mockTrendingCasts(): Cast[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'mock-001',
      content:
        '上海地铁里又看见有人在直播带货,卖的还是"让你年薪百万的副业课"。我端着咖啡的手都抖了 —— 不是被吓的,是终于明白为什么咖啡涨价了。',
      authorFid: 10001,
      authorUsername: 'laowang',
      sourceUrl: 'https://warpcast.com/laowang/mock-001',
      fetchedAt: now,
    },
    {
      id: 'mock-002',
      content:
        '公司新来的 95 后实习生说她的职业规划是"35 岁前财富自由"。我顿了顿,回了她一句:"我也是,只不过我现在 36 了。"',
      authorFid: 10002,
      authorUsername: 'tinyhuman',
      sourceUrl: 'https://warpcast.com/tinyhuman/mock-002',
      fetchedAt: now,
    },
    {
      id: 'mock-003',
      content:
        '今天和朋友算了一下,我们公司晨会的总时长 × 全员时薪 = 一个工程师的年薪。开了三年。CTO 还在问为什么招不到人。',
      authorFid: 10003,
      authorUsername: 'devnotes',
      sourceUrl: 'https://warpcast.com/devnotes/mock-003',
      fetchedAt: now,
    },
    {
      id: 'mock-004',
      content:
        '加密圈最玄学的事:你看着一个项目从 0 涨到 100 倍,你没买,你恨;你看着另一个项目从 100 倍跌到 0,你买了,你还是恨。',
      authorFid: 10004,
      authorUsername: 'cryptocat',
      sourceUrl: 'https://warpcast.com/cryptocat/mock-004',
      fetchedAt: now,
    },
    {
      id: 'mock-005',
      content:
        '相亲对象问我:"你平时下班都干嘛?" 我说:"看 GitHub。" 她说:"GitHub 是哪个 APP,我下一个我们一起看。" 这局,我输了,但又像赢了。',
      authorFid: 10005,
      authorUsername: 'singlecoder',
      sourceUrl: 'https://warpcast.com/singlecoder/mock-005',
      fetchedAt: now,
    },
    {
      id: 'mock-006',
      content: '今天天气不错。',
      authorFid: 10006,
      authorUsername: 'boringguy',
      sourceUrl: 'https://warpcast.com/boringguy/mock-006',
      fetchedAt: now,
    },
    {
      id: 'mock-007',
      content:
        '北京胡同里的奶奶给我让了三次座,直到我承认我也是河北的。这才是真正的同乡识别协议,无需 KYC。',
      authorFid: 10007,
      authorUsername: 'hebeizai',
      sourceUrl: 'https://warpcast.com/hebeizai/mock-007',
      fetchedAt: now,
    },
    {
      id: 'mock-008',
      content:
        '"AI 会取代程序员吗?" 不会。AI 会取代的是那种"我也不知道这段代码是干嘛的,但是它能跑"的程序员 —— 也就是我们所有人。',
      authorFid: 10008,
      authorUsername: 'aiwhisperer',
      sourceUrl: 'https://warpcast.com/aiwhisperer/mock-008',
      fetchedAt: now,
    },
    {
      id: 'mock-009',
      content: '在吗?有事问你。',
      authorFid: 10009,
      authorUsername: 'lurker',
      sourceUrl: 'https://warpcast.com/lurker/mock-009',
      fetchedAt: now,
    },
    {
      id: 'mock-010',
      content:
        'Web3 项目方:"我们这个是真正去中心化的。" 提问环节:"那你们 token 80% 在团队和 VC 手里是为啥?" 项目方:"下一个问题。"',
      authorFid: 10010,
      authorUsername: 'rugwatcher',
      sourceUrl: 'https://warpcast.com/rugwatcher/mock-010',
      fetchedAt: now,
    },
  ];
}

// ---------------------------------------------------------------------------
// Neynar API 类型(只列我们用到的字段)
// ---------------------------------------------------------------------------
interface NeynarFeedResponse {
  casts: NeynarCast[];
}

interface NeynarCast {
  hash: string;
  text: string;
  author: {
    fid: number;
    username?: string;
    pfp_url?: string;
  };
}
