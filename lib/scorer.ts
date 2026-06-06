import { buildScoringPrompt, SAGE_PERSONA } from './sage-prompt';
import type { SageScore } from './types';

/**
 * Sage 的评分器,走 OpenAI 协议兼容网关(Codex / 官方 OpenAI / 任何兼容服务)。
 *
 * 用原生 fetch 而不是 openai SDK —— 网关 (modcon.top) 返回 `resp_xxx` 风格的 id,
 * openai SDK 6.x 对响应格式比较挑剔,直接 fetch 反而更稳。
 *
 * 配置:
 *   OPENAI_API_KEY     必填,sk-xxx
 *   OPENAI_BASE_URL    可选,默认 https://api.openai.com/v1
 *                      Codex 网关:https://modcon.top/v1
 *   OPENAI_MODEL       可选,默认 gpt-4o-mini,Codex 网关上一般 gpt-5.4
 */

interface ChatCompletionResponse {
  choices?: Array<{
    message?: { role: string; content: string };
  }>;
}

function getConfig() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('缺少 OPENAI_API_KEY,去 .env.local 填一下');
  const baseURL = (
    process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
  ).replace(/\/+$/, '');
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  return { apiKey, baseURL, model };
}

/**
 * 让 Sage 给一条内容打分。
 */
export async function scoreCast(args: {
  castId: string;
  content: string;
}): Promise<SageScore> {
  const { castId, content } = args;
  const { apiKey, baseURL, model } = getConfig();

  const res = await fetch(`${baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.6,
      max_tokens: 512,
      messages: [
        { role: 'system', content: SAGE_PERSONA },
        { role: 'user', content: buildScoringPrompt(content) },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`LLM ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = (await res.json()) as ChatCompletionResponse;
  const text = data.choices?.[0]?.message?.content ?? '';
  const parsed = extractJSON(text);

  return {
    castId,
    score: clamp(Number(parsed.score) || 0, 0, 100),
    comment: String(parsed.comment ?? '').slice(0, 80),
    tokenName: String(parsed.tokenName ?? 'MEME').slice(0, 8).toUpperCase(),
    viralReasoning: String(parsed.viralReasoning ?? '').slice(0, 100),
    model,
    scoredAt: new Date().toISOString(),
  };
}

function clamp(n: number, lo: number, hi: number): number {
  if (Number.isNaN(n)) return lo;
  return Math.max(lo, Math.min(hi, n));
}

/**
 * 从 LLM 的回复里捞出第一个 JSON 对象,容忍 ```json fence 等噪音。
 */
function extractJSON(text: string): Record<string, unknown> {
  const cleaned = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) return {};
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return {};
  }
}
