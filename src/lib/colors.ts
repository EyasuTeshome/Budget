export interface ColorTheme {
  bg: string;
  iconBg: string;
  iconText: string;
  bar: string;
  text: string;
  hex: string;
}

export const COLORS: Record<string, ColorTheme> = {
  amber: {
    bg: 'bg-amber-50',
    iconBg: 'bg-amber-200',
    iconText: 'text-amber-700',
    bar: 'bg-amber-400',
    text: 'text-amber-700',
    hex: '#f5b94d',
  },
  sky: {
    bg: 'bg-sky-50',
    iconBg: 'bg-sky-200',
    iconText: 'text-sky-700',
    bar: 'bg-sky-400',
    text: 'text-sky-700',
    hex: '#6fc3e8',
  },
  rose: {
    bg: 'bg-rose-50',
    iconBg: 'bg-rose-200',
    iconText: 'text-rose-700',
    bar: 'bg-rose-400',
    text: 'text-rose-700',
    hex: '#f29bb0',
  },
  violet: {
    bg: 'bg-violet-50',
    iconBg: 'bg-violet-200',
    iconText: 'text-violet-700',
    bar: 'bg-violet-400',
    text: 'text-violet-700',
    hex: '#c3a6e8',
  },
  pink: {
    bg: 'bg-pink-50',
    iconBg: 'bg-pink-200',
    iconText: 'text-pink-700',
    bar: 'bg-pink-400',
    text: 'text-pink-700',
    hex: '#f4a6c6',
  },
  emerald: {
    bg: 'bg-emerald-50',
    iconBg: 'bg-emerald-200',
    iconText: 'text-emerald-700',
    bar: 'bg-emerald-400',
    text: 'text-emerald-700',
    hex: '#7fd9b9',
  },
  indigo: {
    bg: 'bg-indigo-50',
    iconBg: 'bg-indigo-200',
    iconText: 'text-indigo-700',
    bar: 'bg-indigo-400',
    text: 'text-indigo-700',
    hex: '#8c9eef',
  },
  slate: {
    bg: 'bg-slate-50',
    iconBg: 'bg-slate-200',
    iconText: 'text-slate-700',
    bar: 'bg-slate-400',
    text: 'text-slate-700',
    hex: '#94a3b8',
  },
};

export const COLOR_KEYS = Object.keys(COLORS);

export function getColor(name: string): ColorTheme {
  return COLORS[name] ?? COLORS.slate;
}
