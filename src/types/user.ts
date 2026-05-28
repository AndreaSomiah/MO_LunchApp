export type UserRole = 'employee' | 'manager' | 'admin';

export type DietaryPreference =
  | 'vegetarian'
  | 'vegan'
  | 'halal'
  | 'gluten-free'
  | 'dairy-free';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  dietary: DietaryPreference[];
  avatarId: string;
  imageUrl?: string;
  createdAt: string;
}
