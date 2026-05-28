export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stockLevel: number;
  threshold: number;
  location?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface InventoryRequest {
  id: string;
  itemName: string;
  quantityNeeded: number;
  reason?: string;
  requestedBy: string;
  requestedByName?: string;
  status: 'open' | 'fulfilled' | 'rejected';
  fulfilledBy?: string;
  linkedItemId?: string;
  createdAt: string;
  updatedAt: string;
}
