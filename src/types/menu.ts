import type { DietaryPreference } from './user';

export type { DietaryPreference };

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  calories?: number;
  dietary?: DietaryPreference;
  imageUrl?: string;
  available: boolean;
  restaurantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MenuFilterState {
  category: string;            // '' = all
  dietary: string;             // '' = all
  search: string;
}
