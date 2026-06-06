import type { Config } from 'tailwindcss';

/**
 * Sage 配色 —— 取自 Kiwi Corp 编辑/印刷风。
 *
 * 主色:
 * - paper      米白纸面
 * - ink        深黑印刷字
 * - hairline   细线分割
 * 强调:
 * - sunset (橙黄)、grass (绿)、lilac (紫)、blush (粉)
 *   分别给装饰字母 / 标签 / hover / 强调使用,不抢戏
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#ECECE6',
          50: '#F7F7F3',
          100: '#EFEEEA',
          200: '#E1E0D9',
          300: '#C9C7BD',
        },
        ink: {
          DEFAULT: '#0C0C0C',
          900: '#0C0C0C',
          800: '#1A1A1A',
          700: '#2A2A2A',
          500: '#737373',
          400: '#9A9A95',
          300: '#C9C7BD',
        },
        sunset: { DEFAULT: '#E89A4B', soft: '#F2BD80' },
        grass: { DEFAULT: '#4FC07A', soft: '#A8E0BC' },
        canary: { DEFAULT: '#F4DB4E', soft: '#FAEC9A' },
        lilac: { DEFAULT: '#A58BCC', soft: '#CDBCE3' },
        blush: { DEFAULT: '#E76EA0', soft: '#F2B0CC' },
        sky: { DEFAULT: '#7AAFE6', soft: '#B3CFED' },
      },
      fontFamily: {
        // 标题用粗衬线(Fraunces / Playfair 都行,我们走 Fraunces 印刷感更强)
        display: ['Fraunces', 'Times New Roman', 'serif'],
        // 正文用现代无衬线
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
        // 标签 / 元数据用等宽
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      letterSpacing: {
        wider2: '0.12em',
      },
    },
  },
  plugins: [],
};

export default config;
