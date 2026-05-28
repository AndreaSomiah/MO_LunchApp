import type { AppSettings } from '@/types/settings';

export const formatCurrency = (amount: number, settings: AppSettings | null | undefined): string => {
  const symbol = settings?.currencySymbol ?? '';
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
  return symbol ? `${symbol} ${formatted}` : formatted;
};
