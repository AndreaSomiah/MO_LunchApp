export interface AppSettings {
  id: string;
  allowedEmailDomain: string;
  currency: string;
  currencySymbol: string;
  cutoffTime: string;          // HH:MM 24h
  orderingOpenToday: boolean;
  updatedAt: string;
}
