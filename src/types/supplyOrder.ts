export type SupplyOrderType = 'daily' | 'event';
export type SupplyOrderStatus = 'draft' | 'sent' | 'fulfilled' | 'cancelled';

export interface SupplyOrderItem {
  id: string;
  name: string;
  quantity: number;
  unit: string | null;
  notes: string | null;
  sortOrder: number;
}

export interface SupplyOrder {
  id: string;
  type: SupplyOrderType;
  title: string;
  eventDate: string;
  eventTime: string | null;
  venue: string | null;
  guestCount: number | null;
  status: SupplyOrderStatus;
  notes: string | null;
  createdBy: string;
  createdByName: string | null;
  createdAt: string;
  updatedAt: string;
  items: SupplyOrderItem[];
}

export interface SupplyOrderItemInput {
  name: string;
  quantity: number;
  unit?: string | null;
  notes?: string | null;
}

export interface CreateSupplyOrderInput {
  type: SupplyOrderType;
  title?: string;
  eventDate: string;
  eventTime?: string | null;
  venue?: string | null;
  guestCount?: number | null;
  notes?: string | null;
  status?: 'draft' | 'sent';
  items: SupplyOrderItemInput[];
}

export interface UpdateSupplyOrderInput {
  title?: string;
  eventDate?: string;
  eventTime?: string | null;
  venue?: string | null;
  guestCount?: number | null;
  notes?: string | null;
  items?: SupplyOrderItemInput[];
}

export interface PrefillItem {
  name: string;
  quantity: number;
  unit: string;
}
