/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        // 金融主题配色
        primary: {
          DEFAULT: '#0A1628',      // 深蓝背景
          light: '#1A2A48',        // 浅色背景
          dark: '#050D18',         // 深色背景
        },
        accent: {
          DEFAULT: '#00D4FF',      // 科技蓝强调色
          hover: '#00B8E6',        // 悬停色
        },
        gain: {
          DEFAULT: '#00C853',       // 涨
          light: '#69F0AE',        // 浅涨
          bg: 'rgba(0, 200, 83, 0.1)', // 涨背景
        },
        loss: {
          DEFAULT: '#FF1744',       // 跌
          light: '#FF5252',         // 浅跌
          bg: 'rgba(255, 23, 68, 0.1)', // 跌背景
        },
        neutral: {
          DEFAULT: '#868D94',       // 平
        },
        surface: {
          DEFAULT: '#0D1B2A',      // 卡片背景
          hover: '#152238',        // 悬停背景
        },
        border: {
          DEFAULT: '#1E3A5F',       // 边框色
          light: '#2D4A6F',         // 浅边框
        },
      },
      fontFamily: {
        sans: ['Source Han Sans SC', 'Noto Sans SC', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};
