import type { AppSettings } from '@/types/settings';

const parseCutoff = (cutoff: string): { hh: number; mm: number } => {
  const [hRaw, mRaw] = cutoff.split(':');
  const hh = Number(hRaw);
  const mm = Number(mRaw);
  return {
    hh: Number.isFinite(hh) ? hh : 0,
    mm: Number.isFinite(mm) ? mm : 0,
  };
};

const cutoffDate = (settings: AppSettings): Date => {
  const { hh, mm } = parseCutoff(settings.cutoffTime);
  const d = new Date();
  d.setHours(hh, mm, 0, 0);
  return d;
};

export const isOrderingOpen = (settings: AppSettings | null | undefined): boolean => {
  if (!settings) {
    return false;
  }
  if (settings.orderingOpenToday) {
    return true;
  }
  return Date.now() < cutoffDate(settings).getTime();
};

export const minutesUntilCutoff = (settings: AppSettings | null | undefined): number => {
  if (!settings) {
    return 0;
  }
  const diffMs = cutoffDate(settings).getTime() - Date.now();
  return Math.max(0, Math.round(diffMs / 60_000));
};

export const cutoffTimeDisplay = (settings: AppSettings | null | undefined): string => {
  if (!settings) {
    return '';
  }
  const { hh, mm } = parseCutoff(settings.cutoffTime);
  const d = new Date();
  d.setHours(hh, mm, 0, 0);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};
