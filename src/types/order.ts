import type { MenuItem } from './menu';
import type { User } from './user';

export type OrderStatus = 'pending' | 'confirmed' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  quantity: number;
  price: number;
  notes?: string;
  menuItem?: MenuItem;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  user?: Pick<User, 'id' | 'name' | 'email'>;
  history?: OrderStatusEvent[];
}

export interface OrderStatusEvent {
  id: string;
  orderId: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  changedBy: string | null;
  changedByName?: string;
  changedAt: string;
}
