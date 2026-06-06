import { keccak256, toHex, getAddress, type Address } from 'viem';

/**
 * 把 Farcaster fid → 一个确定性的 EVM 地址。
 *
 * 这是产品的关键设计:创作者完全无感地"拥有"一个钱包。
 * 公式:address = first20bytes( keccak256(salt || fid) )
 *
 * Demo 阶段我们不真的让这个地址持有 ERC-20,只是把"应得余额"记在本地数据库里。
 * 当创作者用 Farcaster OAuth 登录证明 fid 时,服务端把累积奖励转给他自己绑定的钱包。
 *
 * Production 阶段:可以用 ERC-4337 或 CREATE2 部署一个由 Sage 控制 → 用户可领的智能账户。
 */
export function deriveCreatorAddress(fid: number): Address {
  const salt = process.env.ADDRESS_SALT ?? 'sage-hackathon-2026';
  const input = `${salt}::farcaster::${fid}`;
  const hash = keccak256(toHex(input));
  // 取后 20 字节(40 个 hex 字符)作为地址
  const raw = ('0x' + hash.slice(-40)) as Address;
  return getAddress(raw);
}

/**
 * 缩写地址用于 UI 显示。
 */
export function shortAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}
