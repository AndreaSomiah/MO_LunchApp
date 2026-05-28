import { supabase } from '@/lib/supabase';
import type { AppSettings } from '@/types/settings';

interface SettingsRow {
  id: number;
  allowed_email_domain: string;
  currency: string;
  currency_symbol: string;
  cutoff_time: string;
  ordering_open_today: boolean;
  updated_at: string;
}

const mapSettings = (r: SettingsRow): AppSettings => ({
  id: String(r.id),
  allowedEmailDomain: r.allowed_email_domain,
  currency: r.currency,
  currencySymbol: r.currency_symbol,
  cutoffTime: r.cutoff_time,
  orderingOpenToday: r.ordering_open_today,
  updatedAt: r.updated_at,
});

export const fetchSettings = async (): Promise<AppSettings> => {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) {
    // Fallback defaults if settings row doesn't yet exist.
    return {
      id: '1',
      allowedEmailDomain: 'magicorange.com',
      currency: 'ZAR',
      currencySymbol: 'R',
      cutoffTime: '11:00',
      orderingOpenToday: true,
      updatedAt: new Date().toISOString(),
    };
  }
  return mapSettings(data as SettingsRow);
};

export interface SettingsPatch {
  allowedEmailDomain?: string;
  currency?: 'ZAR' | 'USD' | 'EUR' | 'GBP' | 'AUD';
  cutoffTime?: string;
  orderingOpenToday?: boolean;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  ZAR: 'R', USD: '$', EUR: '€', GBP: '£', AUD: 'A$',
};

export const patchSettings = async (payload: SettingsPatch): Promise<AppSettings> => {
  const update: Partial<SettingsRow> = {};
  if (payload.allowedEmailDomain !== undefined) update.allowed_email_domain = payload.allowedEmailDomain;
  if (payload.currency !== undefined) {
    update.currency = payload.currency;
    update.currency_symbol = CURRENCY_SYMBOLS[payload.currency] ?? payload.currency;
  }
  if (payload.cutoffTime !== undefined) update.cutoff_time = payload.cutoffTime;
  if (payload.orderingOpenToday !== undefined) update.ordering_open_today = payload.orderingOpenToday;

  const { data, error } = await supabase
    .from('settings')
    .update(update)
    .eq('id', 1)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapSettings(data as SettingsRow);
};

